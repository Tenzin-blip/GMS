import type { CollectionConfig } from 'payload'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'subscription', 'amount', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
    },
    // {
    //   name: 'subscription',
    //   type: 'relationship',
    //   relationTo: 'subscription',
    //   required: true,
    //   label: 'Subscription',
    // },
    {
      name: 'amount',
      type: 'number',
      label: 'Amount (NRP)',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Payment Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'stripeTransactionId',
      type: 'text',
      label: 'Stripe Transaction ID',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      required: false,
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Transaction Date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  access: {
    create: ({ req: { user } }) => {
      // Allow admins and authenticated users
      return !!user
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admins can read all transactions
      if (user?.role === 'admin') return true
      // Users can only read their own transactions
      return {
        user: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
