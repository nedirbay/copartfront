<template>
  <div class="space-y-6">
    
    <!-- Page Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Awtoulaglar Sanawy</h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ authStore.isAdmin ? 'Ähli awtoulaglaryň ýagdaýyny we çykdajylaryny dolandyryň.' : 'Özüňize berlen awtoulaglaryň ýagdaýyny yzarlaň.' }}
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
        Täze Awtoulag Goş
      </el-button>
    </div>

    <!-- Filter & Search Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="w-full md:w-80">
        <el-input
          v-model="searchQuery"
          placeholder="VIN kod ýa-da ady boýunça gözleg..."
          clearable
          prefix-icon="Search"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <el-select v-model="filterStatus" placeholder="Status filtri" clearable class="!w-44">
          <el-option
            v-for="st in statusesList"
            :key="st.code"
            :label="st.name"
            :value="st.code"
          />
        </el-select>

        <el-select v-model="filterLocation" placeholder="Ýerleşýän ýeri" clearable class="!w-52">
          <el-option
            v-for="loc in locationsList"
            :key="loc.code"
            :label="loc.name"
            :value="loc.code"
          />
        </el-select>

        <el-button @click="resetFilters">Süzgüçleri Arassala</el-button>
      </div>
    </div>

    <!-- Vehicles Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <el-table
        v-loading="loading"
        :data="paginatedVehicles"
        style="width: 100%"
        stripe
        empty-text="Awtoulag tapylmady."
      >
        <!-- Photo Column -->
        <el-table-column label="Surat" width="90" align="center">
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
                title="Surat ýok"
              >
                <el-icon class="text-base"><Picture /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- VIN Code Column -->
        <el-table-column label="VIN Code" min-width="170">
          <template #default="{ row }">
            <router-link :to="`/vehicles/${row.vin}`" class="font-mono font-bold text-blue-700 hover:text-blue-900 no-underline">
              {{ row.vin }}
            </router-link>
          </template>
        </el-table-column>

        <!-- Title / Make & Model -->
        <el-table-column label="Awtoulag" min-width="200">
          <template #default="{ row }">
            <div class="font-semibold text-slate-900 leading-tight">{{ row.title }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ row.make }} {{ row.model }} ({{ row.year }}) - {{ row.color }}</div>
          </template>
        </el-table-column>

        <!-- Status Tag -->
        <el-table-column label="Status" min-width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light" class="font-medium">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Location Tag -->
        <el-table-column label="Ýerleşýän Ýeri" min-width="190">
          <template #default="{ row }">
            <span class="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <el-icon class="mr-1 text-slate-500"><Location /></el-icon>
              {{ getLocationLabel(row.location) }}
            </span>
          </template>
        </el-table-column>

        <!-- Owner -->
        <el-table-column label="Jogapkär (Owner)" min-width="150">
          <template #default="{ row }">
            <span v-if="row.current_owner_detail" class="text-xs font-semibold text-slate-700">
              {{ row.current_owner_detail.first_name || row.current_owner_detail.username }}
            </span>
            <span v-else class="text-xs text-slate-400">Bellenilmegen</span>
          </template>
        </el-table-column>

        <!-- Total Expenses -->
        <el-table-column label="Jemi Çykdajy" min-width="130" align="right">
          <template #default="{ row }">
            <span class="font-bold text-slate-900 font-mono">${{ row.total_expenses }}</span>
          </template>
        </el-table-column>

        <!-- Action -->
        <el-table-column label="Amal" min-width="190" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip content="Jikme-jik görmek" placement="top">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="$router.push(`/vehicles/${row.vin}`)"
                >
                  <el-icon class="mr-0.5"><View /></el-icon> Gör
                </el-button>
              </el-tooltip>

              <el-tooltip v-if="canEditRow(row)" content="Awtoulagy üýtgetmek" placement="top">
                <el-button
                  type="warning"
                  link
                  size="small"
                  @click="openEditModal(row)"
                >
                  <el-icon class="mr-0.5"><Edit /></el-icon> Üýtget
                </el-button>
              </el-tooltip>

              <el-tooltip v-if="authStore.isAdmin" content="Awtoulagy pozmak" placement="top">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleDeleteVehicle(row)"
                >
                  <el-icon class="mr-0.5"><Delete /></el-icon> Poz
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div class="text-xs text-slate-500">
          Jemi: <span class="font-bold text-slate-800">{{ filteredVehicles.length }}</span> awtoulag
          <span v-if="filteredVehicles.length > 0" class="ml-1 text-slate-400">
            ({{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredVehicles.length) }} görkezilýär)
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
import api from '@/api'
import type { Vehicle, DynamicStatus, DynamicLocation } from '@/types'
import VehicleCreateModal from '@/components/modals/VehicleCreateModal.vue'
import VehicleEditModal from '@/components/modals/VehicleEditModal.vue'

const authStore = useAuthStore()
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
  const found = statusesList.value.find(s => s.code === status)
  if (found) return found.name
  switch (status) {
    case 'PURCHASED': return 'Satyn alyndy'
    case 'IN_TRANSIT': return 'Ýolda'
    case 'ARRIVED_TKM': return 'TKM-a geldi'
    case 'SOLD': return 'Satyldy'
    default: return status
  }
}

const getLocationLabel = (loc: string) => {
  const found = locationsList.value.find(l => l.code === loc)
  if (found) return found.name
  switch (loc) {
    case 'USA_COPART': return 'Amerika (Copart)'
    case 'SHIPPING_TRANSIT': return 'Ýük daşama'
    case 'GEORGIA': return 'Gruziýa'
    case 'TURKMENISTAN_INTERNAL': return 'Türkmenistan'
    default: return loc
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
      `"${row.title}" (VIN: ${row.vin}) awtoulagy pozmak isleýärsiňizmi? Oňa degişli ähli taryh we çykdajylar hem pozular.`,
      'Awtoulagy Pozmak',
      {
        confirmButtonText: 'Hawa, Poz',
        cancelButtonText: 'Ýatyr',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )

    await api.delete(`/vehicles/${row.vin}/`)
    ElMessage.success('Awtoulag üstünlikli pozuldy!')
    await fetchVehicles()
  } catch (err: any) {
    if (err !== 'cancel') {
      const msg = err.response?.data?.detail || 'Pozmakda ýalňyşlyk ýüze çykdy.'
      ElMessage.error(msg)
    }
  }
}
</script>
