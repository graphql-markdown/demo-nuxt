import { fileURLToPath } from 'node:url'

import { generate } from "./generate-docs.mjs";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  // @nuxt/ui registers @nuxt/icon, @nuxt/fonts and @nuxtjs/color-mode itself.
  modules: ["@nuxt/content", "@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  // run graphql-markdown before build
  hooks: {
    "build:before": async () => {
      await generate();
    },
  },
   watch: [
    fileURLToPath(new URL('./schema/api.graphql', import.meta.url)),
    fileURLToPath(new URL('./generate-docs.mjs', import.meta.url)),
    fileURLToPath(new URL('./graphql-markdown-formatter.mjs', import.meta.url)),
  ]
});
