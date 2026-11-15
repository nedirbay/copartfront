<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <Navbar />
    <main class="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      &copy; 2026 Copart Auto Tracking System. Ähli hukuklar goralan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'
import { realtime } from '@/realtime'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

// Giren ulanyjy üçin real-time birikme: başga ulanyjylaryň üýtgeşmeleri derrew görünýär
let unsubscribe: (() => void) | undefined
onMounted(() => {
  realtime.start(
    () => localStorage.getItem('access_token'),
    async () => {
      // Token ýaramsyz: profili okamak 401 bolsa api interceptor çykarýar, bolmasa gaýtadan synanyşýarys
      await authStore.fetchUserProfile()
      return authStore.isAuthenticated
    }
  )
  unsubscribe = realtime.subscribe((event) => {
    if (event.type === 'session.revoked') {
      ElMessage.warning(t('x.sessionRevoked'))
      authStore.logout()
      router.push('/login')
    }
  })
})
onUnmounted(() => {
  unsubscribe?.()
  realtime.stop()
})
</script>
