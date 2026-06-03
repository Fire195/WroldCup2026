// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true, typeCheck: true },
  nitro: {
    storage: { kv: { driver: 'vercelKV' } },
  },
  runtimeConfig: {
    footballDataApiKey: process.env.FOOTBALL_DATA_API_KEY,
  },
  app: {
    head: {
      title: '2026 World Cup Predictions',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
    },
  },
})
