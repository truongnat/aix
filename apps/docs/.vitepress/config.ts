import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'aix',
  description: 'Author Once, Compile to Every Provider — a unified TypeScript platform for AI engineering skills, knowledge, and agent workflows.',
  lang: 'en-US',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/cli' },
      { text: 'Skills', link: '/reference/skills' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Skills & Progressive Disclosure', link: '/guide/skills' },
            { text: 'Providers & Compiler', link: '/guide/providers' },
            { text: 'KB Server', link: '/guide/kb-server' },
            { text: 'Engine (Autonomous Mode)', link: '/guide/engine' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'CLI Reference', link: '/reference/cli' },
            { text: 'Skills Catalog', link: '/reference/skills' },
            { text: 'Environment Variables', link: '/reference/env' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com' }],

    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2026 aix contributors',
    },

    search: { provider: 'local' },
  },
});
