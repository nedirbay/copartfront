<template>
  <div class="space-y-6">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ $t('employees.title') }}</h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ $t('employees.subtitle') }}
        </p>
      </div>

      <el-button
        type="primary"
        size="large"
        class="!rounded-xl shadow-xs"
        @click="showCreateModal = true"
      >
        <el-icon class="mr-1.5"><UserFilled /></el-icon>
        {{ $t('employees.addNew') }}
      </el-button>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <el-table
        v-loading="loading"
        :data="employees"
        style="width: 100%"
        stripe
        :empty-text="$t('employees.emptyList')"
      >
        <el-table-column :label="$t('employees.username')" min-width="150">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-800">@{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employees.fullName')" min-width="180">
          <template #default="{ row }">
            <span class="font-semibold text-slate-900">{{ row.first_name }} {{ row.last_name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employees.phone')" min-width="150">
          <template #default="{ row }">
            <span class="text-slate-600 text-sm font-mono">{{ row.phone_number || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employees.role')" min-width="110">
          <template #default>
            <el-tag type="primary" effect="light" class="font-medium">
              {{ $t('nav.roleEmployee') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.createdDate')" min-width="140">
          <template #default="{ row }">
            <span class="text-xs text-slate-500">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <!-- Actions Column -->
        <el-table-column :label="$t('common.actions')" min-width="210" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <el-button
                v-if="row.raw_password"
                type="primary"
                size="small"
                class="!rounded-lg"
                @click="copyToClipboard(row.raw_password)"
              >
                <el-icon class="mr-1"><DocumentCopy /></el-icon>
                {{ $t('common.copy') }}
              </el-button>

              <el-button
                type="warning"
                plain
                size="small"
                class="!rounded-lg"
                @click="handleResetPassword(row)"
              >
                <el-icon class="mr-1"><Key /></el-icon>
                {{ $t('common.edit') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Create Employee Modal -->
    <EmployeeCreateModal v-model="showCreateModal" @created="fetchEmployees" />

    <!-- Password Display & Copy Modal -->
    <el-dialog
      v-model="showPasswordDialog"
      :title="$t('employees.newPassGenerated')"
      width="480px"
      destroy-on-close
    >
      <div v-if="selectedUser" class="text-center space-y-4 py-2">
        <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
          <el-icon :size="28"><Key /></el-icon>
        </div>

        <div>
          <h3 class="text-lg font-bold text-slate-900">
            {{ selectedUser.first_name }} {{ selectedUser.last_name }} (@{{ selectedUser.username }})
          </h3>
          <p class="text-xs text-slate-500 mt-1">
            {{ $t('employees.createHint') }}
          </p>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-left">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ $t('employees.password') }}:</div>
          <div class="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <code class="text-base font-mono font-bold text-blue-700 select-all">{{ generatedPassword }}</code>
            <el-button type="primary" size="default" class="!rounded-lg" @click="copyToClipboard(generatedPassword)">
              <el-icon class="mr-1"><DocumentCopy /></el-icon>
              {{ $t('common.copy') }}
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <el-button @click="showPasswordDialog = false">{{ $t('common.close') }}</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { User } from '@/types'
import EmployeeCreateModal from '@/components/modals/EmployeeCreateModal.vue'
import { UserFilled, DocumentCopy, Key } from '@element-plus/icons-vue'

const { t, locale } = useI18n()
const loading = ref(false)
const employees = ref<User[]>([])
const showCreateModal = ref(false)

const showPasswordDialog = ref(false)
const selectedUser = ref<User | null>(null)
const generatedPassword = ref('')

const fetchEmployees = async () => {
  loading.value = true
  try {
    const res = await api.get<User[]>('/auth/employees/')
    employees.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {
    ElMessage.error(t('common.error'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})

const handleResetPassword = (user: User) => {
  ElMessageBox.confirm(
    `"${user.first_name} ${user.last_name}" (@${user.username})`,
    t('employees.newPassGenerated'),
    {
      confirmButtonText: t('common.yes'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await api.post(`/auth/employees/${user.id}/reset-password/`)
      selectedUser.value = user
      generatedPassword.value = res.data.new_password
      showPasswordDialog.value = true
      fetchEmployees()
      ElMessage.success(t('common.success'))
    } catch (err) {
      ElMessage.error(t('common.error'))
    }
  }).catch(() => {})
}

const copyToClipboard = async (text?: string) => {
  if (!text) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success(t('common.copied'))
  } catch (err) {
    ElMessage.error(t('common.error'))
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const loc = locale.value === 'ru' ? 'ru-RU' : locale.value === 'en' ? 'en-US' : 'tk-TM'
  return d.toLocaleDateString(loc, { dateStyle: 'medium' })
}
</script>
