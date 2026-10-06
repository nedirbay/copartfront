<template>
  <div class="space-y-6">
    
    <!-- Page Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ $t('vehicles.listTitle') }}</h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ authStore.isAdmin ? $t('vehicles.subtitleAdmin') : $t('vehicles.subtitleEmployee') }}
        </p>
      </div>

      <el-button
        v-if="authStore.isAdmin"
        type="primary"
        size="large"
        class="!rounded-xl shadow-xs"
        @click="showCreateModal = true"
      >
        <el-icon class="mr-1.5"><Plus /></el-icon>
        {{ $t('vehicles.addNew') }}
      </el-button>
    </div>

    <!-- Filter & Search Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="w-full md:w-80">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('vehicles.searchPlaceholder')"
          clearable
          prefix-icon="Search"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <el-select v-model="filterStatus" :placeholder="$t('vehicles.statusFilter')" clearable class="!w-44">
          <el-option
            v-for="st in statusesList"
            :key="st.code"
            :label="getStatusLabel(st.code)"
            :value="st.code"
          />
        </el-select>

        <el-select v-model="filterLocation" :placeholder="$t('vehicles.locationFilter')" clearable class="!w-52">
          <el-option
            v-for="loc in locationsList"
            :key="loc.code"
            :label="getLocationLabel(loc.code)"
            :value="loc.code"
          />
        </el-select>

        <el-button @click="resetFilters">{{ $t('common.clearFilters') }}</el-button>
      </div>
    </div>

    <!-- Vehicles Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <el-table
        v-loading="loading"
        :data="paginatedVehicles"
        style="width: 100%"
        stripe
        :empty-text="$t('vehicles.emptyList')"
      >
        <!-- Photo Column -->
        <el-table-column :label="$t('common.photo')" width="80" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center">
              <el-image
                v-if="row.photo_url"
                :src="row.photo_url"
                :preview-src-list="[row.photo_url]"
                preview-teleported
                fit="cover"
                class="w-12 h-10 rounded-lg shadow-2xs border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <template #error>
                  <div class="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div
                v-else
                class="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"
                :title="$t('common.noPhoto')"
              >
                <el-icon class="text-base"><Picture /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- VIN Code Column -->
        <el-table-column :label="$t('vehicles.vinCode')" min-width="155">
          <template #default="{ row }">
            <router-link :to="`/vehicles/${row.vin}`" class="font-mono font-bold text-blue-700 hover:text-blue-900 no-underline">
              {{ row.vin }}
            </router-link>
          </template>
        </el-table-column>

        <!-- Title / Make & Model -->
        <el-table-column :label="$t('vehicles.vehicleName')" min-width="190">
          <template #default="{ row }">
            <div class="font-semibold text-slate-900 leading-tight">{{ row.title }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ row.make }} {{ row.model }} ({{ row.year }}) - {{ row.color }}</div>
          </template>
        </el-table-column>

        <!-- Status Tag -->
        <el-table-column :label="$t('common.status')" min-width="125">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light" class="font-medium">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Location Tag -->
        <el-table-column :label="$t('common.location')" min-width="150">
          <template #default="{ row }">
            <span class="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <el-icon class="mr-1 text-slate-500"><Location /></el-icon>
              {{ getLocationLabel(row.location) }}
            </span>
          </template>
        </el-table-column>

        <!-- Owner -->
        <el-table-column :label="$t('vehicles.owner')" min-width="130">
          <template #default="{ row }">
            <span v-if="row.current_owner_detail" class="text-xs font-semibold text-slate-700">
              {{ row.current_owner_detail.first_name || row.current_owner_detail.username }}
            </span>
            <span v-else class="text-xs text-slate-400">{{ $t('vehicles.notAssigned') }}</span>
          </template>
        </el-table-column>

        <!-- Total Expenses -->
        <el-table-column :label="$t('vehicles.totalExpenses')" min-width="115" align="right">
          <template #default="{ row }">
            <span class="font-bold text-slate-900 font-mono">${{ row.total_expenses }}</span>
          </template>
        </el-table-column>

        <!-- Action -->
        <el-table-column :label="$t('common.actions')" min-width="175" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip :content="$t('common.details')" placement="top">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="$router.push(`/vehicles/${row.vin}`)"
                >
                  <el-icon class="mr-0.5"><View /></el-icon> {{ $t('common.view') }}
                </el-button>
              </el-tooltip>

              <el-tooltip v-if="canEditRow(row)" :content="$t('common.edit')" placement="top">
                <el-button
                  type="warning"
                  link
                  size="small"
                  @click="openEditModal(row)"
                >
                  <el-icon class="mr-0.5"><Edit /></el-icon> {{ $t('common.edit') }}
                </el-button>
              </el-tooltip>

              <el-tooltip v-if="authStore.isAdmin" :content="$t('common.delete')" placement="top">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleDeleteVehicle(row)"
                >
                  <el-icon class="mr-0.5"><Delete /></el-icon> {{ $t('common.delete') }}
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div class="text-xs text-slate-500">
          {{ $t('common.total') }}: <span class="font-bold text-slate-800">{{ filteredVehicles.length }}</span> {{ $t('vehicles.paginationTotal') }}
          <span v-if="filteredVehicles.length > 0" class="ml-1 text-slate-400">
            ({{ $t('vehicles.paginationShowing', { start: (currentPage - 1) * pageSize + 1, end: Math.min(currentPage * pageSize, filteredVehicles.length) }) }})
          </span>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredVehicles.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          class="!flex-wrap justify-end"
        />
      </div>
    </div>

    <!-- Modals -->
    <VehicleCreateModal v-model="showCreateModal" @created="fetchVehicles" />
    <VehicleEditModal
      v-model="showEditModal"
      :vehicle="selectedVehicleForEdit"
      @updated="fetchVehicles"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { Vehicle, DynamicStatus, DynamicLocation } from '@/types'
import VehicleCreateModal from '@/components/modals/VehicleCreateModal.vue'
import VehicleEditModal from '@/components/modals/VehicleEditModal.vue'
import { Plus, Search, Picture, Location, View, Edit, Delete } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const { t } = useI18n()
const loading = ref(false)
const vehicles = ref<Vehicle[]>([])

const searchQuery = ref('')
const filterStatus = ref('')
const filterLocation = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedVehicleForEdit = ref<Vehicle | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)

const statusesList = ref<DynamicStatus[]>([])
const locationsList = ref<DynamicLocation[]>([])

const fetchDictionaries = async () => {
  try {
    const [stRes, locRes] = await Promise.all([
      api.get('/vehicles/dictionaries/statuses/'),
      api.get('/vehicles/dictionaries/locations/')
    ])
    statusesList.value = Array.isArray(stRes.data) ? stRes.data : stRes.data.results || []
    locationsList.value = Array.isArray(locRes.data) ? locRes.data : locRes.data.results || []
  } catch (err) {}
}

const fetchVehicles = async () => {
  loading.value = true
  try {
    const res = await api.get<Vehicle[]>('/vehicles/')
    vehicles.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDictionaries()
  fetchVehicles()
})

const filteredVehicles = computed(() => {
  return vehicles.value.filter(v => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesQuery = !query || v.vin.toLowerCase().includes(query) || v.title.toLowerCase().includes(query)
    const matchesStatus = !filterStatus.value || v.status === filterStatus.value
    const matchesLocation = !filterLocation.value || v.location === filterLocation.value
    return matchesQuery && matchesStatus && matchesLocation
  })
})

const paginatedVehicles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredVehicles.value.slice(start, start + pageSize.value)
})

watch([searchQuery, filterStatus, filterLocation], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterLocation.value = ''
  currentPage.value = 1
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'PURCHASED': return 'info'
    case 'IN_TRANSIT': return 'warning'
    case 'ARRIVED_TKM': return 'success'
    case 'SOLD': return 'danger'
    default: return 'primary'
  }
}

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

const canEditRow = (row: Vehicle) => {
  if (authStore.isAdmin) return true
  if (row.is_handed_over && row.current_owner === authStore.user?.id) return true
  return false
}

const openEditModal = (row: Vehicle) => {
  selectedVehicleForEdit.value = row
  showEditModal.value = true
}

const handleDeleteVehicle = async (row: Vehicle) => {
  try {
    await ElMessageBox.confirm(
      t('vehicles.deleteConfirmText', { title: row.title, vin: row.vin }),
      t('vehicles.deleteConfirmTitle'),
      {
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )

    await api.delete(`/vehicles/${row.vin}/`)
    ElMessage.success(t('vehicles.deleteSuccess'))
    await fetchVehicles()
  } catch (err: any) {
    if (err !== 'cancel') {
      const msg = err.response?.data?.detail || t('common.error')
      ElMessage.error(msg)
    }
  }
}
</script>
