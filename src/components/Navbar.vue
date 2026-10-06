<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Left: Brand Logo & Title -->
        <div class="flex items-center gap-8">
          <router-link to="/vehicles" class="flex items-center gap-3 no-underline group">
            <div class="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md group-hover:bg-blue-800 transition">
              <el-icon :size="24"><Van /></el-icon>
            </div>
            <div>
              <span class="text-lg font-bold text-slate-900 tracking-tight block leading-tight">Copart Auto</span>
              <span class="text-xs text-blue-700 font-semibold tracking-wider uppercase block">{{ $t('nav.brandSubtitle') }}</span>
            </div>
          </router-link>

          <!-- Middle: Horizontal Navigation Links -->
          <nav class="hidden md:flex items-center space-x-1">
            <router-link
              to="/vehicles"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/vehicles') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><Van /></el-icon>
              <span>{{ $t('nav.vehicles') }}</span>
            </router-link>

            <router-link
              to="/reports"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/reports') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><DataAnalysis /></el-icon>
              <span>{{ $t('nav.reports') }}</span>
            </router-link>

            <router-link
              v-if="authStore.isAdmin"
              to="/employees"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/employees') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><User /></el-icon>
              <span>{{ $t('nav.employees') }}</span>
            </router-link>

            <router-link
              v-if="authStore.isAdmin"
              to="/dictionaries"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/dictionaries') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><Collection /></el-icon>
              <span>{{ $t('nav.dictionaries') }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Right: Language Selector, User Profile & Logout -->
        <div class="flex items-center gap-3">
          <!-- Language Selector Dropdown -->
          <el-dropdown trigger="click" @command="handleLanguageChange">
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition select-none text-xs font-semibold text-slate-700">
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

          <!-- User Profile -->
          <div v-if="authStore.user" class="hidden sm:flex items-center gap-3 pl-1 pr-3 border-r border-slate-200">
            <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
              {{ authStore.user.first_name ? authStore.user.first_name[0].toUpperCase() : authStore.user.username[0].toUpperCase() }}
            </div>
            <div class="text-right leading-tight">
              <span class="block text-sm font-semibold text-slate-800">
                {{ authStore.user.first_name }} {{ authStore.user.last_name }}
              </span>
              <div class="mt-0.5">
                <el-tag v-if="authStore.isAdmin" type="danger" size="small" effect="light" class="font-medium">
                  {{ $t('nav.roleAdmin') }}
                </el-tag>
                <el-tag v-else type="primary" size="small" effect="light" class="font-medium">
                  {{ $t('nav.roleEmployee') }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- Logout Button -->
          <el-button type="danger" plain size="default" class="!rounded-lg" @click="handleLogout">
            <el-icon class="mr-1"><SwitchButton /></el-icon>
            <span class="hidden sm:inline">{{ $t('nav.logout') }}</span>
          </el-button>
        </div>

      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { setLanguage, type SupportedLocale } from '@/i18n'
import { ArrowDown, SwitchButton, Van, DataAnalysis, User, Collection } from '@element-plus/icons-vue'

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

const handleLogout = () => {
  ElMessageBox.confirm(
    t('nav.logoutConfirm'),
    t('nav.logoutTitle'),
    {
      confirmButtonText: t('common.yes'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    }
  ).then(() => {
    authStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>
