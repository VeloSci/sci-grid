import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SciGrid',
  description: 'High-performance data grid for scientific applications',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/basic' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
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
    socialLinks: [
      { icon: 'github', link: 'https://github.com/VeloSci/sci-grid' }
    ]
  }
})
