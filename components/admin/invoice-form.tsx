"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface InvoiceFormProps {
  invoice?: any
  mode: "create" | "edit"
  onSave: () => void
  onCancel: () => void
}

export function InvoiceForm({ invoice, mode, onSave, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Invoice form placeholder (mode: {mode}). Implement fields and submission logic.</p>
      <div className="flex gap-2">
        <Button disabled={loading} onClick={onSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}
