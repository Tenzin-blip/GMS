import type { CollectionConfig } from 'payload'

export const MealPlans: CollectionConfig = {
  slug: 'meal-plans',
  admin: {
    useAsTitle: 'planName',
    defaultColumns: ['planName', 'user', 'dailyCalories', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'trainer'
    },
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
        description: 'User this meal plan belongs to',
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
        description: 'e.g., "Vegetarian Weight Loss Plan"',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Paused', value: 'paused' },
      ],
    },
    {
      name: 'dailyCalories',
      type: 'number',
      required: true,
      label: 'Daily Calorie Target',
    },
    {
      name: 'macros',
      type: 'group',
      label: 'Macro Targets',
      fields: [
        {
          name: 'protein',
          type: 'number',
          required: true,
          label: 'Protein (g)',
        },
        {
          name: 'carbs',
          type: 'number',
          required: true,
          label: 'Carbs (g)',
        },
        {
          name: 'fats',
          type: 'number',
          required: true,
          label: 'Fats (g)',
        },
      ],
    },
    {
      name: 'mealsPerDay',
      type: 'number',
      required: true,
      defaultValue: 5,
      min: 3,
      max: 6,
      label: 'Meals Per Day',
    },
    {
      name: 'days',
      type: 'array',
      required: true,
      label: 'Daily Meal Plans',
      fields: [
        {
          name: 'dayNumber',
          type: 'number',
          required: true,
          label: 'Day Number',
          admin: {
            description: '1-7 for a weekly rotating plan',
          },
        },
        {
          name: 'dayName',
          type: 'text',
          label: 'Day Name',
          admin: {
            description: 'e.g., "Monday" or "Day 1"',
          },
        },
        {
          name: 'meals',
          type: 'array',
          required: true,
          label: 'Meals',
          fields: [
            {
              name: 'mealName',
              type: 'text',
              required: true,
              label: 'Meal Name',
              admin: {
                description: 'e.g., "Protein Oats Bowl"',
              },
            },
            {
              name: 'mealTime',
              type: 'text',
              required: true,
              label: 'Meal Time',
              admin: {
                description: 'e.g., "7:00 AM" or "Breakfast"',
              },
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
                  required: true,
                  label: 'Protein (g)',
                },
                {
                  name: 'carbs',
                  type: 'number',
                  required: true,
                  label: 'Carbs (g)',
                },
                {
                  name: 'fats',
                  type: 'number',
                  required: true,
                  label: 'Fats (g)',
                },
              ],
            },
            {
              name: 'ingredients',
              type: 'array',
              required: true,
              label: 'Ingredients',
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                  label: 'Ingredient',
                },
                {
                  name: 'amount',
                  type: 'text',
                  required: true,
                  label: 'Amount',
                  admin: {
                    description: 'e.g., "60g" or "1 cup"',
                  },
                },
              ],
            },
            {
              name: 'instructions',
              type: 'textarea',
              required: true,
              label: 'Cooking Instructions',
            },
            {
              name: 'prepTime',
              type: 'number',
              required: true,
              label: 'Prep Time (minutes)',
            },
            {
              name: 'mealPrepFriendly',
              type: 'checkbox',
              defaultValue: false,
              label: 'Meal Prep Friendly',
            },
            {
              name: 'imageUrl',
              type: 'upload',
              relationTo: 'media',
              label: 'Meal Image',
            },
            {
              name: 'tags',
              type: 'select',
              hasMany: true,
              label: 'Tags',
              options: [
                { label: 'Quick', value: 'quick' },
                { label: 'High Protein', value: 'high_protein' },
                { label: 'Low Carb', value: 'low_carb' },
                { label: 'Vegetarian', value: 'vegetarian' },
                { label: 'Vegan', value: 'vegan' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'shoppingList',
      type: 'group',
      label: 'Weekly Shopping List',
      fields: [
        {
          name: 'produce',
          type: 'array',
          label: 'Produce',
          fields: [
            {
              name: 'item',
              type: 'text',
              label: 'Item',
            },
          ],
        },
        {
          name: 'dairy',
          type: 'array',
          label: 'Dairy',
          fields: [
            {
              name: 'item',
              type: 'text',
              label: 'Item',
            },
          ],
        },
        {
          name: 'protein',
          type: 'array',
          label: 'Protein',
          fields: [
            {
              name: 'item',
              type: 'text',
              label: 'Item',
            },
          ],
        },
        {
          name: 'pantry',
          type: 'array',
          label: 'Pantry',
          fields: [
            {
              name: 'item',
              type: 'text',
              label: 'Item',
            },
          ],
        },
      ],
    },
    {
      name: 'mealPrepSchedule',
      type: 'array',
      label: 'Meal Prep Schedule',
      fields: [
        {
          name: 'day',
          type: 'text',
          label: 'Day',
          admin: {
            description: 'e.g., "Sunday"',
          },
        },
        {
          name: 'tasks',
          type: 'array',
          label: 'Prep Tasks',
          fields: [
            {
              name: 'task',
              type: 'text',
              label: 'Task',
            },
          ],
        },
      ],
    },
    {
      name: 'trainerNotes',
      type: 'textarea',
      label: 'Trainer Notes',
      admin: {
        description: 'Private notes about this meal plan',
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
      },
      access: {
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (!data.createdBy && req.user) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
  },
}