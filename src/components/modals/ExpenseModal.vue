<template>
  <el-dialog
    v-model="visible"
    :title="expense ? $t('x.editExpense') : $t('vehicles.addExpenseBtn')"
    width="500px"
    destroy-on-close
    @open="onOpen"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <el-form-item :label="$t('vehicles.expenseTitle')" prop="title">
        <el-select
          v-model="form.title"
          :placeholder="$t('vehicles.expenseTitle')"
          filterable
          allow-create
          class="!w-full"
        >
          <el-option
            v-for="item in expenseTypesList"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>

      <div class="grid grid-cols-2 gap-4">
        <el-form-item :label="$t('common.amount')" prop="amount">
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" :step="10" class="!w-full" />
        </el-form-item>

        <el-form-item :label="$t('common.currency')" prop="currency">
          <el-select v-model="form.currency" class="!w-full">
            <el-option
              v-for="curr in currenciesList"
              :key="curr.code"
              :label="`${curr.code} (${curr.symbol})`"
              :value="curr.code"
            />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item :label="$t('vehicles.expenseStage')">
        <el-input v-model="form.stage" placeholder="Copart / Transit / Service" />
      </el-form-item>

      <el-form-item :label="$t('common.description')">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>

      <el-form-item :label="$t('x.receipt')">
        <input ref="receiptInput" type="file" accept="image/*,application/pdf" class="hidden" @change="onReceipt" />
        <div class="flex items-center gap-2">
          <el-button @click="receiptInput?.click()">{{ receiptFile ? receiptFile.name : $t('x.attachReceipt') }}</el-button>
          <a v-if="!receiptFile && expense?.receipt" :href="expense.receipt" target="_blank" class="text-xs text-blue-700">{{ $t('vehicles.viewDoc') }}</a>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">{{ $t('common.close') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitExpense">{{ $t('common.save') }}</el-button>
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
import type { Currency, ExpenseType, VehicleExpense } from '@/types'
import { apiError } from '@/utils/format'

const props = defineProps<{
  modelValue: boolean
  vin: string
  expense?: VehicleExpense | null
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
const receiptInput = ref<HTMLInputElement | null>(null)
const receiptFile = ref<File | null>(null)

const expenseTypesList = ref<ExpenseType[]>([])
const currenciesList = ref<Currency[]>([])

const form = reactive({
  title: '',
  amount: 0,
  currency: 'USD',
  stage: '',
  description: ''
})

const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: t('vehicles.expenseTitle'), trigger: 'change' }],
  amount: [{ required: true, message: t('common.amount'), trigger: 'change' }]
}))

const onOpen = async () => {
  receiptFile.value = null
  const e = props.expense
  form.title = e?.title ?? ''
  form.amount = e ? Number(e.amount) : 0
  form.currency = e?.currency ?? 'USD'
  form.stage = e?.stage ?? ''
  form.description = e?.description ?? ''
  try {
    const [expRes, currRes] = await Promise.all([
      api.get('/vehicles/dictionaries/expense-types/'),
      api.get('/vehicles/dictionaries/currencies/')
    ])
    expenseTypesList.value = Array.isArray(expRes.data) ? expRes.data : expRes.data.results || []
    currenciesList.value = Array.isArray(currRes.data) ? currRes.data : currRes.data.results || []
  } catch (err) {}
}

const onReceipt = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  receiptFile.value = files && files[0] ? files[0] : null
}

const submitExpense = async () => {
  if (!formRef.value || !props.vin) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (receiptFile.value) fd.append('receipt', receiptFile.value)
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (props.expense) {
        await api.patch(`/vehicles/${props.vin}/expenses/${props.expense.id}/`, fd, cfg)
      } else {
        await api.post(`/vehicles/${props.vin}/expenses/`, fd, cfg)
      }
      ElMessage.success(t('common.success'))
      visible.value = false
      emit('created')
    } catch (err: any) {
      ElMessage.error(apiError(err, t('common.error')))
    } finally {
      loading.value = false
    }
  })
}
</script>
