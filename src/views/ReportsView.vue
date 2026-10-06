<template>
  <div class="space-y-6">
    
    <!-- Header Title -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <el-icon class="text-blue-600"><DataAnalysis /></el-icon>
          Hasabatlar we Analitika Ulgamy
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Awtoulaglar, çykdajylar we tapgyrlar boýunça giňişleýin finansial we statistiki hasabatlar.
        </p>
      </div>

      <el-button type="primary" plain class="!rounded-xl" @click="fetchReports">
        <el-icon class="mr-1"><Refresh /></el-icon> Hasabaty Täzele
      </el-button>
    </div>

    <!-- Filter Controls Card -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <el-icon class="text-blue-600"><Filter /></el-icon>
          Wagt Aralygy Filtry (Period Filters)
        </span>
        <span class="text-xs text-slate-400 font-medium">Saýlanan rejim: <strong class="text-blue-700">{{ getPeriodLabel(periodType) }}</strong></span>
      </div>

      <div class="space-y-4">
        <!-- Period Type Selection Radio Buttons -->
        <el-radio-group v-model="periodType" size="large" @change="handlePeriodTypeChange" class="custom-radio-group">
          <el-radio-button label="all">Ähli Döwür</el-radio-button>
          <el-radio-button label="day">Takyk Gün</el-radio-button>
          <el-radio-button label="day_range">Gün Aralygy</el-radio-button>
          <el-radio-button label="month">Takyk Aý</el-radio-button>
          <el-radio-button label="month_range">Aý Aralygy</el-radio-button>
          <el-radio-button label="year">Takyk Ýyl</el-radio-button>
          <el-radio-button label="year_range">Ýyl Aralygy</el-radio-button>
        </el-radio-group>

        <!-- Dynamic Date Input Fields -->
        <div class="flex flex-wrap items-center gap-4 pt-2">
          
          <!-- Takyk Gün -->
          <div v-if="periodType === 'day'" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Gün saýlaň:</span>
            <el-date-picker
              v-model="filterDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="GG.AA.ÝÝÝÝ"
              @change="fetchReports"
            />
          </div>

          <!-- Gün Aralygy -->
          <div v-if="periodType === 'day_range'" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Seneler aralygy:</span>
            <el-date-picker
              v-model="filterDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="-"
              start-placeholder="Başlangyç gün"
              end-placeholder="Ahyrky gün"
              @change="fetchReports"
            />
          </div>

          <!-- Takyk Aý -->
          <div v-if="periodType === 'month'" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Aý saýlaň:</span>
            <el-date-picker
              v-model="filterMonth"
              type="month"
              value-format="YYYY-MM"
              placeholder="AA.ÝÝÝÝ"
              @change="fetchReports"
            />
          </div>

          <!-- Aý Aralygy -->
          <div v-if="periodType === 'month_range'" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Aýlar aralygy:</span>
            <el-date-picker
              v-model="filterMonthRange"
              type="monthrange"
              value-format="YYYY-MM"
              range-separator="-"
              start-placeholder="Başlangyç aý"
              end-placeholder="Ahyrky aý"
              @change="fetchReports"
            />
          </div>

          <!-- Takyk Ýyl -->
          <div v-if="periodType === 'year'" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Ýyl saýlaň:</span>
            <el-date-picker
              v-model="filterYear"
              type="year"
              value-format="YYYY"
              placeholder="ÝÝÝÝ"
              @change="fetchReports"
            />
          </div>

          <!-- Ýyl Aralygy -->
          <div v-if="periodType === 'year_range'" class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-slate-600">Başlangyç ýyl:</span>
              <el-date-picker
                v-model="filterStartYear"
                type="year"
                value-format="YYYY"
                placeholder="Ýyl"
                style="width: 140px;"
                @change="fetchReports"
              />
            </div>
            <span class="text-slate-400 font-bold">-</span>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-slate-600">Ahyrky ýyl:</span>
              <el-date-picker
                v-model="filterEndYear"
                type="year"
                value-format="YYYY"
                placeholder="Ýyl"
                style="width: 140px;"
                @change="fetchReports"
              />
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-loading="loading" class="space-y-6">
      
      <!-- Top KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- KPI 1: Total Vehicles -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Jemi Awtoulaglar</span>
            <span class="text-3xl font-black text-slate-900 block tracking-tight">
              {{ kpis.total_vehicles }}
            </span>
            <span class="text-[11px] text-slate-400 block">Hasaba alnan awtoulag sany</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl">
            <el-icon><Van /></el-icon>
          </div>
        </div>

        <!-- KPI 2: Total Expenses -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Jemi Çykdajylar</span>
            <span class="text-3xl font-black text-emerald-600 font-mono block tracking-tight">
              ${{ kpis.total_expenses_usd }}
            </span>
            <span class="text-[11px] text-slate-400 block">Bütün tapgyrlardaky çykdajy</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl">
            <el-icon><Money /></el-icon>
          </div>
        </div>

        <!-- KPI 3: Handed Over Vehicles -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Tabşyrylan (Handed Over)</span>
            <span class="text-3xl font-black text-blue-700 block tracking-tight">
              {{ kpis.handed_over_count }}
            </span>
            <span class="text-[11px] text-slate-400 block">Işgäryň jogapkärçiligindäki awtoulaglar</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl">
            <el-icon><Check /></el-icon>
          </div>
        </div>

        <!-- KPI 4: Assigned / Pending -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Berkidilen (Assigned)</span>
            <span class="text-3xl font-black text-amber-600 block tracking-tight">
              {{ kpis.assigned_count }}
            </span>
            <span class="text-[11px] text-slate-400 block">Kabul ediş-tabşyryş edilmedik</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-2xl">
            <el-icon><Lock /></el-icon>
          </div>
        </div>

      </div>

      <!-- Financial Visual Breakdown Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Expense Breakdown by Title / Type -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <el-icon class="text-blue-600"><PieChart /></el-icon>
              Çykdajylaryň Ady Boýunça Bölünişi
            </h3>
            <span class="text-xs text-slate-400">{{ byExpenseTitle.length }} dürli çykdajy</span>
          </div>

          <div v-if="byExpenseTitle.length > 0" class="space-y-4">
            <div v-for="item in byExpenseTitle" :key="item.title" class="space-y-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-800">{{ item.title }} <span class="text-slate-400 font-normal">({{ item.count }} sapar)</span></span>
                <span class="font-mono font-bold text-slate-900">${{ Number(item.total_amount).toFixed(2) }}</span>
              </div>
              <el-progress
                :percentage="calculatePercentage(Number(item.total_amount), Number(kpis.total_expenses_usd))"
                :color="getProgressColor(item.title)"
                :stroke-width="8"
                :show-text="false"
              />
            </div>
          </div>
          <div v-else class="py-8 text-center text-slate-400 text-sm">
            Çykdajy maglumaty tapylmady.
          </div>
        </div>

        <!-- Expense Breakdown by Stage & Status Breakdown -->
        <div class="space-y-6">
          
          <!-- Expense Breakdown by Stage -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <el-icon class="text-emerald-600"><TrendCharts /></el-icon>
                Tapgyrlar Boýunça Çykdajylar (Stages)
              </h3>
            </div>

            <div v-if="byExpenseStage.length > 0" class="space-y-3">
              <div v-for="st in byExpenseStage" :key="st.stage || 'Beýlekiler'" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <el-tag size="small" type="info">{{ st.stage || 'General' }}</el-tag>
                </span>
                <span class="font-mono font-bold text-slate-900 text-base">
                  ${{ Number(st.total_amount).toFixed(2) }}
                </span>
              </div>
            </div>
            <div v-else class="py-4 text-center text-slate-400 text-sm">
              Tapgyrlar boýunça maglumat ýok.
            </div>
          </div>

          <!-- Status & Location Summary Badges -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <el-icon class="text-amber-600"><Compass /></el-icon>
              Awtoulag Statuslary we Ýerleşiş Statistikasy
            </h3>

            <div class="grid grid-cols-2 gap-4">
              <!-- Statuses -->
              <div class="space-y-2">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Statuslar</span>
                <div v-for="st in byStatus" :key="st.status" class="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                  <span class="font-semibold text-slate-700">{{ getStatusLabel(st.status) }}</span>
                  <el-tag size="small" type="primary" effect="dark" class="font-bold">{{ st.count }}</el-tag>
                </div>
              </div>

              <!-- Locations -->
              <div class="space-y-2">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ýerleşýän Ýerleri</span>
                <div v-for="loc in byLocation" :key="loc.location" class="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                  <span class="font-semibold text-slate-700">{{ getLocationLabel(loc.location) }}</span>
                  <el-tag size="small" type="success" effect="dark" class="font-bold">{{ loc.count }}</el-tag>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Detailed Vehicles Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Hasabat Düzümindäki Awtoulaglar</h3>
            <p class="text-xs text-slate-500">Saýlanan wagt aralygynda girizilen / işlenen awtoulaglaryň sanawy.</p>
          </div>

          <el-tag size="large" type="primary" effect="plain" class="font-bold">
            Jemi {{ vehiclesList.length }} awtoulag
          </el-tag>
        </div>

        <el-table :data="vehiclesList" stripe style="width: 100%" empty-text="Awtoulag tapylmady.">
          <el-table-column label="VIN Kod" min-width="170">
            <template #default="{ row }">
              <router-link :to="`/vehicles/${row.vin}`" class="font-mono font-bold text-blue-700 hover:text-blue-900 no-underline">
                {{ row.vin }}
              </router-link>
            </template>
          </el-table-column>

          <el-table-column prop="title" label="Awtoulagyň Ady" min-width="180" />

          <el-table-column label="Marka / Model" min-width="160">
            <template #default="{ row }">
              <span class="text-xs font-semibold text-slate-700">{{ row.make }} {{ row.model }} ({{ row.year }})</span>
            </template>
          </el-table-column>

          <el-table-column label="Status" min-width="140">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small" effect="dark" class="font-semibold">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="Ýeri" min-width="160">
            <template #default="{ row }">
              <span class="text-xs text-slate-700 font-medium">{{ getLocationLabel(row.location) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Jogapkär Işgär" min-width="160">
            <template #default="{ row }">
              <span v-if="row.current_owner_detail" class="text-xs text-slate-800 font-semibold flex items-center gap-1">
                <el-icon class="text-emerald-600"><User /></el-icon>
                {{ row.current_owner_detail.first_name }} {{ row.current_owner_detail.last_name }}
              </span>
              <span v-else class="text-xs text-slate-400">-</span>
            </template>
          </el-table-column>

          <el-table-column label="Jemi Çykdajy" min-width="140" align="right">
            <template #default="{ row }">
              <span class="font-mono font-bold text-emerald-700 text-sm">${{ row.total_expenses }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { Vehicle, VehicleStatus, VehicleLocation } from '@/types'

const loading = ref(false)
const periodType = ref('all')

const filterDate = ref('')
const filterDateRange = ref<[string, string] | null>(null)
const filterMonth = ref('')
const filterMonthRange = ref<[string, string] | null>(null)
const filterYear = ref(new Date().getFullYear().toString())
const filterStartYear = ref('')
const filterEndYear = ref('')

const kpis = reactive({
  total_vehicles: 0,
  total_expenses_usd: '0.00',
  handed_over_count: 0,
  assigned_count: 0
})

const byStatus = ref<Array<{ status: string; count: number }>>([])
const byLocation = ref<Array<{ location: string; count: number }>>([])
const byExpenseTitle = ref<Array<{ title: string; total_amount: string | number; count: number }>>([])
const byExpenseStage = ref<Array<{ stage: string; total_amount: string | number }>>([])
const vehiclesList = ref<Vehicle[]>([])

const handlePeriodTypeChange = () => {
  fetchReports()
}

const fetchReports = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      period_type: periodType.value
    }

    if (periodType.value === 'day' && filterDate.value) {
      params.date = filterDate.value
    } else if (periodType.value === 'day_range' && filterDateRange.value) {
      params.start_date = filterDateRange.value[0]
      params.end_date = filterDateRange.value[1]
    } else if (periodType.value === 'month' && filterMonth.value) {
      params.month = filterMonth.value
    } else if (periodType.value === 'month_range' && filterMonthRange.value) {
      params.start_month = filterMonthRange.value[0]
      params.end_month = filterMonthRange.value[1]
    } else if (periodType.value === 'year' && filterYear.value) {
      params.year = filterYear.value
    } else if (periodType.value === 'year_range') {
      if (filterStartYear.value) params.start_year = filterStartYear.value
      if (filterEndYear.value) params.end_year = filterEndYear.value
    }

    const res = await api.get('/vehicles/reports/summary/', { params })
    const data = res.data

    kpis.total_vehicles = data.kpis.total_vehicles
    kpis.total_expenses_usd = data.kpis.total_expenses_usd
    kpis.handed_over_count = data.kpis.handed_over_count
    kpis.assigned_count = data.kpis.assigned_count

    byStatus.value = data.by_status || []
    byLocation.value = data.by_location || []
    byExpenseTitle.value = data.by_expense_title || []
    byExpenseStage.value = data.by_expense_stage || []
    vehiclesList.value = data.vehicles || []
  } catch (err) {
    ElMessage.error('Hasabat maglumatlary ýüklenmedi.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReports()
})

const getPeriodLabel = (type: string) => {
  switch (type) {
    case 'all': return 'Ähli döwür'
    case 'day': return 'Takyk Gün'
    case 'day_range': return 'Günler aralygy'
    case 'month': return 'Takyk Aý'
    case 'month_range': return 'Aýlar aralygy'
    case 'year': return 'Takyk Ýyl'
    case 'year_range': return 'Ýyllar aralygy'
    default: return type
  }
}

const calculatePercentage = (amount: number, total: number) => {
  if (!total || total === 0) return 0
  const pct = Math.round((amount / total) * 100)
  return Math.min(pct, 100)
}

const getProgressColor = (title: string) => {
  const t = title.toLowerCase()
  if (t.includes('copart') || t.includes('auksion')) return '#3B82F6'
  if (t.includes('freight') || t.includes('daşama')) return '#10B981'
  if (t.includes('custom') || t.includes('serhet')) return '#F59E0B'
  if (t.includes('repair') || t.includes('ussa')) return '#EF4444'
  return '#8B5CF6'
}

const getStatusTagType = (status: VehicleStatus) => {
  switch (status) {
    case 'PURCHASED': return 'info'
    case 'IN_TRANSIT': return 'warning'
    case 'ARRIVED_TKM': return 'success'
    case 'SOLD': return 'danger'
    default: return 'info'
  }
}

const getStatusLabel = (status: VehicleStatus) => {
  switch (status) {
    case 'PURCHASED': return 'Satyn alyndy'
    case 'IN_TRANSIT': return 'Ýolda'
    case 'ARRIVED_TKM': return 'TKM-a geldi'
    case 'SOLD': return 'Satyldy'
    default: return status
  }
}

const getLocationLabel = (loc: VehicleLocation) => {
  switch (loc) {
    case 'USA_COPART': return 'Amerika (Copart)'
    case 'SHIPPING_TRANSIT': return 'Ýük daşama'
    case 'GEORGIA': return 'Gruziýa'
    case 'TURKMENISTAN_INTERNAL': return 'Türkmenistan'
    default: return loc
  }
}
</script>
