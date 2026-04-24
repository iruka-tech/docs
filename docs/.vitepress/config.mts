import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Iruka Docs',
  description: 'Product, backend, and integration documentation for Iruka.',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'GitHub', link: 'https://github.com/iruka-tech' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Iruka for Integrators', link: '/' },
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
          { text: 'Signal', link: '/product/public-signal-model' },
          { text: 'Definition', link: '/product/definition' },
          { text: 'Examples', link: '/product/dsl' },
        ],
      },
      {
        text: 'Reference',
        items: [
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
      { icon: 'github', link: 'https://github.com/iruka-tech' },
    ],
    footer: {
      message: 'Private documentation repository for Iruka.',
      copyright: `Copyright © ${new Date().getFullYear()} Iruka`,
    },
  },
})
