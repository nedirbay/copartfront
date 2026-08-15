<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <Navbar />
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      &copy; 2026 Copart Auto Tracking System. Ähli hukuklar goralan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>
