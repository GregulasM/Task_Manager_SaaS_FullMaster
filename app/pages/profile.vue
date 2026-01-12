<template>
  <div class="flex flex-col gap-4 md:flex-row md:gap-6">
    <!-- Sidebar Navigation -->
    <aside class="w-full md:w-64 md:basis-1/5 md:shrink-0">
      <div class="md:hidden">
        <div
          class="overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/80 to-blue-50/60 p-4 shadow-xl shadow-sky-200/30"
        >
          <UAccordion
            :items="profileAccordionItems"
            type="single"
            :model-value="profileAccordionOpen"
            @update:modelValue="handleAccordionUpdate"
            collapsible
            class="space-y-2 cursor-pointer"
          >
            <template #default>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p
                    :class="textClass"
                    class="uppercase tracking-widest text-slate-500"
                  >
                    Профиль
                  </p>
                  <h2 :class="headingClass" class="text-slate-900">Разделы</h2>
                </div>
                <span
                  :class="textClass"
                  class="rounded-full border border-sky-200 bg-sky-100/70 px-2 py-1 font-semibold text-sky-700"
                >
                  Навигация
                </span>
              </div>
            </template>

            <template #sections>
              <nav class="mt-4 space-y-2">
                <NuxtLink
                  v-for="item in navItems"
                  :key="item.to"
                  :to="item.to"
                  :class="[btnClass, navButtonClass(item)]"
                  class="flex w-full items-center justify-between gap-2 px-3 py-2.5"
                  @click="closeProfileAccordion"
                >
                  <div class="flex items-center gap-2">
                    <UIcon :name="item.icon" class="h-4 w-4 text-sky-600" />
                    <span>{{ item.label }}</span>
                  </div>
                  <span
                    class="h-2 w-2 rounded-full border"
                    :class="navDotClass(item)"
                  />
                </NuxtLink>
              </nav>
            </template>
          </UAccordion>
        </div>
      </div>

      <div
        class="hidden overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/80 to-blue-50/60 p-4 shadow-xl shadow-sky-200/30 md:block md:rounded-3xl md:p-5"
      >
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p
              :class="textClass"
              class="uppercase tracking-widest text-slate-500"
            >
              Профиль
            </p>
            <h2 :class="headingClass" class="text-slate-900">Разделы</h2>
          </div>
          <span
            :class="textClass"
            class="rounded-full border border-sky-200 bg-sky-100/70 px-2 py-1 font-semibold text-sky-700"
          >
            Навигация
          </span>
        </div>

        <!-- Navigation Items -->
        <nav class="space-y-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[btnClass, navButtonClass(item)]"
            class="flex w-full items-center justify-between gap-2 px-3 py-2.5"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="item.icon"
                class="h-4 w-4 text-sky-600 md:h-5 md:w-5"
              />
              <span class="hidden xs:inline">{{ item.label }}</span>
            </div>
            <span
              class="h-2 w-2 rounded-full border md:h-2.5 md:w-2.5"
              :class="navDotClass(item)"
            />
          </NuxtLink>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <section class="min-w-0 flex-1">
      <NuxtPage />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

type NavItem = {
  label: string;
  to: string;
  icon: string;
  isActive: (path: string) => boolean;
};

const route = useRoute();
const profileAccordionOpen = ref<string>("");

const navItems: NavItem[] = [
  {
    label: "Приглашения",
    to: "/profile",
    icon: "i-heroicons-envelope",
    isActive: (path) => path === "/profile" || path === "/profile/",
  },
  {
    label: "Аналитика",
    to: "/profile/analytics",
    icon: "i-heroicons-chart-bar",
    isActive: (path) => path.startsWith("/profile/analytics"),
  },
  {
    label: "Мои проекты",
    to: "/profile/my_projects",
    icon: "i-heroicons-briefcase",
    isActive: (path) => path.startsWith("/profile/my_projects"),
  },
];

const profileAccordionItems = [
  {
    label: "Разделы",
    value: "sections",
    slot: "sections",
  },
];

const isActive = (item: NavItem) => item.isActive(route.path);

const navButtonClass = (item: NavItem) =>
  isActive(item)
    ? "bg-sky-100/80 border-sky-300 shadow-lg shadow-sky-200/40"
    : "";

const navDotClass = (item: NavItem) =>
  isActive(item)
    ? "border-emerald-400 bg-emerald-400"
    : "border-sky-200 bg-white";

const closeProfileAccordion = () => {
  profileAccordionOpen.value = "";
};

const handleAccordionUpdate = (value: string | string[] | undefined) => {
  profileAccordionOpen.value = typeof value === "string" ? value : "";
};

// Стандартизированные классы текста
const headingClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";

const textClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

// Классы кнопок
const btnClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-md shadow-sky-100/50 rounded-full hover:bg-blue-400 active:bg-blue-500 border py-2 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 cursor-pointer text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

watch(
  () => route.fullPath,
  () => {
    closeProfileAccordion();
  },
);
</script>
