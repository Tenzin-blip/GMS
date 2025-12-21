import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 7200,
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600000,
  },

  access: {
    create: () => true,
    read: ({ req: { user } }) => {
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
    update: () => true,
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        // If admin email, set role and bypass all verification
        if (data.email === 'admin@gms.com') {
          data.role = 'admin'
          data.email_verified = true
          data.password_set = true
          data.otpflag = true
          data.payment = true
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
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'plan',
      type: 'select',
      label: 'Membership Plan',
      options: [
        { label: 'Essential', value: 'essential' },
        { label: 'Premium', value: 'premium' },
        { label: 'Elite', value: 'elite' },
      ],
      required: false,
      access: {
        update: ({ req: { user }, id }) => {
          if (user?.role === 'admin') return true
          return user?.id === id
        },
      },
    },
    {
      name: 'currentTrainer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Assigned Trainer',
      required: false,
      access: {
        update: ({ req: { user }, id }) => {
          if (user?.role === 'admin') return true
          // allow trainer to assign themselves when handling a request
          if (user?.role === 'trainer') {
            return true
          }
          return user?.id === id
        },
      },
    },
    {
      name: 'nextPaymentDate',
      type: 'date',
      label: 'Next Payment Due Date',
      required: false,
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'MMM d, yyyy',
        },
      },
      access: {
        read: () => true,
        update: () => true,
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
        update: () => true,
      },
    },
    {
      name: 'email_verified',
      type: 'checkbox',
      label: 'Email Verified',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'password_set',
      type: 'checkbox',
      label: 'Password Set',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'otpflag',
      type: 'checkbox',
      label: 'OTP Verified Flag',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'payment',
      type: 'checkbox',
      label: 'Payment Completed Flag',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'khaltiPidx',
      type: 'text',
      label: 'Khalti Pidx',
      admin: {
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'paymentOrderId',
      type: 'text',
      label: 'Payment Order ID',
      admin: {
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'passwordResetToken',
      type: 'text',
      label: 'Password Reset Token',
      admin: {
        hidden: true,
      },
      required: false,
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'passwordResetExpiry',
      type: 'date',
      label: 'Password Reset Token Expiry',
      admin: {
        hidden: true,
      },
      required: false,
      access: {
        read: () => false,
        update: () => true,
      },
    },
  ],
}