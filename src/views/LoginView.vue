<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
      
      <!-- Top Language Selector -->
      <div class="flex justify-end">
        <el-dropdown trigger="click" @command="handleLanguageChange">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition select-none text-xs font-semibold text-slate-700">
            <span class="text-base leading-none">{{ currentLangInfo.flag }}</span>
            <span>{{ currentLangInfo.code.toUpperCase() }}</span>
            <el-icon class="text-slate-400 text-xs ml-0.5"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="min-w-[130px]">
              <el-dropdown-item
                v-for="item in languages"
                :key="item.code"
                :command="item.code"
                :class="{ '!text-blue-700 !font-semibold !bg-blue-50/70': locale === item.code }"
              >
                <div class="flex items-center gap-2 py-0.5">
                  <span class="text-base">{{ item.flag }}</span>
                  <span>{{ item.label }}</span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- Brand Logo -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 text-white shadow-lg mb-2">
          <el-icon :size="32"><Van /></el-icon>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Copart Auto</h1>
        <p class="text-xs text-slate-500">{{ $t('auth.subtitle') }}</p>
      </div>

      <!-- Test Accounts Info Card -->
      <div class="bg-blue-50/80 border border-blue-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
        <div class="font-bold text-blue-900 flex items-center gap-1">
          <el-icon><InfoFilled /></el-icon> Test Accounts:
        </div>

        <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100">
          <div>
            <span class="font-bold text-slate-900">Admin:</span>
            <code class="text-blue-700 font-mono ml-1">admin</code> / <code class="text-slate-600 font-mono">adminpassword123</code>
          </div>
          <el-button type="primary" link size="small" @click="fillCredentials('admin', 'adminpassword123')">Fill</el-button>
        </div>

        <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100">
          <div>
            <span class="font-bold text-slate-900">{{ $t('nav.roleEmployee') }}:</span>
            <code class="text-blue-700 font-mono ml-1">isgar_merdan</code> / <code class="text-slate-600 font-mono">employeepassword123</code>
          </div>
          <el-button type="primary" link size="small" @click="fillCredentials('isgar_merdan', 'employeepassword123')">Fill</el-button>
        </div>
      </div>

      <!-- Login Form -->
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" size="large" @keyup.enter="handleLogin">
        
        <el-form-item :label="$t('auth.username')" prop="username">
          <el-input v-model="form.username" :placeholder="$t('auth.usernamePlaceholder')" prefix-icon="User" />
        </el-form-item>

        <el-form-item :label="$t('auth.password')" prop="password">
          <el-input v-model="form.password" type="password" :placeholder="$t('auth.passwordPlaceholder')" prefix-icon="Lock" show-password />
        </el-form-item>

        <el-button type="primary" class="!w-full !mt-4 !py-3 !rounded-xl text-base font-semibold" :loading="loading" @click="handleLogin">
          {{ $t('auth.loginBtn') }}
        </el-button>

      </el-form>

      <div class="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
        Copart Auto Management System &copy; 2026
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { setLanguage, type SupportedLocale } from '@/i18n'
import { ArrowDown, Van, InfoFilled, User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const languages = [
  { code: 'tkm', label: 'Türkmençe', flag: '🇹🇲' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

const currentLangInfo = computed(() => {
  return languages.find(l => l.code === locale.value) || languages[0]
})

const handleLanguageChange = (val: string) => {
  setLanguage(val as SupportedLocale)
}

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('auth.usernamePlaceholder'), trigger: 'blur' }],
  password: [{ required: true, message: t('auth.passwordPlaceholder'), trigger: 'blur' }]
}))

const fillCredentials = (u: string, p: string) => {
  form.username = u
  form.password = p
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(form)
        ElMessage.success(t('auth.loginSuccess'))
        router.push('/vehicles')
      } catch (err: any) {
        ElMessage.error(err.response?.data?.detail || t('auth.loginFailed'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
