<template>
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
            <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
          </div>
          <div>
            <p
              class="uppercase tracking-widest text-slate-900/70"
              :class="bodyTextClass"
            >
              Добро пожаловать
            </p>
            <h1 class="font-bold text-slate-900" :class="headingTextClass">
              Войти в систему
            </h1>
          </div>
        </div>
        <p class="text-slate-900/80" :class="bodyTextClass">
          Укажите email и пароль, чтобы продолжить работу.
        </p>
      </div>
    </template>

    <div class="space-y-4 xs:mx-6 sm:mx-10">
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
            <UIcon name="i-heroicons-envelope" class="h-4 w-4 text-sky-600" />
          </template>
        </UInput>
      </UFormField>

      <UFormField label="Пароль" name="password" :ui="fieldUi">
        <UInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Введите пароль"
          autocomplete="current-password"
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
              :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
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
        v-if="success"
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
          :class="[baseButtonClass, primaryButtonClass]"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-right-on-rectangle"
          leading
        >
          Войти
        </UButton>
        <div class="text-center text-slate-900/80" :class="bodyTextClass">
          Нет аккаунта?
          <ULink
            to="/auth/register"
            class="font-bold underline underline-offset-4 text-slate-900"
          >
            Создать
          </ULink>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { humanizeError } from "~/utils/human-error";
definePageMeta({ layout: "auth" });

useHead({
  title: "Логин",
});

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

const route = useRoute();

const form = reactive({
  email: typeof route.query.email === "string" ? route.query.email : "",
  password: "",
});

const loading = ref(false);
const error = ref("");
const success = ref("");
const showPassword = ref(false);

const headingTextClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10";
const bodyTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const baseButtonClass = `rounded-full border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5 ${bodyTextClass}`;

const primaryButtonClass =
  "border-sky-200/60 border-sky-100 bg-white shadow-lg shadow-sky-100/70 -translate-y-0.5 hover:bg-blue-400 active:bg-blue-500";

const isSubmitDisabled = computed(
  () => loading.value || !form.email || !form.password,
);

const inputUi = {
  base: `w-full bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-300 ${bodyTextClass}`,
};

const fieldUi = {
  label: `text-slate-900 font-bold ${bodyTextClass}`,
  hint: `text-slate-900/70 ${bodyTextClass}`,
  description: `text-slate-900/80 ${bodyTextClass}`,
  error: `text-slate-900 font-bold ${bodyTextClass}`,
};

const getErrorMessage = (err: unknown, fallback: string) =>
  humanizeError(err, fallback);

const submit = async () => {
  error.value = "";
  success.value = "";

  if (!form.email || !form.password) {
    error.value = "Заполните все поля.";
    return;
  }

  loading.value = true;

  try {
    const result = await $fetch<LoginResponse>("/api/user", {
      method: "POST",
      body: {
        action: "login",
        email: form.email,
        password: form.password,
      },
    });

    success.value = `Добро пожаловать, ${result.user.name}.`;
    form.password = "";
    await navigateTo("/");
  } catch (err) {
    error.value = getErrorMessage(err, "Не удалось войти.");
  } finally {
    loading.value = false;
  }
};
</script>
