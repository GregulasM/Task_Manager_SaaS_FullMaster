<template>
  <section class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header class="space-y-2">
        <p class="text-sm uppercase tracking-[0.2em] text-emerald-300">
          Auth Lab
        </p>
        <h1 class="text-3xl font-semibold">Test: Create User</h1>
        <p class="text-sm text-slate-300">
          Submit the form and see the JSON returned by the test endpoint.
        </p>
      </header>

      <form
        class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/30"
        @submit.prevent="submit"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <label class="flex flex-col gap-2 text-sm">
            Name
            <input
              v-model.trim="form.name"
              type="text"
              placeholder="Alex"
              class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </label>

          <label class="flex flex-col gap-2 text-sm">
            Email
            <input
              v-model.trim="form.email"
              type="email"
              placeholder="ivan@example.com"
              class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </label>
        </div>

        <label class="mt-4 flex flex-col gap-2 text-sm">
          Password
          <input
            v-model="form.password"
            type="password"
            placeholder="********"
            class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          />
        </label>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {{ loading ? "Sending..." : "Create test user" }}
          </button>
          <span
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 text-slate-400"
            >POST /api/user</span
          >
        </div>

        <p
          v-if="error"
          class="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
        >
          {{ error }}
        </p>
      </form>

      <section class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 class="text-sm uppercase tracking-[0.2em] text-slate-400">
          Response JSON
        </h2>
        <pre
          class="mt-3 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-emerald-200"
          >{{ formattedResponse || "No response yet. Submit the form above." }}
        </pre>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
const form = reactive({
  name: "",
  email: "",
  password: "",
});

const loading = ref(false);
const error = ref("");
const response = ref<unknown>(null);

const formattedResponse = computed(() =>
  response.value ? JSON.stringify(response.value, null, 2) : "",
);

const submit = async () => {
  loading.value = true;
  error.value = "";
  response.value = null;

  try {
    const result = await $fetch("/api/user", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
      },
    });

    response.value = result;
  } catch (err) {
    const message =
      (err as { data?: { statusMessage?: string }; message?: string })?.data
        ?.statusMessage ||
      (err as { message?: string })?.message ||
      "Failed to create user.";
    error.value = message;
  } finally {
    loading.value = false;
  }
};
</script>
