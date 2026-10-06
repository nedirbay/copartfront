<template>
  <el-dialog
    v-model="visible"
    title="Täze Awtoulag Hasaba Almak"
    width="580px"
    destroy-on-close
    @open="loadDictionaries"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <div class="grid grid-cols-2 gap-4">
        
        <el-form-item label="VIN Kod (17 belgi)" prop="vin" class="col-span-2">
          <el-input v-model="form.vin" placeholder="Mysal: 1HGCR2F83HA000000" maxlength="17" show-word-limit uppercase />
        </el-form-item>

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

        <el-form-item label="Ýyly" prop="year">
          <el-input-number v-model="form.year" :min="1990" :max="2030" class="!w-full" @change="autoFillTitle" />
        </el-form-item>

        <el-form-item label="Awtoulagyň Ady (Sözbaşysy)" prop="title">
          <el-input v-model="form.title" placeholder="Mysal: Toyota Camry 2022" />
        </el-form-item>

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


        <el-form-item label="Probeg (Ýörelen ýoly, mil)" prop="mileage">
          <el-input-number v-model="form.mileage" :min="0" class="!w-full" />
        </el-form-item>

        <el-form-item label="Häzirki Statusy" prop="status">
          <el-select v-model="form.status" class="!w-full">
            <el-option
              v-for="st in statusesList"
              :key="st.code"
              :label="st.name"
              :value="st.code"
            />
          </el-select>
        </el-form-item>

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

        <el-form-item label="Işgäre Berkitmek (Assign to Employee)" prop="current_owner" class="col-span-2">
          <el-select v-model="form.current_owner" placeholder="Işgär saýlaň (mejbury däl)" clearable class="!w-full">
            <el-option
              v-for="emp in employeesList"
              :key="emp.id"
              :label="`${emp.first_name} ${emp.last_name} (@${emp.username})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>


      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">Ýapmak</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">Hasaba Al</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { Make, VehicleModel, DynamicStatus, DynamicLocation, User } from '@/types'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'created'): void
}>()

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

const rules: FormRules = {
  vin: [
    { required: true, message: 'VIN kody giriziň', trigger: 'blur' },
    { min: 11, max: 17, message: 'VIN kody dogry giriziň', trigger: 'blur' }
  ],
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

    if (statusesList.value.length > 0 && !form.status) {
      form.status = statusesList.value[0].code
    }
    if (locationsList.value.length > 0 && !form.location) {
      form.location = locationsList.value[0].code
    }
  } catch (err) {}
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
        await api.post('/vehicles/', form)
        ElMessage.success('Täze awtoulag üstünlikli hasaba alyndy!')
        visible.value = false
        emit('created')
      } catch (err: any) {
        const msg = err.response?.data?.vin?.[0] || 'Awtoulag döredilende ýalňyşlyk ýüze çykdy.'
        ElMessage.error(msg)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
