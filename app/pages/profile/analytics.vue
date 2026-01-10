<template>
  <UCard class="rounded-[32px] border border-sky-200 bg-white/90">
    <template #header>
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
          Аналитика
        </p>
        <h2 class="text-2xl font-semibold text-slate-900">
          Раздел в разработке
        </h2>
      </div>
    </template>

    <div
      class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-6 text-sm text-slate-600"
    >
      Здесь будут метрики по задачам и просроченным проектам.
    </div>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });
</script>
