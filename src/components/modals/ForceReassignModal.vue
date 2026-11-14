<template>
  <el-dialog v-model="visible" :title="$t('x.forceReassignBtn')" width="500px" destroy-on-close @open="onOpen">
    <el-alert :title="$t('x.forceReassignHint')" type="warning" show-icon :closable="false" class="mb-4" />
    <el-form label-position="top">
      <el-form-item :label="$t('vehicles.owner')">
        <el-select v-model="employeeId" :placeholder="$t('vehicles.assignPlaceholder')" filterable class="!w-full">
          <el-option
            v-for="emp in employees"
            :key="emp.id"
            :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
            :value="emp.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('x.reasonTitle')" required>
        <el-input v-model="note" type="textarea" :rows="3" :placeholder="$t('x.reasonPrompt')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">{{ $t('common.close') }}</el-button>
        <el-button type="danger" :loading="loading" :disabled="!employeeId || !note.trim()" @click="submit">
          {{ $t('x.forceReassignBtn') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { Vehicle, User } from '@/types'
import { apiError } from '@/utils/format'

const props = defineProps<{ modelValue: boolean; vehicle: Vehicle | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void; (e: 'updated'): void }>()
const { t } = useI18n()

const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const employees = ref<User[]>([])
const employeeId = ref<number | null>(null)
const note = ref('')
const loading = ref(false)

const onOpen = async () => {
  employeeId.value = null
  note.value = ''
  try {
    const res = await api.get<User[]>('/auth/employees/lookup/')
    employees.value = res.data.filter((u) => u.id !== props.vehicle?.current_owner)
  } catch (err) {}
}

const submit = async () => {
  if (!props.vehicle || !employeeId.value) return
  loading.value = true
  try {
    await api.post(`/vehicles/${props.vehicle.vin}/force-reassign/`, { employee_id: employeeId.value, note: note.value })
    ElMessage.success(t('common.success'))
    visible.value = false
    emit('updated')
  } catch (err: any) {
    ElMessage.error(apiError(err, t('common.error')))
  } finally {
    loading.value = false
  }
}
</script>
