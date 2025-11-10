import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },

  access: {
    create: () => true, // Anyone can create a user (signup)
    read: ({ req: { user } }) => {
      // Admins can read all users
      if (user?.role === 'admin') return true

      if (!user) return true
      if (user) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    update: () => true, // Allow all updates, but restrict via field-level access
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        // Force admin@gms.com to have role 'admin'
        if (data.email === 'admin@gms.com') {
          data.role = 'admin'
        }
        const planPrices = {
          essential: 3000,
          premium: 4500,
          elite: 6000,
        }

        if (data.plan) {
          data.planPrice = planPrices[data.plan]
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      defaultValue: 'New User',
      required: true,
      access: {
        update: ({ req: { user }, id }) => {
          if (user?.role === 'admin') return true

          return user?.id === id
        },
      },
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Profile Picture',
    },
    {
      name: 'dob',
      type: 'date',
      label: 'Date of Birth',
      defaultValue: () => new Date('2000-01-01'),
      access: {
        update: ({ req: { user }, id }) => {
          if (user?.role === 'admin') return true
          return user?.id === id
        },
      },
    },
    {
      name: 'phoneNumber',
      type: 'text',
      label: 'Phone Number',
      defaultValue: '000-0000000',
      access: {
        update: ({ req: { user }, id }) => {
          if (user?.role === 'admin') return true
          return user?.id === id
        },
      },
    },
    {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
      access: {
        update: ({ req: { user }, id }) => {
          if (user?.role === 'admin') return true
          return user?.id === id
        },
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Trainer', value: 'trainer' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
      // Prevent users from changing their own role
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'plan',
      type: 'select',
      label: 'Payment Plan',
      options: [
        { label: 'Essential', value: 'essential' },
        { label: 'Premium', value: 'premium' },
        { label: 'Elite', value: 'elite' },
      ],
      defaultValue: 'monthly',
      required: true,
      access: {
        update: ({ req: { user } }) => {
          // Only admins can change payment plans
          return user?.role === 'admin'
        },
      },
    },
    {
      name: 'OTP',
      type: 'text',
      label: 'One Time Password',
      admin: {
        readOnly: true,
        hidden: true,
      },
      required: false,
      access: {
        read: () => true,
        update: () => true, // Allow OTP clearing during signup
      },
    },
    {
      name: 'planPrice',
      type: 'number',
      label: 'Plan Price (NRP)',
      admin: { readOnly: true },
    },
  ],
}
