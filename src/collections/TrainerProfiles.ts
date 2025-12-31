import type { CollectionConfig } from 'payload'
import { FITNESS_GOALS } from '../globals/FitnessGoals'

export const TrainerProfiles: CollectionConfig = {
  slug: 'trainer-profiles',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'status', 'specializations', 'workingHours'],
  },
  access: {
    create: ({ req: { user } }) => !!user && (user.role === 'trainer' || user.role === 'admin'),
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paused', value: 'paused' },
      ],
    },
    {
      name: 'specializations',
      type: 'select',
      hasMany: true,
      options: FITNESS_GOALS, 
    },
    {
      name: 'workingDays',
      type: 'select',
      hasMany: true,
      options: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => ({ label: d.toUpperCase(), value: d })),
      required: true,
    },
    {
      name: 'workingHours',
      type: 'group',
      fields: [
        { name: 'start', type: 'text', required: true },
        { name: 'end', type: 'text', required: true },
        { name: 'timezone', type: 'text', required: false, defaultValue: 'UTC' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'avgResponseMinutes',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
}

