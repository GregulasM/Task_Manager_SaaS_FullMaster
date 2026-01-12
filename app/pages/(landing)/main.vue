<script setup lang="ts">
definePageMeta({ layout: "landing" });

// Огромный заголовок для зазывающих фраз
const heroHeadingClass =
  "text-xl 4xs:text-2xl 3xs:text-3xl 2xs:text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl font-black tracking-tight";

const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const subTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold";

const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 cursor-pointer text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Класс карточки с переливающимся градиентом
const cardClass =
  "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/80 to-blue-50/60 p-4 shadow-xl shadow-sky-200/30 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-300/40 hover:-translate-y-1 sm:rounded-3xl sm:p-6";

const cards = [
  {
    title: "Оптимизация ваших дел",
    body: "Собирайте задачи в одном месте и не теряйте фокус.",
  },
  {
    title: "Много проектов — одна платформа",
    body: "Держите личное и рабочее раздельно, но под рукой.",
  },
  {
    title: "Система Канбан — просто и понятно",
    body: "Перетаскивайте карточки и отслеживайте прогресс.",
  },
];

const sliders = [
  { title: "Эффективность в задачах", note: "*слайдер*" },
  {
    title: "Ваш профиль — ваш проект",
    note: "*слайдер* *gif-анимация при наведении*",
  },
  { title: "Коллективная и персональная работа", note: "*слайдер*" },
];

// Плавная прокрутка к секции
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
</script>

<template>
  <div>
    <!-- Секция 1: Hero — на весь экран -->
    <section
      class="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-16"
    >
      <!-- Огромный заголовок -->
      <h1
        :class="heroHeadingClass"
        class="bg-gradient-to-r from-slate-900 via-sky-700 to-blue-600 bg-clip-text text-center text-transparent"
      >
        FullMaster
      </h1>
      <p
        class="mt-2 text-center text-sm font-medium text-slate-600 xs:text-base sm:mt-4 sm:text-lg md:text-xl lg:text-2xl"
      >
        Менеджер задач для вашего удобства
      </p>

      <!-- Сетка карточек -->
      <div
        class="mt-8 grid w-full max-w-6xl grid-cols-1 gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3"
      >
        <div v-for="c in cards" :key="c.title" :class="cardClass">
          <!-- Переливающийся эффект -->
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style="transform: translateX(-100%); animation: shimmer 2s infinite"
          />

          <!-- Заголовок карточки -->
          <p :class="subTextClass" class="relative z-10 text-slate-800">
            {{ c.title }}
          </p>

          <!-- Контент карточки -->
          <div class="relative z-10 mt-3 sm:mt-4">
            <p :class="textClass" class="text-slate-600">
              {{ c.body }}
            </p>

            <!-- Плейсхолдер изображения -->
            <div
              class="mt-3 h-20 w-full rounded-xl bg-gradient-to-br from-sky-100/80 to-blue-100/60 sm:mt-4 sm:h-28 md:h-32"
            />
          </div>
        </div>
      </div>

      <!-- Кнопка "Что ещё?" -->
      <div class="mt-10 sm:mt-14">
        <button
          type="button"
          :class="btnClass"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 sm:gap-3 sm:px-8 sm:py-4"
          @click="scrollToSection('more')"
        >
          <span>Что еще?</span>
          <span aria-hidden="true" class="text-sky-600">↓</span>
        </button>
      </div>
    </section>

    <!-- Секция 2: Слайдеры + CTA — на весь экран -->
    <section
      id="more"
      class="relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-16"
    >
      <!-- Сетка слайдеров -->
      <div
        class="grid w-full max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
      >
        <div v-for="s in sliders" :key="s.title" :class="cardClass">
          <!-- Переливающийся эффект -->
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />

          <!-- Заголовок слайдера -->
          <p :class="subTextClass" class="relative z-10 text-slate-800">
            {{ s.title }}
          </p>

          <!-- Контейнер слайдера -->
          <div class="relative z-10 mt-3 sm:mt-4">
            <div
              class="relative h-24 w-full rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 sm:h-32 md:h-36"
            >
              <!-- Кнопка влево -->
              <button
                type="button"
                class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 shadow-md transition hover:bg-sky-50 cursor-pointer sm:left-3 sm:px-3 sm:py-1.5"
                aria-label="Назад"
              >
                <span :class="textClass" class="text-slate-600">←</span>
              </button>

              <!-- Кнопка вправо -->
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 shadow-md transition hover:bg-sky-50 cursor-pointer sm:right-3 sm:px-3 sm:py-1.5"
                aria-label="Вперед"
              >
                <span :class="textClass" class="text-slate-600">→</span>
              </button>

              <!-- Плейсхолдер контента слайдера -->
              <div
                class="flex h-full items-center justify-center px-10 text-center sm:px-14"
              >
                <p :class="textClass" class="text-slate-500">
                  {{ s.note }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA блок -->
      <div class="mt-10 text-center sm:mt-14">
        <p
          class="text-base font-medium text-slate-600 sm:text-lg md:text-xl lg:text-2xl"
        >
          Понравилось? Тогда регистрируйся и пользуйся!
        </p>

        <div class="mt-4 sm:mt-6">
          <NuxtLink
            to="/auth/register"
            :class="btnClass"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 sm:gap-3 sm:px-8 sm:py-4"
          >
            <span>Регистрируюсь!</span>
            <span aria-hidden="true" class="text-sky-600">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
