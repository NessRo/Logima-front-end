import Logima from '@/assets/Aletro_logo.svg?react'

export function Logo({ className = '' }) {
  return (
    <Logima
      className={`h-8 w-auto text-slate-900 dark:text-white ${className}`}
      role="img"
      aria-label="Logima"
    />
  )
}