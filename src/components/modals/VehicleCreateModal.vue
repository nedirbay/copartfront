<template>
  <el-dialog
    v-model="visible"
    title="Täze Awtoulag Hasaba Almak"
    width="580px"
    destroy-on-close
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <div class="grid grid-cols-2 gap-4">
        
        <el-form-item label="VIN Kod (17 belgi)" prop="vin" class="col-span-2">
          <el-input v-model="form.vin" placeholder="Mysal: 1HGCR2F83HA000000" maxlength="17" show-word-limit uppercase />
        </el-form-item>

        <el-form-item label="Awtoulagyň Ady" prop="title" class="col-span-2">
          <el-input v-model="form.title" placeholder="Mysal: Toyota Camry 2022 SE" />
        </el-form-item>

        <el-form-item label="Markasy (Make)" prop="make">
          <el-input v-model="form.make" placeholder="Toyota" />
        </el-form-item>

        <el-form-item label="Modeli" prop="model">
          <el-input v-model="form.model" placeholder="Camry" />
        </el-form-item>

        <el-form-item label="Ýyly" prop="year">
          <el-input-number v-model="form.year" :min="1990" :max="2030" class="!w-full" />
        </el-form-item>

        <el-form-item label="Reňki" prop="color">
          <el-input v-model="form.color" placeholder="Gara / Ak / Gök" />
        </el-form-item>

        <el-form-item label="Probeg (Ýörelen ýoly, mil)" prop="mileage">
          <el-input-number v-model="form.mileage" :min="0" class="!w-full" />
        </el-form-item>

        <el-form-item label="Häzirki Statusy" prop="status">
          <el-select v-model="form.status" class="!w-full">
            <el-option label="Satyn alyndy (Purchased)" value="PURCHASED" />
            <el-option label="Ýolda (In Transit)" value="IN_TRANSIT" />
            <el-option label="Türkmenistana geldi" value="ARRIVED_TKM" />
            <el-option label="Satyldy" value="SOLD" />
          </el-select>
        </el-form-item>

        <el-form-item label="Ýerleşýän Ýeri" prop="location" class="col-span-2">
          <el-select v-model="form.location" class="!w-full">
            <el-option label="Amerika (Copart)" value="USA_COPART" />
            <el-option label="Ýük daşama ýola çykaryldy" value="SHIPPING_TRANSIT" />
            <el-option label="Gruziýa" value="GEORGIA" />
            <el-option label="Türkmenistan (Içerki ýerleri)" value="TURKMENISTAN_INTERNAL" />
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

const form = reactive({
  vin: '',
  title: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  mileage: 0,
  status: 'PURCHASED',
  location: 'USA_COPART'
})

const rules: FormRules = {
  vin: [
    { required: true, message: 'VIN kody giriziň', trigger: 'blur' },
    { min: 11, max: 17, message: 'VIN kody dogry giriziň', trigger: 'blur' }
  ],
  title: [{ required: true, message: 'Awtoulagyň adyny giriziň', trigger: 'blur' }],
  make: [{ required: true, message: 'Markasyny giriziň', trigger: 'blur' }],
  model: [{ required: true, message: 'Modelini giriziň', trigger: 'blur' }],
  year: [{ required: true, message: 'Ýylyny seçiň', trigger: 'change' }],
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await api.post('/vehicles/', form)
        ElMessage.success('Täze awtoulag üstünlikli hasaba al alndy!')
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
