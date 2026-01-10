<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-40">
      <UContainer class="py-2">
        <div
          class="rounded-[32px] border border-sky-200 bg-white/90 px-6 py-2 shadow-[0_5px_10px_rgba(59,130,246,0.12)]"
        >
          <div class="lg:hidden">
            <UCollapsible v-model:open="mobileMenuOpen">
              <template #default="{ open }">
                <div class="flex items-center justify-between gap-3">
                  <div
                    class="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
                  >
                    <UIcon
                      name="i-heroicons-sparkles"
                      class="h-4 w-4 text-sky-600"
                    />
                    <p class="text-sky-600 font-bold">
                      FullMaster: <span class="text-black">Task Manager</span>
                    </p>
                  </div>
                  <UButton
                    variant="outline"
                    class="rounded-full border-sky-200 bg-white text-slate-900"
                    :icon="
                      open
                        ? 'i-heroicons-chevron-up'
                        : 'i-heroicons-chevron-down'
                    "
                    aria-label="Открыть меню"
                  />
                </div>
              </template>

              <template #content>
                <div class="mt-4 space-y-4">
                  <div class="flex flex-col gap-2">
                    <UButton
                      to="/"
                      variant="outline"
                      class="w-full rounded-full border-sky-200 bg-white text-slate-900"
                      :class="navClass(isHome)"
                      icon="i-heroicons-home"
                      leading
                    >
                      Главная
                    </UButton>
                    <UButton
                      to="/analytics"
                      variant="outline"
                      class="w-full rounded-full border-sky-200 bg-white text-slate-900"
                      :class="navClass(isAnalytics)"
                      icon="i-heroicons-chart-bar"
                      leading
                    >
                      Аналитика
                    </UButton>
                  </div>

                  <div class="flex flex-col gap-3 items-center justify-between">
                    <div
                      class="flex items-center w-full gap-3 rounded-full border border-sky-200 bg-sky-50/70 px-4 py-2"
                    >
                      <UAvatar
                        size="lg"
                        :text="userInitials"
                        class="bg-white"
                      />
                      <div class="text-xs leading-snug">
                        <p class="font-semibold text-slate-900">
                          {{ userName }}
                        </p>
                        <p class="text-slate-600">
                          {{ userEmail }}
                        </p>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                      <UBadge
                        :class="hotTasksBadgeClass"
                        class="rounded-full border px-3 py-1 text-xs font-semibold"
                      >
                        {{ hotTasksLabel }}
                      </UBadge>
                      <UButton
                        v-if="isAuthenticated"
                        to="/profile"
                        variant="outline"
                        class="rounded-full border-sky-200 bg-white text-slate-900"
                        icon="i-heroicons-user-circle"
                        leading
                      >
                        Профиль
                      </UButton>
                      <UButton
                        v-if="isAuthenticated"
                        variant="solid"
                        class="rounded-full bg-sky-200 text-slate-900"
                        icon="i-heroicons-arrow-right-on-rectangle"
                        :loading="logoutLoading"
                        leading
                        @click="logout"
                      >
                        Выйти
                      </UButton>
                      <UButton
                        v-else
                        to="/auth/login"
                        variant="solid"
                        class="rounded-full bg-sky-200 text-slate-900"
                        icon="i-heroicons-arrow-right-on-rectangle"
                        leading
                      >
                        Войти
                      </UButton>
                    </div>
                  </div>
                </div>
              </template>
            </UCollapsible>
          </div>

          <div
            class="hidden lg:flex lg:flex-col lg:gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div class="flex flex-wrap items-center gap-3">
                <div
                  class="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
                >
                  <UIcon
                    name="i-heroicons-sparkles"
                    class="h-4 w-4 text-sky-600"
                  />
                  <p class="text-sky-600 font-bold">
                    FullMaster: <span class="text-black">Task Manager</span>
                  </p>
                </div>
              </div>

              <div class="flex flex-row items-center gap-2">
                <UButton
                  to="/"
                  variant="outline"
                  class="rounded-full flex-1 border-sky-200 bg-white text-slate-900"
                  :class="navClass(isHome)"
                  icon="i-heroicons-home"
                  leading
                >
                  Главная
                </UButton>
                <UButton
                  to="/analytics"
                  variant="outline"
                  class="rounded-full flex-1 border-sky-200 bg-white text-slate-900"
                  :class="navClass(isAnalytics)"
                  icon="i-heroicons-chart-bar"
                  leading
                >
                  Аналитика
                </UButton>
              </div>
            </div>

            <div
              class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end"
            >
              <div class="flex flex-col items-center gap-2">
                <div
                  class="flex items-center w-full gap-3 rounded-full border border-sky-200 bg-sky-50/70 px-4 py-2"
                >
                  <UAvatar size="lg" :text="userInitials" class="bg-white" />
                  <div class="text-xs leading-snug">
                    <p class="font-semibold text-slate-900">
                      {{ userName }}
                    </p>
                    <p class="text-slate-600">
                      {{ userEmail }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <UBadge
                    :class="hotTasksBadgeClass"
                    class="rounded-full border px-3 py-1 text-xs font-semibold"
                  >
                    {{ hotTasksLabel }}
                  </UBadge>

                  <UButton
                    v-if="isAuthenticated"
                    to="/profile"
                    variant="outline"
                    class="rounded-full border-sky-200 bg-white text-slate-900"
                    icon="i-heroicons-user-circle"
                    leading
                  >
                    Профиль
                  </UButton>
                  <UButton
                    v-if="isAuthenticated"
                    variant="solid"
                    class="rounded-full bg-sky-200 text-slate-900"
                    icon="i-heroicons-arrow-right-on-rectangle"
                    :loading="logoutLoading"
                    leading
                    @click="logout"
                  >
                    Выйти
                  </UButton>
                  <UButton
                    v-else
                    to="/auth/login"
                    variant="solid"
                    class="rounded-full bg-sky-200 text-slate-900"
                    icon="i-heroicons-arrow-right-on-rectangle"
                    leading
                  >
                    Войти
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </header>

    <UMain class="px-4 pb-4 pt-4">
      <slot />
    </UMain>
  </div>
</template>

<script setup lang="ts">
type UserPublic = {
  id: string;
  name: string;
  email: string;
};

type ProjectSummary = {
  id: string;
  hotTasksCount?: number;
};

const route = useRoute();
const user = ref<UserPublic | null>(null);
const hotTasks = ref(0);
const logoutLoading = ref(false);
const mobileMenuOpen = ref(false);
const headerRefreshToken = useState<number>("header-refresh-token", () => 0);

const isHome = computed(() => route.path === "/");
const isAnalytics = computed(
  () => route.path === "/analytics" || route.path.startsWith("/analytics/"),
);

const isAuthenticated = computed(() => Boolean(user.value?.id));

const userName = computed(() => user.value?.name || "Гость");
const userEmail = computed(
  () => user.value?.email || "Для входа используйте кнопку",
);

const userInitials = computed(() => {
  if (user.value?.name) return user.value.name;
  if (user.value?.email) return user.value.email;
  return "Г";
});

const hotTasksLabel = computed(() => `${hotTasks.value} задач горит`);
const hotTasksBadgeClass = computed(() => {
  if (hotTasks.value <= 0) {
    return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }
  if (hotTasks.value <= 2) {
    return "border-amber-200 bg-amber-100 text-amber-800";
  }
  return "border-rose-200 bg-rose-100 text-rose-800";
});

const navClass = (active: boolean) =>
  active
    ? "bg-sky-100 border-sky-300 shadow-[0_10px_20px_rgba(59,130,246,0.2)]"
    : "hover:bg-sky-50";

const fetchUser = async () => {
  try {
    user.value = await $fetch<UserPublic>("/api/user", {
      query: { me: "1" },
    });
  } catch {
    user.value = null;
  }
};

const fetchHotTasks = async () => {
  if (!user.value) {
    hotTasks.value = 0;
    return;
  }

  try {
    const projects = await $fetch<ProjectSummary[]>("/api/project", {
      query: { scope: "my" },
    });
    hotTasks.value = projects.reduce(
      (sum, project) => sum + (project.hotTasksCount ?? 0),
      0,
    );
  } catch {
    hotTasks.value = 0;
  }
};

const refreshHeader = async () => {
  await fetchUser();
  await fetchHotTasks();
};

const logout = async () => {
  if (logoutLoading.value) return;
  logoutLoading.value = true;

  try {
    await $fetch("/api/user", {
      method: "POST",
      body: { action: "logout" },
    });
    user.value = null;
    hotTasks.value = 0;
    await navigateTo("/auth/login");
  } finally {
    logoutLoading.value = false;
  }
};

onMounted(() => {
  refreshHeader();
});

watch(
  () => route.fullPath,
  () => {
    refreshHeader();
    mobileMenuOpen.value = false;
  },
);

watch(
  () => headerRefreshToken.value,
  () => {
    refreshHeader();
  },
);
</script>
