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
        <div class="absolute inset-0 bg-slate-950/20" aria-hidden="true"></div>

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
                <p
                  :class="[
                    'uppercase tracking-widest text-slate-500',
                    bodyTextClass,
                  ]"
                >
                  Подтверждение
                </p>
                <h3 :class="['font-semibold text-slate-900', headingTextClass]">
                  {{ title }}
                </h3>
                <p
                  v-if="description"
                  :class="['text-slate-600', bodyTextClass]"
                >
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
              :class="cancelButtonClass"
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

const headingTextClass =
  "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10";
const bodyTextClass =
  "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";

const baseButtonClass =
  "rounded-full border py-2.5 font-bold text-slate-900 transition duration-200 ease-out hover:-translate-y-0.5";

const primaryButtonClass = `${baseButtonClass} border-sky-200/60 border-sky-100 bg-white shadow-lg shadow-sky-100/70 -translate-y-0.5 hover:bg-blue-400 active:bg-blue-500 ${bodyTextClass}`;

const dangerButtonClass = `${baseButtonClass} border-pink-200/60 border-pink-100 bg-white shadow-lg shadow-pink-100/70 -translate-y-0.5 hover:bg-rose-400 active:bg-rose-500 ${bodyTextClass}`;

const cancelButtonClass = dangerButtonClass;

const confirmClass = computed(() =>
  props.tone === "danger" ? dangerButtonClass : primaryButtonClass,
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
