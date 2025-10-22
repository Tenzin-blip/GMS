import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
  duration?: number // optional (default: 3000ms)
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const alertClass =
    type === 'success'
      ? 'alert-success'
      : type === 'error'
      ? 'alert-error'
      : 'alert-info'

  return (
    <div className="toast toast-end toast-bottom transition-all duration-500">
      <div className={`alert ${alertClass} shadow-lg`}>
        <span>{message}</span>
      </div>
    </div>
  )
}
