// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  extends: ['@graphql-markdown/nuxt-theme'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? "/",
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  css: ["~/assets/css/brand.css"],
  // @nuxt/ui is now registered by the layer; modules and css are also handled there.
  // The layer's `gqlmd-generate` module watches generate-docs.ts itself; the
  // schema is fetched from a URL, so there is no local schema file to watch.
});
