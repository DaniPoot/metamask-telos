// https://nuxt.com/docs/api/configuration/nuxt-config
//
//


export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  routeRules: {
    '/': { ssr: false }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt'
  ],
  componentDir: './components/ui'
})
