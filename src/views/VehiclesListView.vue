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
          <el-option label="Satyn alyndy" value="PURCHASED" />
          <el-option label="Ýolda" value="IN_TRANSIT" />
          <el-option label="Türkmenistana geldi" value="ARRIVED_TKM" />
          <el-option label="Satyldy" value="SOLD" />
        </el-select>

        <el-select v-model="filterLocation" placeholder="Ýerleşýän ýeri" clearable class="!w-52">
          <el-option label="Amerika (Copart)" value="USA_COPART" />
          <el-option label="Ýük daşama ýola çykaryldy" value="SHIPPING_TRANSIT" />
          <el-option label="Gruziýa" value="GEORGIA" />
          <el-option label="Türkmenistan" value="TURKMENISTAN_INTERNAL" />
        </el-select>

        <el-button @click="resetFilters">Süzgüçleri Arassala</el-button>
      </div>
    </div>

    <!-- Vehicles Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <el-table
        v-loading="loading"
        :data="filteredVehicles"
        style="width: 100%"
        stripe
        empty-text="Awtoulag tapylmady."
      >
        <!-- VIN Code Column -->
        <el-table-column label="VIN Code" min-width="180">
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
        <el-table-column label="Amal" min-width="110" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="$router.push(`/vehicles/${row.vin}`)"
            >
              Jikme-jik
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Modals -->
    <VehicleCreateModal v-model="showCreateModal" @created="fetchVehicles" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import type { Vehicle, VehicleStatus, VehicleLocation } from '@/types'
import VehicleCreateModal from '@/components/modals/VehicleCreateModal.vue'

const authStore = useAuthStore()
const loading = ref(false)
const vehicles = ref<Vehicle[]>([])

const searchQuery = ref('')
const filterStatus = ref('')
const filterLocation = ref('')
const showCreateModal = ref(false)

const fetchVehicles = async () => {
  loading.value = true
  try {
    const res = await api.get<Vehicle[]>('/vehicles/')
    vehicles.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {
    // Handle error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
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

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterLocation.value = ''
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
