"use client"

interface InvoiceDetailsProps {
  invoice: any
  onUpdate: () => void
  onClose: () => void
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Invoice Details Placeholder</h4>
      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">{JSON.stringify(invoice, null, 2)}</pre>
    </div>
  )
}
