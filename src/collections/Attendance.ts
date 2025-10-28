// payload/collections/Attendance.ts
import { CollectionConfig } from 'payload'

export const Attendance: CollectionConfig = {
  slug: 'attendance',
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
      admin: { readOnly: true },
      hooks: {
        beforeChange: [
          ({ value }) => value || new Date().toISOString().split('T')[0], // auto-fill today
        ],
      },
    },
    {
      name: 'checkInTime',
      type: 'date',
    },
    {
      name: 'checkOutTime',
      type: 'date',
    },
    {
      name: 'durationMinutes',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      options: ['checked-in', 'checked-out', 'auto-closed'],
      defaultValue: 'checked-in',
    },
  ],
}
