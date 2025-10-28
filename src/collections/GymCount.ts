
import { CollectionConfig } from 'payload'

export const GymCounts: CollectionConfig = {
  slug: 'gym_counts',
  admin: { useAsTitle: 'date' },
  fields: [
    {
      name: 'date',
      type: 'text',
      required: true,
      unique: true, // one record per day
    },
    {
      name: 'currentMembers',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'currentTrainers',
      type: 'array',
      fields: [
        {
          name: 'trainer',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
    },
  ],
}


