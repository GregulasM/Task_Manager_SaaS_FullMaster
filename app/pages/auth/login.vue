<template>
  <section class="auth-shell text-slate-900">
    <div class="auth-grid" aria-hidden="true"></div>
    <div class="auth-orb auth-orb--top" aria-hidden="true"></div>
    <div class="auth-orb auth-orb--bottom" aria-hidden="true"></div>

    <UContainer
      class="relative flex min-h-screen items-center justify-center px-4 py-14"
    >
      <div class="w-full max-w-lg">
        <div class="mb-8 flex items-center justify-center gap-4 fade-up">
          <UButton
            to="/auth/login"
            :class="tabClass(isLogin)"
            class="auth-tab"
            icon="i-heroicons-arrow-right-on-rectangle"
            leading
          >
            Логин
          </UButton>
          <UButton
            to="/auth/register"
            :class="tabClass(isRegister)"
            class="auth-tab"
            icon="i-heroicons-user-plus"
            leading
          >
            Регистрация
          </UButton>
        </div>

        <UCard
          as="form"
          class="auth-card fade-up fade-delay-1"
          @submit.prevent="submit"
        >
          <template #header>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="auth-mark">
                  <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
                </div>
                <div>
                  <p
                    class="text-xs uppercase tracking-[0.28em] text-slate-900/70"
                  >
                    Приветствие формы
                  </p>
                  <h1 class="text-2xl font-semibold text-slate-900">
                    Войти в систему
                  </h1>
                </div>
              </div>
              <p class="text-sm text-slate-900/80">
                Укажите email и пароль, чтобы продолжить работу.
              </p>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField
              label="Email"
              name="email"
              :ui="fieldUi"
              class="fade-up fade-delay-2"
            >
              <UInput
                v-model.trim="form.email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
                :ui="inputUi"
              >
                <template #leading>
                  <UIcon
                    name="i-heroicons-envelope"
                    class="h-4 w-4 text-sky-600"
                  />
                </template>
              </UInput>
            </UFormField>

            <UFormField
              label="Пароль"
              name="password"
              :ui="fieldUi"
              class="fade-up fade-delay-3"
            >
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Введите пароль"
                autocomplete="current-password"
                required
                :ui="inputUi"
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
                    class="auth-icon-button"
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
              class="auth-alert fade-up fade-delay-4"
            />
            <UAlert
              v-if="success"
              icon="i-heroicons-check-circle"
              title="Успешно"
              :description="success"
              class="auth-alert fade-up fade-delay-4"
            />
          </div>

          <template #footer>
            <div class="space-y-3">
              <UButton
                type="submit"
                block
                :loading="loading"
                :disabled="isSubmitDisabled"
                class="auth-submit"
                icon="i-heroicons-arrow-right-on-rectangle"
                leading
              >
                Войти
              </UButton>
              <div class="text-center text-xs text-slate-900/80">
                Нет аккаунта?
                <ULink to="/auth/register" class="auth-link"> Создать </ULink>
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
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

const isLogin = computed(() => route.path.endsWith("/login"));
const isRegister = computed(() => route.path.endsWith("/register"));

const isSubmitDisabled = computed(
  () => loading.value || !form.email || !form.password,
);

const inputUi = {
  base: "bg-white/90 border border-sky-200 text-slate-900 placeholder:text-slate-900/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-200",
};

const fieldUi = {
  label: "text-slate-900 font-medium",
  hint: "text-slate-900/70",
  description: "text-slate-900/80",
  error: "text-slate-900",
};

const tabClass = (active: boolean) =>
  active ? "auth-tab--active" : "auth-tab--idle";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "string") return err;
  const typed = err as { data?: { statusMessage?: string }; message?: string };
  return typed?.data?.statusMessage || typed?.message || fallback;
};

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

<style scoped>
.auth-shell {
  --auth-blue: #2563eb;
  --auth-sky: #7dd3fc;
  --auth-ice: #e0f2fe;
  --auth-ice-strong: #dbeafe;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(125, 211, 252, 0.35),
      transparent 45%
    ),
    radial-gradient(
      circle at 90% 15%,
      rgba(59, 130, 246, 0.18),
      transparent 50%
    ),
    linear-gradient(135deg, #ffffff 0%, #f0f8ff 45%, #dbeafe 100%);
}

.auth-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 197, 255, 0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 211, 252, 0.18) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.4;
  pointer-events: none;
}

.auth-orb {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  filter: blur(40px);
  opacity: 0.65;
  pointer-events: none;
}

.auth-orb--top {
  top: -120px;
  right: -80px;
  background: radial-gradient(
    circle,
    rgba(125, 211, 252, 0.6),
    transparent 70%
  );
}

.auth-orb--bottom {
  bottom: -140px;
  left: -80px;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.35),
    transparent 70%
  );
}

.auth-card {
  border-radius: 28px;
  border: 1px solid rgba(125, 211, 252, 0.6);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 30px 80px rgba(59, 130, 246, 0.18);
  backdrop-filter: blur(10px);
}

.auth-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: rgba(125, 211, 252, 0.25);
  border: 1px solid rgba(125, 211, 252, 0.6);
}

.auth-tab {
  padding: 0.6rem 1.6rem;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.6);
  font-weight: 600;
  color: #0f172a;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.auth-tab--active {
  background: var(--auth-sky);
  box-shadow: 0 12px 28px rgba(125, 211, 252, 0.45);
  transform: translateY(-1px);
}

.auth-tab--idle {
  background: rgba(255, 255, 255, 0.85);
}

.auth-tab--idle:hover {
  background: rgba(224, 242, 254, 0.6);
  transform: translateY(-1px);
}

.auth-submit {
  background: linear-gradient(120deg, #93c5fd 0%, #60a5fa 100%);
  color: #0f172a;
  box-shadow: 0 18px 35px rgba(96, 165, 250, 0.35);
  border-radius: 999px;
}

.auth-link {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-icon-button {
  color: #0f172a;
}

.auth-alert {
  border: 1px solid rgba(125, 211, 252, 0.45);
  background: rgba(224, 242, 254, 0.6);
  color: #0f172a;
}

.fade-up {
  opacity: 0;
  transform: translateY(12px);
  animation: fadeUp 0.7s ease forwards;
}

.fade-delay-1 {
  animation-delay: 120ms;
}

.fade-delay-2 {
  animation-delay: 200ms;
}

.fade-delay-3 {
  animation-delay: 280ms;
}

.fade-delay-4 {
  animation-delay: 360ms;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>
