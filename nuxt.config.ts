// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/test-utils",
  ],
  nitro: {
    rollupConfig: {
      external: [/^@prisma\//, /\.wasm$/],
    },
  },
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  hooks: {
    "pages:extend"(pages) {
      const applyLayout = (pageList) => {
        for (const page of pageList) {
          if (page.path?.startsWith("/auth")) {
            page.meta = { ...(page.meta || {}), layout: "auth" };
          } else {
            page.meta = { ...(page.meta || {}), layout: "default" };
          }

          if (page.children?.length) {
            applyLayout(page.children);
          }
        }
      };

      applyLayout(pages);
    },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
