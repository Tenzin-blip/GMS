import type { CollectionConfig } from 'payload'

export const TraineeAssignments: CollectionConfig = {
  slug: 'trainee-assignments',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'trainer', 'status', 'planStatus', 'startedAt'],
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
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'trainer') {
        return {
          trainer: {
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
      name: 'trainer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Ended', value: 'ended' },
      ],
    },
    {
      name: 'planStatus',
      type: 'select',
      label: 'Plan Status',
      defaultValue: 'pending',
      options: [
        { label: 'Pending to make plan', value: 'pending' },
        { label: 'Active plan', value: 'active' },
        { label: 'Revision Requested', value: 'revision' },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'planSentAt',
      type: 'date',
      label: 'Plan Sent Date',
    },
    {
      name: 'endedAt',
      type: 'date',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Trainer Notes',
    },
  ],
}