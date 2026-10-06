<template>
  <div v-loading="loading" class="space-y-6">
    
    <!-- Back Button & Breadcrumbs -->
    <div class="flex items-center gap-2">
      <el-button link @click="$router.push('/vehicles')">
        <el-icon class="mr-1"><Back /></el-icon> Awtoulaglar Sanawyna Gaýt
      </el-button>
    </div>

    <!-- Handover Pending Confirmation Banner (Target Employee) -->
    <div
      v-if="vehicle && vehicle.pending_handover_owner === authStore.user?.id"
      class="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
          <el-icon><Share /></el-icon>
        </div>
        <div>
          <h4 class="text-base font-bold text-slate-900">Awtoulagy Kabul Etmek Tassyklaýşy (Handover)</h4>
          <p class="text-xs text-slate-600">
            Siziň adyňyza kabul ediş-tabşyryş haýyşy geldi. Awtoulagy öz üstüňize kabul etmek üçin "Tassykla" düwmesine basyň.
          </p>
        </div>
      </div>

      <el-button
        type="success"
        size="large"
        class="!rounded-xl shadow-xs"
        :loading="confirmingHandover"
        @click="handleConfirmHandover"
      >
        <el-icon class="mr-1.5"><Check /></el-icon> Kabul Et / Tassykla
      </el-button>
    </div>

    <!-- Vehicle Main Header Card -->
    <div v-if="vehicle" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <!-- Vehicle Photo Display with Preview -->
        <div class="relative shrink-0">
          <el-image
            v-if="vehicle.photo_url"
            :src="vehicle.photo_url"
            :preview-src-list="[vehicle.photo_url]"
            preview-teleported
            fit="cover"
            class="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl shadow-xs border border-slate-200 cursor-pointer hover:opacity-95 transition-all"
          >
            <template #error>
              <div class="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <el-icon class="text-3xl"><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div
            v-else
            class="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex flex-col items-center justify-center text-slate-400"
          >
            <el-icon class="text-3xl"><Picture /></el-icon>
            <span class="text-[11px] mt-1 font-medium">Surat ýok</span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-3">
            <span class="bg-blue-50 text-blue-800 font-mono font-bold text-lg px-3 py-1 rounded-lg border border-blue-200">
              {{ vehicle.vin }}
            </span>
            <el-tag :type="getStatusTagType(vehicle.status)" effect="dark" size="large" class="font-semibold">
              {{ getStatusLabel(vehicle.status) }}
            </el-tag>

            <!-- Status Badge: Berkidilen vs Tabşyrylan -->
            <el-tag v-if="vehicle.is_handed_over" type="success" effect="light" class="font-semibold">
              <el-icon class="mr-1"><Check /></el-icon> Awtoulag Tabşyrylan (Işgär Jogapkär)
            </el-tag>
            <el-tag v-else-if="vehicle.pending_handover_owner" type="warning" effect="light" class="font-semibold">
              <el-icon class="mr-1"><Loading /></el-icon> Tabşyrylyşa Garaşylýar (@{{ vehicle.pending_handover_owner_detail?.username }})
            </el-tag>
            <el-tag v-else type="info" effect="light" class="font-semibold">
              <el-icon class="mr-1"><Lock /></el-icon> Awtoulag Berkidilen (Tabşyrylmadyk)
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
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Edit Vehicle Button -->
        <el-button
          v-if="canEditVehicle"
          type="warning"
          plain
          size="large"
          class="!rounded-xl"
          @click="showEditModal = true"
        >
          <el-icon class="mr-1.5"><Edit /></el-icon>
          Üýtget
        </el-button>

        <!-- Admin: Assign to Employee Button -->
        <el-button
          v-if="canAssign"
          type="info"
          plain
          size="large"
          class="!rounded-xl"
          @click="showAssignModal = true"
        >
          <el-icon class="mr-1.5"><User /></el-icon>
          Işgäre Berkit / Üýtget
        </el-button>

        <el-button
          v-if="canEditVehicle"
          type="primary"
          size="large"
          class="!rounded-xl"
          @click="showStatusModal = true"
        >
          <el-icon class="mr-1.5"><EditPen /></el-icon>
          Status / Ýeri Üýtget
        </el-button>

        <!-- Employee: Handover Button (Admin does NOT have Handover) -->
        <el-button
          v-if="canHandover"
          type="success"
          size="large"
          class="!rounded-xl"
          @click="showHandoverModal = true"
        >
          <el-icon class="mr-1.5"><Share /></el-icon>
          Kabul Ediş-Tabşyryş Ugrat
        </el-button>

        <!-- Admin: Delete Vehicle Button -->
        <el-button
          v-if="authStore.isAdmin"
          type="danger"
          plain
          size="large"
          class="!rounded-xl"
          @click="handleDeleteCurrentVehicle"
        >
          <el-icon class="mr-1.5"><Delete /></el-icon>
          Poz
        </el-button>
      </div>
    </div>

    <!-- Permission Info Alerts -->
    <div v-if="vehicle" class="space-y-2">
      <!-- Alert for Employee when vehicle is only assigned (not handed over) -->
      <el-alert
        v-if="!vehicle.is_handed_over && !authStore.isAdmin && vehicle.pending_handover_owner !== authStore.user?.id"
        title="Awtoulag size diňe berkidilen (Tabşyrylmadyk). Siz diňe jikme-jik maglumatlary görüp bilersiňiz. Kabul ediş-tabşyryş edilip tassyklanýança üýtgeşme girizip bilmersiňiz."
        type="info"
        show-icon
        :closable="false"
      />

      <!-- Alert for Admin when vehicle is handed over to employee -->
      <el-alert
        v-if="vehicle.is_handed_over && authStore.isAdmin"
        title="Awtoulag işgäre tabşyrylan. Kabul ediş-tabşyryş edilenden soň diňe jogapkär işgär üýtgeşme girizip biler (Admin ulanyjy diňe okaýar)."
        type="warning"
        show-icon
        :closable="false"
      />
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

              <el-button
                v-if="canEditVehicle"
                type="primary"
                class="!rounded-xl"
                @click="showExpenseModal = true"
              >
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
            <div v-if="canEditVehicle" class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
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
    <AssignModal v-model="showAssignModal" :vehicle="vehicle" @updated="refreshData" />
    <StatusLocationModal v-model="showStatusModal" :vehicle="vehicle" @updated="refreshData" />
    <HandoverModal v-model="showHandoverModal" :vehicle="vehicle" @updated="refreshData" />
    <ExpenseModal v-model="showExpenseModal" :vin="vin" @created="fetchExpenses" />
    <VehicleEditModal v-model="showEditModal" :vehicle="vehicle" @updated="refreshData" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import type { Vehicle, VehicleHistoryLog, VehicleExpense, VehicleDocument, VehicleStatus, VehicleLocation } from '@/types'

import AssignModal from '@/components/modals/AssignModal.vue'
import StatusLocationModal from '@/components/modals/StatusLocationModal.vue'
import HandoverModal from '@/components/modals/HandoverModal.vue'
import ExpenseModal from '@/components/modals/ExpenseModal.vue'
import VehicleEditModal from '@/components/modals/VehicleEditModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const vin = route.params.vin as string

const loading = ref(false)
const confirmingHandover = ref(false)
const vehicle = ref<Vehicle | null>(null)
const expenses = ref<VehicleExpense[]>([])
const documents = ref<VehicleDocument[]>([])
const historyLogs = ref<VehicleHistoryLog[]>([])

const activeTab = ref('info')
const showAssignModal = ref(false)
const showStatusModal = ref(false)
const showHandoverModal = ref(false)
const showExpenseModal = ref(false)
const showEditModal = ref(false)

// File Upload state
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadTitle = ref('')
const uploadType = ref('PHOTO')
const uploading = ref(false)

// Business logic permission rule:
// 1) Maşyn Berkitmek (is_handed_over = False): Assigned employee can view details, but CANNOT edit/add. ONLY Admin can edit.
// 2) Maşyn Tabşyrmak (is_handed_over = True): Handed employee CAN edit/add. Admin CANNOT edit (Read-only).
const canEditVehicle = computed(() => {
  if (!vehicle.value) return false
  if (vehicle.value.is_handed_over) {
    return authStore.user?.id === vehicle.value.current_owner
  } else {
    return authStore.isAdmin
  }
})

// Handover button is ONLY for assigned employee (Admin does NOT have Handover)
const canHandover = computed(() => {
  if (!vehicle.value) return false
  if (authStore.isAdmin) return false // Admin cannot initiate handover!
  return !vehicle.value.is_handed_over && vehicle.value.current_owner === authStore.user?.id
})

// Assign button is for Admin to assign or change assigned employee before handover
const canAssign = computed(() => {
  if (!vehicle.value) return false
  return authStore.isAdmin && !vehicle.value.is_handed_over
})


const fetchVehicleDetail = async () => {
  try {
    const res = await api.get<Vehicle>(`/vehicles/${vin}/`)
    vehicle.value = res.data
  } catch (err) {
    ElMessage.error('Awtoulag maglumatlary ýüklenmedi.')
  }
}

const handleConfirmHandover = async () => {
  if (!vehicle.value) return
  confirmingHandover.value = true
  try {
    await api.post(`/vehicles/${vin}/confirm-handover/`)
    ElMessage.success('Awtoulag üstünlikli kabul edildi we tassyklandy!')
    refreshData()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || 'Tassyklaýyşda ýalňyşlyk döredi.')
  } finally {
    confirmingHandover.value = false
  }
}

const fetchExpenses = async () => {
  try {
    const res = await api.get<VehicleExpense[]>(`/vehicles/${vin}/expenses/`)
    expenses.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
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
  } catch (err: any) {
    const msg = err.response?.data?.detail || 'Resminama ýüklenende ýalňyşlyk ýüze çykdy.'
    ElMessage.error(msg)
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

const handleDeleteCurrentVehicle = async () => {
  if (!vehicle.value) return
  try {
    await ElMessageBox.confirm(
      `"${vehicle.value.title}" (VIN: ${vehicle.value.vin}) awtoulagy pozmak isleýärsiňizmi? Oňa degişli ähli taryh we çykdajylar hem pozular.`,
      'Awtoulagy Pozmak',
      {
        confirmButtonText: 'Hawa, Poz',
        cancelButtonText: 'Ýatyr',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )

    await api.delete(`/vehicles/${vehicle.value.vin}/`)
    ElMessage.success('Awtoulag üstünlikli pozuldy!')
    router.push('/vehicles')
  } catch (err: any) {
    if (err !== 'cancel') {
      const msg = err.response?.data?.detail || 'Pozmakda ýalňyşlyk ýüze çykdy.'
      ElMessage.error(msg)
    }
  }
}
</script>
