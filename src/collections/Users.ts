import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false, // We're handling verification with OTP manually
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },

  // CRITICAL: Allow public user creation for signup
  access: {
    create: () => true, // Anyone can create a user (signup)
    read: ({ req: { user } }) => {
      // Admins can read all users
      if (user?.role === 'admin') return true
      // Allow reading during signup flow (for OTP verification)
      if (!user) return true
      // Users can only read their own data
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
      // Only admins can delete users
      return user?.role === 'admin'
    },
  },

  hooks: {
    beforeChange: [
      ({ data,  }) => {
        // Force admin@gms.com to have role 'admin'
        if (data.email === 'admin@gms.com') {
          data.role = 'admin'
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
          // Admins can update any name
          if (user?.role === 'admin') return true
          // Users can update their own name
          return user?.id === id
        },
      },
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      required: false, // Optional
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
        update: ({ req: { user }, }) => {
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
      // Allow system to clear OTP during verification (unauthenticated)
      access: {
        read: () => true,
        update: () => true, // Allow OTP clearing during signup
      },
    },
  ],
}
