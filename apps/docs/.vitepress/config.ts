import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SciGrid',
  description: 'High-performance data grid for scientific applications',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],
    sidebar: [
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
    socialLinks: [
      { icon: 'github', link: 'https://github.com/VeloSci/sci-grid' }
    ]
  }
})
