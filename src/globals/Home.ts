import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home', // how you query it in API
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      label: 'Hero Title',
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      label: 'Hero Subtitle',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media', // uses your Media collection
      label: 'Hero Image',
    },
    {
      name: 'aboutSection',
      type: 'textarea',
      label: 'About Section',
    },
  ],
}
