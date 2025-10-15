import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'home',
  access: {
    read: () => true, // make it public
  },
  fields: [
    {
      name: 'heroSection',
      label: 'Hero Section',
      type: 'group',
      fields: [
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          label: 'Main Title',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          label: 'Subtitle',
          type: 'text',
        },
      ],
    },
    {
      name: 'ctaButton1',
      label: 'CTA Button',
      type: 'group', // group is perfect for multiple sub-fields
      fields: [
        {
          name: 'text',
          label: 'Button Text',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          label: 'Button Link',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'ctaButton2',
      label: 'CTA Button',
      type: 'group', // group is perfect for multiple sub-fields
      fields: [
        {
          name: 'text',
          label: 'Button Text',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          label: 'Button Link',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
