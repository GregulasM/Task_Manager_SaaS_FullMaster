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
                {{ loading ? "Загрузка" : "API" }}
              </UBadge>
            </div>
          </template>

          <UAccordion
            :items="accordionItems"
            type="multiple"
            :default-value="['my', 'other']"
            class="space-y-4"
          >
            <template #leading="{ item }">
              <UIcon :name="item.icon" class="h-4 w-4 text-sky-600" />
            </template>

            <template #my>
              <div
                v-if="loading"
                class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-6 text-xs text-slate-600"
              >
                Загрузка проектов...
              </div>
              <div
                v-else-if="!myProjects.length"
                class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-3 text-xs text-slate-600"
              >
                Пока нет ваших проектов.
              </div>
              <div v-else class="space-y-2 pb-4">
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
              <div
                v-if="loading"
                class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-3 text-xs text-slate-600"
              >
                Загрузка проектов...
              </div>
              <div
                v-else-if="!otherProjects.length"
                class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-3 text-xs text-slate-600"
              >
                Пока нет других проектов.
              </div>
              <div v-else class="space-y-2">
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
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-exclamation-circle"
          title="Ошибка"
          :description="errorMessage"
          class="border border-rose-200 bg-rose-50 text-slate-900"
        />
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

            <UCollapsible
              v-if="openMembersId === selectedProject.id"
              :open="openMembersId === selectedProject.id"
            >
              <div
                class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-3"
              >
                <p class="text-sm text-slate-700">Участники:</p>
                <div
                  v-if="membersLoadingId === selectedProject.id"
                  class="text-xs text-slate-600"
                >
                  Загрузка участников...
                </div>
                <div
                  v-else-if="membersError[selectedProject.id]"
                  class="text-xs text-rose-600"
                >
                  {{ membersError[selectedProject.id] }}
                </div>
                <div v-else class="h-12 space-y-1 overflow-y-auto pr-1">
                  <div
                    v-if="
                      hasMembersLoaded(selectedProject.id) &&
                      !membersForProject(selectedProject.id).length
                    "
                    class="text-xs text-slate-600"
                  >
                    Пока участников нет.
                  </div>
                  <div
                    v-for="member in membersForProject(selectedProject.id)"
                    :key="member.id"
                    class="flex items-center justify-between text-xs text-slate-700"
                  >
                    <div class="min-w-0">
                      <span class="truncate font-semibold text-slate-900">
                        {{ member.name }}
                      </span>
                      <span v-if="member.email" class="truncate text-slate-500">
                        · {{ member.email }}
                      </span>
                    </div>
                    <UBadge
                      v-if="member.role === 'OWNER'"
                      class="rounded-full border border-sky-200 bg-white text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700"
                    >
                      Owner
                    </UBadge>
                  </div>
                </div>
              </div>
            </UCollapsible>
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
                icon="i-heroicons-user-group"
                leading
                @click="toggleMembers(selectedProject.id)"
              >
                Список участников
              </UButton>
              <UButton
                v-if="selectedGroup === 'my'"
                variant="outline"
                class="rounded-full border-sky-200 text-slate-900"
                icon="i-heroicons-trash"
                leading
                :loading="isActionLoading('leave')"
                :disabled="loading || isActionLoading('request')"
                @click="handleMyAction"
              >
                Удалить из «Моих»
              </UButton>
              <UButton
                v-else
                variant="outline"
                class="rounded-full border-sky-200 text-slate-900"
                icon="i-heroicons-user-plus"
                leading
                :loading="isActionLoading('request')"
                :disabled="loading || isActionLoading('leave')"
                @click="requestAccess"
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
  role?: "OWNER" | "MEMBER" | null;
};

type ProjectGroup = "my" | "other";

type ProjectApi = {
  id: string;
  name: string;
  description?: string | null;
  tasksCount?: number;
  hotTasksCount?: number;
  role?: "OWNER" | "MEMBER" | null;
};

type MemberItem = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MEMBER";
};

type ProjectMembersResponse = {
  members: Array<{
    role: "OWNER" | "MEMBER";
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

const myProjects = ref<ProjectCard[]>([]);
const otherProjects = ref<ProjectCard[]>([]);
const loading = ref(false);
const errorMessage = ref("");

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

const selectedProject = ref<ProjectCard | null>(null);
const selectedGroup = ref<ProjectGroup>("my");
const isBoardOpen = ref(false);
const actionLoading = ref(false);
const actionType = ref<"request" | "leave" | null>(null);
const openMembersId = ref<string | null>(null);
const membersLoadingId = ref<string | null>(null);
const membersByProject = ref<Record<string, MemberItem[]>>({});
const membersError = ref<Record<string, string>>({});

const selectProject = (project: ProjectCard, group: ProjectGroup) => {
  selectedProject.value = project;
  selectedGroup.value = group;
  isBoardOpen.value = false;
  if (openMembersId.value && openMembersId.value !== project.id) {
    openMembersId.value = null;
  }
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

const mapProject = (project: ProjectApi): ProjectCard => ({
  id: project.id,
  name: project.name,
  description: project.description ?? "Без описания",
  tasksCount: project.tasksCount ?? 0,
  hotTasksCount: project.hotTasksCount ?? 0,
  role: project.role ?? null,
});

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "string") return err;
  const typed = err as { data?: { statusMessage?: string }; message?: string };
  return typed?.data?.statusMessage || typed?.message || fallback;
};

const isActionLoading = (type: "request" | "leave") =>
  actionLoading.value && actionType.value === type;

const membersForProject = (projectId: string) =>
  membersByProject.value[projectId] ?? [];
const hasMembersLoaded = (projectId: string) =>
  Object.prototype.hasOwnProperty.call(membersByProject.value, projectId);

const clearMembersState = (projectId: string) => {
  if (openMembersId.value === projectId) openMembersId.value = null;
  if (membersLoadingId.value === projectId) membersLoadingId.value = null;

  const { [projectId]: _removed, ...rest } = membersByProject.value;
  membersByProject.value = rest;

  const { [projectId]: _error, ...restErrors } = membersError.value;
  membersError.value = restErrors;
};

const syncSelection = () => {
  const currentId = selectedProject.value?.id;
  let nextProject: ProjectCard | null = null;
  let nextGroup: ProjectGroup = "my";

  if (currentId) {
    const fromMy = myProjects.value.find((project) => project.id === currentId);
    if (fromMy) {
      nextProject = fromMy;
      nextGroup = "my";
    } else {
      const fromOther = otherProjects.value.find(
        (project) => project.id === currentId,
      );
      if (fromOther) {
        nextProject = fromOther;
        nextGroup = "other";
      }
    }
  }

  if (!nextProject && myProjects.value.length) {
    nextProject = myProjects.value[0];
    nextGroup = "my";
  }

  if (!nextProject && otherProjects.value.length) {
    nextProject = otherProjects.value[0];
    nextGroup = "other";
  }

  selectedProject.value = nextProject;
  selectedGroup.value = nextGroup;
  if (!nextProject) isBoardOpen.value = false;
  if (!nextProject || openMembersId.value !== nextProject.id) {
    openMembersId.value = null;
  }
};

const loadProjects = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [my, other] = await Promise.all([
      $fetch<ProjectApi[]>("/api/project", { query: { scope: "my" } }),
      $fetch<ProjectApi[]>("/api/project", { query: { scope: "other" } }),
    ]);

    myProjects.value = my.map(mapProject);
    otherProjects.value = other.map(mapProject);
  } catch (err) {
    myProjects.value = [];
    otherProjects.value = [];
    errorMessage.value = getErrorMessage(err, "Не удалось загрузить проекты.");
  } finally {
    loading.value = false;
    syncSelection();
  }
};

const handleMyAction = async () => {
  const project = selectedProject.value;
  if (!project) return;

  if (project.role === "OWNER") {
    await navigateTo("/profile/my_projects");
    return;
  }

  await leaveProject(project.id);
};

const requestAccess = async () => {
  const project = selectedProject.value;
  if (!project) return;
  if (actionLoading.value) return;

  actionLoading.value = true;
  actionType.value = "request";
  errorMessage.value = "";

  try {
    await $fetch("/api/project", {
      method: "POST",
      body: { action: "request_access", projectId: project.id },
    });
    await loadProjects();
  } catch (err) {
    errorMessage.value = getErrorMessage(err, "Не удалось запросить доступ.");
  } finally {
    actionLoading.value = false;
    actionType.value = null;
  }
};

const leaveProject = async (projectId: string) => {
  if (actionLoading.value) return;

  actionLoading.value = true;
  actionType.value = "leave";
  errorMessage.value = "";

  try {
    await $fetch("/api/project", {
      method: "DELETE",
      query: { id: projectId, leave: "1" },
    });
    clearMembersState(projectId);
    await loadProjects();
  } catch (err) {
    errorMessage.value = getErrorMessage(
      err,
      "Не удалось удалить проект из моих.",
    );
  } finally {
    actionLoading.value = false;
    actionType.value = null;
  }
};

const loadMembers = async (projectId: string) => {
  if (membersByProject.value[projectId]) return;
  membersLoadingId.value = projectId;
  membersError.value = {
    ...membersError.value,
    [projectId]: "",
  };

  try {
    const result = await $fetch<ProjectMembersResponse>("/api/project", {
      query: { id: projectId },
    });

    membersByProject.value = {
      ...membersByProject.value,
      [projectId]: result.members.map((member) => ({
        id: member.user.id,
        name: member.user.name || member.user.email,
        email: member.user.email,
        role: member.role,
      })),
    };
  } catch (err) {
    membersByProject.value = {
      ...membersByProject.value,
      [projectId]: [],
    };
    membersError.value = {
      ...membersError.value,
      [projectId]: getErrorMessage(err, "Не удалось загрузить участников."),
    };
  } finally {
    membersLoadingId.value = null;
  }
};

const toggleMembers = async (projectId: string) => {
  if (openMembersId.value === projectId) {
    openMembersId.value = null;
    return;
  }

  openMembersId.value = projectId;
  await loadMembers(projectId);
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

onMounted(() => {
  loadProjects();
});
</script>
