const SYMBOLS: Record<string, string> = { USD: '$', EUR: '€' }

/** Pul mukdaryny walýuta belgisi bilen görkezýär: $1 200.00, 350.00 TMT */
export function money(value: string | number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  const text = Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ')
    : String(value)
  const code = (currency || 'USD').toUpperCase()
  return SYMBOLS[code] ? `${SYMBOLS[code]}${text}` : `${text} ${code}`
}

export function dateOnly(value: string | null | undefined, locale = 'tkm'): string {
  if (!value) return '—'
  const loc = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'tk-TM'
  return new Date(value).toLocaleDateString(loc, { dateStyle: 'medium' })
}

/** Serwerden gelen ýalňyşlyk habaryny okalýan görnüşe getirýär. */
export function apiError(err: any, fallback: string): string {
  const data = err?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return fallback
  if (data.detail) return String(data.detail)
  const first = Object.values(data)[0]
  if (Array.isArray(first) && first.length) return String(first[0])
  if (typeof first === 'string') return first
  return fallback
}

/** Faýly brauzerde ýükläp almak (axios blob jogaby üçin). */
export function saveBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
