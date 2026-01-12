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
            Ваши приглашения
          </p>
          <h2
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-semibold text-slate-900"
          >
            Приглашения в проекты
          </h2>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <UBadge
            class="rounded-full border border-sky-200 bg-white text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-700"
          >
            {{ invitations.length }} шт.
          </UBadge>
          <UBadge
            v-if="loading"
            class="rounded-full border border-sky-200 bg-sky-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-900"
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
                  class="max-w-[32ch] truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-slate-900"
                  :title="invite.projectName"
                >
                  {{ invite.projectName }}
                </p>
                <UBadge
                  v-if="invite.kind === 'request'"
                  class="rounded-full border border-amber-200 bg-amber-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-[0.2em] text-amber-800"
                >
                  Желает войти
                </UBadge>
              </div>
              <p
                class="max-w-[32ch] truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
                :title="invite.projectDescription"
              >
                {{ invite.projectDescription }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 xl:shrink-0">
              <UButton
                :class="[baseButtonClass, primaryButtonClass]"
                variant="ghost"
                color="neutral"
                icon="i-heroicons-check-circle"
                leading
                :loading="isActionLoading(invite.id, 'accept')"
                :disabled="loading || Boolean(actionLoadingId)"
                @click="acceptInvite(invite)"
              >
                Принять
              </UButton>
              <UButton
                :class="[baseButtonClass, dangerButtonClass]"
                variant="ghost"
                color="neutral"
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
              <div
                class="min-w-0 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 leading-snug text-slate-600"
              >
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
        class="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-6 text-center text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-600"
      >
        Пока новых приглашений нет.
      </div>

      <div
        class="text-center text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-slate-500"
      >
        ...
      </div>
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

const bodyTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const baseButtonClass = `rounded-full border cursor-pointer py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 ${bodyTextClass}`;

const primaryButtonClass =
  "border-sky-200/60 border-sky-100 bg-white shadow-lg shadow-sky-100/70 -translate-y-0.5 hover:bg-blue-400 active:bg-blue-500 cursor-pointer";

const dangerButtonClass =
  "border-pink-200/60 border-pink-100 bg-white shadow-lg shadow-pink-100/70 -translate-y-0.5 hover:bg-rose-400 active:bg-rose-500 cursor-pointer";

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
