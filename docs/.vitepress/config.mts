import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Megabat Docs',
  description: 'Product, backend, and integration documentation for Megabat.',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'GitHub', link: 'https://github.com/megabat-ai' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Megabat for Integrators', link: '/' },
        ],
      },
      {
        text: 'Get Started',
        items: [
          { text: 'Getting Started', link: '/get-started/getting-started' },
        ],
      },
      {
        text: 'Product Guide',
        items: [
          { text: 'What You Can Build', link: '/product/public-signal-model' },
          { text: 'Writing Signals', link: '/product/dsl' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Auth', link: '/reference/auth' },
          { text: 'API Reference', link: '/reference/api' },
        ],
      },
      {
        text: 'Integrations',
        items: [
          { text: 'Telegram Delivery', link: '/integrations/telegram-delivery' },
          { text: 'Webapp Integration', link: '/integrations/webapp-integration' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/megabat-ai' },
    ],
    footer: {
      message: 'Private documentation repository for Megabat.',
      copyright: `Copyright © ${new Date().getFullYear()} Megabat`,
    },
  },
})
