<template>
  <UContainer>
    <div class="flex flex-col gap-6 lg:flex-row">
      <aside class="basis-2/8 space-y-4">
        <UCard class="rounded-[28px] border border-sky-200 bg-white/90">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-600">
                  Профиль
                </p>
                <h2 class="text-lg font-semibold text-slate-900">Разделы</h2>
              </div>
              <UBadge
                class="rounded-full border border-sky-200 bg-sky-100 text-xs font-semibold text-slate-900"
              >
                Навигация
              </UBadge>
            </div>
          </template>

          <div class="space-y-2">
            <UButton
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              block
              class="h-auto justify-between rounded-2xl border border-transparent px-4 py-3 text-left transition"
              :class="navButtonClass(item)"
            >
              <div class="flex items-center gap-3">
                <UIcon :name="item.icon" class="h-4 w-4 text-sky-600" />
                <span class="text-sm font-semibold text-slate-900">
                  {{ item.label }}
                </span>
              </div>
              <span
                class="ml-auto h-2.5 w-2.5 rounded-full border"
                :class="navDotClass(item)"
              />
            </UButton>
          </div>
        </UCard>
      </aside>

      <section class="basis-6/8 lg:flex-1 lg:min-w-0">
        <NuxtPage />
      </section>
    </div>
  </UContainer>
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

const isActive = (item: NavItem) => item.isActive(route.path);

const navButtonClass = (item: NavItem) =>
  isActive(item)
    ? "border-sky-200 bg-sky-100/70 shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
    : "hover:border-sky-200 hover:bg-sky-50";

const navDotClass = (item: NavItem) =>
  isActive(item)
    ? "border-emerald-400 bg-emerald-400"
    : "border-sky-200 bg-white";
</script>
