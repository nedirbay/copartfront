<template>
  <el-dialog
    v-model="visible"
    :title="$t('vehicles.handoverBtn')"
    width="500px"
    destroy-on-close
  >
    <el-alert
      :title="$t('vehicles.handoverAlertDesc')"
      type="info"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <el-form label-position="top">
      <el-form-item :label="$t('vehicles.owner')">
        <el-select v-model="selectedEmployeeId" :placeholder="$t('vehicles.assignPlaceholder')" class="!w-full">
          <el-option
            v-for="emp in employees"
            :key="emp.id"
            :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
            :value="emp.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('common.note')">
        <el-input v-model="note" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">{{ $t('common.close') }}</el-button>
        <el-button type="success" :loading="loading" :disabled="!selectedEmployeeId" @click="submitHandover">
          {{ $t('vehicles.handoverBtn') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { Vehicle, User } from '@/types'

const props = defineProps<{
  modelValue: boolean
  vehicle: Vehicle | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'updated'): void
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const employees = ref<User[]>([])
const selectedEmployeeId = ref<number | null>(null)
const note = ref('')

const fetchEmployees = async () => {
  try {
    const res = await api.get<User[]>('/auth/employees/')
    employees.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {
  }
}

watch(visible, (val) => {
  if (val) {
    fetchEmployees()
    selectedEmployeeId.value = null
    note.value = ''
  }
})

const submitHandover = async () => {
  if (!props.vehicle || !selectedEmployeeId.value) return
  loading.value = true
  try {
    await api.post(`/vehicles/${props.vehicle.vin}/handover/`, {
      employee_id: selectedEmployeeId.value,
      note: note.value
    })
    ElMessage.success(t('common.success'))
    visible.value = false
    emit('updated')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || t('common.error'))
  } finally {
    loading.value = false
  }
}
</script>
