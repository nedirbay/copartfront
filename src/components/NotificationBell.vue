<template>
  <el-popover placement="bottom-end" :width="360" trigger="click" @show="onShow" @hide="open_ = false">
    <template #reference>
      <el-badge :value="unread" :hidden="unread === 0" :max="99">
        <el-button circle><el-icon><Bell /></el-icon></el-button>
      </el-badge>
    </template>
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-800">{{ $t('x.notifications') }}</span>
        <el-button v-if="unread > 0" link type="primary" size="small" @click="markAll">{{ $t('x.markAllRead') }}</el-button>
      </div>
      <div v-if="items.length === 0" class="text-sm text-slate-400 py-4 text-center">{{ $t('x.noNotifications') }}</div>
      <div class="max-h-96 overflow-y-auto divide-y divide-slate-100">
        <div
          v-for="n in items"
          :key="n.id"
          class="py-2 px-1 cursor-pointer hover:bg-slate-50 rounded"
          :class="n.is_read ? 'opacity-60' : ''"
          @click="open(n)"
        >
          <div class="text-sm text-slate-800" :class="n.is_read ? '' : 'font-semibold'">{{ n.message }}</div>
          <div class="text-[11px] text-slate-400">{{ new Date(n.created_at).toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { AppNotification } from '@/types'
import { useRealtime, type RealtimeEvent } from '@/realtime'

const router = useRouter()
const { t } = useI18n()
const unread = ref(0)
const items = ref<AppNotification[]>([])
const open_ = ref(false)

const refreshCount = async () => {
  try {
    const res = await api.get('/notifications/unread-count/')
    unread.value = res.data.count
  } catch (err) {}
}

const load = async () => {
  try {
    const res = await api.get<AppNotification[]>('/notifications/')
    items.value = res.data
  } catch (err) {}
}

const onShow = () => {
  open_.value = true
  load()
  // Brauzer bildirişleri üçin rugsat diňe ulanyjy hereketinde soralyp bilner — jaňjagaz basylanda soraýarys
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

const markAll = async () => {
  await api.post('/notifications/read-all/')
  items.value.forEach((n) => (n.is_read = true))
  unread.value = 0
}

const open = async (n: AppNotification) => {
  if (!n.is_read) {
    await api.post(`/notifications/${n.id}/read/`).catch(() => {})
    n.is_read = true
    unread.value = Math.max(0, unread.value - 1)
  }
  if (n.vehicle) router.push(`/vehicles/${n.vehicle}`)
}

onMounted(refreshCount)

// Täze bildiriş geldi ýa-da başga enjamda okaldy — derrew täzelenýär
useRealtime(['notifications.changed'], () => {
  refreshCount()
  if (open_.value) load()
})

type CreatedEvent = Extract<RealtimeEvent, { type: 'notification.created' }>

/** Täze bildirişi görkezýär: tab açyk bolsa popup, gizlin bolsa brauzeriň (ulgamyň) bildirişi. */
const announce = (e: CreatedEvent) => {
  const n: AppNotification = { id: e.id, vehicle: e.vehicle, kind: e.kind, message: e.message, is_read: false, created_at: e.created_at }
  const title = t('x.newNotification')

  if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
    // tag — birnäçe tab açyk bolsa brauzer bir bildiriş görkezýär
    const desktop = new Notification(title, { body: n.message, tag: `copart-${n.id}`, icon: '/favicon.svg' })
    desktop.onclick = () => {
      window.focus()
      desktop.close()
      open(n)
    }
    return
  }

  const popup = ElNotification({
    title,
    message: n.message,
    type: 'info',
    duration: 8000,
    customClass: 'cursor-pointer',
    onClick: () => {
      popup.close()
      open(n)
    },
  })
}

useRealtime(
  ['notification.created'],
  (events) => {
    const created = events.filter((e): e is CreatedEvent => e.type === 'notification.created')
    // Bir wagtda köp bildiriş gelse ekrany doldurmazlyk üçin iň soňky 3-si
    created.slice(-3).forEach(announce)
  },
  { debounce: 50 }
)
</script>
