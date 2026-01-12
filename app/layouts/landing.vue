<template>
  <div class="relative min-h-[100dvh] overflow-x-hidden text-slate-900">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <!-- Базовый градиент -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-100"
        aria-hidden="true"
      />

      <!-- Большие размытые круги — более насыщенные цвета -->
      <div
        class="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-sky-300 blur-2xl"
        aria-hidden="true"
      />
      <div
        class="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-blue-400 blur-2xl"
        aria-hidden="true"
      />
      <div
        class="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-sky-300 blur-2xl"
        aria-hidden="true"
      />

      <!-- Средние акцентные круги -->
      <div
        class="absolute left-1/2 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-300 blur-2xl"
        aria-hidden="true"
      />
      <div
        class="absolute bottom-1/3 left-20 h-48 w-48 rounded-full bg-sky-200 blur-xl"
        aria-hidden="true"
      />

      <!-- Геометрические формы — более заметные -->
      <div
        class="absolute left-1/4 top-1/3 h-34 w-24 rotate-20 rounded-2xl bg-sky-100 shadow-lg shadow-sky-200/50 blur-xs"
        aria-hidden="true"
      >
        <p class="text-center text-3xs py-2 px-2">Срочно!</p>
      </div>
      <div
        class="absolute right-1/4 top-1/3 h-24 w-24 rotate-45 rounded-2xl bg-sky-100 shadow-lg shadow-sky-200/50 blur-xs"
        aria-hidden="true"
      >
        <p class="text-center text-3xs py-2 px-2">На завтра</p>
      </div>

      <div
        class="absolute bottom-1/4 left-1/3 h-16 w-36 -rotate-12 rounded-full bg-blue-100 shadow-md shadow-blue-200/40 blur-xs"
        aria-hidden="true"
      >
        <p class="text-center text-3xs py-2">Список дел:</p>
      </div>
      <div
        class="absolute right-16 bottom-20 h-14 w-14 rotate-12 rounded-xl bg-sky-200 shadow-md shadow-sky-300/40 blur-xs"
        aria-hidden="true"
      />

      <!-- Дополнительные летающие задачи -->
      <div
        class="absolute right-4/5 top-24 h-20 w-28 -rotate-6 rounded-2xl bg-blue-50 shadow-lg shadow-blue-200/50 blur-xs"
        aria-hidden="true"
      >
        <p class="px-2 py-3 text-center text-3xs">Позвонить</p>
      </div>
      <div
        class="absolute bottom-16 left-12 h-18 w-22 rotate-8 rounded-xl bg-sky-50 shadow-md shadow-sky-200/40 blur-xs"
        aria-hidden="true"
      >
        <p class="px-2 py-2 text-center text-3xs">Купить</p>
      </div>
      <div
        class="absolute bottom-1/2 right-8 h-16 w-20 -rotate-15 rounded-2xl bg-blue-100 shadow-md shadow-blue-300/40 blur-xs"
        aria-hidden="true"
      >
        <p class="px-2 py-2 text-center text-3xs">Идея!</p>
      </div>
    </div>

    <!-- Navbar -->
    <header
      class="sticky top-0 z-30 border-b border-sky-200/70 bg-gradient-to-r from-white/95 via-sky-50/90 to-white/95 shadow-sm shadow-sky-100/40 backdrop-blur-md"
    >
      <nav
        class="mx-auto flex max-w-5xl items-center justify-center gap-2 px-1 py-1.5 3xs:gap-1 3xs:px-1 2xs:px-3 xs:px-4 sm:gap-4 sm:px-6 sm:py-2"
      >
        <div class="flex w-full justify-center">
          <!-- Левая часть: Лого -->
          <div class="flex items-center gap-1 3xs:gap-1 sm:gap-3">
            <NuxtLink
              to="/main"
              class="flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50/80 px-1.5 py-0.5 transition hover:-translate-y-0.5 hover:bg-sky-100/80 3xs:gap-1.5 3xs:px-2 3xs:py-1 sm:gap-2 sm:px-3 sm:py-1.5"
            >
              <UIcon
                name="i-heroicons-sparkles"
                class="h-2.5 w-2.5 text-sky-600 3xs:h-3 3xs:w-3 sm:h-4 sm:w-4"
              />
              <p :class="headingClass" class="text-sky-600">
                FullMaster: <span class="text-slate-900">Task Manager</span>
              </p>
            </NuxtLink>
          </div>
        </div>

        <div class="flex w-full justify-center">
          <!-- Центр: Навигация -->
          <div class="flex items-center gap-1 3xs:gap-1 sm:gap-3">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              :class="btnClass"
              class="flex items-center gap-0.5 px-2 3xs:gap-1 3xs:px-2.5 sm:px-3"
            >
              <span>{{ item.label }}</span>
              <!-- Индикация (точка) -->
              <span
                class="ml-auto h-2.5 w-2.5 rounded-full border"
                :class="navDotClass(item)"
              />
            </NuxtLink>
          </div>
        </div>

        <div class="flex w-full justify-center">
          <!-- Правая часть: Auth кнопки -->
          <div class="flex items-center gap-1 3xs:gap-1 sm:gap-3">
            <NuxtLink
              to="/auth/login"
              :class="btnClass"
              class="px-2 3xs:px-2.5 sm:px-3"
            >
              Войти
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              :class="btnClass"
              class="px-2 3xs:px-2.5 sm:px-3"
            >
              Регистрация
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Page wrapper (без боковых отступов - контент сам решает) -->
    <main class="mx-auto w-full max-w-5xl py-2 sm:py-4">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mx-auto w-full max-w-5xl px-2 pb-4 3xs:px-3 xs:px-4 sm:px-6">
      <p :class="textClass" class="text-center text-slate-500">
        {{ new Date().getFullYear() }} FullMaster
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
type NavItem = {
  label: string;
  to: string;
  isActive: (path: string) => boolean;
};

const route = useRoute();

const nav: NavItem[] = [
  {
    label: "Главная",
    to: "/main",
    isActive: (p) => p === "/main" || p === "/",
  },
  { label: "О нас", to: "/about", isActive: (p) => p === "/about" },
];

const isActive = (item: NavItem) => item.isActive(route.path);

const navDotClass = (item: NavItem) =>
  isActive(item)
    ? "border-emerald-400 bg-emerald-400"
    : "border-sky-200 bg-white";

// Стандартизированные классы текста
const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Классы кнопок - эталон из login.vue
const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";
</script>
