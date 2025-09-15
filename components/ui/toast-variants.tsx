"use client"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"

interface ToastVariantProps {
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info"
}

export function SuccessToast({ title, description }: ToastVariantProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-success">{title}</h4>
        {description && <p className="text-sm text-success/80 mt-1">{description}</p>}
      </div>
    </div>
  )
}

export function ErrorToast({ title, description }: ToastVariantProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-destructive">{title}</h4>
        {description && <p className="text-sm text-destructive/80 mt-1">{description}</p>}
      </div>
    </div>
  )
}

export function WarningToast({ title, description }: ToastVariantProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-warning">{title}</h4>
        {description && <p className="text-sm text-warning/80 mt-1">{description}</p>}
      </div>
    </div>
  )
}

export function InfoToast({ title, description }: ToastVariantProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
      <Info className="h-5 w-5 text-info mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-info">{title}</h4>
        {description && <p className="text-sm text-info/80 mt-1">{description}</p>}
      </div>
    </div>
  )
}
