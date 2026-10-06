<template>
  <el-dialog
    v-model="visible"
    :title="$t('vehicles.editStatusBtn')"
    width="500px"
    destroy-on-close
    @open="loadDictionaries"
  >
    <el-form :model="form" label-position="top">
      <el-form-item :label="$t('vehicles.statusLabel')">
        <el-select v-model="form.status" class="!w-full">
          <el-option
            v-for="st in statusesList"
            :key="st.code"
            :label="getStatusLabel(st.code)"
            :value="st.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('vehicles.locationLabel')">
        <el-select v-model="form.location" class="!w-full">
          <el-option
            v-for="loc in locationsList"
            :key="loc.code"
            :label="getLocationLabel(loc.code)"
            :value="loc.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('common.note')">
        <el-input v-model="form.note" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">{{ $t('common.close') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitUpdate">{{ $t('common.save') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

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

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PURCHASED': return t('vehicles.statusPurchased')
    case 'IN_TRANSIT': return t('vehicles.statusInTransit')
    case 'ARRIVED_TKM': return t('vehicles.statusArrivedTkm')
    case 'SOLD': return t('vehicles.statusSold')
    default: {
      const found = statusesList.value.find(s => s.code === status)
      return found ? found.name : status
    }
  }
}

const getLocationLabel = (loc: string) => {
  switch (loc) {
    case 'USA_COPART': return t('vehicles.locUsaCopart')
    case 'SHIPPING_TRANSIT': return t('vehicles.locShippingTransit')
    case 'GEORGIA': return t('vehicles.locGeorgia')
    case 'TURKMENISTAN_INTERNAL': return t('vehicles.locTurkmenistanInternal')
    default: {
      const found = locationsList.value.find(l => l.code === loc)
      return found ? found.name : loc
    }
  }
}

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
