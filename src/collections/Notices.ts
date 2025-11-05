import { CollectionConfig } from 'payload';

export const Notices: CollectionConfig = {
  slug: 'notices',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'type', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      return user?.role === 'admin';
    },
    read: () => true,
    update: ({ req: { user } }) => {
      return user?.role === 'admin';
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notice title or headline',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Date of the notice or event',
        date: {
          displayFormat: 'MMM dd, yyyy',
        },
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Important',
          value: 'important',
        },
        {
          label: 'Warning',
          value: 'warning',
        },
        {
          label: 'Reminder',
          value: 'reminder',
        },
      ],
      defaultValue: 'reminder',
      admin: {
        description: 'Notice priority level',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional detailed description of the notice',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Toggle to show/hide this notice',
      },
    },
  ],
  timestamps: true,
};

