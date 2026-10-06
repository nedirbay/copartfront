<template>
  <el-dialog
    v-model="visible"
    title="Status we Ýerleşýän Ýerini Täzelemek"
    width="500px"
    destroy-on-close
    @open="loadDictionaries"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="Täze Status">
        <el-select v-model="form.status" class="!w-full">
          <el-option
            v-for="st in statusesList"
            :key="st.code"
            :label="st.name"
            :value="st.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Täze Ýerleşýän Ýeri">
        <el-select v-model="form.location" class="!w-full">
          <el-option
            v-for="loc in locationsList"
            :key="loc.code"
            :label="loc.name"
            :value="loc.code"
          />
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
import type { Vehicle, DynamicStatus, DynamicLocation } from '@/types'

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
const statusesList = ref<DynamicStatus[]>([])
const locationsList = ref<DynamicLocation[]>([])

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

const loadDictionaries = async () => {
  try {
    const [stRes, locRes] = await Promise.all([
      api.get('/vehicles/dictionaries/statuses/'),
      api.get('/vehicles/dictionaries/locations/')
    ])
    statusesList.value = Array.isArray(stRes.data) ? stRes.data : stRes.data.results || []
    locationsList.value = Array.isArray(locRes.data) ? locRes.data : locRes.data.results || []
  } catch (err) {}
}

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
