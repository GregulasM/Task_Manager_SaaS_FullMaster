<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        @click="onBackdrop"
      >
        <div class="absolute inset-0 bg-slate-950/90" aria-hidden="true"></div>

        <div
          class="relative w-full max-w-md rounded-3xl border border-sky-200 bg-white/95 shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <div class="px-6 pb-6 pt-6">
            <div class="flex items-start gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-slate-900"
              >
                <UIcon :name="iconName" class="h-5 w-5" />
              </div>
              <div class="space-y-2">
                <p class="text-sm uppercase tracking-widest text-slate-500">
                  Подтверждение
                </p>
                <h3 class="text-lg font-semibold text-slate-900">
                  {{ title }}
                </h3>
                <p v-if="description" class="text-sm text-slate-600">
                  {{ description }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-sky-100 px-6 py-5">
            <UButton
              :class="confirmClass"
              :loading="loading"
              :disabled="loading"
              icon="i-heroicons-check"
              leading
              @click="onConfirm"
            >
              {{ confirmText }}
            </UButton>
            <UButton
              variant="outline"
              class="rounded-full border-sky-200 text-slate-900"
              :disabled="loading"
              icon="i-heroicons-x-mark"
              leading
              @click="onCancel"
            >
              {{ cancelText }}
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type Tone = "default" | "danger";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  confirmText: { type: String, default: "Подтвердить" },
  cancelText: { type: String, default: "Отмена" },
  tone: { type: String as () => Tone, default: "default" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const confirmClass = computed(() =>
  props.tone === "danger"
    ? "rounded-full bg-rose-500 text-white hover:bg-rose-400"
    : "rounded-full bg-sky-200 text-slate-900 hover:bg-sky-100",
);

const iconName = computed(() =>
  props.tone === "danger"
    ? "i-heroicons-exclamation-triangle"
    : "i-heroicons-shield-check",
);

const close = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const onBackdrop = () => {
  if (props.loading) return;
  close();
};

const onCancel = () => {
  if (props.loading) return;
  close();
};

const onConfirm = () => {
  emit("confirm");
};
</script>
