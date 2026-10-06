<template>
  <div class="space-y-6">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Işgärler Dolandyryşy</h1>
        <p class="text-sm text-slate-500 mt-1">
          Ulgamdaky işgärleriň hasaplaryny dörediň we olaryň parollaryny kopýalaň.
        </p>
      </div>

      <el-button
        type="primary"
        size="large"
        class="!rounded-xl shadow-xs"
        @click="showCreateModal = true"
      >
        <el-icon class="mr-1.5"><UserFilled /></el-icon>
        Täze Işgär Goş
      </el-button>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <el-table
        v-loading="loading"
        :data="employees"
        style="width: 100%"
        stripe
        empty-text="Işgär tapylmady."
      >
        <el-table-column label="Ulanyjy Ady" min-width="150">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-800">@{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Ady & Familiýasy" min-width="180">
          <template #default="{ row }">
            <span class="font-semibold text-slate-900">{{ row.first_name }} {{ row.last_name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Telefon" min-width="150">
          <template #default="{ row }">
            <span class="text-slate-600 text-sm font-mono">{{ row.phone_number || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Roly" min-width="110">
          <template #default="{ row }">
            <el-tag type="primary" effect="light" class="font-medium">
              Işgär
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Döredilen Senesi" min-width="140">
          <template #default="{ row }">
            <span class="text-xs text-slate-500">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <!-- Actions Column -->
        <el-table-column label="Amallar" min-width="210" align="center">
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
                Paroly Göçür
              </el-button>

              <el-button
                type="warning"
                plain
                size="small"
                class="!rounded-lg"
                @click="handleResetPassword(row)"
              >
                <el-icon class="mr-1"><Key /></el-icon>
                Täzele
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
      title="Täze Parol Döredildi"
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
            Işgär üçin täze 16 belgili awtomatiki kynlykly parol döredildi:
          </p>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-left">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Täze Parol:</div>
          <div class="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <code class="text-base font-mono font-bold text-blue-700 select-all">{{ generatedPassword }}</code>
            <el-button type="primary" size="default" class="!rounded-lg" @click="copyToClipboard(generatedPassword)">
              <el-icon class="mr-1"><DocumentCopy /></el-icon>
              Paroly Göçür
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <el-button @click="showPasswordDialog = false">Ýapmak</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import type { User } from '@/types'
import EmployeeCreateModal from '@/components/modals/EmployeeCreateModal.vue'

const loading = ref(false)
const employees = ref<User[]>([])
const showCreateModal = ref(false)

const showPasswordDialog = ref(false)
const selectedUser = ref<User | null>(null)
const generatedPassword = ref('')
const showPasswordMap = reactive<Record<number, boolean>>({})

const fetchEmployees = async () => {
  loading.value = true
  try {
    const res = await api.get<User[]>('/auth/employees/')
    employees.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {
    ElMessage.error('Işgärler sanawy ýüklenmedi.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})

const toggleShowPassword = (userId: number) => {
  showPasswordMap[userId] = !showPasswordMap[userId]
}

const handleResetPassword = (user: User) => {
  ElMessageBox.confirm(
    `"${user.first_name} ${user.last_name}" (@${user.username}) işgäriniň parolyny täzelemek we täze paroly göçürmek isleýärsiňizmi?`,
    'Täze Parol Döretmek',
    {
      confirmButtonText: 'Hawa, täzele we göçür',
      cancelButtonText: 'Ýap',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await api.post(`/auth/employees/${user.id}/reset-password/`)
      selectedUser.value = user
      generatedPassword.value = res.data.new_password
      showPasswordDialog.value = true
      fetchEmployees()
      ElMessage.success('Işgäriň paroly üstünlikli täzelendi!')
    } catch (err) {
      ElMessage.error('Parol täzelenende ýalňyşlyk ýüze çykdy.')
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
    ElMessage.success('Parol üstünlikli göçürüldi (Copied)!')
  } catch (err) {
    ElMessage.error('Göçürmekde ýalňyşlyk döredi.')
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('tk-TM', { dateStyle: 'medium' })
}
</script>
