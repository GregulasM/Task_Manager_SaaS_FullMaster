<template>
  <UContainer>
    <div class="flex flex-col gap-6 lg:flex-row lg:grid-cols-[320px,1fr]">
      <aside class="space-y-4 basis-2/8">
        <UCard class="rounded-[28px] border border-sky-200 bg-white/90">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
                  Навигация
                </p>
                <h2 class="text-lg font-semibold text-slate-900">Проекты</h2>
              </div>
              <UBadge
                class="rounded-full border border-sky-200 bg-sky-100 text-xs font-semibold text-slate-900"
              >
                Заглушка
              </UBadge>
            </div>
          </template>

          <UAccordion
            :items="accordionItems"
            type="multiple"
            :default-value="['my', 'other']"
            class="space-y-3"
          >
            <template #leading="{ item }">
              <UIcon :name="item.icon" class="h-4 w-4 text-sky-600" />
            </template>

            <template #my>
              <div class="space-y-2">
                <UButton
                  v-for="project in myProjects"
                  :key="project.id"
                  variant="ghost"
                  block
                  class="h-auto justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
                  :class="projectButtonClass(project.id)"
                  @click="selectProject(project, 'my')"
                >
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">
                      {{ project.name }}
                    </p>
                    <p class="text-xs text-slate-600">
                      {{ project.description }}
                    </p>
                  </div>
                  <div class="ml-3 flex items-center gap-2">
                    <UBadge
                      class="rounded-full border border-sky-200 bg-white text-xs font-semibold text-slate-700"
                    >
                      {{ project.tasksCount }}
                    </UBadge>
                  </div>
                </UButton>
              </div>
            </template>

            <template #other>
              <div class="space-y-2">
                <UButton
                  v-for="project in otherProjects"
                  :key="project.id"
                  variant="ghost"
                  block
                  class="h-auto justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
                  :class="projectButtonClass(project.id)"
                  @click="selectProject(project, 'other')"
                >
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">
                      {{ project.name }}
                    </p>
                    <p class="text-xs text-slate-600">
                      {{ project.description }}
                    </p>
                  </div>
                  <div class="ml-3 flex items-center gap-2">
                    <UBadge
                      class="rounded-full border border-sky-200 bg-white text-xs font-semibold text-slate-700"
                    >
                      {{ project.tasksCount }}
                    </UBadge>
                  </div>
                </UButton>
              </div>
            </template>
          </UAccordion>
        </UCard>
      </aside>

      <section class="basis-6/8 space-y-6 lg:flex-1 lg:min-w-0">
        <UCard
          v-if="selectedProject && !isBoardOpen"
          class="rounded-[32px] border border-sky-200 bg-white/90 lg:min-h-[560px] lg:flex lg:flex-col"
          :ui="{ body: 'flex flex-col lg:flex-1', footer: 'lg:mt-auto' }"
        >
          <template #header>
            <div
              class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
                  Детали проекта
                </p>
                <h2 class="text-2xl font-semibold text-slate-900">
                  {{ selectedProject.name }}
                </h2>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  class="rounded-full border border-sky-200 bg-white text-xs font-semibold text-slate-700"
                >
                  {{ selectedProject.tasksCount }} задач
                </UBadge>
                <UBadge
                  :class="hotBadgeClass(selectedProject.hotTasksCount)"
                  class="rounded-full border text-xs font-semibold"
                >
                  Горящие: {{ selectedProject.hotTasksCount }} шт.
                </UBadge>
                <UBadge
                  class="rounded-full border border-sky-200 bg-sky-100 text-xs font-semibold text-slate-900"
                >
                  Заглушка
                </UBadge>
              </div>
            </div>
          </template>

          <div class="flex flex-1 flex-col gap-4">
            <p class="text-sm text-slate-700">
              {{ selectedProject.description }}
            </p>
            <div
              class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-3 text-xs text-slate-600"
            >
              Здесь будет полноценная карточка проекта и статистика после
              подключения API.
            </div>
          </div>

          <template #footer>
            <div
              class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <UButton
                class="rounded-full bg-sky-200 text-slate-900"
                icon="i-heroicons-arrow-right-circle"
                leading
                @click="openBoard"
              >
                Открыть
              </UButton>
              <UButton
                v-if="selectedGroup === 'my'"
                variant="outline"
                class="rounded-full border-sky-200 text-slate-900"
                icon="i-heroicons-trash"
                leading
                disabled
              >
                Удалить из «Моих»
              </UButton>
              <UButton
                v-else
                variant="outline"
                class="rounded-full border-sky-200 text-slate-900"
                icon="i-heroicons-user-plus"
                leading
                disabled
              >
                Запросить доступ
              </UButton>
            </div>
          </template>
        </UCard>

        <UCard
          v-else-if="selectedProject && isBoardOpen"
          class="rounded-[32px] border border-sky-200 bg-white/90 lg:min-h-[560px] lg:flex lg:flex-col"
          :ui="{ body: 'flex flex-col lg:flex-1' }"
        >
          <template #header>
            <div
              class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
                  Kanban
                </p>
                <h2 class="text-2xl font-semibold text-slate-900">
                  {{ selectedProject.name }}
                </h2>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <UBadge
                  class="rounded-full border border-sky-200 bg-white text-xs font-semibold text-slate-700"
                >
                  Задач: {{ selectedProject.tasksCount }}
                </UBadge>
                <UBadge
                  :class="hotBadgeClass(selectedProject.hotTasksCount)"
                  class="rounded-full border text-xs font-semibold"
                >
                  Горящие: {{ selectedProject.hotTasksCount }}
                </UBadge>
                <UButton
                  variant="outline"
                  class="rounded-full border-sky-200 text-slate-900"
                  icon="i-heroicons-arrow-left"
                  leading
                  @click="closeBoard"
                >
                  Назад
                </UButton>
              </div>
            </div>
          </template>

          <div class="grid flex-1 gap-4 lg:grid-cols-4">
            <div
              v-for="column in boardColumns"
              :key="column.id"
              class="rounded-[28px] border border-sky-200 bg-white/80 p-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900">
                  {{ column.title }}
                </h3>
                <UBadge
                  class="rounded-full border border-sky-200 bg-sky-50 text-xs font-semibold text-slate-700"
                >
                  {{ column.items.length }}
                </UBadge>
              </div>
              <div class="mt-4 space-y-3">
                <div
                  v-for="task in column.items"
                  :key="task"
                  class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-3 py-3 text-xs text-slate-600"
                >
                  {{ task }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard
          v-else
          class="rounded-[32px] border border-dashed border-sky-200 bg-white/80"
        >
          <div class="flex flex-col items-center gap-3 py-16 text-center">
            <UIcon
              name="i-heroicons-rectangle-stack"
              class="h-10 w-10 text-sky-300"
            />
            <p class="text-lg font-semibold text-slate-900">
              Выберите проект слева
            </p>
            <p class="text-sm text-slate-600">
              Здесь появится доска и подробности проекта.
            </p>
          </div>
        </UCard>
      </section>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

type ProjectCard = {
  id: string;
  name: string;
  description: string;
  tasksCount: number;
  hotTasksCount: number;
};

type ProjectGroup = "my" | "other";

const myProjects: ProjectCard[] = [
  {
    id: "my-1",
    name: "FullMaster Core",
    description: "Основной продуктовый проект платформы.",
    tasksCount: 18,
    hotTasksCount: 1,
  },
  {
    id: "my-2",
    name: "Marketing Sprint",
    description: "Контент, лендинги и сбор лидов.",
    tasksCount: 9,
    hotTasksCount: 0,
  },
  {
    id: "my-3",
    name: "Mobile MVP",
    description: "Прототип мобильного приложения.",
    tasksCount: 14,
    hotTasksCount: 3,
  },
];

const otherProjects: ProjectCard[] = [
  {
    id: "other-1",
    name: "Community Hub",
    description: "Открытый проект для участников сообщества.",
    tasksCount: 6,
    hotTasksCount: 0,
  },
  {
    id: "other-2",
    name: "Design System",
    description: "UI-библиотека и гайд по стилю.",
    tasksCount: 11,
    hotTasksCount: 2,
  },
];

const accordionItems = [
  {
    label: "Мои проекты",
    value: "my",
    slot: "my",
    icon: "i-heroicons-folder",
  },
  {
    label: "Другие проекты",
    value: "other",
    slot: "other",
    icon: "i-heroicons-squares-plus",
  },
];

const selectedProject = ref<ProjectCard | null>(myProjects[0] ?? null);
const selectedGroup = ref<ProjectGroup>(myProjects.length ? "my" : "other");
const isBoardOpen = ref(false);

const selectProject = (project: ProjectCard, group: ProjectGroup) => {
  selectedProject.value = project;
  selectedGroup.value = group;
  isBoardOpen.value = false;
};

const projectButtonClass = (id: string) =>
  selectedProject.value?.id === id
    ? "border-sky-300 bg-sky-100"
    : "hover:bg-sky-50";

const openBoard = () => {
  isBoardOpen.value = true;
};

const closeBoard = () => {
  isBoardOpen.value = false;
};

const hotBadgeClass = (count: number) => {
  if (count <= 0) return "border-emerald-200 bg-emerald-100 text-emerald-800";
  if (count <= 2) return "border-amber-200 bg-amber-100 text-amber-800";
  return "border-rose-200 bg-rose-100 text-rose-800";
};

const boardColumns = [
  {
    id: "todo",
    title: "To Do",
    items: ["Заглушка задачи 1", "Заглушка задачи 2"],
  },
  {
    id: "in-progress",
    title: "In Progress",
    items: ["Заглушка задачи 3"],
  },
  {
    id: "review",
    title: "Review",
    items: ["Заглушка задачи 4", "Заглушка задачи 5"],
  },
  {
    id: "done",
    title: "Done",
    items: ["Заглушка задачи 6"],
  },
];
</script>
