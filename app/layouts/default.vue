<template>
  <div class="relative min-h-[100dvh] overflow-x-hidden text-slate-900">
    <!-- Фон: градиент -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-100"
        aria-hidden="true"
      />
      <div
        class="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-sky-200/40 blur-2xl"
        aria-hidden="true"
      />
      <div
        class="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-blue-300/40 blur-2xl"
        aria-hidden="true"
      />
      <div
        class="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-sky-200/40 blur-2xl"
        aria-hidden="true"
      />
    </div>

    <!-- Navbar -->
    <header
      class="sticky top-0 z-30 border-b border-sky-200/70 bg-gradient-to-r from-white/95 via-sky-50/90 to-white/95 shadow-sm shadow-sky-100/40 backdrop-blur-md"
    >
      <nav
        class="flex w-full items-center justify-between gap-2 px-3 py-1.5 xs:px-4 md:gap-4 md:px-6 md:py-2"
      >
        <!-- Левая часть: Лого -->
        <div class="flex shrink-0 items-center">
          <NuxtLink
            to="/main"
            class="flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50/80 px-1.5 py-0.5 transition hover:-translate-y-0.5 hover:bg-sky-100/80 md:gap-2 md:px-3 md:py-1.5"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="h-4 w-4 text-sky-600 md:h-5 md:w-5"
            />
            <p :class="headingClass" class="text-sky-600">
              FullMaster<span class="hidden text-slate-900 md:inline"
                >: Task Manager</span
              >
            </p>
          </NuxtLink>
        </div>

        <!-- Центр: Навигация -->
        <div class="flex items-center gap-2 md:gap-4">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            :class="[btnClass, navActiveClass(item)]"
            class="flex items-center gap-1 px-2 md:gap-2 md:px-4"
          >
            <UIcon :name="item.icon" class="h-4 w-4 md:h-5 md:w-5" />
            <span class="hidden md:inline">{{ item.label }}</span>
            <span
              class="h-2 w-2 rounded-full border md:h-2.5 md:w-2.5"
              :class="navDotClass(item)"
            />
          </NuxtLink>
        </div>

        <!-- Правая часть: Пользователь и меню -->
        <div class="flex shrink-0 items-center gap-2 md:gap-3">
          <!-- Badge горящих задач -->
          <UBadge
            :class="hotTasksBadgeClass"
            class="hidden rounded-full border px-2 py-1 font-semibold xs:flex md:px-3"
            :ui="{ base: textClass }"
          >
            🔥 {{ hotTasks }}
          </UBadge>

          <!-- Выпадающее меню пользователя -->
          <UPopover
            v-if="isAuthenticated"
            mode="click"
            :ui="{
              content:
                'p-0 bg-transparent shadow-none ring-0 rounded-none ' +
                'data-[state=open]:animate-[scale-in_100ms_ease-out] ' +
                'data-[state=closed]:animate-[scale-out_100ms_ease-in] ' +
                'origin-(--reka-popover-content-transform-origin) ' +
                'focus:outline-none pointer-events-auto',
              arrow: 'hidden',
            }"
          >
            <button
              :class="btnClass"
              class="flex items-center gap-1 px-2 md:gap-2 md:px-3"
            >
              <UIcon
                name="i-heroicons-user-circle"
                class="h-4 w-4 text-sky-600 md:h-5 md:w-5"
              />
              <span class="hidden md:inline">{{ userName }}</span>
              <UIcon
                name="i-heroicons-chevron-down"
                class="h-3 w-3 md:h-4 md:w-4"
              />
            </button>

            <template #content>
              <div
                class="w-56 border border-sky-200/70 bg-white/95 p-2 shadow-xl shadow-sky-200/30 backdrop-blur-md"
              >
                <!-- Информация о пользователе -->
                <div
                  class="mb-2 rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2"
                >
                  <p :class="textClass" class="font-semibold text-slate-900">
                    {{ userName }}
                  </p>
                  <p :class="textClass" class="text-slate-500">
                    {{ userEmail }}
                  </p>
                </div>

                <!-- Пункты меню -->
                <div class="space-y-1">
                  <NuxtLink
                    to="/profile"
                    :class="btnClass"
                    class="flex w-full items-center gap-2 px-3 py-2"
                  >
                    <UIcon
                      name="i-heroicons-user-circle"
                      class="h-4 w-4 text-sky-600"
                    />
                    <span>Профиль</span>
                  </NuxtLink>

                  <button
                    :class="dangerBtnClass"
                    class="flex w-full items-center gap-2 px-3 py-2"
                    :disabled="logoutLoading"
                    @click="requestLogout"
                  >
                    <UIcon
                      v-if="!logoutLoading"
                      name="i-heroicons-arrow-right-on-rectangle"
                      class="h-4 w-4"
                    />
                    <UIcon
                      v-else
                      name="i-heroicons-arrow-path"
                      class="h-4 w-4 animate-spin"
                    />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            </template>
          </UPopover>

          <!-- Если не авторизован -->
          <template v-else>
            <NuxtLink
              to="/auth/login"
              :class="btnClass"
              class="flex items-center gap-1 px-2 md:gap-2 md:px-3"
            >
              <UIcon
                name="i-heroicons-arrow-right-on-rectangle"
                class="h-4 w-4 md:h-5 md:w-5"
              />
              <span class="hidden md:inline">Войти</span>
            </NuxtLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main content -->
    <main class="w-full px-3 py-4 xs:px-4 md:px-6 md:py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="w-full px-4 pb-6 sm:px-8 sm:pb-8">
      <p :class="textClass" class="text-center text-slate-500">
        {{ new Date().getFullYear() }} FullMaster
      </p>
    </footer>

    <!-- Confirm Logout Dialog -->
    <ConfirmDialog
      v-model="confirmLogoutOpen"
      title="Выйти из аккаунта?"
      description="Текущая сессия будет завершена, и потребуется повторный вход."
      confirm-text="Выйти"
      cancel-text="Остаться"
      :loading="logoutLoading"
      @confirm="confirmLogout"
    />
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

type NavItem = {
  label: string;
  to: string;
  icon: string;
  isActive: (path: string) => boolean;
};

const route = useRoute();
const user = ref<UserPublic | null>(null);
const hotTasks = ref(0);
const logoutLoading = ref(false);
const confirmLogoutOpen = ref(false);
const headerRefreshToken = useState<number>("header-refresh-token", () => 0);

// Навигация
const nav: NavItem[] = [
  {
    label: "Проекты",
    to: "/",
    icon: "i-heroicons-folder",
    isActive: (p) => p === "/",
  },
  {
    label: "Аналитика",
    to: "/profile/analytics",
    icon: "i-heroicons-chart-bar",
    isActive: (p) => p.startsWith("/profile/analytics"),
  },
];

const isActive = (item: NavItem) => item.isActive(route.path);

const navDotClass = (item: NavItem) =>
  isActive(item)
    ? "border-emerald-400 bg-emerald-400"
    : "border-sky-200 bg-white";

const navActiveClass = (item: NavItem) =>
  isActive(item) ? "bg-sky-100/80 border-sky-300" : "";

// Стандартизированные классы текста
const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Классы кнопок
const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const dangerBtnClass =
  "border-pink-200/60 bg-white border-pink-100 shadow-lg shadow-pink-100/70 -translate-y-0.5 rounded-full hover:bg-rose-400 active:bg-rose-500 border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Computed
const isAuthenticated = computed(() => Boolean(user.value?.id));
const userName = computed(() => user.value?.name || "Гость");
const userEmail = computed(() => user.value?.email || "");

const hotTasksBadgeClass = computed(() => {
  if (hotTasks.value <= 0) {
    return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }
  if (hotTasks.value <= 2) {
    return "border-amber-200 bg-amber-100 text-amber-800";
  }
  return "border-rose-200 bg-rose-100 text-rose-800";
});

// Methods
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
    await navigateTo("/main");
  } finally {
    logoutLoading.value = false;
  }
};

const requestLogout = () => {
  if (logoutLoading.value) return;
  confirmLogoutOpen.value = true;
};

const confirmLogout = async () => {
  await logout();
  confirmLogoutOpen.value = false;
};

// Lifecycle
onMounted(() => {
  refreshHeader();
});

watch(
  () => route.fullPath,
  () => {
    refreshHeader();
  },
);

watch(
  () => headerRefreshToken.value,
  () => {
    refreshHeader();
  },
);
</script>
