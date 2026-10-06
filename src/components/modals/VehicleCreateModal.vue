<template>
  <el-dialog
    v-model="visible"
    :title="$t('vehicles.createModalTitle')"
    width="580px"
    class="top-modal"
    append-to-body
    destroy-on-close
    @open="loadDictionaries"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <div class="grid grid-cols-2 gap-4">
        
        <el-form-item :label="$t('vehicles.vinLabel')" prop="vin" class="col-span-2">
          <el-input v-model="form.vin" :placeholder="$t('vehicles.vinPlaceholder')" maxlength="17" show-word-limit uppercase />
        </el-form-item>

        <el-form-item :label="$t('vehicles.makeLabel')" prop="make">
          <el-select
            v-model="form.make"
            :placeholder="$t('vehicles.makePlaceholder')"
            filterable
            allow-create
            class="!w-full"
            @change="handleMakeChange"
          >
            <el-option
              v-for="item in makesList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('vehicles.modelLabel')" prop="model">
          <el-select
            v-model="form.model"
            :placeholder="$t('vehicles.modelPlaceholder')"
            filterable
            allow-create
            :disabled="!form.make"
            :loading="loadingModels"
            class="!w-full"
            @change="autoFillTitle"
          >
            <el-option
              v-for="item in modelsList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('vehicles.yearLabel')" prop="year">
          <el-input-number v-model="form.year" :min="1990" :max="2030" class="!w-full" @change="autoFillTitle" />
        </el-form-item>

        <el-form-item :label="$t('vehicles.titleLabel')" prop="title">
          <el-input v-model="form.title" :placeholder="$t('vehicles.titlePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('vehicles.colorLabel')" prop="color">
          <el-select
            v-model="form.color"
            :placeholder="$t('vehicles.colorPlaceholder')"
            filterable
            allow-create
            class="!w-full"
          >
            <el-option
              v-for="c in colorsList"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('vehicles.mileageLabel')" prop="mileage">
          <el-input-number v-model="form.mileage" :min="0" class="!w-full" />
        </el-form-item>

        <el-form-item :label="$t('vehicles.statusLabel')" prop="status">
          <el-select v-model="form.status" class="!w-full">
            <el-option
              v-for="st in statusesList"
              :key="st.code"
              :label="getStatusLabel(st.code)"
              :value="st.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('vehicles.locationLabel')" prop="location">
          <el-select v-model="form.location" class="!w-full">
            <el-option
              v-for="loc in locationsList"
              :key="loc.code"
              :label="getLocationLabel(loc.code)"
              :value="loc.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('vehicles.assignLabel')" prop="current_owner" class="col-span-2">
          <el-select v-model="form.current_owner" :placeholder="$t('vehicles.assignPlaceholder')" clearable class="!w-full">
            <el-option
              v-for="emp in employeesList"
              :key="emp.id"
              :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>

        <!-- Photo Upload -->
        <el-form-item :label="$t('vehicles.photoLabel')" class="col-span-2">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div
              v-if="photoPreview"
              class="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group shrink-0"
            >
              <img :src="photoPreview" class="w-full h-full object-cover" alt="Preview" />
              <button
                type="button"
                @click="removePhoto"
                class="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
              >
                <el-icon class="mr-1"><Delete /></el-icon> {{ $t('vehicles.removePhotoBtn') }}
              </button>
            </div>
            <div v-else class="w-32 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
              <el-icon class="text-2xl"><Picture /></el-icon>
              <span class="text-[11px] mt-1">{{ $t('common.noPhoto') }}</span>
            </div>

            <div class="space-y-1">
              <input
                type="file"
                ref="photoInputRef"
                accept="image/*"
                class="hidden"
                @change="handlePhotoChange"
              />
              <el-button @click="triggerPhotoSelect">
                <el-icon class="mr-1"><Upload /></el-icon>
                {{ photoPreview ? $t('vehicles.changePhotoBtn') : $t('vehicles.uploadPhotoBtn') }}
              </el-button>
              <p class="text-xs text-slate-400 mt-1">
                {{ $t('vehicles.photoHint') }}
              </p>
            </div>
          </div>
        </el-form-item>

      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">{{ $t('common.close') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('common.save') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { Make, VehicleModel, DynamicStatus, DynamicLocation, User } from '@/types'
import { Delete, Picture, Upload } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'created'): void
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const loadingModels = ref(false)

const photoInputRef = ref<HTMLInputElement | null>(null)
const photoFile = ref<File | null>(null)
const photoPreview = ref<string>('')

const makesList = ref<Make[]>([])
const modelsList = ref<VehicleModel[]>([])
const statusesList = ref<DynamicStatus[]>([])
const locationsList = ref<DynamicLocation[]>([])
const employeesList = ref<User[]>([])
const colorsList = ref([
  'Gara',
  'Ak',
  'Çal / Kümüş',
  'Gök',
  'Gyzyl',
  'Ýaşyl',
  'Goňur',
  'Sary',
  'Şampan / Altyn',
  'Oranžewyy',
  'Melewşe'
])

const form = reactive({
  vin: '',
  title: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  mileage: 0,
  status: 'PURCHASED',
  location: 'USA_COPART',
  current_owner: null as number | null
})

const rules = computed<FormRules>(() => ({
  vin: [
    { required: true, message: t('vehicles.vinLabel'), trigger: 'blur' },
    { min: 11, max: 17, message: t('vehicles.vinLabel'), trigger: 'blur' }
  ],
  title: [{ required: true, message: t('vehicles.titleLabel'), trigger: 'blur' }],
  make: [{ required: true, message: t('vehicles.makeLabel'), trigger: 'change' }],
  model: [{ required: true, message: t('vehicles.modelLabel'), trigger: 'change' }],
  year: [{ required: true, message: t('vehicles.yearLabel'), trigger: 'change' }],
}))

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

const loadDictionaries = async () => {
  try {
    const [makesRes, statusesRes, locationsRes, empRes] = await Promise.all([
      api.get('/vehicles/dictionaries/makes/'),
      api.get('/vehicles/dictionaries/statuses/'),
      api.get('/vehicles/dictionaries/locations/'),
      api.get('/auth/employees/')
    ])
    makesList.value = Array.isArray(makesRes.data) ? makesRes.data : makesRes.data.results || []
    statusesList.value = Array.isArray(statusesRes.data) ? statusesRes.data : statusesRes.data.results || []
    locationsList.value = Array.isArray(locationsRes.data) ? locationsRes.data : locationsRes.data.results || []
    employeesList.value = Array.isArray(empRes.data) ? empRes.data : empRes.data.results || []

    if (statusesList.value.length > 0 && !form.status) {
      form.status = statusesList.value[0].code
    }
    if (locationsList.value.length > 0 && !form.location) {
      form.location = locationsList.value[0].code
    }
    photoFile.value = null
    photoPreview.value = ''
  } catch (err) {}
}

const triggerPhotoSelect = () => {
  photoInputRef.value?.click()
}

const handlePhotoChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    photoFile.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = ''
  if (photoInputRef.value) {
    photoInputRef.value.value = ''
  }
}

const handleMakeChange = async (makeName: string) => {
  form.model = ''
  modelsList.value = []
  if (!makeName) return

  // Find make ID if exists
  const foundMake = makesList.value.find(m => m.name.toLowerCase() === makeName.toLowerCase())
  loadingModels.value = true
  try {
    const url = foundMake
      ? `/vehicles/dictionaries/models/?make_id=${foundMake.id}`
      : `/vehicles/dictionaries/models/?make=${encodeURIComponent(makeName)}`
    const res = await api.get(url)
    modelsList.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
  } finally {
    loadingModels.value = false
  }
  autoFillTitle()
}

const autoFillTitle = () => {
  if (form.make && form.model && form.year) {
    if (!form.title || form.title === `${form.make} ${form.model} ${form.year}`) {
      form.title = `${form.make} ${form.model} ${form.year}`
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const formData = new FormData()
        formData.append('vin', form.vin)
        formData.append('title', form.title)
        formData.append('make', form.make)
        formData.append('model', form.model)
        formData.append('year', String(form.year))
        formData.append('color', form.color)
        formData.append('mileage', String(form.mileage))
        formData.append('status', form.status)
        formData.append('location', form.location)
        if (form.current_owner) {
          formData.append('current_owner', String(form.current_owner))
        }
        if (photoFile.value) {
          formData.append('photo', photoFile.value)
        }

        await api.post('/vehicles/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        ElMessage.success(t('vehicles.createSuccess'))
        visible.value = false
        emit('created')
      } catch (err: any) {
        const msg = err.response?.data?.vin?.[0] || err.response?.data?.detail || t('common.error')
        ElMessage.error(msg)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
