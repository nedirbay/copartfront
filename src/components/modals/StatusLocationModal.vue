<template>
  <el-dialog
    v-model="visible"
    title="Status we Ýerleşýän Ýerini Täzelemek"
    width="500px"
    destroy-on-close
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="Täze Status">
        <el-select v-model="form.status" class="!w-full">
          <el-option label="Satyn alyndy (Purchased)" value="PURCHASED" />
          <el-option label="Ýolda (In Transit)" value="IN_TRANSIT" />
          <el-option label="Türkmenistana geldi (Arrived TKM)" value="ARRIVED_TKM" />
          <el-option label="Satyldy (Sold)" value="SOLD" />
        </el-select>
      </el-form-item>

      <el-form-item label="Täze Ýerleşýän Ýeri">
        <el-select v-model="form.location" class="!w-full">
          <el-option label="Amerika (Copart)" value="USA_COPART" />
          <el-option label="Ýük daşama ýola çykaryldy" value="SHIPPING_TRANSIT" />
          <el-option label="Gruziýa" value="GEORGIA" />
          <el-option label="Türkmenistan (Içerki ýerleri)" value="TURKMENISTAN_INTERNAL" />
        </el-select>
      </el-form-item>

      <el-form-item label="Bellik (Taryh üçin)">
        <el-input v-model="form.note" type="textarea" :rows="3" placeholder="Mysal: Gruziýa portuna geldi, konteýner açyldy." />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">Ýapmak</el-button>
        <el-button type="primary" :loading="loading" @click="submitUpdate">Täzele</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { Vehicle } from '@/types'

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
const form = reactive({
  status: '',
  location: '',
  note: ''
})

watch(() => props.vehicle, (newVeh) => {
  if (newVeh) {
    form.status = newVeh.status
    form.location = newVeh.location
    form.note = ''
  }
}, { immediate: true })

const submitUpdate = async () => {
  if (!props.vehicle) return
  loading.value = true
  try {
    await api.post(`/vehicles/${props.vehicle.vin}/update-status-location/`, form)
    ElMessage.success('Awtoulagyň statusy we ýerleşýän ýeri täzelendi!')
    visible.value = false
    emit('updated')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || 'Täzelemekde ýalňyşlyk döredi.')
  } finally {
    loading.value = false
  }
}
</script>
