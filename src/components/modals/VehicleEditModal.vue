<template>
  <el-dialog
    v-model="visible"
    title="Awtoulagy Üýtgetmek (Edit)"
    width="600px"
    destroy-on-close
    @open="initForm"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <div class="grid grid-cols-2 gap-4">
        
        <!-- VIN (Read only) -->
        <el-form-item label="VIN Kod" class="col-span-2">
          <el-input :model-value="vehicle?.vin" disabled>
            <template #prefix>
              <span class="font-mono text-slate-500 font-bold">VIN:</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- Make -->
        <el-form-item label="Markasy (Make)" prop="make">
          <el-select
            v-model="form.make"
            placeholder="Markany saýlaň"
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

        <!-- Model -->
        <el-form-item label="Modeli" prop="model">
          <el-select
            v-model="form.model"
            placeholder="Modeli saýlaň"
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

        <!-- Year -->
        <el-form-item label="Ýyly" prop="year">
          <el-input-number v-model="form.year" :min="1990" :max="2035" class="!w-full" @change="autoFillTitle" />
        </el-form-item>

        <!-- Title -->
        <el-form-item label="Awtoulagyň Ady" prop="title">
          <el-input v-model="form.title" placeholder="Mysal: Toyota Camry 2022" />
        </el-form-item>

        <!-- Color -->
        <el-form-item label="Reňki" prop="color">
          <el-select
            v-model="form.color"
            placeholder="Reňki saýlaň ýa-da giriziň"
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

        <!-- Mileage -->
        <el-form-item label="Probeg (mil)" prop="mileage">
          <el-input-number v-model="form.mileage" :min="0" class="!w-full" />
        </el-form-item>

        <!-- Status -->
        <el-form-item label="Statusy" prop="status">
          <el-select v-model="form.status" class="!w-full">
            <el-option
              v-for="st in statusesList"
              :key="st.code"
              :label="st.name"
              :value="st.code"
            />
          </el-select>
        </el-form-item>

        <!-- Location -->
        <el-form-item label="Ýerleşýän Ýeri" prop="location">
          <el-select v-model="form.location" class="!w-full">
            <el-option
              v-for="loc in locationsList"
              :key="loc.code"
              :label="loc.name"
              :value="loc.code"
            />
          </el-select>
        </el-form-item>

        <!-- Owner (Admin only) -->
        <el-form-item v-if="authStore.isAdmin" label="Jogapkär Işgär (Owner)" prop="current_owner" class="col-span-2">
          <el-select v-model="form.current_owner" placeholder="Işgär saýlaň" clearable class="!w-full">
            <el-option
              v-for="emp in employeesList"
              :key="emp.id"
              :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>

        <!-- Photo Section -->
        <el-form-item label="Awtoulagyň Suraty" class="col-span-2">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <!-- Current / Preview Image -->
            <div
              v-if="photoPreview"
              class="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group shrink-0"
            >
              <img :src="photoPreview" class="w-full h-full object-cover" alt="Vehicle preview" />
              <button
                type="button"
                @click="removePhoto"
                class="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
              >
                <el-icon class="mr-1"><Delete /></el-icon> Aýyr
              </button>
            </div>
            <div v-else class="w-32 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
              <el-icon class="text-2xl"><Picture /></el-icon>
              <span class="text-[11px] mt-1">Surat ýok</span>
            </div>

            <!-- Upload Controls -->
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
                {{ photoPreview ? 'Suraty Çalyş' : 'Täze Surat Ýükle' }}
              </el-button>
              <p class="text-xs text-slate-400 mt-1">
                JPG, PNG, WEBP formatlar goldanylýar (iň köp 10MB).
              </p>
            </div>
          </div>
        </el-form-item>

      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">Ýatyr</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">
          Ýatda Sakla
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import type { Vehicle, Make, VehicleModel, DynamicStatus, DynamicLocation, User } from '@/types'

const props = defineProps<{
  modelValue: boolean
  vehicle: Vehicle | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'updated'): void
}>()

const authStore = useAuthStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const loadingModels = ref(false)

const makesList = ref<Make[]>([])
const modelsList = ref<VehicleModel[]>([])
const statusesList = ref<DynamicStatus[]>([])
const locationsList = ref<DynamicLocation[]>([])
const employeesList = ref<User[]>([])

const photoInputRef = ref<HTMLInputElement | null>(null)
const photoFile = ref<File | null>(null)
const photoPreview = ref<string>('')
const photoRemoved = ref(false)

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

const rules: FormRules = {
  title: [{ required: true, message: 'Awtoulagyň adyny giriziň', trigger: 'blur' }],
  make: [{ required: true, message: 'Markasyny saýlaň', trigger: 'change' }],
  model: [{ required: true, message: 'Modelini saýlaň', trigger: 'change' }],
  year: [{ required: true, message: 'Ýylyny seçiň', trigger: 'change' }],
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
  } catch (err) {}
}

const initForm = async () => {
  await loadDictionaries()
  photoFile.value = null
  photoRemoved.value = false

  if (props.vehicle) {
    form.title = props.vehicle.title
    form.make = props.vehicle.make
    form.model = props.vehicle.model
    form.year = props.vehicle.year
    form.color = props.vehicle.color
    form.mileage = props.vehicle.mileage
    form.status = props.vehicle.status
    form.location = props.vehicle.location
    form.current_owner = props.vehicle.current_owner

    photoPreview.value = props.vehicle.photo_url || ''

    if (form.make) {
      await fetchModelsForMake(form.make)
    }
  }
}

const fetchModelsForMake = async (makeName: string) => {
  loadingModels.value = true
  try {
    const foundMake = makesList.value.find(m => m.name.toLowerCase() === makeName.toLowerCase())
    const url = foundMake
      ? `/vehicles/dictionaries/models/?make_id=${foundMake.id}`
      : `/vehicles/dictionaries/models/?make=${encodeURIComponent(makeName)}`
    const res = await api.get(url)
    modelsList.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
  } finally {
    loadingModels.value = false
  }
}

const handleMakeChange = async (makeName: string) => {
  form.model = ''
  modelsList.value = []
  if (makeName) {
    await fetchModelsForMake(makeName)
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

const triggerPhotoSelect = () => {
  photoInputRef.value?.click()
}

const handlePhotoChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    photoFile.value = file
    photoRemoved.value = false
    photoPreview.value = URL.createObjectURL(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = ''
  photoRemoved.value = true
  if (photoInputRef.value) {
    photoInputRef.value.value = ''
  }
}

const submitForm = async () => {
  const currentVehicle = props.vehicle
  if (!formRef.value || !currentVehicle) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('make', form.make)
        formData.append('model', form.model)
        formData.append('year', String(form.year))
        formData.append('color', form.color)
        formData.append('mileage', String(form.mileage))
        formData.append('status', form.status)
        formData.append('location', form.location)
        if (form.current_owner !== null && form.current_owner !== undefined) {
          formData.append('current_owner', String(form.current_owner))
        }

        if (photoFile.value) {
          formData.append('photo', photoFile.value)
        } else if (photoRemoved.value) {
          formData.append('photo', '')
        }

        await api.patch(`/vehicles/${currentVehicle.vin}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        ElMessage.success('Awtoulag maglumatlary üstünlikli täzelendi!')
        visible.value = false
        emit('updated')
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Üýtgetmekde ýalňyşlyk ýüze çykdy.'
        ElMessage.error(msg)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
