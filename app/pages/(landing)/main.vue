<script setup lang="ts">
definePageMeta({ layout: "landing" });

// Огромный заголовок для зазывающих фраз
const heroHeadingClass =
  "text-xl 4xs:text-2xl 3xs:text-3xl 2xs:text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl font-black tracking-tight";

const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[8px] 4xs:text-[9px] 3xs:text-[10px] 2xs:text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-2xl";

const subTextClass =
  "text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-2xl font-semibold";

const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 cursor-pointer text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Класс карточки с переливающимся градиентом
const cardClass =
  "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/80 to-blue-50/60 p-6 shadow-xl shadow-sky-200/30 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-300/40 hover:-translate-y-1 sm:rounded-3xl sm:p-8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const cards = [
  {
    title: "Оптимизация ваших дел",
    body: "Собирайте задачи в одном месте и не теряйте фокус.",
    image: "/Tasks.png",
    description: "Собирайте задачи в одном месте и не теряйте фокус.",
  },
  {
    title: "Много проектов — одна платформа",
    body: "Держите личное и рабочее раздельно, но под рукой.",
    image: "/Projects.png",
    description: "Держите личное и рабочее раздельно, но под рукой.",
  },
  {
    title: "Система Канбан — просто и понятно",
    body: "Перетаскивайте карточки и отслеживайте прогресс.",
    image: "/Kanban.png",
    description: "Перетаскивайте карточки и отслеживайте прогресс.",
  },
];

const sliders = [
  {
    title: "Эффективность в задачах",
    image: "/MoreTask.png",
    description:
      "Ставьте приоритеты, контролируйте сроки и завершайте задачи без перегрузки.",
  },
  {
    title: "Ваш профиль — ваш проект",
    image: "/MyProjects.png",
    description:
      "Настраивайте рабочее пространство под себя: роли, цели и структуру проектов.",
  },
  {
    title: "Коллективная и персональная работа",
    image: "/Members.png",
    description:
      "Работайте в команде и ведите личные дела параллельно, не смешивая контексты.",
  },
];

// Плавная прокрутка к секции
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const activeCard = ref<{
  title: string;
  image: string;
  description?: string;
} | null>(null);

const openCard = (card: {
  title: string;
  image: string;
  description?: string;
}) => {
  activeCard.value = card;
};

const closeCard = () => {
  activeCard.value = null;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && activeCard.value) {
    closeCard();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
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
        <div
          v-for="c in cards"
          :key="c.title"
          :class="cardClass"
          role="button"
          tabindex="0"
          @click="
            openCard({
              title: c.title,
              image: c.image,
              description: c.description,
            })
          "
          @keydown.enter="
            openCard({
              title: c.title,
              image: c.image,
              description: c.description,
            })
          "
          @keydown.space.prevent="
            openCard({
              title: c.title,
              image: c.image,
              description: c.description,
            })
          "
        >
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

            <img
              :src="c.image"
              :alt="c.title"
              class="mt-4 h-28 w-full rounded-2xl object-cover sm:mt-5 sm:h-36 md:h-44"
              loading="lazy"
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
        <div
          v-for="s in sliders"
          :key="s.title"
          :class="cardClass"
          role="button"
          tabindex="0"
          @click="
            openCard({
              title: s.title,
              image: s.image,
              description: s.description,
            })
          "
          @keydown.enter="
            openCard({
              title: s.title,
              image: s.image,
              description: s.description,
            })
          "
          @keydown.space.prevent="
            openCard({
              title: s.title,
              image: s.image,
              description: s.description,
            })
          "
        >
          <!-- Переливающийся эффект -->
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />

          <!-- Заголовок слайдера -->
          <p :class="subTextClass" class="relative z-10 text-slate-800">
            {{ s.title }}
          </p>

          <!-- Контейнер изображения -->
          <div class="relative z-10 mt-3 sm:mt-4">
            <img
              :src="s.image"
              :alt="s.title"
              class="h-28 w-full rounded-2xl object-cover sm:h-36 md:h-44"
              loading="lazy"
            />
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

    <Teleport to="body">
      <!-- Модальное окно изображения -->
      <Transition name="modal">
        <div
          v-if="activeCard"
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          @click="closeCard"
        >
          <div
            class="modal-panel relative w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            @click.stop
          >
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-sky-400 cursor-pointer"
              @click="closeCard"
            >
              Закрыть
            </button>

            <div class="space-y-4 sm:space-y-6">
              <h3
                class="text-lg font-semibold text-slate-900 sm:text-xl md:text-2xl"
              >
                {{ activeCard.title }}
              </h3>
              <img
                :src="activeCard.image"
                :alt="activeCard.title"
                class="max-h-[70vh] w-full rounded-2xl object-contain"
              />
              <p
                v-if="activeCard.description"
                class="text-sm text-slate-600 sm:text-base md:text-lg"
              >
                {{ activeCard.description }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel {
  animation: modal-pop 220ms ease;
}

.modal-leave-active .modal-panel {
  animation: modal-pop-out 160ms ease;
}

@keyframes modal-pop {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-pop-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
}
</style>
