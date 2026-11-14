<template>
  <el-popover placement="bottom-end" :width="360" trigger="click" @show="load">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import api from '@/api'
import type { AppNotification } from '@/types'

const router = useRouter()
const unread = ref(0)
const items = ref<AppNotification[]>([])
let timer: number | undefined

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

onMounted(() => {
  refreshCount()
  timer = window.setInterval(refreshCount, 60000)
})
onUnmounted(() => window.clearInterval(timer))
</script>
