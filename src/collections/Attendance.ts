import { CollectionConfig } from 'payload'

export const Attendance: CollectionConfig = {
  slug: 'attendance',
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['user', 'date', 'checkInTime', 'checkOutTime', 'status'],
  },
  access: {
    create: ({ req: { user } }) => {
      return !!user && user.role === 'admin'
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      return !!user && user.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      return !!user && user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['member', 'trainer'],
      required: true,
      defaultValue: 'member',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd',
        },
      },
      defaultValue: () => new Date().toISOString().split('T')[0],
    },
    {
      name: 'checkInTime',
      type: 'text',
      required: false,
      admin: {
        description: 'Format: HH:MM (24-hour format, e.g., 09:30)',
      },
      validate: (value) => {
        if (!value) return true 
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(value)) {
          return 'Please enter time in HH:MM format (e.g., 09:30)'
        }
        return true
      },
    },
    {
      name: 'checkOutTime',
      type: 'text',
      required: false,
      admin: {
        description: 'Format: HH:MM (24-hour format, e.g., 18:45)',
      },
      validate: (value) => {
        if (!value) return true 
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(value)) {
          return 'Please enter time in HH:MM format (e.g., 18:45)'
        }
        return true
      },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      admin: { 
        readOnly: true,
        description: 'Automatically calculated from check-in and check-out times',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.checkInTime && data?.checkOutTime) {
              const [inHour, inMin] = data?.checkInTime.split(':').map(Number)
              const [outHour, outMin] = data?.checkOutTime.split(':').map(Number)
              
              const inMinutes = inHour * 60 + inMin
              const outMinutes = outHour * 60 + outMin
              
              return outMinutes - inMinutes
            }
            return 0
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Checked In', value: 'checked-in' },
        { label: 'Checked Out', value: 'checked-out' },
        { label: 'Auto Closed', value: 'auto-closed' },
        { label: 'Absent', value: 'absent' },
      ],
      required: true,
      defaultValue: 'absent',
      admin: {
        description: 'Status is "absent" if no check-in/check-out time is provided',
      },
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            if (!data?.checkInTime && !data?.checkOutTime) {
              return 'absent'
            }

            if (data?.checkInTime && !data?.checkOutTime) {
              return 'checked-in'
            }

            if (data?.checkInTime && data?.checkOutTime) {
              return 'present'
            }
            return value
          },
        ],
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.date) {
          if(data)
          data.date = new Date().toISOString().split('T')[0]
        }
        return data
      },
    ],
  },
}