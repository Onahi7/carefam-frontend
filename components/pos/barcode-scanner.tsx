"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scan, Keyboard, AlertCircle } from "lucide-react"
import { POSService } from "@/lib/pos-service"
import type { Product } from "@/lib/types"

interface BarcodeScannerProps {
  onProductScanned: (product: Product) => void
}

export function BarcodeScanner({ onProductScanned }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleScan = async (barcodeValue: string) => {
    if (!barcodeValue.trim()) return

    setIsScanning(true)
    setError("")

    try {
      const product = await POSService.processBarcodeScan(barcodeValue)
      if (product) {
        onProductScanned(product)
        setBarcode("")
      } else {
        setError("Product not found for this barcode")
      }
    } catch (err) {
      setError("Failed to scan barcode. Please try again.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan(barcode)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleScan(barcode)
    }
  }

  // Simulate barcode scanner input (in production, this would be handled by actual scanner hardware)
  const simulateBarcodeScan = (sampleBarcode: string) => {
    setBarcode(sampleBarcode)
    handleScan(sampleBarcode)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
        <CardDescription>Scan product barcodes or enter manually</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan or type barcode..."
                className="font-mono"
                disabled={isScanning}
              />
              <Button type="submit" disabled={isScanning || !barcode.trim()}>
                {isScanning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Keyboard className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Demo Barcodes */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Demo Barcodes:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateBarcodeScan("1234567890123")}
              className="text-xs bg-transparent"
            >
              Paracetamol
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateBarcodeScan("1234567890124")}
              className="text-xs bg-transparent"
            >
              Amoxicillin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateBarcodeScan("1234567890125")}
              className="text-xs bg-transparent"
            >
              Vitamin C
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateBarcodeScan("1234567890126")}
              className="text-xs bg-transparent"
            >
              Ibuprofen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
