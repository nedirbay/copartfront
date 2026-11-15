/**
 * Real-time müşderi (WebSocket). Serwer maglumat üýtgände ýeňil waka ugradýar
 * (meselem {type: 'vehicle.changed', vin}), sahypalar bolsa degişli maglumaty REST-den täzeden okaýar.
 *
 * - Birikme kesilse awtomatik gaýtadan birikýär (artýan garaşma bilen).
 * - Gaýtadan birikende 'resync' wakasy döredilýär: arada sypdyrylan üýtgeşmeler üçin sahypalar täzelenýär.
 * - Tab gizlenip gaýdyp gelende hem birikme barlanýar.
 */
import { onMounted, onUnmounted } from 'vue'

export type RealtimeEvent =
  | { type: 'hello'; user_id: number }
  | { type: 'vehicle.changed'; vin: string }
  | { type: 'vehicle.deleted'; vin: string }
  | { type: 'notifications.changed' }
  | { type: 'dictionary.changed'; name: 'statuses' | 'locations' | 'makes' | 'models' | 'currencies' | 'expense_types' }
  | { type: 'employees.changed' }
  | { type: 'session.revoked' }
  | { type: 'resync' }

export type RealtimeEventType = RealtimeEvent['type']
type Handler = (event: RealtimeEvent) => void

const CLOSE_UNAUTHORIZED = 4001
const CLOSE_SESSION_REVOKED = 4003
const PING_INTERVAL = 25_000
const MAX_BACKOFF = 30_000

function socketUrl(token: string): string {
  const base = import.meta.env.VITE_WS_URL as string | undefined
  const url = base
    ? base.replace(/\/?$/, '/')
    : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/`
  return `${url}?token=${encodeURIComponent(token)}`
}

class RealtimeClient {
  private ws: WebSocket | null = null
  private handlers = new Set<Handler>()
  private getToken: (() => string | null) | null = null
  private onAuthFailed: (() => Promise<boolean>) | null = null
  private running = false
  private attempt = 0
  private hadConnection = false
  private reconnectTimer: number | undefined
  private pingTimer: number | undefined

  /** Giriş edilenden soň çagyrylýar. onAuthFailed: token ýaramsyz bolanda (true — gaýtadan synanyş). */
  start(getToken: () => string | null, onAuthFailed: () => Promise<boolean>) {
    this.getToken = getToken
    this.onAuthFailed = onAuthFailed
    if (this.running) return
    this.running = true
    this.attempt = 0
    this.hadConnection = false
    document.addEventListener('visibilitychange', this.onVisibility)
    window.addEventListener('online', this.onVisibility)
    this.connect()
  }

  stop() {
    this.running = false
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('online', this.onVisibility)
    window.clearTimeout(this.reconnectTimer)
    window.clearInterval(this.pingTimer)
    const ws = this.ws
    this.ws = null
    ws?.close(1000)
  }

  subscribe(handler: Handler): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  private emit(event: RealtimeEvent) {
    this.handlers.forEach((h) => {
      try {
        h(event)
      } catch (err) {
        console.error('[realtime] handler error', err)
      }
    })
  }

  private onVisibility = () => {
    // Tab gaýdyp açylanda / internet gelende garaşman derrew birikýäris
    if (this.running && document.visibilityState === 'visible' && !this.ws) {
      window.clearTimeout(this.reconnectTimer)
      this.attempt = 0
      this.connect()
    }
  }

  private connect() {
    const token = this.getToken?.()
    if (!this.running || !token || this.ws) return

    const ws = new WebSocket(socketUrl(token))
    this.ws = ws

    ws.onopen = () => {
      this.attempt = 0
      window.clearInterval(this.pingTimer)
      this.pingTimer = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
      }, PING_INTERVAL)
    }

    ws.onmessage = (msg) => {
      let event: RealtimeEvent | { type: 'pong' }
      try {
        event = JSON.parse(msg.data)
      } catch {
        return
      }
      if (event.type === 'pong') return
      if (event.type === 'hello') {
        // Birinji birikmede sahypalar eýýäm täze maglumat ýükledi; gaýtadan birikende — sinhronlaşdyrmaly
        if (this.hadConnection) this.emit({ type: 'resync' })
        this.hadConnection = true
      }
      this.emit(event as RealtimeEvent)
    }

    ws.onclose = async (e) => {
      window.clearInterval(this.pingTimer)
      if (this.ws === ws) this.ws = null
      if (!this.running) return

      if (e.code === CLOSE_SESSION_REVOKED) {
        this.emit({ type: 'session.revoked' })
        this.stop()
        return
      }
      if (e.code === CLOSE_UNAUTHORIZED) {
        const retry = await (this.onAuthFailed?.() ?? Promise.resolve(false))
        if (!retry) {
          this.stop()
          return
        }
      }
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    window.clearTimeout(this.reconnectTimer)
    // 1s, 2s, 4s ... 30s + tötänleýin goşundy (serwer täzeden açylanda hemme bir wagtda birikmez ýaly)
    const delay = Math.min(1000 * 2 ** this.attempt, MAX_BACKOFF) + Math.random() * 1000
    this.attempt++
    this.reconnectTimer = window.setTimeout(() => this.connect(), delay)
  }
}

export const realtime = new RealtimeClient()

/**
 * Komponent içinde wakalara ýazylmak. Handler gysga wagtda gelen birnäçe wakadan soň
 * bir gezek çagyrylýar (debounce) — bir hereket birnäçe waka döredip biler.
 * filter false gaýtarsa waka hasaba alynmaýar. 'resync' elmydama kabul edilýär.
 */
export function useRealtime(
  types: RealtimeEventType[],
  handler: (events: RealtimeEvent[]) => void,
  options: { filter?: (event: RealtimeEvent) => boolean; debounce?: number } = {}
) {
  const wanted = new Set<RealtimeEventType>([...types, 'resync'])
  const wait = options.debounce ?? 300
  let pending: RealtimeEvent[] = []
  let timer: number | undefined
  let unsubscribe: (() => void) | undefined

  onMounted(() => {
    unsubscribe = realtime.subscribe((event) => {
      if (!wanted.has(event.type)) return
      if (event.type !== 'resync' && options.filter && !options.filter(event)) return
      pending.push(event)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const batch = pending
        pending = []
        handler(batch)
      }, wait)
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
    window.clearTimeout(timer)
  })
}
