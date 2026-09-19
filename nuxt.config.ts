import { fileURLToPath } from "node:url";

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
  // @nuxt/ui is now registered by the layer; modules and css are also handled there.
  // The layer's `gqlmd-generate` module watches generate-docs.ts itself, but
  // has no way to know which schema file(s) it points at — that part of the
  // old `watch` array still belongs here.
  watch: [fileURLToPath(new URL("./schema/api.graphql", import.meta.url))],
});
