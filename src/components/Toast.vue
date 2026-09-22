<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all"
        :class="[
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : toast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200',
        ]"
      >
        <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4 text-emerald-500 shrink-0" />
        <AlertCircle v-else-if="toast.type === 'error'" class="w-4 h-4 text-rose-500 shrink-0" />
        <Info v-else class="w-4 h-4 text-slate-500 shrink-0" />
        <span class="leading-tight">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, Info } from '@lucide/vue'
import { toasts } from '@/utils/toast'
</script>
