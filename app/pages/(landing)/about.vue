<template>
  <section
    class="mx-1 rounded-[1.25rem] border border-sky-200/70 bg-white/80 p-2 shadow-xl shadow-sky-100/60 3xs:mx-2 3xs:rounded-[1.5rem] 3xs:p-3 2xs:mx-3 2xs:p-4 xs:mx-4 sm:mx-6 sm:rounded-[1.75rem] sm:p-6"
  >
    <!-- Заголовок -->
    <h1 :class="headingClass" class="text-center text-slate-900">
      Крутые, амбициозные и трудолюбивые
    </h1>

    <!-- Блок с ценностями -->
    <div
      class="mx-auto mt-2 w-full max-w-md rounded-[1rem] border border-sky-200/60 bg-white/90 p-2 shadow-lg shadow-sky-100/50 3xs:mt-3 3xs:rounded-[1.25rem] 3xs:p-3 sm:mt-4 sm:max-w-lg sm:rounded-[1.5rem] sm:p-5"
    >
      <ul class="space-y-1 3xs:space-y-2 sm:space-y-3">
        <li
          v-for="(item, idx) in values"
          :key="idx"
          class="flex items-start gap-2"
        >
          <!-- Кружок-маркер -->
          <span
            class="mt-0.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full border border-sky-300/80 bg-white 3xs:h-2.5 3xs:w-2.5 sm:h-3 sm:w-3"
            aria-hidden="true"
          />
          <span :class="textClass" class="text-slate-800">{{ item }}</span>
        </li>
      </ul>
    </div>

    <!-- Нижний текст -->
    <p :class="headingClass" class="mt-3 text-center text-slate-900 sm:mt-6">
      Приложение FullMaster позволит и тебе стать лучше!
    </p>
  </section>
</template>
<script setup lang="ts">
definePageMeta({ layout: "landing" });

const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const values = [
  "Мы упрощаем жизнь людей",
  "Не боимся использовать новое",
  "Готовы к трудностям и их вызовам",
];
</script>
