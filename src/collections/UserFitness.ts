import type { CollectionConfig } from 'payload'

export const UserFitness: CollectionConfig = {
  slug: 'user-fitness',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'goal', 'updatedAt'],
  },

  access: {
    create: ({ req: { user } }) => !!user, // Must be logged in
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'trainer') return true
      // Users can only read their own fitness data
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Users can only update their own fitness data
      return {
        user: {
          equals: user?.id,
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
      unique: true, // One fitness profile per user
      hasMany: false,
    },

    // Goal
    {
      name: 'goal',
      type: 'select',
      label: 'Fitness Goal',
      options: [
        { label: 'Weight Loss', value: 'weight_loss' },
        { label: 'Weight Gain', value: 'weight_gain' },
        { label: 'Muscle Building', value: 'muscle_building' },
        { label: 'Toning', value: 'toning' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      defaultValue: 'maintenance',
    },

    // Body Metrics
    {
      name: 'bodyMetrics',
      type: 'group',
      label: 'Body Metrics',
      fields: [
        {
          name: 'height',
          type: 'number',
          label: 'Height (cm)',
          min: 0,
        },
        {
          name: 'currentWeight',
          type: 'number',
          label: 'Current Weight (kg)',
          min: 0,
        },
        {
          name: 'targetWeight',
          type: 'number',
          label: 'Target Weight (kg)',
          min: 0,
        },
      ],
    },

    // Nutrition Tracking
    {
      name: 'dailyCalories',
      type: 'group',
      label: 'Daily Calories',
      fields: [
        {
          name: 'target',
          type: 'number',
          label: 'Target Calories',
          defaultValue: 2000,
        },
        {
          name: 'consumed',
          type: 'number',
          label: 'Calories Consumed',
          defaultValue: 0,
        },
        {
          name: 'burned',
          type: 'number',
          label: 'Calories Burned',
          defaultValue: 0,
        },
      ],
    },

    // Meal Plan Preferences
    {
      name: 'mealPlan',
      type: 'group',
      label: 'Meal Plan Preferences',
      fields: [
        {
          name: 'dietType',
          type: 'select',
          label: 'Diet Type',
          options: [
            { label: 'Vegetarian', value: 'vegetarian' },
            { label: 'Non-Vegetarian', value: 'non_vegetarian' },
            { label: 'Vegan', value: 'vegan' },
            { label: 'Pescatarian', value: 'pescatarian' },
          ],
          defaultValue: 'non_vegetarian',
        },
        {
          name: 'allergies',
          type: 'array',
          label: 'Allergies',
          fields: [
            {
              name: 'allergen',
              type: 'text',
            },
          ],
        },
        {
          name: 'preferences',
          type: 'textarea',
          label: 'Food Preferences/Dislikes',
        },
      ],
    },

    // Workout Plan
    {
      name: 'workoutPlan',
      type: 'group',
      label: 'Workout Plan',
      fields: [
        {
          name: 'frequency',
          type: 'number',
          label: 'Workouts Per Week',
          min: 0,
          max: 7,
          defaultValue: 3,
        },
        {
          name: 'preferredDays',
          type: 'select',
          label: 'Preferred Workout Days',
          hasMany: true,
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Session Duration (minutes)',
          defaultValue: 60,
        },
        {
          name: 'preferredTypes',
          type: 'select',
          label: 'Preferred Workout Types',
          hasMany: true,
          options: [
            { label: 'Cardio', value: 'cardio' },
            { label: 'Strength Training', value: 'strength' },
            { label: 'Yoga', value: 'yoga' },
            { label: 'HIIT', value: 'hiit' },
            { label: 'Sports', value: 'sports' },
          ],
        },
      ],
    },

    // Notes for trainer/admin
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        condition: (data, siblingData, { user }) => {
          return user?.role === 'admin' || user?.role === 'trainer'
        },
      },
    },
  ],
}
