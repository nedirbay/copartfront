<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
    <div class="max-w-2xl w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
      
      <div class="inline-flex items-center justify-center p-4 bg-amber-500/10 text-amber-400 rounded-2xl ring-1 ring-amber-500/30">
        <el-icon :size="40"><Van /></el-icon>
      </div>

      <h1 class="text-3xl font-bold tracking-tight text-white">
        Copart App - Vue 3 + TypeScript
      </h1>

      <p class="text-slate-400 text-base">
        Vue 3, TypeScript (TS), Vite, Element Plus, we Tailwind CSS üstünlikli sazlandy!
      </p>

      <div class="flex items-center justify-center gap-3 pt-2">
        <el-tag type="success" size="large" effect="dark" round>
          <el-icon class="mr-1"><Check /></el-icon> Vue 3 + TS
        </el-tag>
        <el-tag type="primary" size="large" effect="dark" round>
          <el-icon class="mr-1"><Star /></el-icon> Element Plus
        </el-tag>
        <el-tag type="warning" size="large" effect="dark" round>
          <el-icon class="mr-1"><Lightning /></el-icon> Tailwind CSS
        </el-tag>
      </div>

      <div class="pt-4 border-t border-slate-700/60 flex justify-center gap-4">
        <el-button type="primary" size="large" @click="handleTestClick">
          <el-icon class="mr-1"><Select /></el-icon> Element Plus Barlag
        </el-button>
        <el-button type="info" size="large" plain @click="showToast">
          <el-icon class="mr-1"><Bell /></el-icon> Habarlandyryş
        </el-button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElNotification } from 'element-plus'

const handleTestClick = (): void => {
  ElMessage.success({
    message: 'TypeScript, Element Plus we Tailwind CSS üstünlikli işleýär!',
    type: 'success',
  })
}

const showToast = (): void => {
  ElNotification({
    title: 'Copart App Frontend (TypeScript)',
    message: 'Vue 3 TS blank proýekti doly taýýar!',
    type: 'info',
  })
}
</script>
