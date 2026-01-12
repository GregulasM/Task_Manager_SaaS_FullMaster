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
        Крутые, амбициозные
      </h1>
      <h2
        :class="heroHeadingClass"
        class="bg-gradient-to-r from-blue-600 via-sky-600 to-slate-800 bg-clip-text text-center text-transparent"
      >
        и трудолюбивые
      </h2>

      <!-- Блок с ценностями -->
      <div class="mt-10 w-full max-w-3xl sm:mt-14">
        <div class="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div v-for="(item, idx) in values" :key="idx" :class="cardClass">
            <!-- Переливающийся эффект -->
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style="
                transform: translateX(-100%);
                animation: shimmer 2s infinite;
              "
            />

            <!-- Иконка -->
            <div
              class="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 sm:h-16 sm:w-16"
            >
              <UIcon
                :name="item.icon"
                class="h-6 w-6 text-sky-600 sm:h-8 sm:w-8"
              />
            </div>

            <!-- Текст ценности -->
            <p
              :class="subTextClass"
              class="relative z-10 mt-4 text-center text-slate-800 sm:mt-5"
            >
              {{ item.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- Кнопка вниз -->
      <div class="mt-10 sm:mt-14">
        <button
          type="button"
          :class="btnClass"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 sm:gap-3 sm:px-8 sm:py-4"
          @click="scrollToSection('mission')"
        >
          <span>Наша миссия</span>
          <span aria-hidden="true" class="text-sky-600">↓</span>
        </button>
      </div>
    </section>

    <!-- Секция 2: Миссия — на весь экран -->
    <section
      id="mission"
      class="relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-16"
    >
      <!-- Огромный заголовок -->
      <h2
        :class="heroHeadingClass"
        class="bg-gradient-to-r from-sky-600 via-blue-600 to-slate-800 bg-clip-text text-center text-transparent"
      >
        Приложение FullMaster
      </h2>
      <p
        class="mt-2 text-center text-sm font-medium text-slate-600 xs:text-base sm:mt-4 sm:text-lg md:text-xl lg:text-2xl"
      >
        позволит и тебе стать лучше!
      </p>

      <!-- Блок с преимуществами -->
      <div class="mt-10 w-full max-w-4xl sm:mt-14">
        <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div v-for="(benefit, idx) in benefits" :key="idx" :class="cardClass">
            <!-- Переливающийся эффект -->
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />

            <!-- Заголовок -->
            <p :class="subTextClass" class="relative z-10 text-slate-800">
              {{ benefit.title }}
            </p>

            <!-- Описание -->
            <p
              :class="textClass"
              class="relative z-10 mt-2 text-slate-600 sm:mt-3"
            >
              {{ benefit.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA блок -->
      <div class="mt-10 text-center sm:mt-14">
        <p
          class="text-base font-medium text-slate-600 sm:text-lg md:text-xl lg:text-2xl"
        >
          Присоединяйся к нам!
        </p>

        <div class="mt-4 sm:mt-6">
          <NuxtLink
            to="/auth/register"
            :class="btnClass"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 sm:gap-3 sm:px-8 sm:py-4"
          >
            <span>Начать сейчас</span>
            <span aria-hidden="true" class="text-sky-600">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "landing" });

// Огромный заголовок для зазывающих фраз
const heroHeadingClass =
  "text-xl 4xs:text-2xl 3xs:text-3xl 2xs:text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl font-black tracking-tight";

const subTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 cursor-pointer text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Класс карточки с переливающимся градиентом
const cardClass =
  "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/80 to-blue-50/60 p-4 shadow-xl shadow-sky-200/30 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-300/40 hover:-translate-y-1 sm:rounded-3xl sm:p-6";

// Плавная прокрутка к секции
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const values = [
  {
    text: "Мы упрощаем жизнь людей",
    icon: "i-heroicons-heart",
  },
  {
    text: "Не боимся использовать новое",
    icon: "i-heroicons-rocket-launch",
  },
  {
    text: "Готовы к трудностям и их вызовам",
    icon: "i-heroicons-fire",
  },
];

const benefits = [
  {
    title: "Простота использования",
    description:
      "Интуитивный интерфейс, который не требует обучения. Начните работать сразу.",
  },
  {
    title: "Гибкость задач",
    description:
      "Адаптируйте деятельность под свои нужды. Создавайте проекты, доски и задачи.",
  },
  {
    title: "Командная работа",
    description: "Приглашайте коллег и работайте вместе над общими проектами.",
  },
  {
    title: "Всегда под рукой",
    description:
      "Доступ с любого устройства. Ваши задачи синхронизируются автоматически.",
  },
];
</script>

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
