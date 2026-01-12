<script setup lang="ts">
definePageMeta({ layout: "landing" });

const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const subTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold";

const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-1.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

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
</script>

<template>
  <div class="space-y-2 3xs:space-y-3 sm:space-y-4">
    <!-- Верхний блок: заголовок + 3 карточки фич -->
    <section
      class="mx-1 rounded-[1.25rem] border border-sky-200/70 bg-white/80 p-2 shadow-xl shadow-sky-100/60 3xs:mx-2 3xs:rounded-[1.5rem] 3xs:p-3 2xs:mx-3 2xs:p-4 xs:mx-4 sm:mx-6 sm:rounded-[1.75rem] sm:p-6"
    >
      <!-- Заголовок -->
      <h1 :class="headingClass" class="text-center text-slate-900">
        FullMaster — менеджер задач для вашего удобства
      </h1>

      <!-- Сетка карточек -->
      <div
        class="mt-2 grid grid-cols-1 gap-2 3xs:mt-3 3xs:gap-2 xs:grid-cols-3 xs:gap-3 sm:mt-4 sm:gap-4"
      >
        <div
          v-for="c in cards"
          :key="c.title"
          class="min-w-0 rounded-[1rem] border border-sky-200/60 bg-white/90 p-2 shadow-lg shadow-sky-100/50 3xs:rounded-[1.25rem] 3xs:p-3 sm:rounded-[1.5rem] sm:p-4"
        >
          <!-- Заголовок карточки -->
          <p :class="subTextClass" class="text-center text-slate-800">
            {{ c.title }}
          </p>

          <!-- Контент карточки -->
          <div
            class="mt-2 rounded-[0.75rem] border border-dashed border-sky-200/70 bg-gradient-to-br from-white/80 via-sky-50/60 to-blue-50/60 p-1.5 3xs:rounded-[1rem] 3xs:p-2 sm:rounded-[1.25rem]"
          >
            <p :class="textClass" class="text-slate-600">
              {{ c.body }}
            </p>

            <!-- Плейсхолдер изображения -->
            <div
              class="mt-1.5 h-12 w-full rounded-[0.6rem] border border-sky-200/60 bg-white/70 shadow-inner shadow-sky-100/50 3xs:mt-2 3xs:h-14 3xs:rounded-[0.75rem] sm:h-20 sm:rounded-[1rem]"
            />
          </div>
        </div>
      </div>

      <!-- Кнопка "Что ещё?" -->
      <div class="mt-3 flex justify-center sm:mt-5">
        <a
          href="#more"
          :class="btnClass"
          class="inline-flex items-center justify-center gap-1 px-3 3xs:gap-2 3xs:px-4 sm:px-6"
        >
          <span>Что еще?</span>
          <span aria-hidden="true" class="text-sky-600">↓</span>
        </a>
      </div>
    </section>

    <!-- Нижний блок: слайдеры + CTA -->
    <section
      id="more"
      class="mx-1 scroll-mt-12 rounded-[1.25rem] border border-sky-200/70 bg-white/75 p-2 shadow-xl shadow-sky-100/50 3xs:mx-2 3xs:rounded-[1.5rem] 3xs:p-3 2xs:mx-3 2xs:p-4 xs:mx-4 sm:mx-6 sm:rounded-[1.75rem] sm:p-6"
    >
      <!-- Сетка слайдеров -->
      <div
        class="grid grid-cols-1 gap-2 3xs:gap-2 xs:grid-cols-3 xs:gap-3 sm:gap-4"
      >
        <div
          v-for="s in sliders"
          :key="s.title"
          class="min-w-0 rounded-[1rem] border border-sky-200/60 bg-white/90 p-2 shadow-lg shadow-sky-100/50 3xs:rounded-[1.25rem] 3xs:p-3 sm:rounded-[1.5rem] sm:p-4"
        >
          <!-- Заголовок слайдера -->
          <p :class="subTextClass" class="text-center text-slate-800">
            {{ s.title }}
          </p>

          <!-- Контейнер слайдера -->
          <div
            class="mt-2 rounded-[0.75rem] border border-sky-200/60 bg-white/80 p-1.5 3xs:rounded-[1rem] 3xs:p-2 sm:rounded-[1.25rem]"
          >
            <div
              class="relative h-12 w-full rounded-[0.6rem] border border-sky-200/60 bg-gradient-to-br from-white/80 via-sky-50/60 to-blue-50/60 3xs:h-14 3xs:rounded-[0.75rem] sm:h-20 sm:rounded-[1rem]"
            >
              <!-- Кнопка влево -->
              <button
                type="button"
                class="absolute left-1 top-1/2 -translate-y-1/2 rounded-full border border-sky-200/70 bg-white/90 px-1 py-0.5 shadow-sm shadow-sky-100/50 transition hover:bg-sky-50 3xs:left-1.5 3xs:px-1.5 3xs:py-1 sm:left-2 sm:px-2"
                aria-label="Назад"
              >
                <span :class="textClass" class="text-slate-600">←</span>
              </button>

              <!-- Кнопка вправо -->
              <button
                type="button"
                class="absolute right-1 top-1/2 -translate-y-1/2 rounded-full border border-sky-200/70 bg-white/90 px-1 py-0.5 shadow-sm shadow-sky-100/50 transition hover:bg-sky-50 3xs:right-1.5 3xs:px-1.5 3xs:py-1 sm:right-2 sm:px-2"
                aria-label="Вперед"
              >
                <span :class="textClass" class="text-slate-600">→</span>
              </button>

              <!-- Плейсхолдер контента слайдера -->
              <div
                class="flex h-full items-center justify-center px-6 text-center 3xs:px-8 sm:px-10"
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
      <div class="mt-3 text-center sm:mt-5">
        <p :class="textClass" class="text-slate-600">
          Понравилось? Тогда регистрируйся и пользуйся!
        </p>

        <div class="mt-2 flex justify-center 3xs:mt-3">
          <NuxtLink
            to="/auth/register"
            :class="btnClass"
            class="inline-flex items-center justify-center gap-1 px-4 3xs:gap-2 3xs:px-5 sm:px-6"
          >
            <span>Регистрируюсь!</span>
            <span aria-hidden="true" class="text-sky-600">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
