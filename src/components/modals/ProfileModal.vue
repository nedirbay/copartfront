<template>
  <el-dialog v-model="visible" :title="$t('x.profile')" width="480px" destroy-on-close @open="onOpen">
    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('x.profile')" name="profile">
        <el-form label-position="top">
          <div class="grid grid-cols-2 gap-4">
            <el-form-item :label="$t('x.firstName')"><el-input v-model="profile.first_name" /></el-form-item>
            <el-form-item :label="$t('x.lastName')"><el-input v-model="profile.last_name" /></el-form-item>
          </div>
          <el-form-item :label="$t('employees.phone')"><el-input v-model="profile.phone_number" /></el-form-item>
          <el-form-item :label="$t('x.telegramChatId')">
            <el-input v-model="profile.telegram_chat_id" />
            <div class="text-[11px] text-slate-400 mt-1">{{ $t('x.telegramHint') }}</div>
          </el-form-item>
          <el-button type="primary" :loading="saving" @click="saveProfile">{{ $t('common.save') }}</el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="$t('x.changePassword')" name="password">
        <el-form label-position="top">
          <el-form-item :label="$t('x.oldPassword')"><el-input v-model="pwd.old_password" type="password" show-password /></el-form-item>
          <el-form-item :label="$t('x.newPassword')"><el-input v-model="pwd.new_password" type="password" show-password :placeholder="$t('x.passwordMin')" /></el-form-item>
          <el-form-item :label="$t('x.confirmPassword')"><el-input v-model="pwd.confirm" type="password" show-password /></el-form-item>
          <el-button type="primary" :loading="saving" :disabled="!pwd.old_password || pwd.new_password.length < 8" @click="changePassword">
            {{ $t('x.changePassword') }}
          </el-button>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { apiError } from '@/utils/format'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
const { t } = useI18n()
const authStore = useAuthStore()

const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const tab = ref('profile')
const saving = ref(false)
const profile = reactive({ first_name: '', last_name: '', phone_number: '', telegram_chat_id: '' })
const pwd = reactive({ old_password: '', new_password: '', confirm: '' })

const onOpen = () => {
  const u = authStore.user
  profile.first_name = u?.first_name || ''
  profile.last_name = u?.last_name || ''
  profile.phone_number = u?.phone_number || ''
  profile.telegram_chat_id = u?.telegram_chat_id || ''
  pwd.old_password = pwd.new_password = pwd.confirm = ''
}

const saveProfile = async () => {
  saving.value = true
  try {
    await api.patch('/auth/me/', profile)
    await authStore.fetchUserProfile()
    ElMessage.success(t('common.success'))
  } catch (err: any) {
    ElMessage.error(apiError(err, t('common.error')))
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (pwd.new_password !== pwd.confirm) {
    ElMessage.error(t('x.passwordMismatch'))
    return
  }
  saving.value = true
  try {
    await api.post('/auth/me/change-password/', { old_password: pwd.old_password, new_password: pwd.new_password })
    ElMessage.success(t('common.success'))
    visible.value = false
  } catch (err: any) {
    ElMessage.error(apiError(err, t('common.error')))
  } finally {
    saving.value = false
  }
}
</script>
