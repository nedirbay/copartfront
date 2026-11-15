<template>
  <div v-loading="loading" class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ $t('x.dashTitle') }}</h1>
      <p class="text-sm text-slate-500 mt-1">{{ $t('x.dashSubtitle') }}</p>
    </div>

    <div v-if="data" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in cards" :key="card.key" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ card.label }}</div>
        <div class="text-3xl font-bold mt-1" :class="card.count > 0 ? card.color : 'text-slate-300'">{{ card.count }}</div>
      </div>
    </div>

    <div v-if="data" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <h3 class="font-bold text-slate-900 mb-3">{{ $t('x.workload') }}</h3>
      <el-table :data="data.employees" stripe>
        <el-table-column :label="$t('employees.fullName')" min-width="180">
          <template #default="{ row }">
            <span class="font-semibold">{{ row.first_name }} {{ row.last_name }}</span>
            <span class="text-xs text-slate-400 ml-1">@{{ row.username }}</span>
            <el-tag v-if="!row.is_active" size="small" type="danger" class="ml-2">{{ $t('x.inactive') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="active" :label="$t('x.activeVehicles')" align="center" />
        <el-table-column prop="handed_over" :label="$t('x.handedOverCount')" align="center" />
        <el-table-column prop="pending_incoming" :label="$t('x.incoming')" align="center" />
        <el-table-column prop="total" :label="$t('common.total')" align="center" />
      </el-table>
    </div>

    <div v-if="data" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="sec in sections" :key="sec.key" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 class="font-bold text-slate-900 mb-3">{{ sec.label }}</h3>
        <div v-if="sec.rows.length === 0" class="text-sm text-slate-400">{{ $t('x.nothing') }}</div>
        <div
          v-for="v in sec.rows"
          :key="v.vin"
          class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 px-1 rounded"
          @click="$router.push(`/vehicles/${v.vin}`)"
        >
          <div>
            <div class="font-mono text-xs text-blue-800 font-bold">{{ v.vin }}</div>
            <div class="text-sm text-slate-800">{{ v.title }}</div>
          </div>
          <div class="text-right text-xs text-slate-500">
            <div>{{ v.owner }}<span v-if="v.pending_owner"> → {{ v.pending_owner }}</span></div>
            <div v-if="sec.key === 'overdue'">ETA: {{ dateOnly(v.eta, locale) }}</div>
            <div v-else-if="sec.key === 'stale'">{{ dateOnly(v.status_changed_at, locale) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import { useRealtime } from '@/realtime'
import { dateOnly } from '@/utils/format'

interface BriefVehicle {
  vin: string; title: string; status: string; location: string
  owner: string; pending_owner: string | null; status_changed_at: string | null; eta: string | null
}
interface Dashboard {
  stale_days: number
  employees: { id: number; username: string; first_name: string; last_name: string; is_active: boolean; total: number; active: number; handed_over: number; pending_incoming: number }[]
  pending_handovers: BriefVehicle[]
  stale_vehicles: BriefVehicle[]
  overdue_eta: BriefVehicle[]
  orphaned_vehicles: BriefVehicle[]
  counts: Record<'pending_handovers' | 'stale_vehicles' | 'overdue_eta' | 'orphaned_vehicles', number>
}

const { t, locale } = useI18n()
const loading = ref(false)
const data = ref<Dashboard | null>(null)

const cards = computed(() => {
  const c = data.value!.counts
  return [
    { key: 'p', label: t('x.pendingHandovers'), count: c.pending_handovers, color: 'text-amber-600' },
    { key: 's', label: t('x.staleVehicles', { days: data.value!.stale_days }), count: c.stale_vehicles, color: 'text-orange-600' },
    { key: 'o', label: t('x.overdueEta'), count: c.overdue_eta, color: 'text-red-600' },
    { key: 'r', label: t('x.orphaned'), count: c.orphaned_vehicles, color: 'text-red-700' },
  ]
})

const sections = computed(() => [
  { key: 'pending', label: t('x.pendingHandovers'), rows: data.value!.pending_handovers },
  { key: 'stale', label: t('x.staleVehicles', { days: data.value!.stale_days }), rows: data.value!.stale_vehicles },
  { key: 'overdue', label: t('x.overdueEta'), rows: data.value!.overdue_eta },
  { key: 'orphaned', label: t('x.orphaned'), rows: data.value!.orphaned_vehicles },
])

const load = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    data.value = (await api.get<Dashboard>('/vehicles/reports/dashboard/')).data
  } catch (err) {
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

useRealtime(['vehicle.changed', 'vehicle.deleted', 'employees.changed'], () => load(true), { debounce: 800 })
</script>
