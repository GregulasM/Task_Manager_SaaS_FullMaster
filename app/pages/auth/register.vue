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
        <div class="mb-8 flex items-center justify-center gap-4">
          <UButton
            to="/auth/login"
            :class="[
              'rounded-full border hover:bg-blue-400 active:bg-blue-500 px-6 py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5',
              bodyTextClass,
              tabClass(isLogin),
            ]"
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
            :class="[
              'rounded-full hover:bg-blue-400 active:bg-blue-500 border px-6 py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5',
              bodyTextClass,
              tabClass(isRegister),
            ]"
            variant="ghost"
            color="neutral"
            :active="false"
            icon="i-heroicons-user-plus"
            leading
          >
            Регистрация
          </UButton>
        </div>

        <UCard
          as="form"
          class="rounded-3xl border border-sky-200/60 bg-white/90 shadow-2xl shadow-blue-200/50 backdrop-blur-md"
          @submit.prevent="submit"
        >
          <template #header>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div
                  class="grid h-11 w-11 place-items-center rounded-2xl border border-sky-200/60 bg-sky-200/30"
                >
                  <UIcon name="i-heroicons-user-plus" class="h-5 w-5" />
                </div>
                <div>
                  <p
                    class="uppercase tracking-widest text-slate-900/70"
                    :class="bodyTextClass"
                  >
                    Приветствие формы
                  </p>
                  <h1
                    class="font-bold text-slate-900"
                    :class="headingTextClass"
                  >
                    Создать аккаунт
                  </h1>
                </div>
              </div>
              <p class="text-slate-900/80" :class="bodyTextClass">
                Заполните данные, чтобы начать работу в сервисе.
              </p>
            </div>
          </template>

          <div class="space-y-4 xs:mx-6 sm:mx-10">
            <UFormField label="Имя" name="name" :ui="fieldUi">
              <UInput
                v-model.trim="form.name"
                type="text"
                placeholder="Как вас зовут"
                autocomplete="name"
                required
                :ui="inputUi"
                class="w-full"
              >
                <template #leading>
                  <UIcon name="i-heroicons-user" class="h-4 w-4 text-sky-600" />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Email" name="email" :ui="fieldUi">
              <UInput
                v-model.trim="form.email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
                :ui="inputUi"
                class="w-full"
              >
                <template #leading>
                  <UIcon
                    name="i-heroicons-envelope"
                    class="h-4 w-4 text-sky-600"
                  />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Пароль" name="password" :ui="fieldUi">
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 8 символов"
                autocomplete="new-password"
                required
                :ui="inputUi"
                class="w-full"
              >
                <template #leading>
                  <UIcon
                    name="i-heroicons-lock-closed"
                    class="h-4 w-4 text-sky-600"
                  />
                </template>
                <template #trailing>
                  <UButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    square
                    class="text-slate-900"
                    :icon="
                      showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'
                    "
                    :aria-label="
                      showPassword ? 'Скрыть пароль' : 'Показать пароль'
                    "
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>

            <UAlert
              v-if="error"
              icon="i-heroicons-exclamation-circle"
              title="Ошибка"
              :description="error"
              class="border border-sky-200/50 bg-sky-50/70 text-slate-900"
              :class="bodyTextClass"
            />
            <UAlert
              v-else-if="success"
              icon="i-heroicons-check-circle"
              title="Успешно"
              :description="success"
              class="border border-sky-200/50 bg-sky-50/70 text-slate-900"
              :class="bodyTextClass"
            />
          </div>

          <template #footer>
            <div class="space-y-3">
              <UButton
                type="submit"
                block
                :loading="loading"
                :disabled="isSubmitDisabled"
                :class="[
                  'rounded-full bg-gradient-to-r from-sky-300 to-blue-400 font-bold text-slate-900 shadow-lg shadow-blue-200/60',
                  bodyTextClass,
                ]"
                icon="i-heroicons-user-plus"
                leading
              >
                Зарегистрироваться
              </UButton>
              <div class="text-center text-slate-900/80" :class="bodyTextClass">
                Уже есть аккаунт?
                <ULink
                  :to="loginTarget"
                  class="font-bold underline underline-offset-4 text-slate-900"
                >
                  Войти
                </ULink>
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { humanizeError } from "~/utils/human-error";
definePageMeta({ layout: "auth" });

useHead({
  title: "Регистрация",
});

type RegisterResponse = {
  id: string;
  email: string;
  name: string;
};

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};
const route = useRoute();

const form = reactive({
  name: "",
  email: "",
  password: "",
});

const registeredEmail = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");
const showPassword = ref(false);

const headingTextClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10";
const bodyTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const isLogin = computed(() => route.path.endsWith("/login"));
const isRegister = computed(() => route.path.endsWith("/register"));

const isSubmitDisabled = computed(
  () => loading.value || !form.name || !form.email || !form.password,
);

const loginTarget = computed(() =>
  registeredEmail.value
    ? { path: "/auth/login", query: { email: registeredEmail.value } }
    : "/auth/login",
);

const latinNamePattern = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/;
const isLatinName = (value: string) => latinNamePattern.test(value);

const inputUi = {
  base: `w-full bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-300 ${bodyTextClass}`,
};

const fieldUi = {
  label: `text-slate-900 font-bold ${bodyTextClass}`,
  hint: `text-slate-900/70 ${bodyTextClass}`,
  description: `text-slate-900/80 ${bodyTextClass}`,
  error: `text-slate-900 font-bold ${bodyTextClass}`,
};

const tabActiveClass =
  "bg-sky-300 border-sky-300 shadow-lg shadow-sky-200/70 -translate-y-0.5";
const tabIdleClass = "border-sky-200/60 bg-white/80 hover:bg-sky-100/60";
const tabClass = (active: boolean) => (active ? tabActiveClass : tabIdleClass);

const getErrorMessage = (err: unknown, fallback: string) =>
  humanizeError(err, fallback);

const submit = async () => {
  error.value = "";
  success.value = "";

  const name = form.name.trim();

  if (!name || !form.email || !form.password) {
    error.value = "Заполните все поля.";
    return;
  }

  if (!isLatinName(name)) {
    error.value = "Имя может содержать только латиницу.";
    return;
  }

  if (form.password.length < 8) {
    error.value = "Пароль должен быть не короче 8 символов.";
    return;
  }

  loading.value = true;

  try {
    const result = await $fetch<RegisterResponse>("/api/user", {
      method: "POST",
      body: {
        action: "register",
        name,
        email: form.email,
        password: form.password,
      },
    });

    registeredEmail.value = result.email;
    try {
      await $fetch<LoginResponse>("/api/user", {
        method: "POST",
        body: {
          action: "login",
          email: result.email,
          password: form.password,
        },
      });
      await navigateTo("/");
      return;
    } catch (loginError) {
      error.value = getErrorMessage(
        loginError,
        "Аккаунт создан, но войти не удалось.",
      );
      form.password = "";
      return;
    }
  } catch (err) {
    error.value = getErrorMessage(err, "Не удалось зарегистрироваться.");
  } finally {
    loading.value = false;
  }
};
</script>
