import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const loading = ref<boolean>(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isEmployee = computed(() => user.value?.role === 'EMPLOYEE')

  async function login(credentials: { username: string; password: string }) {
    loading.value = true
    try {
      const res = await api.post('/auth/token/', credentials)
      token.value = res.data.access
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      await fetchUserProfile()
      return true
    } finally {
      loading.value = false
    }
  }

  async function fetchUserProfile() {
    if (!token.value) return
    try {
      const res = await api.get<User>('/auth/me/')
      user.value = res.data
    } catch (err) {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isEmployee,
    login,
    fetchUserProfile,
    logout,
  }
})
