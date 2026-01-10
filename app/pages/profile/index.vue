<template>
  <UCard class="rounded-[32px] border border-sky-200 bg-white/90">
    <template #header>
      <div
        class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
      >
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
            Ваши приглашения
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Приглашения в проекты
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <UBadge
            class="rounded-full border border-sky-200 bg-white text-xs font-semibold text-slate-700"
          >
            {{ invitations.length }} шт.
          </UBadge>
          <UBadge
            v-if="loading"
            class="rounded-full border border-sky-200 bg-sky-100 text-xs font-semibold text-slate-900"
          >
            Загрузка
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
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
          class="rounded-[24px] border border-sky-200 bg-white/80 p-4"
        >
          <div class="space-y-3">
            <div class="h-4 w-48 rounded-full bg-sky-100"></div>
            <div class="h-3 w-64 rounded-full bg-sky-50"></div>
            <div
              class="h-10 w-full rounded-2xl border border-dashed border-sky-200 bg-sky-50/60"
            ></div>
          </div>
        </div>
      </div>

      <div v-else class="max-h-[60vh] space-y-4 overflow-auto pr-2">
        <div
          v-for="invite in invitations"
          :key="invite.id"
          class="rounded-[24px] border border-sky-200 bg-white/80 p-4"
        >
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
            <div class="min-w-0 xl:w-[320px] xl:shrink-0">
              <div class="flex flex-wrap items-center gap-2">
                <p
                  class="max-w-[32ch] truncate text-sm font-semibold text-slate-900"
                  :title="invite.projectName"
                >
                  {{ invite.projectName }}
                </p>
                <UBadge
                  v-if="invite.kind === 'request'"
                  class="rounded-full border border-amber-200 bg-amber-100 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800"
                >
                  Желает войти
                </UBadge>
              </div>
              <p
                class="max-w-[32ch] truncate text-xs text-slate-600"
                :title="invite.projectDescription"
              >
                {{ invite.projectDescription }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 xl:shrink-0">
              <UButton
                class="rounded-full bg-sky-200 text-slate-900"
                icon="i-heroicons-check-circle"
                leading
                :loading="isActionLoading(invite.id, 'accept')"
                :disabled="loading || Boolean(actionLoadingId)"
                @click="acceptInvite(invite)"
              >
                Принять
              </UButton>
              <UButton
                variant="outline"
                class="rounded-full border-sky-200 text-slate-900"
                icon="i-heroicons-x-circle"
                leading
                :loading="isActionLoading(invite.id, 'decline')"
                :disabled="loading || Boolean(actionLoadingId)"
                @click="declineInvite(invite)"
              >
                Отклонить
              </UButton>
            </div>

            <div
              class="flex items-center gap-4 xl:ml-auto xl:w-[220px] xl:shrink-0"
            >
              <div class="hidden h-10 w-px bg-sky-200 xl:block"></div>
              <div class="min-w-0 text-xs leading-snug text-slate-600">
                <p class="truncate font-semibold text-slate-900">
                  {{ invite.inviterName }}
                </p>
                <p class="truncate">{{ invite.inviterEmail }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && !invitations.length"
        class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-6 text-center text-sm text-slate-600"
      >
        Пока новых приглашений нет.
      </div>

      <div class="text-center text-xs text-slate-500">...</div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { humanizeError } from "~/utils/human-error";
definePageMeta({ layout: "default" });

type InvitationItem = {
  id: string;
  kind: "invite" | "request";
  projectName: string;
  projectDescription: string;
  inviterName: string;
  inviterEmail: string;
};

type InvitationApi = {
  id: string;
  kind?: "invite" | "request";
  projectName?: string | null;
  projectDescription?: string | null;
  invitedBy?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

const invitations = ref<InvitationItem[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const actionLoadingId = ref<string | null>(null);
const actionType = ref<"accept" | "decline" | null>(null);

const isActionLoading = (id: string, type: "accept" | "decline") =>
  actionLoadingId.value === id && actionType.value === type;

const mapInvitation = (invite: InvitationApi): InvitationItem => ({
  id: invite.id,
  kind: invite.kind === "request" ? "request" : "invite",
  projectName: invite.projectName?.trim() || "Без названия",
  projectDescription: invite.projectDescription?.trim() || "Без описания",
  inviterName: invite.invitedBy?.name?.trim() || "Неизвестно",
  inviterEmail: invite.invitedBy?.email?.trim() || "",
});

const getErrorMessage = (err: unknown, fallback: string) =>
  humanizeError(err, fallback);

const loadInvitations = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const result = await $fetch<InvitationApi[]>("/api/project", {
      query: { scope: "invites" },
    });
    invitations.value = result.map(mapInvitation);
  } catch (err) {
    invitations.value = [];
    errorMessage.value = getErrorMessage(
      err,
      "Не удалось загрузить приглашения.",
    );
  } finally {
    loading.value = false;
  }
};

const removeInvite = (id: string) => {
  invitations.value = invitations.value.filter((invite) => invite.id !== id);
};

const acceptInvite = async (invite: InvitationItem) => {
  if (actionLoadingId.value) return;
  actionLoadingId.value = invite.id;
  actionType.value = "accept";
  errorMessage.value = "";

  try {
    await $fetch("/api/project", {
      method: "POST",
      body: {
        action: invite.kind === "request" ? "approve_request" : "accept_invite",
        invitationId: invite.id,
      },
    });
    removeInvite(invite.id);
  } catch (err) {
    errorMessage.value = getErrorMessage(
      err,
      "Не удалось принять приглашение.",
    );
  } finally {
    actionLoadingId.value = null;
    actionType.value = null;
  }
};

const declineInvite = async (invite: InvitationItem) => {
  if (actionLoadingId.value) return;
  actionLoadingId.value = invite.id;
  actionType.value = "decline";
  errorMessage.value = "";

  try {
    await $fetch("/api/project", {
      method: "POST",
      body: {
        action: invite.kind === "request" ? "reject_request" : "decline_invite",
        invitationId: invite.id,
      },
    });
    removeInvite(invite.id);
  } catch (err) {
    errorMessage.value = getErrorMessage(
      err,
      "Не удалось отклонить приглашение.",
    );
  } finally {
    actionLoadingId.value = null;
    actionType.value = null;
  }
};

onMounted(() => {
  loadInvitations();
});
</script>
