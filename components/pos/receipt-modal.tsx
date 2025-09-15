"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download, CheckCircle } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { POSService } from "@/lib/pos-service"

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  receiptNumber: string
}

export function ReceiptModal({ isOpen, onClose, transaction, receiptNumber }: ReceiptModalProps) {
  if (!transaction) return null

  const receiptText = POSService.generateReceipt(transaction, receiptNumber)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptNumber}</title>
            <style>
              body { font-family: monospace; font-size: 12px; margin: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownload = () => {
    const blob = new Blob([receiptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${receiptNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Transaction Complete
          </DialogTitle>
          <DialogDescription>Receipt #{receiptNumber}</DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {receiptText}
            </pre>
          </CardContent>
        </Card>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex-1 bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={onClose} className="flex-1">
            New Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
