import type { CollectionConfig } from 'payload'
import { FITNESS_GOALS } from '../globals/FitnessGoals'


export const PlanRequests: CollectionConfig = {
  slug: 'plan-requests',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'goals', 'tier', 'status', 'assignedTrainer'],
  },
  access: {
    create: ({ req: { user } }) => !!user,
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
      name: 'userFitnessData',
      type: 'relationship',
      relationTo: 'user-fitness',
      required: false,
      admin: {
        description: 'Reference to user fitness profile for trainer context',
      },
    },
    {
      name: 'goals',
      type: 'select',
      hasMany: true,
      options: FITNESS_GOALS, 
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
      name: 'matchedSpecializations',
      type: 'array',
      fields: [
        {
          name: 'specialization',
          type: 'text',
        },
      ],
      admin: {
        description: 'Trainer specializations that matched user goals',
        readOnly: true,
      },
    },
    {
      name: 'matchScore',
      type: 'number',
      admin: {
        description: 'Number of goals that matched trainer specializations',
        readOnly: true,
      },
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
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === 'rejected',
      },
    },
  ],
}