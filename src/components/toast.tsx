type ToastProps = {
  message: string
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="toast toast-bottom toast-end">
      <div className="alert alert-success">
        <span>{message}</span>
      </div>
    </div>
  )
}
