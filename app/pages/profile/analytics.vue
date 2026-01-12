<template>
  <UCard
    class="rounded-[32px] border border-sky-200 bg-white/90"
    :ui="{
      root:
        'p-0 bg-transparent shadow-none ring-0 rounded-none ' +
        'data-[state=open]:animate-[scale-in_100ms_ease-out] ' +
        'data-[state=closed]:animate-[scale-out_100ms_ease-in] ' +
        'origin-(--reka-popover-content-transform-origin) ' +
        'focus:outline-none pointer-events-auto',
    }"
  >
    <template #header>
      <div
        class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
      >
        <div class="space-y-2">
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase tracking-[0.3em] text-slate-600"
          >
            Аналитика
          </p>
          <h2
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-semibold text-slate-900"
          >
            График задач по статусам
          </h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            class="rounded-full border border-sky-200 bg-white text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-700"
          >
            {{ totalTasks }} задач
          </UBadge>
          <UBadge
            class="rounded-full border border-sky-200 bg-sky-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-900"
          >
            {{ projectsCount }} проектов
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <UAlert
        v-if="errorMessage"
        icon="i-heroicons-exclamation-circle"
        title="Ошибка"
        :description="errorMessage"
        class="border border-rose-200 bg-rose-50 text-slate-900"
      />

      <div v-if="loading" class="space-y-4">
        <div
          v-for="item in 3"
          :key="item"
          class="rounded-[28px] border border-sky-200 bg-white/80 p-6"
        >
          <div class="space-y-3">
            <div class="h-4 w-48 rounded-full bg-sky-100"></div>
            <div class="h-3 w-64 rounded-full bg-sky-50"></div>
            <div
              class="h-16 w-full rounded-2xl border border-dashed border-sky-200 bg-sky-50/60"
            ></div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="rounded-[28px] border border-sky-200 bg-white/80 p-6">
          <div class="flex items-center justify-between">
            <p
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase tracking-[0.3em] text-slate-600"
            >
              График
            </p>
            <UBadge
              class="rounded-full border border-sky-200 bg-white text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-700"
            >
              Обновлено
            </UBadge>
          </div>

          <div
            v-if="!totalTasks"
            class="mt-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-6 text-center text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
          >
            Пока нет задач для аналитики.
          </div>

          <div v-else class="mt-6 space-y-4">
            <div v-for="item in chartItems" :key="item.id" class="space-y-2">
              <div
                class="flex items-center justify-between text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12"
              >
                <span class="text-slate-600">{{ item.label }}</span>
                <span class="font-semibold text-slate-900">
                  {{ item.count }}
                </span>
              </div>
              <div class="h-2 rounded-full bg-sky-100">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="item.barClass"
                  :style="{ width: barWidth(item.count) }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-sky-200 bg-white/80 px-4 py-4 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-700"
        >
          <span class="font-semibold text-slate-900">
            Количество просроченных задач:
          </span>
          {{ overdueTotal }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { humanizeError } from "~/utils/human-error";
definePageMeta({ layout: "default" });

type ProjectApi = {
  id: string;
  name: string;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

type TaskStatsResponse = {
  projectId: string;
  byStatus: Record<TaskStatus, number>;
  overdue?: number;
  hot?: number;
};

const headerRefreshToken = useState<number>("header-refresh-token", () => 0);

const statusTotals = ref<Record<TaskStatus, number>>({
  TODO: 0,
  IN_PROGRESS: 0,
  REVIEW: 0,
  DONE: 0,
});
const overdueTotal = ref(0);
const projectsCount = ref(0);
const loading = ref(false);
const errorMessage = ref("");

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

const chartItems = computed(() => [
  {
    id: "TODO" as const,
    label: statusLabels.TODO,
    count: statusTotals.value.TODO,
    barClass: "bg-slate-400",
  },
  {
    id: "IN_PROGRESS" as const,
    label: statusLabels.IN_PROGRESS,
    count: statusTotals.value.IN_PROGRESS,
    barClass: "bg-sky-400",
  },
  {
    id: "REVIEW" as const,
    label: statusLabels.REVIEW,
    count: statusTotals.value.REVIEW,
    barClass: "bg-amber-400",
  },
  {
    id: "DONE" as const,
    label: statusLabels.DONE,
    count: statusTotals.value.DONE,
    barClass: "bg-emerald-400",
  },
]);

const totalTasks = computed(() =>
  Object.values(statusTotals.value).reduce((sum, count) => sum + count, 0),
);

const maxCount = computed(() =>
  Math.max(1, ...Object.values(statusTotals.value)),
);

const barWidth = (count: number) =>
  `${Math.round((count / maxCount.value) * 100)}%`;

const getErrorMessage = (err: unknown, fallback: string) =>
  humanizeError(err, fallback);

const resetTotals = () => {
  statusTotals.value = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
  };
  overdueTotal.value = 0;
  projectsCount.value = 0;
};

const loadAnalytics = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const projects = await $fetch<ProjectApi[]>("/api/project", {
      query: { scope: "my" },
    });

    projectsCount.value = projects.length;

    if (!projects.length) {
      resetTotals();
      return;
    }

    const statsList = await Promise.all(
      projects.map((project) =>
        $fetch<TaskStatsResponse>("/api/task", {
          query: { action: "stats", projectId: project.id },
        }),
      ),
    );

    const totals: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    };
    let overdue = 0;

    for (const stats of statsList) {
      totals.TODO += stats.byStatus?.TODO ?? 0;
      totals.IN_PROGRESS += stats.byStatus?.IN_PROGRESS ?? 0;
      totals.REVIEW += stats.byStatus?.REVIEW ?? 0;
      totals.DONE += stats.byStatus?.DONE ?? 0;
      overdue += stats.overdue ?? 0;
    }

    statusTotals.value = totals;
    overdueTotal.value = overdue;
  } catch (err) {
    resetTotals();
    errorMessage.value = getErrorMessage(
      err,
      "Не удалось загрузить аналитику.",
    );
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAnalytics();
});

watch(
  () => headerRefreshToken.value,
  () => {
    loadAnalytics();
  },
);
</script>
