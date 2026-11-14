<template>
  <div class="col-span-2 space-y-2">
    <el-divider content-position="left">{{ $t('x.logistics') }}</el-divider>
    <div class="grid grid-cols-2 gap-4">
      <el-form-item :label="$t('x.lotNumber')">
        <el-input v-model="form.lot_number" maxlength="30" />
      </el-form-item>
      <el-form-item :label="$t('x.auctionDate')">
        <el-date-picker v-model="form.auction_date" type="date" value-format="YYYY-MM-DD" format="DD.MM.YYYY" class="!w-full" />
      </el-form-item>
      <el-form-item :label="$t('x.containerNumber')">
        <el-input v-model="form.container_number" maxlength="30" />
      </el-form-item>
      <el-form-item :label="$t('x.eta')">
        <el-date-picker v-model="form.eta" type="date" value-format="YYYY-MM-DD" format="DD.MM.YYYY" class="!w-full" />
      </el-form-item>
    </div>

    <el-divider content-position="left">{{ $t('x.finance') }}</el-divider>
    <div class="grid grid-cols-3 gap-4">
      <el-form-item :label="$t('x.purchasePrice')" class="col-span-2">
        <el-input-number v-model="form.purchase_price" :min="0" :precision="2" :step="100" :controls="false" class="!w-full" />
      </el-form-item>
      <el-form-item :label="$t('common.currency')">
        <el-select v-model="form.purchase_currency" class="!w-full">
          <el-option v-for="c in currencies" :key="c.code" :label="c.code" :value="c.code" />
        </el-select>
      </el-form-item>
      <template v-if="showSale">
        <el-form-item :label="$t('x.salePrice')" class="col-span-2">
          <el-input-number v-model="form.sale_price" :min="0" :precision="2" :step="100" :controls="false" class="!w-full" />
        </el-form-item>
        <el-form-item :label="$t('common.currency')">
          <el-select v-model="form.sale_currency" class="!w-full">
            <el-option v-for="c in currencies" :key="c.code" :label="c.code" :value="c.code" />
          </el-select>
        </el-form-item>
      </template>
    </div>

    <template v-if="showSale">
      <el-divider content-position="left">{{ $t('x.buyer') }}</el-divider>
      <div class="grid grid-cols-2 gap-4">
        <el-form-item :label="$t('x.buyerName')">
          <el-input v-model="form.buyer_name" maxlength="150" />
        </el-form-item>
        <el-form-item :label="$t('x.buyerPhone')">
          <el-input v-model="form.buyer_phone" maxlength="30" />
        </el-form-item>
        <el-form-item :label="$t('x.buyerNote')" class="col-span-2">
          <el-input v-model="form.buyer_note" type="textarea" :rows="2" />
        </el-form-item>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import type { Currency } from '@/types'

defineProps<{ form: ExtraForm; showSale?: boolean }>()

const currencies = ref<Currency[]>([])
onMounted(async () => {
  try {
    const res = await api.get('/vehicles/dictionaries/currencies/')
    currencies.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (err) {}
})
</script>

<script lang="ts">
import type { Vehicle } from '@/types'

export interface ExtraForm {
  lot_number: string
  auction_date: string | null
  container_number: string
  eta: string | null
  purchase_price: number | null
  purchase_currency: string
  sale_price: number | null
  sale_currency: string
  buyer_name: string
  buyer_phone: string
  buyer_note: string
}

export function emptyExtra(): ExtraForm {
  return {
    lot_number: '', auction_date: null, container_number: '', eta: null,
    purchase_price: null, purchase_currency: 'USD', sale_price: null, sale_currency: 'USD',
    buyer_name: '', buyer_phone: '', buyer_note: '',
  }
}

export function extraFromVehicle(v: Vehicle): ExtraForm {
  const num = (x?: string | null) => (x === null || x === undefined || x === '' ? null : Number(x))
  return {
    lot_number: v.lot_number || '', auction_date: v.auction_date || null,
    container_number: v.container_number || '', eta: v.eta || null,
    purchase_price: num(v.purchase_price), purchase_currency: v.purchase_currency || 'USD',
    sale_price: num(v.sale_price), sale_currency: v.sale_currency || 'USD',
    buyer_name: v.buyer_name || '', buyer_phone: v.buyer_phone || '', buyer_note: v.buyer_note || '',
  }
}

/** FormData-a goşmak: boş bahalar '' bolup gidýär (serwer olary null hasaplaýar). */
export function appendExtra(fd: FormData, f: Record<string, unknown>, includeSale: boolean) {
  const saleKeys = ['sale_price', 'sale_currency', 'buyer_name', 'buyer_phone', 'buyer_note']
  Object.entries(f).forEach(([k, v]) => {
    if (!includeSale && saleKeys.includes(k)) return
    fd.append(k, v === null || v === undefined ? '' : String(v))
  })
}
</script>
