<template>
  <el-dialog
    v-model="visible"
    :title="$t('vehicles.addExpenseBtn')"
    width="500px"
    destroy-on-close
    @open="loadDictionaries"
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
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="10" class="!w-full" />
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
import type { Currency, ExpenseType } from '@/types'

const props = defineProps<{
  modelValue: boolean
  vin: string
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

const loadDictionaries = async () => {
  try {
    const [expRes, currRes] = await Promise.all([
      api.get('/vehicles/dictionaries/expense-types/'),
      api.get('/vehicles/dictionaries/currencies/')
    ])
    expenseTypesList.value = Array.isArray(expRes.data) ? expRes.data : expRes.data.results || []
    currenciesList.value = Array.isArray(currRes.data) ? currRes.data : currRes.data.results || []

    if (currenciesList.value.length > 0 && !form.currency) {
      form.currency = currenciesList.value[0].code
    }
  } catch (err) {}
}

const submitExpense = async () => {
  if (!formRef.value || !props.vin) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await api.post(`/vehicles/${props.vin}/expenses/`, form)
        ElMessage.success(t('common.success'))
        visible.value = false
        form.title = ''
        form.amount = 0
        form.description = ''
        emit('created')
      } catch (err: any) {
        ElMessage.error(t('common.error'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
