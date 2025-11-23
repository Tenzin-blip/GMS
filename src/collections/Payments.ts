// collections/Payments.ts
import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'user', 'amount', 'status', 'createdAt'],
  },
  access: {
    create: () => true, // Allow API routes to create payments
    read: ({ req: { user } }) => {
      // Allow admin full access
      if (user?.role === 'admin') return true

      // Allow API routes (when no user is authenticated) to read payments
      // This is needed for callback route
      if (!user) return true

      // Regular users can only see their own payments
      return {
        user: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      // Allow admin to update
      if (user?.role === 'admin') return true

      // Allow API routes (when no user is authenticated) to update payments
      // This is needed for callback route to mark payments as completed
      if (!user) return true

      return false
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
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'orderId',
      type: 'text',
      label: 'Order ID',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'khaltiPidx',
      type: 'text',
      label: 'Khalti Payment Index',
      required: false,
      admin: {
        readOnly: true,
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
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      label: 'Amount (NPR)',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Payment Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Initiated', value: 'initiated' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Payment Method',
      options: [
        { label: 'Khalti', value: 'khalti' },
        { label: 'Cash', value: 'cash' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
      ],
      defaultValue: 'khalti',
    },
    {
      name: 'paymentType',
      type: 'select',
      label: 'Payment Type',
      options: [
        { label: 'Initial Signup', value: 'signup' },
        { label: 'Monthly Renewal', value: 'renewal' },
      ],
      defaultValue: 'signup',
      required: true,
    },
    {
      name: 'paidAt',
      type: 'date',
      label: 'Paid At',
      required: false,
      admin: {
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
        },
      },
    },
    {
      name: 'validUntil',
      type: 'date',
      label: 'Valid Until (31 days from payment)',
      required: false,
      admin: {
        date: {
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'khaltiTransactionId',
      type: 'text',
      label: 'Khalti Transaction ID',
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
  ],
  timestamps: true,
}
