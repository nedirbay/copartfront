<template>
  <div>
    <!-- Create Employee Form Dialog -->
    <el-dialog
      v-model="visible"
      :title="$t('employees.createTitle')"
      width="520px"
      destroy-on-close
    >
      <el-alert
        :title="$t('employees.createHint')"
        type="info"
        show-icon
        :closable="false"
        class="mb-4"
      />

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item :label="$t('employees.username')" prop="username">
          <el-input v-model="form.username" placeholder="isgar_merdan" />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item :label="$t('employees.fullName')" prop="first_name">
            <el-input v-model="form.first_name" placeholder="Merdan" />
          </el-form-item>

          <el-form-item :label="$t('employees.fullName')" prop="last_name">
            <el-input v-model="form.last_name" placeholder="Annamyradow" />
          </el-form-item>
        </div>

        <el-form-item :label="$t('employees.phone')">
          <el-input v-model="form.phone_number" placeholder="+99365123456" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="visible = false">{{ $t('common.close') }}</el-button>
          <el-button type="primary" :loading="loading" @click="submitEmployee">{{ $t('common.save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Success Dialog displaying Generated Password -->
    <el-dialog
      v-model="showPasswordResult"
      :title="$t('employees.createSuccess')"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="text-center space-y-4 py-2">
        <el-icon class="text-emerald-500 text-5xl"><CircleCheckFilled /></el-icon>
        <h3 class="text-lg font-bold text-slate-800">{{ $t('employees.createSuccess') }}</h3>
        <p class="text-sm text-slate-600">
          {{ $t('employees.createHint') }}
        </p>

        <div class="bg-slate-100 border border-slate-300 rounded-xl p-4 space-y-2 text-left">
          <div class="text-xs text-slate-500">{{ $t('employees.username') }}: <strong class="text-slate-800">{{ createdUser?.username }}</strong></div>
          <div class="text-xs text-slate-500">{{ $t('employees.password') }}:</div>
          <div class="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
            <code class="text-base font-mono font-bold text-blue-700 select-all">{{ generatedPassword }}</code>
            <el-button type="primary" link size="small" @click="copyPassword">
              <el-icon class="mr-1"><DocumentCopy /></el-icon> {{ $t('common.copy') }}
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <el-button type="primary" class="!px-8" @click="showPasswordResult = false">{{ $t('common.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import type { EmployeeCreated } from '@/types'
import { CircleCheckFilled, DocumentCopy } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'created'): void
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const showPasswordResult = ref(false)
const createdUser = ref<EmployeeCreated | null>(null)
const generatedPassword = ref('')

const form = reactive({
  username: '',
  first_name: '',
  last_name: '',
  phone_number: ''
})

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('employees.username'), trigger: 'blur' }],
  first_name: [{ required: true, message: t('employees.fullName'), trigger: 'blur' }],
  last_name: [{ required: true, message: t('employees.fullName'), trigger: 'blur' }],
}))

const submitEmployee = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await api.post<EmployeeCreated>('/auth/employees/', form)
        createdUser.value = res.data
        generatedPassword.value = res.data.generated_password || ''
        
        visible.value = false
        showPasswordResult.value = true
        
        form.username = ''
        form.first_name = ''
        form.last_name = ''
        form.phone_number = ''
        
        emit('created')
      } catch (err: any) {
        const msg = err.response?.data?.username?.[0] || t('common.error')
        ElMessage.error(msg)
      } finally {
        loading.value = false
      }
    }
  })
}

const copyPassword = () => {
  if (generatedPassword.value) {
    navigator.clipboard.writeText(generatedPassword.value)
    ElMessage.success(t('common.copied'))
  }
}
</script>
