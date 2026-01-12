<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "ru",
  },
});

const title = "FullMaster Task Manager";
const description = "Startup MVP Task Manager. FullMaster Task Manager.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "/PublicSite.png",
  twitterImage: "/PublicSite.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
