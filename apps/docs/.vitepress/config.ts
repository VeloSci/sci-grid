import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
  title: 'SciGrid',
  description: 'High-performance data grid for scientific applications',
  base: '/sci-grid/',
  outDir: './dist',
  head: [
    ['link', { rel: 'icon', href: '/sci-grid/favicon.ico' }]
  ],
  vite: {
    resolve: {
      alias: [
        { find: '@sci-grid/core', replacement: resolve(__dirname, '../../../packages/core/src/index.ts') },
        { find: '@sci-grid/vue', replacement: resolve(__dirname, '../../../packages/vue/src/index.ts') },
        { find: '@sci-grid/react', replacement: resolve(__dirname, '../../../packages/react/src/index.tsx') },
        { find: '@sci-grid/solid', replacement: resolve(__dirname, '../../../packages/solid/src/index.tsx') }
      ]
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/basic' }
    ],
    logo: '/sci-grid/logo.svg',
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Scientific Features', link: '/guide/scientific' },
          ]
        },
        {
          text: 'Frameworks',
          items: [
            { text: 'React', link: '/guide/frameworks/react' },
            { text: 'Vue', link: '/guide/frameworks/vue' },
            { text: 'Angular', link: '/guide/frameworks/angular' },
            { text: 'Solid', link: '/guide/frameworks/solid' },
            { text: 'Astro', link: '/guide/frameworks/astro' },
          ]
        },
        {
          text: 'Interactivity',
          items: [
            { text: 'Context Menus', link: '/guide/context-menus' },
            { text: 'Keyboard Shortcuts', link: '/guide/keyboard-shortcuts' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Renderers', link: '/guide/advanced/renderers' },
            { text: 'Performance', link: '/guide/advanced/performance' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'SciGrid Class', link: '/api/scigrid' },
            { text: 'Data Provider', link: '/api/provider' },
            { text: 'Configuration', link: '/api/config' },
            { text: 'Events', link: '/api/events' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Basics',
          items: [
            { text: 'Basic Setup', link: '/examples/basic' },
            { text: 'Million Rows', link: '/examples/million-rows' },
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Column Types', link: '/examples/column-types' },
            { text: 'Theming', link: '/examples/theming' },
            { text: 'Sorting', link: '/examples/sorting' },
            { text: 'Editing', link: '/examples/editing' },
            { text: 'Advanced Headers', link: '/examples/headers' },
            { text: 'Selection Modes', link: '/examples/selection' },
            { text: 'Interactivity & UX', link: '/examples/interactivity' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Real-time Streaming', link: '/examples/streaming' },
            { text: 'Sparklines & Visuals', link: '/examples/visuals' },
          ]
        }
      ]
    },
    footer: {
      message: 'Integrated under the Sci DNA / VeloSci Ecosystem',
      copyright: '© 2026 VeloSci Instrumentation Services'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/VeloSci/sci-grid' }
    ]
  }
})
