import type { CollectionConfig } from 'payload'

export const WorkoutPlans: CollectionConfig = {
  slug: 'workout-plans',
  admin: {
    useAsTitle: 'planName',
    defaultColumns: ['planName', 'user', 'status', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      // Only admins and trainers can create workout plans
      return user?.role === 'admin' || user?.role === 'trainer'
    },
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'trainer') {
        // Trainers can read plans for their assigned clients
        return {
          'user.assignedTrainer': {
            equals: user.id,
          },
        }
      }
      // Users can only read their own plans
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Trainers can update plans for their clients
      return user?.role === 'trainer'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
      admin: {
        description: 'User this workout plan belongs to',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'planName',
      type: 'text',
      required: true,
      label: 'Plan Name',
      admin: {
        description: 'e.g., "12-Week Weight Loss Program"',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Paused', value: 'paused' },
      ],
      admin: {
        description: 'Current status of the workout plan',
      },
    },
    {
      name: 'splitType',
      type: 'select',
      required: true,
      options: [
        { label: 'Full Body', value: 'full_body' },
        { label: 'Upper/Lower', value: 'upper_lower' },
        { label: 'Push/Pull/Legs', value: 'push_pull_legs' },
        { label: 'Body Part Split', value: 'body_part_split' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Type of workout split',
      },
    },
    {
      name: 'daysPerWeek',
      type: 'number',
      required: true,
      min: 1,
      max: 7,
      admin: {
        description: 'Number of workout days per week',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      required: true,
      admin: {
        description: 'Average session duration in minutes',
      },
    },
    {
      name: 'totalWeeks',
      type: 'number',
      required: true,
      defaultValue: 12,
      admin: {
        description: 'Total program duration in weeks',
      },
    },
    {
      name: 'weeks',
      type: 'array',
      required: true,
      label: 'Weekly Schedule',
      fields: [
        {
          name: 'weekNumber',
          type: 'number',
          required: true,
          label: 'Week Number',
        },
        {
          name: 'focusNote',
          type: 'text',
          label: 'Week Focus',
          admin: {
            description: 'e.g., "Build foundation, focus on form"',
          },
        },
        {
          name: 'days',
          type: 'array',
          required: true,
          label: 'Workout Days',
          fields: [
            {
              name: 'dayNumber',
              type: 'number',
              required: true,
              label: 'Day Number',
              admin: {
                description: '1-7 for Monday-Sunday',
              },
            },
            {
              name: 'workoutName',
              type: 'text',
              required: true,
              label: 'Workout Name',
              admin: {
                description: 'e.g., "Upper Body Strength"',
              },
            },
            {
              name: 'estimatedDuration',
              type: 'number',
              required: true,
              label: 'Duration (minutes)',
            },
            {
              name: 'exercises',
              type: 'array',
              required: true,
              label: 'Exercises',
              fields: [
                {
                  name: 'exerciseName',
                  type: 'text',
                  required: true,
                  label: 'Exercise Name',
                },
                {
                  name: 'sets',
                  type: 'number',
                  required: true,
                  label: 'Sets',
                },
                {
                  name: 'reps',
                  type: 'text',
                  required: true,
                  label: 'Reps',
                  admin: {
                    description: 'e.g., "8-10" or "12-15"',
                  },
                },
                {
                  name: 'rest',
                  type: 'text',
                  required: true,
                  label: 'Rest Period',
                  admin: {
                    description: 'e.g., "90s" or "2 min"',
                  },
                },
                {
                  name: 'notes',
                  type: 'textarea',
                  label: 'Exercise Notes',
                  admin: {
                    description: 'Form cues, modifications, etc.',
                  },
                },
                {
                  name: 'videoUrl',
                  type: 'text',
                  label: 'Video Tutorial URL',
                  admin: {
                    description: 'Link to exercise demonstration',
                  },
                },
                {
                  name: 'alternatives',
                  type: 'array',
                  label: 'Alternative Exercises',
                  fields: [
                    {
                      name: 'exerciseName',
                      type: 'text',
                      label: 'Alternative Exercise',
                    },
                  ],
                },
              ],
            },
            {
              name: 'warmup',
              type: 'textarea',
              label: 'Warmup Routine',
            },
            {
              name: 'cooldown',
              type: 'textarea',
              label: 'Cooldown Routine',
            },
          ],
        },
      ],
    },
    {
      name: 'progressionNotes',
      type: 'textarea',
      label: 'Progression Strategy',
      admin: {
        description: 'How to progress through the program',
      },
    },
    {
      name: 'trainerNotes',
      type: 'textarea',
      label: 'Trainer Notes',
      admin: {
        description: 'Private notes about this plan',
      },
      access: {
        read: ({ req: { user } }) => {
          return user?.role === 'admin' || user?.role === 'trainer'
        },
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Created By',
      admin: {
        readOnly: true,
        description: 'Trainer who created this plan',
      },
      access: {
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Auto-set createdBy on creation
        if (!data.createdBy && req.user) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
  },
}