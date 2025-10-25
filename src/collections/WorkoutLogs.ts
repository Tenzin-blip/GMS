import type { CollectionConfig } from 'payload'

export const WorkoutLogs: CollectionConfig = {
  slug: 'workout-logs',
  admin: {
    useAsTitle: 'workoutName',
    defaultColumns: ['user', 'workoutName', 'date', 'completed'],
  },
  access: {
    create: ({ req: { user } }) => !!user, // Any logged-in user can log workouts
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'trainer') {
        return {
          'user.assignedTrainer': {
            equals: user.id,
          },
        }
      }
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Users can only update their own logs
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
    },
    {
      name: 'workoutPlan',
      type: 'relationship',
      relationTo: 'workout-plans',
      label: 'Workout Plan',
      admin: {
        description: 'Link to the original workout plan',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      label: 'Workout Date',
    },
    {
      name: 'workoutName',
      type: 'text',
      required: true,
      label: 'Workout Name',
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: true,
      label: 'Completed',
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (minutes)',
      admin: {
        description: 'Actual workout duration',
      },
    },
    {
      name: 'exercises',
      type: 'array',
      label: 'Exercise Log',
      fields: [
        {
          name: 'exerciseName',
          type: 'text',
          required: true,
          label: 'Exercise',
        },
        {
          name: 'sets',
          type: 'array',
          label: 'Sets Performed',
          fields: [
            {
              name: 'reps',
              type: 'number',
              label: 'Reps',
            },
            {
              name: 'weight',
              type: 'number',
              label: 'Weight (kg)',
            },
            {
              name: 'completed',
              type: 'checkbox',
              defaultValue: true,
              label: 'Completed',
            },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Exercise Notes',
        },
      ],
    },
    {
      name: 'overallNotes',
      type: 'textarea',
      label: 'Workout Notes',
      admin: {
        description: 'How did you feel? Any issues?',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      label: 'Workout Rating',
      admin: {
        description: '1-5 stars',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Auto-set user if not provided
        if (!data.user && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
}