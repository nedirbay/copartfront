<template>
  <div v-loading="loading" class="space-y-6">
    
    <!-- Back Button & Breadcrumbs -->
    <div class="flex items-center gap-2">
      <el-button link @click="$router.push('/vehicles')">
        <el-icon class="mr-1"><Back /></el-icon> Awtoulaglar Sanawyna Gaýt
      </el-button>
    </div>

    <!-- Vehicle Main Header Card -->
    <div v-if="vehicle" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <span class="bg-blue-50 text-blue-800 font-mono font-bold text-lg px-3 py-1 rounded-lg border border-blue-200">
            {{ vehicle.vin }}
          </span>
          <el-tag :type="getStatusTagType(vehicle.status)" effect="dark" size="large" class="font-semibold">
            {{ getStatusLabel(vehicle.status) }}
          </el-tag>
          <el-tag v-if="vehicle.is_handed_over" type="success" effect="plain" class="font-medium">
            <el-icon class="mr-1"><Check /></el-icon> Kabul ediş-tabşyryş edildi
          </el-tag>
        </div>

        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
          {{ vehicle.title }}
        </h1>
        
        <p class="text-sm text-slate-500 flex items-center gap-4">
          <span><strong class="text-slate-700">Marka/Model:</strong> {{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</span>
          <span>&bull;</span>
          <span><strong class="text-slate-700">Reňki:</strong> {{ vehicle.color }}</span>
          <span>&bull;</span>
          <span><strong class="text-slate-700">Probeg:</strong> {{ vehicle.mileage }} mil</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <el-button
          type="primary"
          size="large"
          class="!rounded-xl"
          @click="showStatusModal = true"
        >
          <el-icon class="mr-1.5"><EditPen /></el-icon>
          Status / Ýeri Üýtget
        </el-button>

        <el-button
          v-if="canHandover"
          type="success"
          size="large"
          class="!rounded-xl"
          @click="showHandoverModal = true"
        >
          <el-icon class="mr-1.5"><Share /></el-icon>
          Kabul Ediş-Tabşyryş (Handover)
        </el-button>
      </div>
    </div>

    <!-- Vehicle Detailed Content Tabs -->
    <div v-if="vehicle" class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <el-tabs v-model="activeTab" class="custom-vehicle-tabs">
        
        <!-- TAB 1: General Info -->
        <el-tab-pane label="Umumy Maglumat" name="info">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
            
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Ýerleşýän Ýeri</span>
              <span class="text-base font-bold text-slate-900 mt-1 block flex items-center gap-1.5">
                <el-icon class="text-blue-600"><Location /></el-icon>
                {{ getLocationLabel(vehicle.location) }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Jogapkär (Owner)</span>
              <span class="text-base font-bold text-slate-900 mt-1 block flex items-center gap-1.5">
                <el-icon class="text-emerald-600"><User /></el-icon>
                {{ vehicle.current_owner_detail ? `${vehicle.current_owner_detail.first_name} ${vehicle.current_owner_detail.last_name}` : 'Bellenilmegen' }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Jemi Çykdajy</span>
              <span class="text-lg font-bold text-slate-900 font-mono mt-1 block text-emerald-700">
                ${{ vehicle.total_expenses }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Hasaba Alnan Senesi</span>
              <span class="text-sm font-semibold text-slate-700 mt-1 block">
                {{ formatDate(vehicle.created_at) }}
              </span>
            </div>

          </div>
        </el-tab-pane>

        <!-- TAB 2: Expenses -->
        <el-tab-pane label="Çykdajylar (Expenses)" name="expenses">
          <div class="space-y-4 py-2">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Awtoulagyň Çykdajylary</h3>
                <p class="text-xs text-slate-500">Copart, daşama, Gruziýa, ussa we beýleki çykdajylar.</p>
              </div>

              <el-button type="primary" class="!rounded-xl" @click="showExpenseModal = true">
                <el-icon class="mr-1"><Plus /></el-icon> Çykdajy Goş
              </el-button>
            </div>

            <el-table :data="expenses" stripe style="width: 100%" empty-text="Çykdajy ýok.">
              <el-table-column prop="title" label="Çykdajynyň Ady" min-width="200" />
              <el-table-column prop="stage" label="Tapgyry" min-width="140">
                <template #default="{ row }">
                  <el-tag v-if="row.stage" size="small" type="info">{{ row.stage }}</el-tag>
                  <span v-else class="text-slate-400 text-xs">-</span>
                </template>
              </el-table-column>
              <el-table-column label="Möçberi" min-width="140" align="right">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-slate-900">${{ row.amount }} {{ row.currency }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Girizen" min-width="150">
                <template #default="{ row }">
                  <span class="text-xs text-slate-600">
                    {{ row.created_by_detail ? row.created_by_detail.username : '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Sene" min-width="150">
                <template #default="{ row }">
                  <span class="text-xs text-slate-500">{{ formatDate(row.created_at) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- TAB 3: Documents & Photos -->
        <el-tab-pane label="Resminamalar & Suratlar" name="documents">
          <div class="space-y-6 py-2">
            
            <!-- Upload Box -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 class="text-sm font-bold text-slate-800">Täze Surat / Resminama Ýüklemek</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Resminamanyň Sözbaşysy</label>
                  <el-input v-model="uploadTitle" placeholder="Mysal: Öň tarap suraty" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Tipi</label>
                  <el-select v-model="uploadType" class="!w-full">
                    <el-option label="Surat (Photo)" value="PHOTO" />
                    <el-option label="Auksion Resminamasy" value="AUCTION_DOC" />
                    <el-option label="Ýük daşama Resminamasy" value="SHIPPING_DOC" />
                    <el-option label="Ussa / Serhet Çykdajysy" value="REPAIR_BILL" />
                    <el-option label="Başga" value="OTHER" />
                  </el-select>
                </div>

                <div>
                  <input type="file" ref="fileInput" class="hidden" @change="onFileSelected" />
                  <div class="flex gap-2">
                    <el-button @click="triggerFileSelect" class="flex-1">
                      <el-icon class="mr-1"><FolderOpened /></el-icon>
                      {{ selectedFile ? selectedFile.name : 'Faýl Seçiň' }}
                    </el-button>
                    <el-button type="primary" :disabled="!selectedFile || !uploadTitle" :loading="uploading" @click="uploadDocument">
                      Ýükle
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-md transition"
              >
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <el-tag size="small" type="primary">{{ doc.document_type }}</el-tag>
                    <span class="text-[10px] text-slate-400">{{ formatDate(doc.created_at) }}</span>
                  </div>
                  <div class="font-semibold text-sm text-slate-900 truncate" :title="doc.title">{{ doc.title }}</div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex justify-between items-center mt-2">
                  <span class="text-xs text-slate-500">Ýükledi: {{ doc.uploaded_by_detail?.username || '-' }}</span>
                  <a :href="doc.file" target="_blank" class="text-blue-700 hover:text-blue-900 text-xs font-bold no-underline flex items-center gap-1">
                    <el-icon><View /></el-icon> Gör
                  </a>
                </div>
              </div>
            </div>

          </div>
        </el-tab-pane>

        <!-- TAB 4: Timeline / History -->
        <el-tab-pane label="Yzarlama Taryhy (Timeline)" name="history">
          <div class="py-4 max-w-3xl">
            <el-timeline>
              <el-timeline-item
                v-for="log in historyLogs"
                :key="log.id"
                :timestamp="formatDate(log.created_at)"
                placement="top"
                type="primary"
              >
                <el-card class="!rounded-xl !border-slate-200 shadow-2xs">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <el-tag size="small" type="info">{{ getStatusLabel(log.status as any) }}</el-tag>
                      <span class="text-xs font-semibold text-slate-600">&bull; {{ getLocationLabel(log.location as any) }}</span>
                    </div>
                    <p v-if="log.note" class="text-sm text-slate-700 mt-2">{{ log.note }}</p>
                    <div class="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100 flex justify-between">
                      <span>Üýtgeden: <strong>{{ log.changed_by_detail?.username || 'Ulgam' }}</strong></span>
                      <span>Owner: <strong>{{ log.owner_detail?.username || 'Bellenilmegen' }}</strong></span>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>

    <!-- Modals -->
    <StatusLocationModal v-model="showStatusModal" :vehicle="vehicle" @updated="refreshData" />
    <HandoverModal v-model="showHandoverModal" :vehicle="vehicle" @updated="refreshData" />
    <ExpenseModal v-model="showExpenseModal" :vin="vin" @created="fetchExpenses" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { Vehicle, VehicleHistoryLog, VehicleExpense, VehicleDocument, VehicleStatus, VehicleLocation } from '@/types'

import StatusLocationModal from '@/components/modals/StatusLocationModal.vue'
import HandoverModal from '@/components/modals/HandoverModal.vue'
import ExpenseModal from '@/components/modals/ExpenseModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const vin = route.params.vin as string

const loading = ref(false)
const vehicle = ref<Vehicle | null>(null)
const expenses = ref<VehicleExpense[]>([])
const documents = ref<VehicleDocument[]>([])
const historyLogs = ref<VehicleHistoryLog[]>([])

const activeTab = ref('info')
const showStatusModal = ref(false)
const showHandoverModal = ref(false)
const showExpenseModal = ref(false)

// File Upload state
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadTitle = ref('')
const uploadType = ref('PHOTO')
const uploading = ref(false)

const canHandover = computed(() => {
  if (!vehicle.value) return false
  return authStore.isAdmin || vehicle.value.current_owner === authStore.user?.id
})

const fetchVehicleDetail = async () => {
  try {
    const res = await api.get<Vehicle>(`/vehicles/${vin}/`)
    vehicle.value = res.data
  } catch (err) {
    ElMessage.error('Awtoulag maglumatlary ýüklenmedi.')
  }
}

const fetchExpenses = async () => {
  try {
    const res = await api.get<VehicleExpense[]>(`/vehicles/${vin}/expenses/`)
    expenses.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
    // Re-fetch vehicle details to get updated total_expenses
    fetchVehicleDetail()
  } catch (err) {}
}

const fetchDocuments = async () => {
  try {
    const res = await api.get<VehicleDocument[]>(`/vehicles/${vin}/documents/`)
    documents.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
  } catch (err) {}
}

const fetchHistoryLogs = async () => {
  try {
    const res = await api.get<VehicleHistoryLog[]>(`/vehicles/${vin}/history/`)
    historyLogs.value = res.data
  } catch (err) {}
}

const refreshData = async () => {
  loading.value = true
  await Promise.all([
    fetchVehicleDetail(),
    fetchExpenses(),
    fetchDocuments(),
    fetchHistoryLogs()
  ])
  loading.value = false
}

onMounted(() => {
  refreshData()
})

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const uploadDocument = async () => {
  if (!selectedFile.value || !uploadTitle.value) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('title', uploadTitle.value)
    formData.append('document_type', uploadType.value)

    await api.post(`/vehicles/${vin}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    ElMessage.success('Resminama üstünlikli ýüklendi!')
    selectedFile.value = null
    uploadTitle.value = ''
    fetchDocuments()
  } catch (err) {
    ElMessage.error('Resminama ýüklenende ýalňyşlyk ýüze çykdy.')
  } finally {
    uploading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('tk-TM', { dateStyle: 'medium', timeStyle: 'short' })
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
