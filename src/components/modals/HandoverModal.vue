<template>
  <el-dialog
    v-model="visible"
    title="Kabul Ediş-Tabşyryş (Handover)"
    width="500px"
    destroy-on-close
  >
    <el-alert
      title="Awtoulag tabşyrylandan soň, ondan soňky çykdajylar we ýagdaýy tabşyrylan işgär tarapyndan dolandyrylar."
      type="info"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <el-form label-position="top">
      <el-form-item label="Kabul ediji Işgär (Employee)">
        <el-select v-model="selectedEmployeeId" placeholder="Işgäri seçiň" class="!w-full">
          <el-option
            v-for="emp in employees"
            :key="emp.id"
            :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
            :value="emp.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Tabşyryş Belligi">
        <el-input v-model="note" type="textarea" :rows="3" placeholder="Mysal: Gruziýada awtoulag kabul edip alyndy." />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">Ýapmak</el-button>
        <el-button type="success" :loading="loading" :disabled="!selectedEmployeeId" @click="submitHandover">
          Tabşyr (Handover)
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
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
    employees.value = res.data
  } catch (err) {
    // If empty or error
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
    ElMessage.success('Awtoulag üstünlikli tabşyryldy!')
    visible.value = false
    emit('updated')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || 'Tabşyryşda ýalňyşlyk döredi.')
  } finally {
    loading.value = false
  }
}
</script>
