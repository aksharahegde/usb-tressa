// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@tresjs/nuxt', '@nuxtjs/seo', '@vercel/analytics/nuxt'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' }
      ]
    }
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://usb-connectors.example.com',
    name: 'USB Connector Presentation',
    description: 'Interactive 3D USB connector visual guide with annotated product, exploded, and wireframe views.',
    image: '/logo.png',
    defaultLocale: 'en'
  },
  ogImage: {
    enabled: true
  },
  sitemap: {
    enabled: true
  },
  robots: {
    enabled: true
  }
})
