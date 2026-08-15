<template>
  <div class="space-y-6">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Işgärler Dolandyryşy</h1>
        <p class="text-sm text-slate-500 mt-1">
          Ulgamdaky işgärleriň hasaplaryny dörediň we dolandyryň.
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
        <el-table-column label="Ulanyjy Ady" min-width="160">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-800">@{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Ady & Familiýasy" min-width="200">
          <template #default="{ row }">
            <span class="font-semibold text-slate-900">{{ row.first_name }} {{ row.last_name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Email" min-width="200">
          <template #default="{ row }">
            <span class="text-slate-600 text-sm">{{ row.email || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Telefon" min-width="160">
          <template #default="{ row }">
            <span class="text-slate-600 text-sm font-mono">{{ row.phone_number || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Roly" min-width="120">
          <template #default="{ row }">
            <el-tag type="primary" effect="light" class="font-medium">
              Işgär
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Döredilen Senesi" min-width="160">
          <template #default="{ row }">
            <span class="text-xs text-slate-500">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Modal -->
    <EmployeeCreateModal v-model="showCreateModal" @created="fetchEmployees" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { User } from '@/types'
import EmployeeCreateModal from '@/components/modals/EmployeeCreateModal.vue'

const loading = ref(false)
const employees = ref<User[]>([])
const showCreateModal = ref(false)

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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('tk-TM', { dateStyle: 'medium' })
}
</script>
