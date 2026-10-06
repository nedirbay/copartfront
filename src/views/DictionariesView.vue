<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ $t('dictionaries.title') }}</h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ $t('dictionaries.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Main Tabs -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <el-tabs v-model="activeTab" class="custom-dictionary-tabs" @tab-change="handleTabChange">
        
        <!-- TAB 1: Makes & Models -->
        <el-tab-pane :label="$t('dictionaries.tabMakes')" name="makes-models">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
            
            <!-- Left: Makes (Markalar) -->
            <div class="lg:col-span-5 border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-slate-900">{{ $t('dictionaries.make') }}</h3>
                </div>
                <el-button type="primary" size="small" class="!rounded-lg" @click="openMakeModal()">
                  <el-icon class="mr-1"><Plus /></el-icon> {{ $t('dictionaries.addMake') }}
                </el-button>
              </div>

              <div v-loading="loadingMakes" class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <div
                  v-for="make in makes"
                  :key="make.id"
                  @click="selectMake(make)"
                  class="p-3 rounded-xl border transition cursor-pointer flex items-center justify-between"
                  :class="selectedMake?.id === make.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:border-slate-300'"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {{ make.name[0] }}
                    </span>
                    <span class="font-semibold text-slate-800 text-sm">{{ make.name }}</span>
                  </div>

                  <div class="flex items-center gap-1" @click.stop>
                    <el-button type="primary" link size="small" @click="openMakeModal(make)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="danger" link size="small" @click="deleteMake(make)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Models dependent on Make -->
            <div class="lg:col-span-7 border border-slate-200 rounded-xl p-4 bg-white space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900">
                    <span v-if="selectedMake" class="text-blue-700 font-extrabold">{{ selectedMake.name }}</span>
                    <span v-else>{{ $t('common.all') }}</span> {{ $t('vehicles.modelLabel') }}
                  </h3>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  class="!rounded-lg"
                  :disabled="!selectedMake"
                  @click="openModelModal()"
                >
                  <el-icon class="mr-1"><Plus /></el-icon> {{ $t('dictionaries.addModel') }}
                </el-button>
              </div>

              <div v-if="!selectedMake" class="text-center py-12 text-slate-400 text-sm">
                {{ $t('vehicles.makePlaceholder') }}
              </div>

              <div v-else v-loading="loadingModels">
                <el-table :data="models" stripe style="width: 100%" empty-text="-">
                  <el-table-column prop="name" :label="$t('vehicles.modelLabel')" min-width="180">
                    <template #default="{ row }">
                      <span class="font-semibold text-slate-800">{{ row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="make_name" :label="$t('dictionaries.make')" min-width="120">
                    <template #default="{ row }">
                      <el-tag size="small" type="info">{{ row.make_name || selectedMake?.name }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('common.actions')" width="120" align="right">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="openModelModal(row)">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button type="danger" link size="small" @click="deleteModel(row)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

          </div>
        </el-tab-pane>

        <!-- TAB 2: Statuses -->
        <el-tab-pane :label="$t('dictionaries.tabStatuses')" name="statuses">
          <div class="space-y-4 py-2">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ $t('dictionaries.tabStatuses') }}</h3>
              </div>
              <el-button type="primary" class="!rounded-xl" @click="openStatusModal()">
                <el-icon class="mr-1"><Plus /></el-icon> {{ $t('dictionaries.addStatus') }}
              </el-button>
            </div>

            <el-table v-loading="loadingStatuses" :data="statuses" stripe style="width: 100%" empty-text="-">
              <el-table-column prop="code" :label="$t('dictionaries.code')" min-width="180">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                    {{ row.code }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('dictionaries.name')" min-width="200">
                <template #default="{ row }">
                  <span class="font-semibold text-slate-800">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.actions')" width="120" align="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="openStatusModal(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click="deleteStatus(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- TAB 3: Locations -->
        <el-tab-pane :label="$t('dictionaries.tabLocations')" name="locations">
          <div class="space-y-4 py-2">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ $t('dictionaries.tabLocations') }}</h3>
              </div>
              <el-button type="primary" class="!rounded-xl" @click="openLocationModal()">
                <el-icon class="mr-1"><Plus /></el-icon> {{ $t('dictionaries.addLocation') }}
              </el-button>
            </div>

            <el-table v-loading="loadingLocations" :data="locations" stripe style="width: 100%" empty-text="-">
              <el-table-column prop="code" :label="$t('dictionaries.code')" min-width="180">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {{ row.code }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('dictionaries.name')" min-width="200">
                <template #default="{ row }">
                  <span class="font-semibold text-slate-800">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.actions')" width="120" align="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="openLocationModal(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click="deleteLocation(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- TAB 4: Currencies -->
        <el-tab-pane :label="$t('dictionaries.tabCurrencies')" name="currencies">
          <div class="space-y-4 py-2">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ $t('dictionaries.tabCurrencies') }}</h3>
              </div>
              <el-button type="primary" class="!rounded-xl" @click="openCurrencyModal()">
                <el-icon class="mr-1"><Plus /></el-icon> {{ $t('dictionaries.addCurrency') }}
              </el-button>
            </div>

            <el-table v-loading="loadingCurrencies" :data="currencies" stripe style="width: 100%" empty-text="-">
              <el-table-column prop="code" :label="$t('dictionaries.code')" min-width="120">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-slate-900">{{ row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('dictionaries.name')" min-width="180" />
              <el-table-column prop="symbol" :label="$t('dictionaries.symbol')" min-width="120">
                <template #default="{ row }">
                  <span class="font-bold text-blue-700 bg-slate-100 px-2 py-0.5 rounded">{{ row.symbol }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.actions')" width="120" align="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="openCurrencyModal(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click="deleteCurrency(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- TAB 5: Expense Types -->
        <el-tab-pane :label="$t('dictionaries.tabExpenseTypes')" name="expense-types">
          <div class="space-y-4 py-2">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ $t('dictionaries.tabExpenseTypes') }}</h3>
              </div>
              <el-button type="primary" class="!rounded-xl" @click="openExpenseTypeModal()">
                <el-icon class="mr-1"><Plus /></el-icon> {{ $t('dictionaries.addExpenseType') }}
              </el-button>
            </div>

            <el-table v-loading="loadingExpenseTypes" :data="expenseTypes" stripe style="width: 100%" empty-text="-">
              <el-table-column prop="name" :label="$t('dictionaries.name')" min-width="250">
                <template #default="{ row }">
                  <span class="font-semibold text-slate-800">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.actions')" width="120" align="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="openExpenseTypeModal(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click="deleteExpenseType(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>

    <!-- Modals for CRUD -->
    <!-- 1. Make Modal -->
    <el-dialog v-model="makeModal.visible" :title="makeModal.isEdit ? $t('common.edit') : $t('dictionaries.addMake')" width="400px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="$t('dictionaries.name')" required>
          <el-input v-model="makeModal.form.name" placeholder="Toyota, BMW, etc." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="makeModal.visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="makeModal.loading" @click="saveMake">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 2. Model Modal -->
    <el-dialog v-model="modelModal.visible" :title="modelModal.isEdit ? $t('common.edit') : $t('dictionaries.addModel')" width="400px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="$t('dictionaries.make')">
          <el-input :model-value="selectedMake?.name" disabled />
        </el-form-item>
        <el-form-item :label="$t('dictionaries.name')" required>
          <el-input v-model="modelModal.form.name" placeholder="Camry, X5, etc." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="modelModal.visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="modelModal.loading" @click="saveModel">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 3. Status Modal -->
    <el-dialog v-model="statusModal.visible" :title="statusModal.isEdit ? $t('common.edit') : $t('dictionaries.addStatus')" width="450px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="$t('dictionaries.code')" required>
          <el-input v-model="statusModal.form.code" placeholder="IN_TRANSIT" uppercase />
        </el-form-item>
        <el-form-item :label="$t('dictionaries.name')" required>
          <el-input v-model="statusModal.form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="statusModal.visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="statusModal.loading" @click="saveStatus">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 4. Location Modal -->
    <el-dialog v-model="locationModal.visible" :title="locationModal.isEdit ? $t('common.edit') : $t('dictionaries.addLocation')" width="450px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="$t('dictionaries.code')" required>
          <el-input v-model="locationModal.form.code" placeholder="GEORGIA" uppercase />
        </el-form-item>
        <el-form-item :label="$t('dictionaries.name')" required>
          <el-input v-model="locationModal.form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="locationModal.visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="locationModal.loading" @click="saveLocation">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. Currency Modal -->
    <el-dialog v-model="currencyModal.visible" :title="currencyModal.isEdit ? $t('common.edit') : $t('dictionaries.addCurrency')" width="450px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="$t('dictionaries.code')" required>
          <el-input v-model="currencyModal.form.code" placeholder="USD" uppercase />
        </el-form-item>
        <el-form-item :label="$t('dictionaries.name')" required>
          <el-input v-model="currencyModal.form.name" placeholder="US Dollar" />
        </el-form-item>
        <el-form-item :label="$t('dictionaries.symbol')" required>
          <el-input v-model="currencyModal.form.symbol" placeholder="$" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="currencyModal.visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="currencyModal.loading" @click="saveCurrency">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 6. Expense Type Modal -->
    <el-dialog v-model="expenseTypeModal.visible" :title="expenseTypeModal.isEdit ? $t('common.edit') : $t('dictionaries.addExpenseType')" width="450px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="$t('dictionaries.name')" required>
          <el-input v-model="expenseTypeModal.form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="expenseTypeModal.visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="expenseTypeModal.loading" @click="saveExpenseType">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { Make, VehicleModel, DynamicStatus, DynamicLocation, Currency, ExpenseType } from '@/types'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()
const activeTab = ref('makes-models')

// Data State
const makes = ref<Make[]>([])
const models = ref<VehicleModel[]>([])
const selectedMake = ref<Make | null>(null)

const statuses = ref<DynamicStatus[]>([])
const locations = ref<DynamicLocation[]>([])
const currencies = ref<Currency[]>([])
const expenseTypes = ref<ExpenseType[]>([])

// Loading states
const loadingMakes = ref(false)
const loadingModels = ref(false)
const loadingStatuses = ref(false)
const loadingLocations = ref(false)
const loadingCurrencies = ref(false)
const loadingExpenseTypes = ref(false)

// Modals State
const makeModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
  form: { name: '' }
})

const modelModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
  form: { name: '' }
})

const statusModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
  form: { code: '', name: '' }
})

const locationModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
  form: { code: '', name: '' }
})

const currencyModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
  form: { code: '', name: '', symbol: '' }
})

const expenseTypeModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
  form: { name: '' }
})

// Fetch methods
const fetchMakes = async () => {
  loadingMakes.value = true
  try {
    const res = await api.get('/vehicles/dictionaries/makes/')
    makes.value = Array.isArray(res.data) ? res.data : res.data.results || []
    if (makes.value.length > 0 && !selectedMake.value) {
      selectMake(makes.value[0])
    }
  } catch (err) {
    ElMessage.error('Markalar ýüklenmedi.')
  } finally {
    loadingMakes.value = false
  }
}

const fetchModelsForMake = async (makeId: number) => {
  loadingModels.value = true
  try {
    const res = await api.get(`/vehicles/dictionaries/models/?make_id=${makeId}`)
    models.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
    ElMessage.error('Modeller ýüklenmedi.')
  } finally {
    loadingModels.value = false
  }
}

const selectMake = (make: Make) => {
  selectedMake.value = make
  fetchModelsForMake(make.id)
}

const fetchStatuses = async () => {
  loadingStatuses.value = true
  try {
    const res = await api.get('/vehicles/dictionaries/statuses/')
    statuses.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
    ElMessage.error('Statuslar ýüklenmedi.')
  } finally {
    loadingStatuses.value = false
  }
}

const fetchLocations = async () => {
  loadingLocations.value = true
  try {
    const res = await api.get('/vehicles/dictionaries/locations/')
    locations.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
    ElMessage.error('Ýerleşýän ýerler ýüklenmedi.')
  } finally {
    loadingLocations.value = false
  }
}

const fetchCurrencies = async () => {
  loadingCurrencies.value = true
  try {
    const res = await api.get('/vehicles/dictionaries/currencies/')
    currencies.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
    ElMessage.error('Walýutalar ýüklenmedi.')
  } finally {
    loadingCurrencies.value = false
  }
}

const fetchExpenseTypes = async () => {
  loadingExpenseTypes.value = true
  try {
    const res = await api.get('/vehicles/dictionaries/expense-types/')
    expenseTypes.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {
    ElMessage.error('Çykdajy atlary ýüklenmedi.')
  } finally {
    loadingExpenseTypes.value = false
  }
}

const handleTabChange = (tabName: any) => {
  if (tabName === 'makes-models') fetchMakes()
  else if (tabName === 'statuses') fetchStatuses()
  else if (tabName === 'locations') fetchLocations()
  else if (tabName === 'currencies') fetchCurrencies()
  else if (tabName === 'expense-types') fetchExpenseTypes()
}

onMounted(() => {
  fetchMakes()
})

// CRUD Actions: Make
const openMakeModal = (make?: Make) => {
  makeModal.isEdit = !!make
  makeModal.editId = make ? make.id : null
  makeModal.form.name = make ? make.name : ''
  makeModal.visible = true
}

const saveMake = async () => {
  if (!makeModal.form.name.trim()) return
  makeModal.loading = true
  try {
    if (makeModal.isEdit && makeModal.editId) {
      await api.put(`/vehicles/dictionaries/makes/${makeModal.editId}/`, makeModal.form)
      ElMessage.success('Marka täzelendi!')
    } else {
      await api.post('/vehicles/dictionaries/makes/', makeModal.form)
      ElMessage.success('Täze marka goşuldy!')
    }
    makeModal.visible = false
    fetchMakes()
  } catch (err) {
    ElMessage.error('Marka ýatda saklananda ýalňyşlyk döredi.')
  } finally {
    makeModal.loading = false
  }
}

const deleteMake = (make: Make) => {
  ElMessageBox.confirm(`"${make.name}" markasyny öçürmek isleýärsiňizmi?`, 'Markany Öçürmek', {
    confirmButtonText: 'Öçür',
    cancelButtonText: 'Ýap',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/vehicles/dictionaries/makes/${make.id}/`)
      ElMessage.success('Marka öçürüldi.')
      if (selectedMake.value?.id === make.id) {
        selectedMake.value = null
      }
      fetchMakes()
    } catch (err) {
      ElMessage.error('Markany öçürmekde ýalňyşlyk döredi.')
    }
  })
}

// CRUD Actions: Model
const openModelModal = (model?: VehicleModel) => {
  if (!selectedMake.value) return
  modelModal.isEdit = !!model
  modelModal.editId = model ? model.id : null
  modelModal.form.name = model ? model.name : ''
  modelModal.visible = true
}

const saveModel = async () => {
  if (!selectedMake.value || !modelModal.form.name.trim()) return
  modelModal.loading = true
  try {
    const payload = {
      make: selectedMake.value.id,
      name: modelModal.form.name
    }
    if (modelModal.isEdit && modelModal.editId) {
      await api.put(`/vehicles/dictionaries/models/${modelModal.editId}/`, payload)
      ElMessage.success('Model täzelendi!')
    } else {
      await api.post('/vehicles/dictionaries/models/', payload)
      ElMessage.success('Täze model goşuldy!')
    }
    modelModal.visible = false
    fetchModelsForMake(selectedMake.value.id)
  } catch (err) {
    ElMessage.error('Model ýatda saklananda ýalňyşlyk döredi.')
  } finally {
    modelModal.loading = false
  }
}

const deleteModel = (model: VehicleModel) => {
  ElMessageBox.confirm(`"${model.name}" modelini öçürmek isleýärsiňizmi?`, 'Modeli Öçürmek', {
    confirmButtonText: 'Öçür',
    cancelButtonText: 'Ýap',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/vehicles/dictionaries/models/${model.id}/`)
      ElMessage.success('Model öçürüldi.')
      if (selectedMake.value) {
        fetchModelsForMake(selectedMake.value.id)
      }
    } catch (err) {
      ElMessage.error('Modeli öçürmekde ýalňyşlyk döredi.')
    }
  })
}

// CRUD Actions: Status
const openStatusModal = (status?: DynamicStatus) => {
  statusModal.isEdit = !!status
  statusModal.editId = status ? status.id : null
  statusModal.form.code = status ? status.code : ''
  statusModal.form.name = status ? status.name : ''
  statusModal.visible = true
}

const saveStatus = async () => {
  if (!statusModal.form.code.trim() || !statusModal.form.name.trim()) return
  statusModal.loading = true
  try {
    if (statusModal.isEdit && statusModal.editId) {
      await api.put(`/vehicles/dictionaries/statuses/${statusModal.editId}/`, statusModal.form)
      ElMessage.success('Status täzelendi!')
    } else {
      await api.post('/vehicles/dictionaries/statuses/', statusModal.form)
      ElMessage.success('Täze status goşuldy!')
    }
    statusModal.visible = false
    fetchStatuses()
  } catch (err) {
    ElMessage.error('Status ýatda saklananda ýalňyşlyk döredi.')
  } finally {
    statusModal.loading = false
  }
}

const deleteStatus = (status: DynamicStatus) => {
  ElMessageBox.confirm(`"${status.name}" statusyny öçürmek isleýärsiňizmi?`, 'Statusy Öçürmek', {
    confirmButtonText: 'Öçür',
    cancelButtonText: 'Ýap',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/vehicles/dictionaries/statuses/${status.id}/`)
      ElMessage.success('Status öçürüldi.')
      fetchStatuses()
    } catch (err) {
      ElMessage.error('Statusy öçürmekde ýalňyşlyk döredi.')
    }
  })
}

// CRUD Actions: Location
const openLocationModal = (loc?: DynamicLocation) => {
  locationModal.isEdit = !!loc
  locationModal.editId = loc ? loc.id : null
  locationModal.form.code = loc ? loc.code : ''
  locationModal.form.name = loc ? loc.name : ''
  locationModal.visible = true
}

const saveLocation = async () => {
  if (!locationModal.form.code.trim() || !locationModal.form.name.trim()) return
  locationModal.loading = true
  try {
    if (locationModal.isEdit && locationModal.editId) {
      await api.put(`/vehicles/dictionaries/locations/${locationModal.editId}/`, locationModal.form)
      ElMessage.success('Ýerleşýän ýer täzelendi!')
    } else {
      await api.post('/vehicles/dictionaries/locations/', locationModal.form)
      ElMessage.success('Täze ýerleşýän ýer goşuldy!')
    }
    locationModal.visible = false
    fetchLocations()
  } catch (err) {
    ElMessage.error('Ýerleşýän ýer ýatda saklananda ýalňyşlyk döredi.')
  } finally {
    locationModal.loading = false
  }
}

const deleteLocation = (loc: DynamicLocation) => {
  ElMessageBox.confirm(`"${loc.name}" ýerini öçürmek isleýärsiňizmi?`, 'Ýerleşýän Ýeri Öçürmek', {
    confirmButtonText: 'Öçür',
    cancelButtonText: 'Ýap',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/vehicles/dictionaries/locations/${loc.id}/`)
      ElMessage.success('Ýerleşýän ýer öçürüldi.')
      fetchLocations()
    } catch (err) {
      ElMessage.error('Ýerleşýän ýeri öçürmekde ýalňyşlyk döredi.')
    }
  })
}

// CRUD Actions: Currency
const openCurrencyModal = (curr?: Currency) => {
  currencyModal.isEdit = !!curr
  currencyModal.editId = curr ? curr.id : null
  currencyModal.form.code = curr ? curr.code : ''
  currencyModal.form.name = curr ? curr.name : ''
  currencyModal.form.symbol = curr ? curr.symbol : ''
  currencyModal.visible = true
}

const saveCurrency = async () => {
  if (!currencyModal.form.code.trim() || !currencyModal.form.name.trim()) return
  currencyModal.loading = true
  try {
    if (currencyModal.isEdit && currencyModal.editId) {
      await api.put(`/vehicles/dictionaries/currencies/${currencyModal.editId}/`, currencyModal.form)
      ElMessage.success('Walýuta täzelendi!')
    } else {
      await api.post('/vehicles/dictionaries/currencies/', currencyModal.form)
      ElMessage.success('Täze walýuta goşuldy!')
    }
    currencyModal.visible = false
    fetchCurrencies()
  } catch (err) {
    ElMessage.error('Walýuta ýatda saklananda ýalňyşlyk döredi.')
  } finally {
    currencyModal.loading = false
  }
}

const deleteCurrency = (curr: Currency) => {
  ElMessageBox.confirm(`"${curr.code}" walýutasyny öçürmek isleýärsiňizmi?`, 'Walýutany Öçürmek', {
    confirmButtonText: 'Öçür',
    cancelButtonText: 'Ýap',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/vehicles/dictionaries/currencies/${curr.id}/`)
      ElMessage.success('Walýuta öçürüldi.')
      fetchCurrencies()
    } catch (err) {
      ElMessage.error('Walýutany öçürmekde ýalňyşlyk döredi.')
    }
  })
}

// CRUD Actions: Expense Type
const openExpenseTypeModal = (exp?: ExpenseType) => {
  expenseTypeModal.isEdit = !!exp
  expenseTypeModal.editId = exp ? exp.id : null
  expenseTypeModal.form.name = exp ? exp.name : ''
  expenseTypeModal.visible = true
}

const saveExpenseType = async () => {
  if (!expenseTypeModal.form.name.trim()) return
  expenseTypeModal.loading = true
  try {
    if (expenseTypeModal.isEdit && expenseTypeModal.editId) {
      await api.put(`/vehicles/dictionaries/expense-types/${expenseTypeModal.editId}/`, expenseTypeModal.form)
      ElMessage.success('Çykdajy ady täzelendi!')
    } else {
      await api.post('/vehicles/dictionaries/expense-types/', expenseTypeModal.form)
      ElMessage.success('Täze çykdajy ady goşuldy!')
    }
    expenseTypeModal.visible = false
    fetchExpenseTypes()
  } catch (err) {
    ElMessage.error('Çykdajy ady ýatda saklananda ýalňyşlyk döredi.')
  } finally {
    expenseTypeModal.loading = false
  }
}

const deleteExpenseType = (exp: ExpenseType) => {
  ElMessageBox.confirm(`"${exp.name}" çykdajy adyny öçürmek isleýärsiňizmi?`, 'Çykdajy Adyny Öçürmek', {
    confirmButtonText: 'Öçür',
    cancelButtonText: 'Ýap',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/vehicles/dictionaries/expense-types/${exp.id}/`)
      ElMessage.success('Çykdajy ady öçürüldi.')
      fetchExpenseTypes()
    } catch (err) {
      ElMessage.error('Çykdajy adyny öçürmekde ýalňyşlyk döredi.')
    }
  })
}
</script>
