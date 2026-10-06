<template>
  <el-dialog
    v-model="visible"
    title="Awtoulagy Işgäre Berkitmek"
    width="500px"
    destroy-on-close
    @open="fetchEmployees"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <el-form-item label="Jogapkär Işgär (Employee)" prop="employee_id">
        <el-select v-model="form.employee_id" placeholder="Işgär saýlaň" filterable class="!w-full">
          <el-option
            v-for="emp in employees"
            :key="emp.id"
            :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
            :value="emp.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Bellik (Optional)">
        <el-input v-model="form.note" type="textarea" :rows="2" placeholder="Mysal: Awtoulag Merdana berkidildi." />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">Ýapmak</el-button>
        <el-button type="primary" :loading="loading" @click="submitAssign">Berkit</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
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

const formRef = ref<FormInstance>()
const loading = ref(false)
const employees = ref<User[]>([])

const form = reactive({
  employee_id: null as number | null,
  note: ''
})

const rules: FormRules = {
  employee_id: [{ required: true, message: 'Işgär saýlaň', trigger: 'change' }]
}

watch(() => props.vehicle, (newVeh) => {
  if (newVeh) {
    form.employee_id = newVeh.current_owner
    form.note = ''
  }
}, { immediate: true })

const fetchEmployees = async () => {
  try {
    const res = await api.get<User[]>('/auth/employees/')
    employees.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {}
}

const submitAssign = async () => {
  if (!formRef.value || !props.vehicle) return
  await formRef.value.validate(async (valid) => {
    if (valid && props.vehicle) {
      loading.value = true
      try {
        await api.post(`/vehicles/${props.vehicle.vin}/assign/`, form)
        ElMessage.success('Awtoulag işgäre üstünlikli berkidildi!')
        visible.value = false
        emit('updated')
      } catch (err: any) {
        ElMessage.error(err.response?.data?.detail || 'Işgäre berkitmekde ýalňyşlyk döredi.')
      } finally {
        loading.value = false
      }
    }
  })
}

</script>
