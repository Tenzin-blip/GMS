import type { CollectionConfig } from 'payload'

export const MealLogs: CollectionConfig = {
  slug: 'meal-logs',
  admin: {
    useAsTitle: 'mealName',
    defaultColumns: ['user', 'mealName', 'date', 'calories'],
  },
  access: {
    create: ({ req: { user } }) => !!user,
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
      name: 'mealPlan',
      type: 'relationship',
      relationTo: 'meal-plans',
      label: 'Meal Plan',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      label: 'Date',
    },
    {
      name: 'mealTime',
      type: 'select',
      required: true,
      options: [
        { label: 'Breakfast', value: 'breakfast' },
        { label: 'Morning Snack', value: 'morning_snack' },
        { label: 'Lunch', value: 'lunch' },
        { label: 'Afternoon Snack', value: 'afternoon_snack' },
        { label: 'Dinner', value: 'dinner' },
        { label: 'Evening Snack', value: 'evening_snack' },
      ],
      label: 'Meal Time',
    },
    {
      name: 'mealName',
      type: 'text',
      required: true,
      label: 'Meal Name',
    },
    {
      name: 'calories',
      type: 'number',
      required: true,
      label: 'Calories',
    },
    {
      name: 'macros',
      type: 'group',
      label: 'Macros',
      fields: [
        {
          name: 'protein',
          type: 'number',
          label: 'Protein (g)',
        },
        {
          name: 'carbs',
          type: 'number',
          label: 'Carbs (g)',
        },
        {
          name: 'fats',
          type: 'number',
          label: 'Fats (g)',
        },
      ],
    },
    {
      name: 'adherence',
      type: 'checkbox',
      defaultValue: true,
      label: 'Followed Plan',
      admin: {
        description: 'Did you follow the meal plan?',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Meal Photo',
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (!data.user && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
}