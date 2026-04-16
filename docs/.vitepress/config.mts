import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Megabat Docs',
  description: 'Product, backend, and integration documentation for Megabat.',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: [/^\.\.\/src\//],
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'GitHub', link: 'https://github.com/megabat-ai' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [{ text: 'Documentation Map', link: '/' }],
      },
      {
        text: 'Get Started',
        items: [
          { text: 'Getting Started', link: '/get-started/getting-started' },
          { text: 'Deployment', link: '/get-started/deployment' },
        ],
      },
      {
        text: 'Product Model',
        items: [
          { text: 'Public Signal Model', link: '/product/public-signal-model' },
          { text: 'Signal DSL', link: '/product/dsl' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/reference/api' },
          { text: 'Auth', link: '/reference/auth' },
        ],
      },
      {
        text: 'Integrations',
        items: [
          { text: 'Telegram Delivery', link: '/integrations/telegram-delivery' },
          { text: 'Webapp Integration', link: '/integrations/webapp-integration' },
          { text: 'Delivery Package', link: '/packages/delivery' },
        ],
      },
      {
        text: 'Internals',
        items: [
          { text: 'Architecture', link: '/internals/architecture' },
          { text: 'Sources', link: '/internals/sources' },
          { text: 'Internal Signal Engine', link: '/internals/internal-signal-engine' },
          { text: 'Design Decisions', link: '/internals/design-decisions' },
          { text: 'No Time Travel Constraint', link: '/internals/no-time-travel' },
        ],
      },
      {
        text: 'Planning',
        items: [
          { text: 'Roadmap', link: '/planning/roadmap' },
          { text: 'Implementation Status', link: '/planning/implementation-status' },
          { text: 'Notification UX', link: '/planning/notification-ux' },
          { text: 'Reflexive Source Refactor Plan', link: '/planning/reflexive-source-refactor-plan' },
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
