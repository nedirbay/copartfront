<template>
  <el-config-provider :locale="elementPlusLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import tk from 'element-plus/dist/locale/tk.mjs'
import ru from 'element-plus/dist/locale/ru.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const { locale } = useI18n()

const elementPlusLocale = computed(() => {
  if (locale.value === 'ru') return ru
  if (locale.value === 'en') return en
  return tk
})
</script>
