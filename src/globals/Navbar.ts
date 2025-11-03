import type { GlobalConfig } from 'payload';

export const Navbar: GlobalConfig = {
  slug: 'navbar',
  label: 'Navbar',
  access: {
    read: () => true, 
  },
  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'navLinks',
      label: 'Navigation Links',
      type: 'array',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          label: 'Link URL',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'ctaButton',
      label: 'CTA Button',
      type: 'group', 
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
};
