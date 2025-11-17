'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type SectionFadeProps = {
  children: ReactNode
  delay?: number
  className?: string
}

export function SectionFade({ children, delay = 0, className = '' }: SectionFadeProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, scale: 0.98, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

