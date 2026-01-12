<template>
  <UCard
    class="rounded-lg border border-sky-200 bg-white/90"
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
        class="flex flex-col gap-1 sm:gap-3 xl:flex-row xl:items-center xl:justify-between"
      >
        <div class="space-y-1 sm:space-y-2">
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase tracking-[0.3em] text-slate-600"
          >
            Мои проекты
          </p>
          <h2
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-semibold text-slate-900"
          >
            Управление проектами
          </h2>
        </div>
        <div class="flex flex-wrap items-center gap-1 sm:gap-2">
          <UBadge
            class="rounded-full border border-sky-200 bg-white text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-700"
          >
            {{ projects.length }} проектов
          </UBadge>
          <UBadge
            v-if="listLoading"
            class="rounded-full border border-sky-200 bg-sky-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-900"
          >
            Загрузка
          </UBadge>
          <UButton
            :class="[baseButtonClass, primaryButtonClass]"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-plus"
            leading
            :disabled="formMode !== null || listLoading"
            @click="startCreate"
          >
            Создать проект
          </UButton>
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
      <div
        v-if="formMode"
        class="rounded-[24px] border border-sky-200 bg-sky-50/70 p-4"
      >
        <div class="grid gap-4 xl:grid-cols-[1fr,1fr]">
          <UFormField label="Название проекта" :ui="fieldUi" class="w-full">
            <UInput
              v-model.trim="form.name"
              placeholder="Название проекта"
              :ui="inputUi"
            />
          </UFormField>
          <UFormField label="Описание" :ui="fieldUi" class="w-full">
            <UTextarea
              v-model.trim="form.description"
              placeholder="Описание проекта"
              :rows="3"
              class="min-h-[96px]"
              :ui="textareaUi"
            />
          </UFormField>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <UButton
            :class="[baseButtonClass, primaryButtonClass]"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-check"
            leading
            :loading="formLoading"
            :disabled="!form.name || formLoading"
            @click="submitForm"
          >
            {{ formMode === "create" ? "Создать" : "Сохранить" }}
          </UButton>
          <UButton
            :class="[baseButtonClass, dangerButtonClass]"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-x-mark"
            leading
            :disabled="formLoading"
            @click="cancelForm"
          >
            Отмена
          </UButton>
        </div>

        <p
          v-if="formMode === 'edit'"
          class="mt-3 text-center text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
        >
          Вы редактируете
          <span
            class="font-semibold text-slate-900 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12"
            >{{ editingName }}</span
          >
        </p>
      </div>

      <div v-if="listLoading" class="space-y-4">
        <div
          v-for="item in 3"
          :key="item"
          class="rounded-[24px] border border-sky-200 bg-white/80 p-4"
        >
          <div class="space-y-3">
            <div class="h-4 w-40 rounded-full bg-sky-100"></div>
            <div class="h-3 w-64 rounded-full bg-sky-50"></div>
            <div
              class="h-10 w-full rounded-2xl border border-dashed border-sky-200 bg-sky-50/60"
            ></div>
          </div>
        </div>
      </div>

      <div v-else class="max-h-[100vh] space-y-3 overflow-auto pr-2">
        <div
          v-for="project in projects"
          :key="project.id"
          class="rounded-[24px] border border-sky-200 bg-white/80 p-4"
        >
          <div
            class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
          >
            <div class="flex-1">
              <p
                class="max-w-[32ch] truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-900"
                :title="project.name"
              >
                {{ project.name }}
              </p>
              <p
                class="max-w-[32ch] truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
                :title="project.description || 'Без описания'"
              >
                {{ project.description || "Без описания" }}
              </p>
              <p
                v-if="!canManage(project)"
                class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
              >
                Владелец:
                <span
                  class="font-semibold text-slate-900 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12"
                >
                  {{ ownerLabel(project) }}
                </span>
                <span
                  v-if="project.ownerEmail"
                  class="text-slate-500 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12"
                >
                  · {{ project.ownerEmail }}
                </span>
              </p>
            </div>

            <div
              class="flex w-full flex-wrap items-center justify-start gap-2 xl:w-auto xl:justify-end"
            >
              <template v-if="canManage(project)">
                <UButton
                  :class="[baseButtonClass, primaryButtonClass]"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-user-plus"
                  leading
                  @click="toggleInvite(project.id)"
                >
                  Пригласить людей
                </UButton>
                <UButton
                  :class="[baseButtonClass, primaryButtonClass]"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-user-group"
                  leading
                  @click="toggleMembers(project.id)"
                >
                  Список участников
                </UButton>
                <UButton
                  :class="[baseButtonClass, primaryButtonClass]"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-pencil-square"
                  leading
                  @click="startEdit(project)"
                >
                  Изменить
                </UButton>
                <UButton
                  :class="[baseButtonClass, dangerButtonClass]"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-trash"
                  leading
                  :loading="deleteLoadingId === project.id"
                  :disabled="deleteLoadingId === project.id"
                  @click="confirmProjectAction('delete', project)"
                >
                  Удалить
                </UButton>
              </template>
              <template v-else>
                <UButton
                  :class="[baseButtonClass, primaryButtonClass]"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-user-group"
                  leading
                  @click="toggleMembers(project.id)"
                >
                  Список участников
                </UButton>
                <UButton
                  :class="[baseButtonClass, dangerButtonClass]"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-arrow-left-on-rectangle"
                  leading
                  :loading="leaveLoadingId === project.id"
                  :disabled="leaveLoadingId === project.id"
                  @click="confirmProjectAction('leave', project)"
                >
                  Выйти
                </UButton>
              </template>
            </div>
          </div>

          <UCollapsible
            v-if="openMembersId === project.id"
            :open="openMembersId === project.id"
            class="cursor-pointer"
          >
            <div
              class="mt-3 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-3"
            >
              <p
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-700"
              >
                Участники:
              </p>
              <div
                v-if="membersLoadingId === project.id"
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
              >
                Загрузка участников...
              </div>
              <div
                v-else-if="membersError[project.id]"
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-rose-600"
              >
                {{ membersError[project.id] }}
              </div>
              <div v-else class="h-12 space-y-1 overflow-y-auto pr-1">
                <div
                  v-if="
                    hasMembersLoaded(project.id) &&
                    !membersForProject(project.id).length
                  "
                  class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
                >
                  Пока участников нет.
                </div>
                <div
                  v-for="member in membersForProject(project.id)"
                  :key="member.id"
                  class="flex items-center justify-between gap-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-700"
                >
                  <div class="min-w-0">
                    <span
                      class="truncate font-semibold text-slate-900 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12"
                    >
                      {{ member.name }}
                    </span>
                    <span
                      v-if="member.email"
                      class="truncate text-slate-500 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12"
                    >
                      · {{ member.email }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UBadge
                      v-if="member.role === 'OWNER'"
                      class="rounded-full border border-sky-200 bg-white text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-[0.2em] text-slate-700"
                    >
                      Owner
                    </UBadge>
                    <UButton
                      v-if="canRemoveMember(project, member)"
                      :class="[baseButtonClass, dangerButtonClass]"
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      icon="i-heroicons-user-minus"
                      :loading="isRemovingMember(project.id, member.id)"
                      :disabled="isRemovingMember(project.id, member.id)"
                      @click="removeMember(project.id, member.id)"
                    >
                      Исключить
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </UCollapsible>

          <div
            v-if="inviteProjectId === project.id"
            class="mt-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4"
          >
            <UFormField label="Email участника" :ui="fieldUi" class="w-full">
              <UInput
                v-model.trim="inviteEmail"
                placeholder="user@example.com"
                type="email"
                :ui="inputUi"
              />
            </UFormField>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <UButton
                :class="[baseButtonClass, primaryButtonClass]"
                variant="ghost"
                color="neutral"
                icon="i-heroicons-paper-airplane"
                leading
                :loading="inviteLoading"
                :disabled="inviteLoading || !inviteEmail"
                @click="submitInvite(project.id)"
              >
                Отправить
              </UButton>
              <UButton
                :class="[baseButtonClass, dangerButtonClass]"
                variant="ghost"
                color="neutral"
                icon="i-heroicons-x-mark"
                leading
                :disabled="inviteLoading"
                @click="cancelInvite"
              >
                Отмена
              </UButton>
            </div>
            <p
              v-if="inviteError"
              class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-rose-600"
            >
              {{ inviteError }}
            </p>
            <p
              v-if="inviteSuccess"
              class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-emerald-700"
            >
              {{ inviteSuccess }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="!listLoading && !projects.length"
        class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-6 text-center text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
      >
        Пока проектов нет.
      </div>
    </div>

    <ConfirmDialog
      v-model="confirmOpen"
      :title="confirmTitle"
      :description="confirmDescription"
      :confirm-text="confirmButtonText"
      cancel-text="Отмена"
      :tone="confirmTone"
      :loading="confirmLoading"
      @confirm="runConfirmedAction"
    />
  </UCard>
</template>

<script setup lang="ts">
import { humanizeError } from "~/utils/human-error";
definePageMeta({ layout: "default" });

type ProjectItem = {
  id: string;
  name: string;
  description: string;
  role?: "OWNER" | "MEMBER" | null;
  ownerName?: string;
  ownerEmail?: string;
};

type FormMode = "create" | "edit" | null;

type ProjectApi = {
  id: string;
  name: string;
  description?: string | null;
  role?: "OWNER" | "MEMBER" | null;
  owner?: {
    name?: string | null;
    email?: string | null;
  } | null;
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

type UserPublic = {
  id: string;
  name: string;
  email: string;
};

const projects = ref<ProjectItem[]>([]);

const formMode = ref<FormMode>(null);
const editingId = ref<string | null>(null);
const listLoading = ref(false);
const formLoading = ref(false);
const deleteLoadingId = ref<string | null>(null);
const leaveLoadingId = ref<string | null>(null);
const removeMemberLoadingId = ref<string | null>(null);
const errorMessage = ref("");
const inviteProjectId = ref<string | null>(null);
const inviteEmail = ref("");
const inviteLoading = ref(false);
const inviteError = ref("");
const inviteSuccess = ref("");
const openMembersId = ref<string | null>(null);
const membersLoadingId = ref<string | null>(null);
const membersByProject = ref<Record<string, MemberItem[]>>({});
const membersError = ref<Record<string, string>>({});
const currentUserId = ref<string | null>(null);
const confirmAction = ref<{
  type: "delete" | "leave";
  id: string;
  name: string;
} | null>(null);

const form = reactive({
  name: "",
  description: "",
});

const bodyTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const baseButtonClass = `rounded-full border px-3 py-1.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 cursor-pointer ${bodyTextClass}`;

const primaryButtonClass =
  "border-sky-200/60 border-sky-100 bg-white shadow-lg shadow-sky-100/70 -translate-y-0.5 hover:bg-blue-400 active:bg-blue-500 cursor-pointer";

const dangerButtonClass =
  "border-pink-200/60 border-pink-100 bg-white shadow-lg shadow-pink-100/70 -translate-y-0.5 hover:bg-rose-400 active:bg-rose-500 cursor-pointer";

const inputUi = {
  base: `w-full bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 ring-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent ${bodyTextClass}`,
};

const textareaUi = {
  base: `w-full bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 ring-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent ${bodyTextClass}`,
};

const fieldUi = {
  label:
    "text-slate-900 font-medium text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12",
};

const confirmOpen = computed({
  get: () => Boolean(confirmAction.value),
  set: (value) => {
    if (!value) confirmAction.value = null;
  },
});

const confirmTitle = computed(() =>
  confirmAction.value?.type === "delete"
    ? "Удалить проект?"
    : "Выйти из проекта?",
);

const confirmDescription = computed(() => {
  if (!confirmAction.value) return "";
  return confirmAction.value.type === "delete"
    ? `Проект «${confirmAction.value.name}» будет удален навсегда.`
    : `Вы выйдете из проекта «${confirmAction.value.name}».`;
});

const confirmButtonText = computed(() =>
  confirmAction.value?.type === "delete" ? "Удалить" : "Выйти",
);

const confirmTone = computed(() =>
  confirmAction.value?.type === "delete" ? "danger" : "default",
);

const confirmLoading = computed(() => {
  if (!confirmAction.value) return false;
  if (confirmAction.value.type === "delete") {
    return deleteLoadingId.value === confirmAction.value.id;
  }
  return leaveLoadingId.value === confirmAction.value.id;
});

const editingName = computed(() => {
  if (!editingId.value) return "";
  return projects.value.find((project) => project.id === editingId.value)?.name;
});

const canManage = (project: ProjectItem) => project.role === "OWNER";
const canRemoveMember = (project: ProjectItem, member: MemberItem) =>
  canManage(project) &&
  member.role !== "OWNER" &&
  member.id !== currentUserId.value;
const ownerLabel = (project: ProjectItem) =>
  project.ownerName || project.ownerEmail || "Неизвестно";
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

const getErrorMessage = (err: unknown, fallback: string) =>
  humanizeError(err, fallback);

const resetForm = () => {
  form.name = "";
  form.description = "";
  editingId.value = null;
};

const startCreate = () => {
  formMode.value = "create";
  errorMessage.value = "";
  resetForm();
};

const startEdit = (project: ProjectItem) => {
  if (!canManage(project)) return;
  formMode.value = "edit";
  editingId.value = project.id;
  form.name = project.name;
  form.description = project.description;
};

const confirmProjectAction = (
  type: "delete" | "leave",
  project: ProjectItem,
) => {
  confirmAction.value = { type, id: project.id, name: project.name };
};

const runConfirmedAction = async () => {
  if (!confirmAction.value) return;
  const { type, id } = confirmAction.value;
  if (type === "delete") {
    await removeProject(id);
  } else {
    await leaveProject(id);
  }
  confirmAction.value = null;
};

const cancelForm = () => {
  formMode.value = null;
  resetForm();
};

const submitForm = async () => {
  if (!form.name) return;
  if (formLoading.value) return;

  formLoading.value = true;
  errorMessage.value = "";

  try {
    if (formMode.value === "create") {
      const created = await $fetch<ProjectApi>("/api/project", {
        method: "POST",
        body: {
          action: "create",
          name: form.name,
          description: form.description,
        },
      });

      projects.value.unshift({
        id: created.id,
        name: created.name,
        description: created.description ?? "",
        role: created.role ?? "OWNER",
      });
    }

    if (formMode.value === "edit" && editingId.value) {
      const updated = await $fetch<ProjectApi>("/api/project", {
        method: "PATCH",
        body: {
          id: editingId.value,
          name: form.name,
          description: form.description,
        },
      });

      const project = projects.value.find((item) => item.id === updated.id);
      if (project) {
        project.name = updated.name;
        project.description = updated.description ?? "";
      }
    }

    formMode.value = null;
    resetForm();
  } catch (err) {
    errorMessage.value = getErrorMessage(err, "Не удалось сохранить проект.");
  } finally {
    formLoading.value = false;
  }
};

const removeProject = async (id: string) => {
  if (deleteLoadingId.value) return;
  deleteLoadingId.value = id;
  errorMessage.value = "";

  try {
    await $fetch("/api/project", { method: "DELETE", query: { id } });
    projects.value = projects.value.filter((project) => project.id !== id);
    if (editingId.value === id) {
      cancelForm();
    }
    if (inviteProjectId.value === id) {
      cancelInvite();
    }
    clearMembersState(id);
  } catch (err) {
    errorMessage.value = getErrorMessage(err, "Не удалось удалить проект.");
  } finally {
    deleteLoadingId.value = null;
  }
};

const leaveProject = async (id: string) => {
  if (leaveLoadingId.value) return;
  leaveLoadingId.value = id;
  errorMessage.value = "";

  try {
    await $fetch("/api/project", {
      method: "DELETE",
      query: { id, leave: "1" },
    });
    projects.value = projects.value.filter((project) => project.id !== id);
    clearMembersState(id);
  } catch (err) {
    errorMessage.value = getErrorMessage(err, "Не удалось выйти из проекта.");
  } finally {
    leaveLoadingId.value = null;
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

const isRemovingMember = (projectId: string, memberId: string) =>
  removeMemberLoadingId.value === `${projectId}:${memberId}`;

const removeMember = async (projectId: string, memberId: string) => {
  if (removeMemberLoadingId.value) return;
  if (!projectId || !memberId) return;

  removeMemberLoadingId.value = `${projectId}:${memberId}`;
  membersError.value = { ...membersError.value, [projectId]: "" };

  try {
    await $fetch("/api/project", {
      method: "POST",
      body: { action: "remove_member", projectId, memberUserId: memberId },
    });

    const members = membersByProject.value[projectId] ?? [];
    membersByProject.value = {
      ...membersByProject.value,
      [projectId]: members.filter((member) => member.id !== memberId),
    };
  } catch (err) {
    membersError.value = {
      ...membersError.value,
      [projectId]: getErrorMessage(err, "Не удалось исключить участника."),
    };
  } finally {
    removeMemberLoadingId.value = null;
  }
};

const toggleInvite = (projectId: string) => {
  if (inviteProjectId.value === projectId) {
    cancelInvite();
    return;
  }
  inviteProjectId.value = projectId;
  inviteEmail.value = "";
  inviteError.value = "";
  inviteSuccess.value = "";
};

const cancelInvite = () => {
  inviteProjectId.value = null;
  inviteEmail.value = "";
  inviteError.value = "";
  inviteSuccess.value = "";
};

const submitInvite = async (projectId: string) => {
  if (!inviteEmail.value) {
    inviteError.value = "Введите email участника.";
    return;
  }
  if (inviteLoading.value) return;

  inviteLoading.value = true;
  inviteError.value = "";
  inviteSuccess.value = "";

  try {
    await $fetch("/api/project", {
      method: "POST",
      body: {
        action: "invite",
        projectId,
        email: inviteEmail.value,
      },
    });
    inviteSuccess.value = "Приглашение отправлено.";
    inviteEmail.value = "";
  } catch (err) {
    inviteError.value = getErrorMessage(
      err,
      "Не удалось отправить приглашение.",
    );
  } finally {
    inviteLoading.value = false;
  }
};

const loadProjects = async () => {
  listLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await $fetch<ProjectApi[]>("/api/project", {
      query: { scope: "my" },
    });

    projects.value = result.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      role: project.role ?? null,
      ownerName: project.owner?.name || project.owner?.email || "Неизвестно",
      ownerEmail: project.owner?.email || "",
    }));
  } catch (err) {
    projects.value = [];
    errorMessage.value = getErrorMessage(err, "Не удалось загрузить проекты.");
  } finally {
    listLoading.value = false;
  }
};

const loadCurrentUser = async () => {
  try {
    const me = await $fetch<UserPublic>("/api/user", {
      query: { me: "1" },
    });
    currentUserId.value = me.id;
  } catch {
    currentUserId.value = null;
  }
};

onMounted(() => {
  loadProjects();
  loadCurrentUser();
});
</script>
