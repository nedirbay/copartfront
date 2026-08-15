<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
      
      <!-- Brand Logo -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 text-white shadow-lg mb-2">
          <el-icon :size="32"><Van /></el-icon>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Copart Auto System</h1>
        <p class="text-xs text-slate-500">Awtoulaglary dolandyrmak we hasaba almak ulgamy</p>
      </div>

      <!-- Test Accounts Info Card -->
      <div class="bg-blue-50/80 border border-blue-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
        <div class="font-bold text-blue-900 flex items-center gap-1">
          <el-icon><InfoFilled /></el-icon> Barlag üçin Ulanyjylar (Test Accounts):
        </div>

        <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100">
          <div>
            <span class="font-bold text-slate-900">Admin:</span>
            <code class="text-blue-700 font-mono ml-1">admin</code> / <code class="text-slate-600 font-mono">adminpassword123</code>
          </div>
          <el-button type="primary" link size="small" @click="fillCredentials('admin', 'adminpassword123')">Doldur</el-button>
        </div>

        <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100">
          <div>
            <span class="font-bold text-slate-900">Işgär:</span>
            <code class="text-blue-700 font-mono ml-1">isgar_merdan</code> / <code class="text-slate-600 font-mono">employeepassword123</code>
          </div>
          <el-button type="primary" link size="small" @click="fillCredentials('isgar_merdan', 'employeepassword123')">Doldur</el-button>
        </div>
      </div>

      <!-- Login Form -->
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" size="large" @keyup.enter="handleLogin">
        
        <el-form-item label="Ulanyjy Ady (Username)" prop="username">
          <el-input v-model="form.username" placeholder="Ulanyjy adyňyzy giriziň" prefix-icon="User" />
        </el-form-item>

        <el-form-item label="Parol (Password)" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Parolyňyzy giriziň" prefix-icon="Lock" show-password />
        </el-form-item>

        <el-button type="primary" class="!w-full !mt-4 !py-3 !rounded-xl text-base font-semibold" :loading="loading" @click="handleLogin">
          Ulgama Gir
        </el-button>

      </el-form>

      <div class="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
        Copart Auto Management System &copy; 2026
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: 'Ulanyjy adyny giriziň', trigger: 'blur' }],
  password: [{ required: true, message: 'Paroly giriziň', trigger: 'blur' }]
}

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
        ElMessage.success('Ulgama üstünlikli girildi!')
        router.push('/vehicles')
      } catch (err: any) {
        ElMessage.error(err.response?.data?.detail || 'Ulanyjy ady ýa-da parol nädogry!')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
