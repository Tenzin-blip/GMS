import type { CollectionConfig } from 'payload'

export const PlanVersions: CollectionConfig = {
  slug: 'plan-versions',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'type', 'source', 'status', 'activatedAt'],
  },
  access: {
    create: ({ req: { user } }) => !!user && (user.role === 'trainer' || user.role === 'admin'),
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'trainer') {
        return {
          trainer: {
            equals: user.id,
          },
        }
      }
      return {
        user: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => !!user && user.role === 'admin',
    delete: ({ req: { user } }) => !!user && user.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'trainer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Workout', value: 'workout' },
        { label: 'Meal', value: 'meal' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'generic',
      options: [
        { label: 'Generic', value: 'generic' },
        { label: 'Trainer', value: 'trainer' },
        { label: 'AI', value: 'ai' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
    },
    {
      name: 'activatedAt',
      type: 'date',
    },
  ],
}

