<template>
  <section
    class="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 text-slate-900"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/40 via-transparent to-white/20"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-sky-300/60 blur-2xl"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-blue-400/40 blur-2xl"
      aria-hidden="true"
    ></div>

    <UContainer
      class="relative flex min-h-screen items-center justify-center px-4 py-14"
    >
      <div class="w-full max-w-lg">
        <div class="mb-8 flex flex-col items-center justify-center gap-4">
          <div class="flex flex-col gap-2">
            <UButton
              to="/main"
              :class="[baseButtonClass, primaryButtonClass, 'justify-center']"
              variant="ghost"
              color="neutral"
              :active="false"
              icon="solar:arrow-left-linear"
              leading
            >
              На главную
            </UButton>
            <div class="flex flex-row gap-2">
              <UButton
                to="/auth/login"
                :class="[baseButtonClass, 'flex-1', tabClass(isLogin)]"
                variant="ghost"
                color="neutral"
                :active="false"
                icon="i-heroicons-arrow-right-on-rectangle"
                leading
              >
                Логин
              </UButton>
              <UButton
                to="/auth/register"
                :class="[baseButtonClass, 'flex-1', tabClass(isRegister)]"
                variant="ghost"
                color="neutral"
                :active="false"
                icon="i-heroicons-user-plus"
                leading
              >
                Регистрация
              </UButton>
            </div>
          </div>
        </div>

        <Motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }">
          <slot />
        </Motion>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();

const bodyTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const baseButtonClass = `rounded-full border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-400 active:bg-blue-500 ${bodyTextClass}`;

const primaryButtonClass =
  "border-sky-200/60 border-sky-100 bg-white shadow-lg shadow-sky-100/70 -translate-y-0.5";

const tabActiveClass =
  "bg-sky-300 border-sky-300 shadow-lg shadow-sky-200/70 -translate-y-0.5";

const tabIdleClass =
  "border-sky-200/60 bg-white border-sky-100 shadow-lg shadow-sky-100/70 -translate-y-0.5";

const isLogin = computed(() => route.path.endsWith("/login"));
const isRegister = computed(() => route.path.endsWith("/register"));

const tabClass = (active: boolean) => (active ? tabActiveClass : tabIdleClass);
</script>
