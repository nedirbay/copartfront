<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Left: Brand Logo & Title -->
        <div class="flex items-center gap-8">
          <router-link to="/vehicles" class="flex items-center gap-3 no-underline group">
            <div class="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md group-hover:bg-blue-800 transition">
              <el-icon :size="24"><Van /></el-icon>
            </div>
            <div>
              <span class="text-lg font-bold text-slate-900 tracking-tight block leading-tight">Copart Auto</span>
              <span class="text-xs text-blue-700 font-semibold tracking-wider uppercase block">Dolandyryş Ulgamy</span>
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
              <span>Awtoulaglar</span>
            </router-link>

            <router-link
              to="/reports"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/reports') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><DataAnalysis /></el-icon>
              <span>Hasabatlar</span>
            </router-link>

            <router-link
              v-if="authStore.isAdmin"
              to="/employees"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/employees') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><User /></el-icon>
              <span>Işgärler</span>
            </router-link>


            <router-link
              v-if="authStore.isAdmin"
              to="/dictionaries"
              class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 no-underline"
              :class="$route.path.startsWith('/dictionaries') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              <el-icon><Collection /></el-icon>
              <span>Sözlükler</span>
            </router-link>

          </nav>
        </div>

        <!-- Right: Current User & Logout -->
        <div class="flex items-center gap-4">
          <div v-if="authStore.user" class="hidden sm:flex items-center gap-3 pr-2 border-r border-slate-200">
            <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
              {{ authStore.user.first_name ? authStore.user.first_name[0].toUpperCase() : authStore.user.username[0].toUpperCase() }}
            </div>
            <div class="text-right leading-tight">
              <span class="block text-sm font-semibold text-slate-800">
                {{ authStore.user.first_name }} {{ authStore.user.last_name }}
              </span>
              <div class="mt-0.5">
                <el-tag v-if="authStore.isAdmin" type="danger" size="small" effect="light" class="font-medium">
                  Administrator
                </el-tag>
                <el-tag v-else type="primary" size="small" effect="light" class="font-medium">
                  Işgär
                </el-tag>
              </div>
            </div>
          </div>

          <el-button type="danger" plain size="default" class="!rounded-lg" @click="handleLogout">
            <el-icon class="mr-1"><SwitchButton /></el-icon>
            <span class="hidden sm:inline">Çykmak</span>
          </el-button>
        </div>

      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  ElMessageBox.confirm(
    'Ulgamdan çykmak isleýärsiňizmi?',
    'Ulgamdan Çykmak',
    {
      confirmButtonText: 'Hawa, çyk',
      cancelButtonText: 'Ýap',
      type: 'warning',
    }
  ).then(() => {
    authStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>
