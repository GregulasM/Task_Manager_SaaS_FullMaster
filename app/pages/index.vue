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
                  Задач: {{ boardTasksTotal }}
                </UBadge>
                <UBadge
                  :class="hotBadgeClass(boardOverdueTotal)"
                  class="rounded-full border text-xs font-semibold"
                >
                  Горящие: {{ boardOverdueTotal }}
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

          <div class="flex flex-1 flex-col gap-4">
            <UAlert
              v-if="boardError"
              icon="i-heroicons-exclamation-circle"
              title="Ошибка"
              :description="boardError"
              class="border border-rose-200 bg-rose-50 text-slate-900"
            />

            <div class="rounded-[24px] border border-sky-200 bg-sky-50/70 p-4">
              <div
                class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
              >
                <div class="space-y-1">
                  <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
                    Новая задача
                  </p>
                  <h3 class="text-lg font-semibold text-slate-900">
                    Создание карточки
                  </h3>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge
                    class="rounded-full border border-sky-200 bg-white text-xs font-semibold text-slate-700"
                  >
                    {{ createLoading ? "Создаем" : "API" }}
                  </UBadge>
                  <UButton
                    class="rounded-full bg-sky-200 text-slate-900"
                    icon="i-heroicons-plus"
                    leading
                    :loading="createLoading"
                    :disabled="createLoading || !createForm.title.trim()"
                    @click="createTask"
                  >
                    Создать задачу
                  </UButton>
                </div>
              </div>

              <div class="mt-4 grid gap-4 xl:grid-cols-2">
                <UFormField label="Название" :ui="fieldUi" class="w-full">
                  <UInput
                    v-model.trim="createForm.title"
                    placeholder="Название задачи"
                    :ui="inputUi"
                  />
                </UFormField>
                <UFormField label="Описание" :ui="fieldUi" class="w-full">
                  <UTextarea
                    v-model.trim="createForm.description"
                    placeholder="Описание задачи"
                    :rows="3"
                    class="min-h-[96px]"
                    :ui="textareaUi"
                  />
                </UFormField>
              </div>

              <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <UFormField label="Исполнитель" :ui="fieldUi" class="w-full">
                  <USelectMenu
                    :items="assigneeOptions"
                    :model-value="createForm.assigneeId"
                    value-key="value"
                    label-key="label"
                    placeholder="Без исполнителя"
                    :ui="selectUi"
                    @update:model-value="setCreateAssignee"
                  />
                </UFormField>
                <UFormField label="Дедлайн" :ui="fieldUi" class="w-full">
                  <UInput
                    v-model="createForm.dueDate"
                    type="date"
                    :ui="inputUi"
                  />
                </UFormField>
                <UFormField label="Приоритет" :ui="fieldUi" class="w-full">
                  <USelectMenu
                    :items="priorityOptions"
                    :model-value="createForm.priority"
                    value-key="value"
                    label-key="label"
                    :ui="selectUi"
                    @update:model-value="setCreatePriority"
                  />
                </UFormField>
                <UFormField label="Статус" :ui="fieldUi" class="w-full">
                  <USelectMenu
                    :items="statusOptions"
                    :model-value="createForm.status"
                    value-key="value"
                    label-key="label"
                    :ui="selectUi"
                    @update:model-value="setCreateStatus"
                  />
                </UFormField>
              </div>
            </div>

            <div v-if="boardLoading" class="grid gap-4 lg:grid-cols-4">
              <div
                v-for="item in 4"
                :key="item"
                class="rounded-[28px] border border-sky-200 bg-white/80 p-4"
              >
                <div class="space-y-3">
                  <div class="h-4 w-24 rounded-full bg-sky-100"></div>
                  <div
                    class="h-24 w-full rounded-2xl border border-dashed border-sky-200 bg-sky-50/60"
                  ></div>
                  <div
                    class="h-24 w-full rounded-2xl border border-dashed border-sky-200 bg-sky-50/60"
                  ></div>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-1 gap-4 overflow-x-scroll pb-2">
              <div
                v-for="column in boardColumns"
                :key="column.id"
                class="flex min-h-[420px] w-80 shrink-0 flex-col rounded-[28px] border border-sky-200 bg-white/80 p-4"
                @dragover.prevent="handleDragOver(column.id, 'end')"
                @drop.prevent="handleDrop(column.id, 'end')"
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-slate-900">
                    {{ column.title }}
                  </h3>
                  <UBadge
                    class="rounded-full border border-sky-200 bg-sky-50 text-xs font-semibold text-slate-700"
                  >
                    {{ column.tasks.length }}
                  </UBadge>
                </div>

                <div class="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  <div
                    v-if="!column.tasks.length"
                    class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-3 py-3 text-xs text-slate-600"
                  >
                    Пока задач нет.
                  </div>
                  <div
                    v-for="(task, index) in column.tasks"
                    :key="task.id"
                    class="rounded-2xl border border-sky-200 bg-white/90 p-3 shadow-sm transition"
                    :class="taskCardClass(task, column.id, index)"
                    :draggable="!isTaskEditing(task.id)"
                    @dragstart="handleDragStart($event, task)"
                    @dragend="handleDragEnd"
                    @dragover.prevent="handleDragOver(column.id, index)"
                    @drop.prevent="handleDrop(column.id, index)"
                  >
                    <div
                      class="mb-2 w-full rounded-full p-1"
                      :class="priorityStripeClass(task)"
                    />
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <p
                          class="text-[10px] uppercase tracking-[0.3em] text-slate-500"
                        >
                          Название
                        </p>
                        <div v-if="isEditing(task.id, 'title')">
                          <UInput
                            v-model.trim="editingValue"
                            placeholder="Название"
                            size="xs"
                            :ui="inputUi"
                            @blur="saveEditing(task)"
                            @keydown.enter.prevent="saveEditing(task)"
                            @keydown.esc="cancelEditing"
                          />
                        </div>
                        <p
                          v-else
                          class="cursor-text text-sm font-semibold text-slate-900"
                          @dblclick="startEditing(task, 'title')"
                        >
                          {{ task.title }}
                        </p>
                      </div>
                      <UButton
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        icon="i-heroicons-trash"
                        class="rounded-full"
                        @click="deleteTask(task)"
                      />
                    </div>

                    <div>
                      <p
                        class="text-[10px] uppercase tracking-[0.3em] text-slate-500"
                      >
                        Описание
                      </p>
                      <div v-if="isEditing(task.id, 'description')">
                        <UTextarea
                          v-model.trim="editingValue"
                          placeholder="Описание"
                          :rows="2"
                          size="xs"
                          :ui="textareaUi"
                          @blur="saveEditing(task)"
                          @keydown.esc="cancelEditing"
                        />
                      </div>
                      <p
                        v-else
                        class="cursor-text text-xs text-slate-600"
                        @dblclick="startEditing(task, 'description')"
                      >
                        {{ task.description || "Без описания" }}
                      </p>
                    </div>

                    <div class="grid gap-2 text-xs">
                      <div class="grid grid-cols-[1fr,auto] items-center gap-2">
                        <span class="text-slate-500">Исполнитель:</span>
                        <div
                          class="min-w-[140px] max-w-[170px]"
                          @pointerdown.stop
                        >
                          <USelectMenu
                            :items="assigneeOptions"
                            :model-value="
                              task.assignee?.id || NO_ASSIGNEE_VALUE
                            "
                            value-key="value"
                            label-key="label"
                            placeholder="Без исполнителя"
                            class="w-full"
                            :ui="selectUi"
                            @update:model-value="
                              (value) => setTaskAssignee(task, value)
                            "
                          />
                        </div>
                      </div>
                      <div class="grid grid-cols-[1fr,auto] items-center gap-2">
                        <span class="text-slate-500">Дедлайн:</span>
                        <div class="min-w-[140px] max-w-[170px]">
                          <div v-if="isEditing(task.id, 'dueDate')">
                            <UInput
                              v-model="editingValue"
                              type="date"
                              size="xs"
                              :ui="inputUi"
                              @blur="saveEditing(task)"
                              @keydown.enter.prevent="saveEditing(task)"
                              @keydown.esc="cancelEditing"
                            />
                          </div>
                          <button
                            v-else
                            type="button"
                            class="w-full rounded-full border border-sky-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                            @click="startEditing(task, 'dueDate')"
                          >
                            {{ formatDueDate(task.dueDate) }}
                          </button>
                        </div>
                      </div>
                      <div class="grid grid-cols-[1fr,auto] items-center gap-2">
                        <span class="text-slate-500">Приоритет:</span>
                        <div class="min-w-[140px] max-w-[170px]">
                          <USelectMenu
                            :items="priorityOptions"
                            :model-value="task.priority"
                            value-key="value"
                            label-key="label"
                            class="w-full"
                            :ui="selectUi"
                            @update:model-value="
                              (value) => setTaskPriority(task, value)
                            "
                          />
                        </div>
                      </div>
                      <div class="grid grid-cols-[1fr,auto] items-center gap-2">
                        <span class="text-slate-500">Статус:</span>
                        <div class="min-w-[140px] max-w-[170px]">
                          <USelectMenu
                            :items="statusOptions"
                            :model-value="task.status"
                            value-key="value"
                            label-key="label"
                            class="w-full"
                            :ui="selectUi"
                            @update:model-value="
                              (value) => setTaskStatus(task, value)
                            "
                          />
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge
                        class="rounded-full border text-[10px] font-semibold uppercase tracking-[0.2em]"
                        :class="priorityBadgeClass(task.priority)"
                      >
                        {{ priorityLabels[task.priority] }}
                      </UBadge>
                      <UBadge
                        v-if="task.isOverdue"
                        class="rounded-full border border-rose-200 bg-rose-100 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-800"
                      >
                        Просрочено
                      </UBadge>
                    </div>
                  </div>
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
  project?: {
    owner?: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
  members: Array<{
    role: "OWNER" | "MEMBER";
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type TaskUser = {
  id: string;
  name: string;
  email: string;
};

type TaskItem = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  assignee: TaskUser | null;
  createdBy: TaskUser | null;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
};

type TaskBoardResponse = {
  projectId: string;
  columns: Record<TaskStatus, TaskItem[]>;
  stats: {
    byStatus: Record<TaskStatus, number>;
    overdue: number;
  };
};

type TaskUpdatePayload = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
};

const NO_ASSIGNEE_VALUE = "__none__";

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

const boardLoading = ref(false);
const boardError = ref("");
const boardStats = ref<TaskBoardResponse["stats"] | null>(null);
const tasksByStatus = ref<Record<TaskStatus, TaskItem[]>>({
  TODO: [],
  IN_PROGRESS: [],
  REVIEW: [],
  DONE: [],
});
const createLoading = ref(false);
const editingField = ref<{
  id: string;
  field: "title" | "description" | "dueDate";
} | null>(null);
const editingValue = ref("");
const dragState = ref<{ id: string; fromStatus: TaskStatus } | null>(null);
const dragOver = ref<{ status: TaskStatus; index: number | "end" } | null>(
  null,
);

const createForm = reactive({
  title: "",
  description: "",
  assigneeId: NO_ASSIGNEE_VALUE,
  dueDate: "",
  priority: "MEDIUM" as TaskPriority,
  status: "TODO" as TaskStatus,
});

const selectProject = (project: ProjectCard, group: ProjectGroup) => {
  selectedProject.value = project;
  selectedGroup.value = group;
  isBoardOpen.value = false;
  boardError.value = "";
  boardStats.value = null;
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
  boardError.value = "";
  void ensureMembersLoaded();
};

const closeBoard = () => {
  isBoardOpen.value = false;
  editingField.value = null;
  dragState.value = null;
  dragOver.value = null;
};

const hotBadgeClass = (count: number) => {
  if (count <= 0) return "border-emerald-200 bg-emerald-100 text-emerald-800";
  if (count <= 2) return "border-amber-200 bg-amber-100 text-amber-800";
  return "border-rose-200 bg-rose-100 text-rose-800";
};

const inputUi = {
  base: "bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-200",
};

const textareaUi = {
  base: "bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-200",
};

const selectUi = {
  base: "bg-white/90 border border-sky-200 text-slate-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-200",
};

const fieldUi = {
  label: "text-slate-900 font-medium",
};

const statusOptions = [
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Done", value: "DONE" },
];

const priorityOptions = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

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

const assigneeOptions = computed(() => {
  const projectId = selectedProject.value?.id;
  if (!projectId) {
    return [{ label: "Без исполнителя", value: NO_ASSIGNEE_VALUE }];
  }

  const members = membersForProject(projectId);
  return [
    { label: "Без исполнителя", value: NO_ASSIGNEE_VALUE },
    ...members.map((member) => ({
      label: member.email ? `${member.name} · ${member.email}` : member.name,
      value: member.id,
    })),
  ];
});

const ensureMembersLoaded = async () => {
  const projectId = selectedProject.value?.id;
  if (!projectId) return;
  if (!hasMembersLoaded(projectId) && membersLoadingId.value !== projectId) {
    await loadMembers(projectId);
  }
};

const boardTasksTotal = computed(() => {
  const stats = boardStats.value?.byStatus;
  if (!stats) return selectedProject.value?.tasksCount ?? 0;
  return Object.values(stats).reduce((sum, count) => sum + count, 0);
});

const boardOverdueTotal = computed(() => {
  if (boardStats.value) return boardStats.value.overdue;
  return selectedProject.value?.hotTasksCount ?? 0;
});

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

    const owner = result.project?.owner;
    const members = result.members.map((member) => ({
      id: member.user.id,
      name: member.user.name || member.user.email,
      email: member.user.email,
      role: member.role,
    }));

    if (owner && !members.find((member) => member.id === owner.id)) {
      members.unshift({
        id: owner.id,
        name: owner.name || owner.email,
        email: owner.email,
        role: "OWNER",
      });
    }

    membersByProject.value = {
      ...membersByProject.value,
      [projectId]: members,
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

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const boardColumns = computed(() => [
  {
    id: "TODO" as const,
    title: statusLabels.TODO,
    tasks: tasksByStatus.value.TODO,
  },
  {
    id: "IN_PROGRESS" as const,
    title: statusLabels.IN_PROGRESS,
    tasks: tasksByStatus.value.IN_PROGRESS,
  },
  {
    id: "REVIEW" as const,
    title: statusLabels.REVIEW,
    tasks: tasksByStatus.value.REVIEW,
  },
  {
    id: "DONE" as const,
    title: statusLabels.DONE,
    tasks: tasksByStatus.value.DONE,
  },
]);

const formatDateInput = (value: string | null) =>
  value ? value.slice(0, 10) : "";

const formatDueDate = (value: string | null) => {
  if (!value) return "Без дедлайна";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Без дедлайна";
  return parsed.toLocaleDateString("ru-RU");
};

const computeOverdue = (task: TaskItem) => {
  if (!task.dueDate || task.status === "DONE") return false;
  const due = new Date(task.dueDate).getTime();
  if (Number.isNaN(due)) return false;
  return due < Date.now();
};

const priorityBadgeClass = (priority: TaskPriority) => {
  switch (priority) {
    case "LOW":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "MEDIUM":
      return "border-yellow-200 bg-yellow-100 text-yellow-800";
    case "HIGH":
      return "border-orange-200 bg-orange-100 text-orange-800";
    case "URGENT":
      return "border-rose-200 bg-rose-100 text-rose-800";
    default:
      return "border-sky-200 bg-sky-100 text-sky-800";
  }
};

const priorityStripeClass = (task: TaskItem) => {
  if (task.isOverdue) return "bg-rose-500";
  switch (task.priority) {
    case "LOW":
      return "bg-emerald-400";
    case "MEDIUM":
      return "bg-yellow-400";
    case "HIGH":
      return "bg-orange-400";
    case "URGENT":
      return "bg-rose-500";
    default:
      return "bg-sky-400";
  }
};

const taskCardClass = (task: TaskItem, status: TaskStatus, index: number) => {
  const classes: string[] = [];

  if (dragOver.value?.status === status) {
    const isMatch =
      dragOver.value.index === "end"
        ? index === tasksByStatus.value[status].length - 1
        : dragOver.value.index === index;
    if (isMatch) classes.push("ring-2 ring-sky-300");
  }

  return classes.filter(Boolean).join(" ");
};

const isEditing = (
  taskId: string,
  field: "title" | "description" | "dueDate",
) => editingField.value?.id === taskId && editingField.value?.field === field;

const isTaskEditing = (taskId: string) => editingField.value?.id === taskId;

const startEditing = (
  task: TaskItem,
  field: "title" | "description" | "dueDate",
) => {
  editingField.value = { id: task.id, field };
  editingValue.value =
    field === "dueDate" ? formatDateInput(task.dueDate) : task[field] || "";
};

const cancelEditing = () => {
  editingField.value = null;
  editingValue.value = "";
};

const applyTaskUpdate = (updated: TaskItem) => {
  const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
  let fromStatus: TaskStatus | null = null;
  let fromIndex = -1;

  for (const status of statuses) {
    const idx = tasksByStatus.value[status].findIndex(
      (task) => task.id === updated.id,
    );
    if (idx !== -1) {
      fromStatus = status;
      fromIndex = idx;
      break;
    }
  }

  const nextTask = {
    ...updated,
    isOverdue: computeOverdue(updated),
  };

  if (!fromStatus) {
    tasksByStatus.value[updated.status].push(nextTask);
    tasksByStatus.value[updated.status].sort((a, b) => a.position - b.position);
    return;
  }

  if (fromStatus === updated.status) {
    tasksByStatus.value[fromStatus].splice(fromIndex, 1, nextTask);
    tasksByStatus.value[fromStatus].sort((a, b) => a.position - b.position);
    return;
  }

  tasksByStatus.value[fromStatus].splice(fromIndex, 1);
  tasksByStatus.value[updated.status].push(nextTask);
  tasksByStatus.value[updated.status].sort((a, b) => a.position - b.position);
};

const recomputeBoardStats = () => {
  const byStatus: Record<TaskStatus, number> = {
    TODO: tasksByStatus.value.TODO.length,
    IN_PROGRESS: tasksByStatus.value.IN_PROGRESS.length,
    REVIEW: tasksByStatus.value.REVIEW.length,
    DONE: tasksByStatus.value.DONE.length,
  };

  let overdue = 0;
  (Object.keys(byStatus) as TaskStatus[]).forEach((status) => {
    tasksByStatus.value[status] = tasksByStatus.value[status].map((task) => {
      const isOverdue = computeOverdue(task);
      if (isOverdue) overdue += 1;
      return { ...task, isOverdue };
    });
  });

  boardStats.value = { byStatus, overdue };
};

const syncProjectCounts = (projectId: string) => {
  if (!boardStats.value) return;
  const total = Object.values(boardStats.value.byStatus).reduce(
    (sum, count) => sum + count,
    0,
  );

  const updateList = (list: ProjectCard[]) => {
    const project = list.find((item) => item.id === projectId);
    if (project) {
      project.tasksCount = total;
      project.hotTasksCount = boardStats.value?.overdue ?? 0;
    }
  };

  updateList(myProjects.value);
  updateList(otherProjects.value);
};

const loadBoard = async (projectId: string) => {
  boardLoading.value = true;
  boardError.value = "";

  try {
    const result = await $fetch<TaskBoardResponse>("/api/task", {
      query: { projectId },
    });

    const sortColumn = (items: TaskItem[] | undefined) =>
      (items ?? []).slice().sort((a, b) => a.position - b.position);

    tasksByStatus.value = {
      TODO: sortColumn(result.columns.TODO),
      IN_PROGRESS: sortColumn(result.columns.IN_PROGRESS),
      REVIEW: sortColumn(result.columns.REVIEW),
      DONE: sortColumn(result.columns.DONE),
    };

    recomputeBoardStats();
    syncProjectCounts(projectId);
  } catch (err) {
    boardError.value = getErrorMessage(err, "Не удалось загрузить задачи.");
    tasksByStatus.value = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };
    boardStats.value = null;
  } finally {
    boardLoading.value = false;
  }
};

const createTask = async () => {
  const projectId = selectedProject.value?.id;
  if (!projectId) return;
  if (!createForm.title.trim()) return;
  if (createLoading.value) return;

  createLoading.value = true;
  boardError.value = "";

  try {
    const created = await $fetch<TaskItem>("/api/task", {
      method: "POST",
      body: {
        action: "create",
        projectId,
        title: createForm.title.trim(),
        description: createForm.description.trim() || null,
        status: createForm.status,
        priority: createForm.priority,
        dueDate: createForm.dueDate
          ? new Date(createForm.dueDate).toISOString()
          : null,
        assigneeId:
          createForm.assigneeId === NO_ASSIGNEE_VALUE
            ? null
            : createForm.assigneeId || null,
      },
    });

    applyTaskUpdate(created);
    recomputeBoardStats();
    syncProjectCounts(projectId);

    createForm.title = "";
    createForm.description = "";
    createForm.assigneeId = NO_ASSIGNEE_VALUE;
    createForm.dueDate = "";
    createForm.priority = "MEDIUM";
    createForm.status = "TODO";
  } catch (err) {
    boardError.value = getErrorMessage(err, "Не удалось создать задачу.");
  } finally {
    createLoading.value = false;
  }
};

const setCreateAssignee = (value: unknown) => {
  if (typeof value === "string") {
    createForm.assigneeId = value;
    return;
  }
  createForm.assigneeId = NO_ASSIGNEE_VALUE;
};

const setCreatePriority = (value: unknown) => {
  if (typeof value === "string") {
    createForm.priority = value as TaskPriority;
  }
};

const setCreateStatus = (value: unknown) => {
  if (typeof value === "string") {
    createForm.status = value as TaskStatus;
  }
};

const setTaskAssignee = (task: TaskItem, value: unknown) => {
  const nextValue =
    typeof value === "string" && value !== NO_ASSIGNEE_VALUE ? value : null;
  updateTaskField(task, { assigneeId: nextValue });
};

const setTaskPriority = (task: TaskItem, value: unknown) => {
  if (typeof value === "string") {
    updateTaskField(task, { priority: value as TaskPriority });
  }
};

const setTaskStatus = (task: TaskItem, value: unknown) => {
  if (typeof value === "string") {
    updateTaskField(task, { status: value as TaskStatus });
  }
};

const updateTaskField = async (task: TaskItem, patch: TaskUpdatePayload) => {
  boardError.value = "";
  const projectId = selectedProject.value?.id;

  const resolveAssignee = (id: string | null | undefined) => {
    if (!id || !projectId) return null;
    const member = membersForProject(projectId).find((item) => item.id === id);
    if (!member) return null;
    return { id: member.id, name: member.name, email: member.email };
  };

  const optimistic: TaskItem = {
    ...task,
    title: typeof patch.title === "string" ? patch.title : task.title,
    description:
      typeof patch.description !== "undefined"
        ? patch.description
        : task.description,
    status: patch.status ?? task.status,
    priority: patch.priority ?? task.priority,
    dueDate:
      typeof patch.dueDate !== "undefined" ? patch.dueDate : task.dueDate,
    assignee:
      typeof patch.assigneeId !== "undefined"
        ? resolveAssignee(patch.assigneeId)
        : task.assignee,
  };

  applyTaskUpdate(optimistic);
  recomputeBoardStats();
  if (projectId) syncProjectCounts(projectId);

  try {
    const updated = await $fetch<TaskItem>("/api/task", {
      method: "PATCH",
      body: { id: task.id, ...patch },
    });
    applyTaskUpdate(updated);
    recomputeBoardStats();
    if (projectId) syncProjectCounts(projectId);
  } catch (err) {
    boardError.value = getErrorMessage(err, "Не удалось обновить задачу.");
    if (projectId) {
      await loadBoard(projectId);
    }
  }
};

const saveEditing = async (task: TaskItem) => {
  if (!editingField.value) return;

  const field = editingField.value.field;
  const value = editingValue.value.trim();

  if (field === "title" && !value) {
    boardError.value = "Название задачи не может быть пустым.";
    return;
  }

  if (field === "dueDate") {
    await updateTaskField(task, {
      dueDate: value ? new Date(value).toISOString() : null,
    });
  } else if (field === "description") {
    await updateTaskField(task, { description: value || null });
  } else {
    await updateTaskField(task, { title: value });
  }

  cancelEditing();
};

const deleteTask = async (task: TaskItem) => {
  const projectId = selectedProject.value?.id;
  if (!projectId) return;

  boardError.value = "";

  try {
    await $fetch("/api/task", {
      method: "DELETE",
      query: { projectId, id: task.id },
    });

    tasksByStatus.value[task.status] = tasksByStatus.value[task.status].filter(
      (item) => item.id !== task.id,
    );
    recomputeBoardStats();
    syncProjectCounts(projectId);
  } catch (err) {
    boardError.value = getErrorMessage(err, "Не удалось удалить задачу.");
  }
};

const moveTaskLocal = (
  taskId: string,
  toStatus: TaskStatus,
  toIndex: number,
) => {
  const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
  let fromStatus: TaskStatus | null = null;
  let fromIndex = -1;
  let task: TaskItem | undefined;

  for (const status of statuses) {
    const idx = tasksByStatus.value[status].findIndex(
      (item) => item.id === taskId,
    );
    if (idx !== -1) {
      fromStatus = status;
      fromIndex = idx;
      task = tasksByStatus.value[status][idx];
      break;
    }
  }

  if (!task || !fromStatus) return;

  tasksByStatus.value[fromStatus].splice(fromIndex, 1);

  const destination = tasksByStatus.value[toStatus];
  const insertIndex =
    fromStatus === toStatus && toIndex > fromIndex ? toIndex - 1 : toIndex;
  const boundedIndex = Math.max(0, Math.min(insertIndex, destination.length));

  task.status = toStatus;
  destination.splice(boundedIndex, 0, task);

  tasksByStatus.value[fromStatus].forEach((item, idx) => {
    item.position = idx;
  });
  tasksByStatus.value[toStatus].forEach((item, idx) => {
    item.position = idx;
  });
};

const handleDragStart = (event: DragEvent, task: TaskItem) => {
  if (editingField.value?.id === task.id) return;
  dragState.value = { id: task.id, fromStatus: task.status };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
  }
};

const handleDragEnd = () => {
  dragState.value = null;
  dragOver.value = null;
};

const handleDragOver = (status: TaskStatus, index: number | "end") => {
  dragOver.value = { status, index };
};

const handleDrop = async (status: TaskStatus, index: number | "end") => {
  if (!dragState.value || !selectedProject.value) return;

  const projectId = selectedProject.value.id;
  const taskId = dragState.value.id;
  const toIndex = index === "end" ? tasksByStatus.value[status].length : index;

  const currentIndex = tasksByStatus.value[status].findIndex(
    (task) => task.id === taskId,
  );
  if (dragState.value.fromStatus === status && currentIndex === toIndex) {
    dragState.value = null;
    dragOver.value = null;
    return;
  }

  moveTaskLocal(taskId, status, toIndex);
  recomputeBoardStats();
  syncProjectCounts(projectId);

  try {
    await $fetch("/api/task", {
      method: "POST",
      body: {
        action: "move",
        projectId,
        id: taskId,
        toStatus: status,
        toIndex,
      },
    });
  } catch (err) {
    boardError.value = getErrorMessage(err, "Не удалось переместить задачу.");
    await loadBoard(projectId);
  } finally {
    dragState.value = null;
    dragOver.value = null;
  }
};

watch(
  () => [selectedProject.value?.id, isBoardOpen.value] as const,
  ([projectId, isOpen]) => {
    if (projectId && isOpen) {
      loadBoard(projectId);
      loadMembers(projectId);
    }
    if (!isOpen) {
      editingField.value = null;
    }
  },
);

onMounted(() => {
  loadProjects();
});
</script>
