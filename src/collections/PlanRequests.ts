import type { CollectionConfig } from 'payload'

export const PlanRequests: CollectionConfig = {
  slug: 'plan-requests',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'goal', 'tier', 'status', 'assignedTrainer'],
  },
  access: {
    create: ({ req: { user } }) => !!user, // created by system/admin/user flow
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'trainer') {
        return {
          assignedTrainer: {
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
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'trainer') {
        return {
          assignedTrainer: {
            equals: user.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'goal',
      type: 'text',
      required: true,
    },
    {
      name: 'tier',
      type: 'select',
      options: [
        { label: 'Premium', value: 'premium' },
        { label: 'Elite', value: 'elite' },
      ],
      required: true,
    },
    {
      name: 'specializationMatch',
      type: 'text',
      required: false,
    },
    {
      name: 'assignedTrainer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'respondedAt',
      type: 'date',
    },
  ],
}

