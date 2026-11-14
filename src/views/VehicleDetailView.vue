<template>
  <div v-loading="loading" class="space-y-6">
    
    <!-- Back Button & Breadcrumbs -->
    <div class="flex items-center gap-2">
      <el-button link @click="$router.push('/vehicles')">
        <el-icon class="mr-1"><Back /></el-icon> {{ $t('common.back') }}
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
          <h4 class="text-base font-bold text-slate-900">{{ $t('vehicles.handoverAlertTitle') }}</h4>
          <p class="text-xs text-slate-600">
            {{ $t('vehicles.handoverAlertDesc') }}
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <el-button size="large" type="danger" plain class="!rounded-xl" @click="handleRejectHandover">
          {{ $t('x.rejectHandoverBtn') }}
        </el-button>
        <el-button
          type="success"
          size="large"
          class="!rounded-xl shadow-xs"
          :loading="confirmingHandover"
          @click="handleConfirmHandover"
        >
          <el-icon class="mr-1.5"><Check /></el-icon> {{ $t('vehicles.confirmHandoverBtn') }}
        </el-button>
      </div>
    </div>

    <!-- Pending handover: initiator / admin can cancel -->
    <el-alert
      v-if="vehicle && vehicle.pending_handover_owner && vehicle.pending_handover_owner !== authStore.user?.id && (authStore.isAdmin || vehicle.current_owner === authStore.user?.id)"
      type="warning"
      show-icon
      :closable="false"
      :title="$t('vehicles.pendingHandoverBadge', { username: vehicle.pending_handover_owner_detail?.username })"
    >
      <el-button size="small" type="warning" class="mt-2" @click="handleCancelHandover">{{ $t('x.cancelHandoverBtn') }}</el-button>
    </el-alert>

    <!-- Vehicle Main Header Card -->
    <div v-if="vehicle" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <!-- Vehicle Photo Display with Preview -->
        <div class="relative shrink-0">
          <el-image
            v-if="vehicle.photo_url"
            :src="vehicle.photo_url"
            :preview-src-list="vehicle.photos && vehicle.photos.length ? vehicle.photos : [vehicle.photo_url]"
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
          <span
            v-if="vehicle.photos && vehicle.photos.length > 1"
            class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
          >{{ vehicle.photos.length }}</span>
          <div
            v-else-if="!vehicle.photo_url"
            class="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex flex-col items-center justify-center text-slate-400"
          >
            <el-icon class="text-3xl"><Picture /></el-icon>
            <span class="text-[11px] mt-1 font-medium">{{ $t('common.noPhoto') }}</span>
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
              <el-icon class="mr-1"><Check /></el-icon> {{ $t('vehicles.handedOverBadge') }}
            </el-tag>
            <el-tag v-else-if="vehicle.pending_handover_owner" type="warning" effect="light" class="font-semibold">
              <el-icon class="mr-1"><Loading /></el-icon> {{ $t('vehicles.pendingHandoverBadge', { username: vehicle.pending_handover_owner_detail?.username }) }}
            </el-tag>
            <el-tag v-else type="info" effect="light" class="font-semibold">
              <el-icon class="mr-1"><Lock /></el-icon> {{ $t('vehicles.assignedBadge') }}
            </el-tag>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
            {{ vehicle.title }}
          </h1>
          
          <p class="text-sm text-slate-500 flex items-center gap-4">
            <span><strong class="text-slate-700">{{ $t('vehicles.makeLabel') }}:</strong> {{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</span>
            <span>&bull;</span>
            <span><strong class="text-slate-700">{{ $t('vehicles.colorLabel') }}:</strong> {{ vehicle.color }}</span>
            <span>&bull;</span>
            <span><strong class="text-slate-700">{{ $t('vehicles.mileageLabel') }}:</strong> {{ vehicle.mileage }}</span>
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
          {{ $t('common.edit') }}
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
          {{ $t('vehicles.assignBtn') }}
        </el-button>

        <el-button
          v-if="canEditVehicle"
          type="primary"
          size="large"
          class="!rounded-xl"
          @click="showStatusModal = true"
        >
          <el-icon class="mr-1.5"><EditPen /></el-icon>
          {{ $t('vehicles.editStatusBtn') }}
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
          {{ $t('vehicles.handoverBtn') }}
        </el-button>

        <!-- Admin: force reassign / revoke handover -->
        <el-button v-if="authStore.isAdmin && vehicle.is_handed_over" type="danger" plain size="large" class="!rounded-xl" @click="showForceModal = true">
          {{ $t('x.forceReassignBtn') }}
        </el-button>
        <el-button v-if="authStore.isAdmin && vehicle.is_handed_over" type="warning" plain size="large" class="!rounded-xl" @click="handleRevokeHandover">
          {{ $t('x.revokeHandoverBtn') }}
        </el-button>

        <el-button size="large" class="!rounded-xl no-print" @click="printCard">
          <el-icon class="mr-1.5"><Printer /></el-icon>{{ $t('x.print') }}
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
          {{ $t('common.delete') }}
        </el-button>
      </div>
    </div>

    <!-- Permission Info Alerts -->
    <div v-if="vehicle" class="space-y-2">
      <!-- Alert for Employee when vehicle is only assigned (not handed over) -->
      <el-alert
        v-if="!vehicle.is_handed_over && !authStore.isAdmin && vehicle.pending_handover_owner !== authStore.user?.id"
        :title="$t('vehicles.assignedOnlyAlert')"
        type="info"
        show-icon
        :closable="false"
      />
    </div>

    <!-- Vehicle Detailed Content Tabs -->
    <div v-if="vehicle" class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <el-tabs v-model="activeTab" class="custom-vehicle-tabs">
        
        <!-- TAB 1: General Info -->
        <el-tab-pane :label="$t('vehicles.tabOverview')" name="info">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
            
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">{{ $t('common.location') }}</span>
              <span class="text-base font-bold text-slate-900 mt-1 block flex items-center gap-1.5">
                <el-icon class="text-blue-600"><Location /></el-icon>
                {{ getLocationLabel(vehicle.location) }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">{{ $t('vehicles.owner') }}</span>
              <span class="text-base font-bold text-slate-900 mt-1 block flex items-center gap-1.5">
                <el-icon class="text-emerald-600"><User /></el-icon>
                {{ vehicle.current_owner_detail ? `${vehicle.current_owner_detail.first_name} ${vehicle.current_owner_detail.last_name}` : $t('vehicles.notAssigned') }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">{{ $t('vehicles.totalExpenses') }}</span>
              <span class="text-lg font-bold text-slate-900 font-mono mt-1 block text-emerald-700">
                {{ money(vehicle.total_expenses) }}
              </span>
              <span v-if="currencyBreakdown" class="text-[11px] text-slate-500 block mt-0.5">{{ currencyBreakdown }}</span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">{{ $t('common.createdDate') }}</span>
              <span class="text-sm font-semibold text-slate-700 mt-1 block">
                {{ formatDate(vehicle.created_at) }}
              </span>
            </div>

          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
            <!-- Finance -->
            <div class="border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 class="text-sm font-bold text-slate-800">{{ $t('x.finance') }}</h4>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.purchasePrice') }}</span>
                <span class="font-mono font-semibold">{{ vehicle.purchase_price ? money(vehicle.purchase_price, vehicle.purchase_currency) : '—' }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.expensesUsd') }}</span>
                <span class="font-mono font-semibold">{{ money(vehicle.total_expenses) }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.salePrice') }}</span>
                <span class="font-mono font-semibold">{{ vehicle.sale_price ? money(vehicle.sale_price, vehicle.sale_currency) : '—' }}</span></div>
              <div class="flex justify-between text-sm pt-2 border-t border-slate-100"><span class="font-semibold">{{ $t('x.profit') }}</span>
                <span class="font-mono font-bold" :class="Number(vehicle.profit_usd) < 0 ? 'text-red-600' : 'text-emerald-700'">
                  {{ vehicle.profit_usd !== null && vehicle.profit_usd !== undefined ? money(vehicle.profit_usd) : '—' }}
                </span></div>
              <div v-if="vehicle.sold_at" class="flex justify-between text-xs text-slate-500"><span>{{ $t('x.soldAt') }}</span><span>{{ dateOnly(vehicle.sold_at, locale) }}</span></div>
            </div>

            <!-- Logistics -->
            <div class="border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 class="text-sm font-bold text-slate-800">{{ $t('x.logistics') }}</h4>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.lotNumber') }}</span><span class="font-mono">{{ vehicle.lot_number || '—' }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.auctionDate') }}</span><span>{{ dateOnly(vehicle.auction_date, locale) }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.containerNumber') }}</span><span class="font-mono">{{ vehicle.container_number || '—' }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-slate-500">{{ $t('x.eta') }}</span>
                <span :class="etaOverdue ? 'text-red-600 font-semibold' : ''">{{ dateOnly(vehicle.eta, locale) }}</span></div>
              <template v-if="vehicle.buyer_name || vehicle.buyer_phone">
                <h4 class="text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">{{ $t('x.buyer') }}</h4>
                <div class="text-sm">{{ vehicle.buyer_name }} <span class="font-mono text-slate-500">{{ vehicle.buyer_phone }}</span></div>
                <div v-if="vehicle.buyer_note" class="text-xs text-slate-500">{{ vehicle.buyer_note }}</div>
              </template>
            </div>

            <!-- Stage durations -->
            <div class="border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 class="text-sm font-bold text-slate-800">{{ $t('x.stageDurations') }}</h4>
              <div v-for="(st, i) in stages" :key="i" class="flex justify-between text-sm">
                <span class="text-slate-600">{{ getStatusLabel(st.status) }}</span>
                <span class="font-mono">{{ st.days }} {{ $t('x.days') }}</span>
              </div>
              <div class="flex justify-between text-sm pt-2 border-t border-slate-100 font-semibold">
                <span>{{ $t('x.totalDays') }}</span><span class="font-mono">{{ totalDays }} {{ $t('x.days') }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- TAB 2: Expenses -->
        <el-tab-pane :label="$t('vehicles.tabExpenses')" name="expenses">
          <div class="space-y-4 py-2">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ $t('vehicles.tabExpenses') }}</h3>
                <p class="text-xs text-slate-500">Copart, Transit, Service</p>
              </div>

              <el-button
                v-if="canEditVehicle"
                type="primary"
                class="!rounded-xl"
                @click="openAddExpense"
              >
                <el-icon class="mr-1"><Plus /></el-icon> {{ $t('vehicles.addExpenseBtn') }}
              </el-button>
            </div>

            <el-table :data="expenses" stripe style="width: 100%" :empty-text="$t('vehicles.emptyList')">
              <el-table-column prop="title" :label="$t('vehicles.expenseTitle')" min-width="200" />
              <el-table-column prop="stage" :label="$t('vehicles.expenseStage')" min-width="140">
                <template #default="{ row }">
                  <el-tag v-if="row.stage" size="small" type="info">{{ row.stage }}</el-tag>
                  <span v-else class="text-slate-400 text-xs">-</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.amount')" min-width="140" align="right">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-slate-900">{{ money(row.amount, row.currency) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('x.amountUsd')" min-width="110" align="right">
                <template #default="{ row }">
                  <span class="font-mono text-slate-600">{{ money(row.amount_usd) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('x.receipt')" min-width="80" align="center">
                <template #default="{ row }">
                  <a v-if="row.receipt" :href="row.receipt" target="_blank" class="text-blue-700"><el-icon><View /></el-icon></a>
                  <span v-else class="text-slate-300">—</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('vehicles.expenseCreatedBy')" min-width="150">
                <template #default="{ row }">
                  <span class="text-xs text-slate-600">
                    {{ row.created_by_detail ? row.created_by_detail.username : '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.date')" min-width="150">
                <template #default="{ row }">
                  <span class="text-xs text-slate-500">{{ formatDate(row.created_at) }}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="canEditVehicle" :label="$t('common.actions')" width="110" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openEditExpense(row)"><el-icon><Edit /></el-icon></el-button>
                  <el-button link type="danger" @click="deleteExpense(row)"><el-icon><Delete /></el-icon></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- TAB 3: Documents & Photos -->
        <el-tab-pane :label="$t('vehicles.tabDocuments')" name="documents">
          <div class="space-y-6 py-2">
            
            <!-- Upload Box -->
            <div v-if="canEditVehicle" class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 class="text-sm font-bold text-slate-800">{{ $t('common.upload') }}</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">{{ $t('common.note') }}</label>
                  <el-input v-model="uploadTitle" placeholder="Document title" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">{{ $t('common.type') }}</label>
                  <el-select v-model="uploadType" class="!w-full">
                    <el-option label="PHOTO" value="PHOTO" />
                    <el-option label="AUCTION_DOC" value="AUCTION_DOC" />
                    <el-option label="SHIPPING_DOC" value="SHIPPING_DOC" />
                    <el-option label="REPAIR_BILL" value="REPAIR_BILL" />
                    <el-option label="OTHER" value="OTHER" />
                  </el-select>
                </div>

                <div>
                  <input type="file" ref="fileInput" class="hidden" @change="onFileSelected" />
                  <div class="flex gap-2">
                    <el-button @click="triggerFileSelect" class="flex-1">
                      <el-icon class="mr-1"><FolderOpened /></el-icon>
                      {{ selectedFile ? selectedFile.name : $t('common.selectFile') }}
                    </el-button>
                    <el-button type="primary" :disabled="!selectedFile || !uploadTitle" :loading="uploading" @click="uploadDocument">
                      {{ $t('common.upload') }}
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
                  <span class="text-xs text-slate-500">{{ $t('vehicles.docUploadedBy') }}: {{ doc.uploaded_by_detail?.username || '-' }}</span>
                  <div class="flex items-center gap-3">
                    <a :href="doc.file" target="_blank" class="text-blue-700 hover:text-blue-900 text-xs font-bold no-underline flex items-center gap-1">
                      <el-icon><View /></el-icon> {{ $t('vehicles.viewDoc') }}
                    </a>
                    <el-button v-if="canEditVehicle" link type="danger" size="small" @click="deleteDocument(doc)"><el-icon><Delete /></el-icon></el-button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </el-tab-pane>

        <!-- TAB 4: Timeline / History -->
        <el-tab-pane :label="$t('vehicles.tabHistory')" name="history">
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
                    <div class="flex items-center gap-2 flex-wrap">
                      <el-tag v-if="log.event" size="small" effect="dark" :type="eventTagType(log.event)">{{ $t('x.ev_' + log.event) }}</el-tag>
                      <el-tag size="small" type="info">{{ getStatusLabel(log.status as any) }}</el-tag>
                      <span class="text-xs font-semibold text-slate-600">&bull; {{ getLocationLabel(log.location as any) }}</span>
                    </div>
                    <p v-if="log.note" class="text-sm text-slate-700 mt-2">{{ log.note }}</p>
                    <div class="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100 flex justify-between">
                      <span>{{ $t('vehicles.historyChangedBy') }}: <strong>{{ log.changed_by_detail?.username || '-' }}</strong></span>
                      <span>{{ $t('vehicles.historyOwner') }}: <strong>{{ log.owner_detail?.username || '-' }}</strong></span>
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
    <ExpenseModal v-model="showExpenseModal" :vin="vin" :expense="editingExpense" @created="refreshData" />
    <ForceReassignModal v-model="showForceModal" :vehicle="vehicle" @updated="refreshData" />
    <VehicleEditModal v-model="showEditModal" :vehicle="vehicle" @updated="refreshData" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { Vehicle, VehicleHistoryLog, VehicleExpense, VehicleDocument, VehicleStatus, VehicleLocation } from '@/types'
import {
  Back,
  Share,
  Check,
  Picture,
  Loading,
  Lock,
  Edit,
  User,
  EditPen,
  Delete,
  Location,
  Plus,
  FolderOpened,
  View,
  Printer
} from '@element-plus/icons-vue'
import ForceReassignModal from '@/components/modals/ForceReassignModal.vue'
import { money, dateOnly, apiError } from '@/utils/format'

import AssignModal from '@/components/modals/AssignModal.vue'
import StatusLocationModal from '@/components/modals/StatusLocationModal.vue'
import HandoverModal from '@/components/modals/HandoverModal.vue'
import ExpenseModal from '@/components/modals/ExpenseModal.vue'
import VehicleEditModal from '@/components/modals/VehicleEditModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()
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
const showForceModal = ref(false)
const editingExpense = ref<VehicleExpense | null>(null)
const stages = ref<{ status: string; days: number }[]>([])
const totalDays = ref(0)
const statusNames = ref<Record<string, string>>({})
const locationNames = ref<Record<string, string>>({})

const currencyBreakdown = computed(() => {
  const by = vehicle.value?.expenses_by_currency || {}
  const keys = Object.keys(by)
  if (keys.length === 0 || (keys.length === 1 && keys[0] === 'USD')) return ''
  return keys.map((k) => money(by[k], k)).join(' + ')
})

const etaOverdue = computed(() => {
  const v = vehicle.value
  if (!v?.eta || v.status === 'ARRIVED_TKM' || v.status === 'SOLD') return false
  return new Date(v.eta) < new Date(new Date().toDateString())
})

const eventTagType = (ev: string) => {
  if (ev.startsWith('EXPENSE') || ev.startsWith('DOCUMENT')) return 'info'
  if (ev === 'HANDOVER_CONFIRMED' || ev === 'CREATED') return 'success'
  if (ev === 'HANDOVER_REJECTED' || ev === 'HANDOVER_CANCELLED' || ev === 'REASSIGNED' || ev === 'HANDOVER_REVOKED') return 'danger'
  if (ev === 'HANDOVER_REQUESTED') return 'warning'
  return 'primary'
}

const askReason = async (title: string, required: boolean): Promise<string | null> => {
  try {
    const { value } = await ElMessageBox.prompt(required ? t('x.reasonPrompt') : t('x.reasonOptional'), title, {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      inputType: 'textarea',
      inputValidator: (v: string) => (!required || (v && v.trim().length > 0)) || t('x.reasonRequired'),
    })
    return value || ''
  } catch {
    return null
  }
}

const postAction = async (path: string, body: Record<string, unknown> = {}) => {
  try {
    await api.post(`/vehicles/${vin}/${path}/`, body)
    ElMessage.success(t('common.success'))
    refreshData()
  } catch (err: any) {
    ElMessage.error(apiError(err, t('common.error')))
  }
}

const handleRejectHandover = async () => {
  const note = await askReason(t('x.rejectHandoverBtn'), false)
  if (note !== null) {
    await postAction('reject-handover', { note })
    router.push('/vehicles')
  }
}

const handleCancelHandover = async () => {
  const note = await askReason(t('x.cancelHandoverBtn'), false)
  if (note !== null) postAction('cancel-handover', { note })
}

const handleRevokeHandover = async () => {
  const note = await askReason(t('x.revokeHandoverBtn'), true)
  if (note !== null) postAction('revoke-handover', { note })
}

const openAddExpense = () => {
  editingExpense.value = null
  showExpenseModal.value = true
}

const openEditExpense = (row: VehicleExpense) => {
  editingExpense.value = row
  showExpenseModal.value = true
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(t('x.deleteConfirm'), t('common.delete'), {
      confirmButtonText: t('common.yes'), cancelButtonText: t('common.cancel'), type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

const deleteExpense = async (row: VehicleExpense) => {
  if (!(await confirmDelete())) return
  try {
    await api.delete(`/vehicles/${vin}/expenses/${row.id}/`)
    ElMessage.success(t('common.success'))
    refreshData()
  } catch (err: any) {
    ElMessage.error(apiError(err, t('common.error')))
  }
}

const deleteDocument = async (doc: VehicleDocument) => {
  if (!(await confirmDelete())) return
  try {
    await api.delete(`/vehicles/${vin}/documents/${doc.id}/`)
    ElMessage.success(t('common.success'))
    refreshData()
  } catch (err: any) {
    ElMessage.error(apiError(err, t('common.error')))
  }
}

const printCard = () => window.print()

const fetchStages = async () => {
  try {
    const res = await api.get(`/vehicles/${vin}/stage-durations/`)
    stages.value = res.data.stages
    totalDays.value = res.data.total_days
  } catch (err) {}
}

const fetchDictNames = async () => {
  try {
    const [st, loc] = await Promise.all([
      api.get('/vehicles/dictionaries/statuses/'),
      api.get('/vehicles/dictionaries/locations/'),
    ])
    const list = (d: any) => (Array.isArray(d) ? d : d.results || []) as { code: string; name: string }[]
    statusNames.value = Object.fromEntries(list(st.data).map((x) => [x.code, x.name]))
    locationNames.value = Object.fromEntries(list(loc.data).map((x) => [x.code, x.name]))
  } catch (err) {}
}

// File Upload state
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadTitle = ref('')
const uploadType = ref('PHOTO')
const uploading = ref(false)

const canEditVehicle = computed(() => {
  if (!vehicle.value) return false
  if (vehicle.value.is_handed_over) {
    return authStore.user?.id === vehicle.value.current_owner
  } else {
    return authStore.isAdmin
  }
})

const canHandover = computed(() => {
  if (!vehicle.value) return false
  if (authStore.isAdmin) return false
  return !vehicle.value.is_handed_over && vehicle.value.current_owner === authStore.user?.id
})

const canAssign = computed(() => {
  if (!vehicle.value) return false
  return authStore.isAdmin && !vehicle.value.is_handed_over
})

const fetchVehicleDetail = async () => {
  try {
    const res = await api.get<Vehicle>(`/vehicles/${vin}/`)
    vehicle.value = res.data
  } catch (err) {
    ElMessage.error(t('common.error'))
  }
}

const handleConfirmHandover = async () => {
  if (!vehicle.value) return
  confirmingHandover.value = true
  try {
    await api.post(`/vehicles/${vin}/confirm-handover/`)
    ElMessage.success(t('common.success'))
    refreshData()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || t('common.error'))
  } finally {
    confirmingHandover.value = false
  }
}

const fetchExpenses = async () => {
  try {
    const res = await api.get<VehicleExpense[]>(`/vehicles/${vin}/expenses/`)
    expenses.value = Array.isArray(res.data) ? res.data : (res.data as any).results || []
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
    fetchHistoryLogs(),
    fetchStages()
  ])
  loading.value = false
}

onMounted(() => {
  fetchDictNames()
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
    ElMessage.success(t('common.success'))
    selectedFile.value = null
    uploadTitle.value = ''
    fetchDocuments()
  } catch (err: any) {
    const msg = err.response?.data?.detail || t('common.error')
    ElMessage.error(msg)
  } finally {
    uploading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const loc = locale.value === 'ru' ? 'ru-RU' : locale.value === 'en' ? 'en-US' : 'tk-TM'
  return d.toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' })
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
    case 'PURCHASED': return t('vehicles.statusPurchased')
    case 'IN_TRANSIT': return t('vehicles.statusInTransit')
    case 'ARRIVED_TKM': return t('vehicles.statusArrivedTkm')
    case 'SOLD': return t('vehicles.statusSold')
    default: return statusNames.value[status] || status
  }
}

const getLocationLabel = (loc: VehicleLocation) => {
  switch (loc) {
    case 'USA_COPART': return t('vehicles.locUsaCopart')
    case 'SHIPPING_TRANSIT': return t('vehicles.locShippingTransit')
    case 'GEORGIA': return t('vehicles.locGeorgia')
    case 'TURKMENISTAN_INTERNAL': return t('vehicles.locTurkmenistanInternal')
    default: return locationNames.value[loc] || loc
  }
}

const handleDeleteCurrentVehicle = async () => {
  if (!vehicle.value) return
  try {
    await ElMessageBox.confirm(
      t('vehicles.deleteConfirmText', { title: vehicle.value.title, vin: vehicle.value.vin }),
      t('vehicles.deleteConfirmTitle'),
      {
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )

    await api.delete(`/vehicles/${vehicle.value.vin}/`)
    ElMessage.success(t('vehicles.deleteSuccess'))
    router.push('/vehicles')
  } catch (err: any) {
    if (err !== 'cancel') {
      const msg = err.response?.data?.detail || t('common.error')
      ElMessage.error(msg)
    }
  }
}
</script>
