import React from 'react'
import { LucideIcon } from 'lucide-react'

interface AttendanceStatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
}

export default function AttendanceStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-orange-500',
  valueColor = 'text-white',
}: AttendanceStatCardProps) {
  return (
    <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className={`text-4xl font-bold ${valueColor} mb-1`}>{value}</p>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  )
}