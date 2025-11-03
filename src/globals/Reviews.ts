import type { GlobalConfig } from 'payload'

export const Reviews: GlobalConfig = {
  slug: 'reviews', 
  label: 'Reviews',
  access: {
    read: () => true, 
  },
  fields: [
    {
      name: 'reviews',
      label: 'Reviews',
      type: 'array',
      labels: {
        singular: 'Review',
        plural: 'Reviews',
      },
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
        },
        {
          name: 'message',
          label: 'Message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
