"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Download, FileText, Table, BarChart3, Calendar } from "lucide-react"
import type { DateRange } from "react-day-picker"

interface ExportOptions {
  format: "csv" | "excel" | "pdf"
  dateRange: DateRange | undefined
  includeHeaders: boolean
  includeCharts: boolean
  dataTypes: string[]
}

export function DataExport() {
  const [options, setOptions] = useState<ExportOptions>({
    format: "csv",
    dateRange: undefined,
    includeHeaders: true,
    includeCharts: false,
    dataTypes: ["sales", "inventory"],
  })
  const [isExporting, setIsExporting] = useState(false)

  const dataTypeOptions = [
    { id: "sales", label: "Sales Transactions", icon: BarChart3 },
    { id: "inventory", label: "Inventory Data", icon: Table },
    { id: "customers", label: "Customer Records", icon: FileText },
    { id: "suppliers", label: "Supplier Information", icon: FileText },
    { id: "staff", label: "Staff Performance", icon: FileText },
    { id: "audit", label: "Audit Logs", icon: Calendar },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // TODO: Implement actual export functionality
      console.log("Exporting data with options:", options)

      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create and download file
      const filename = `pharmacy-data-${new Date().toISOString().split("T")[0]}.${options.format}`
      console.log(`Export completed: ${filename}`)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      dataTypes: checked ? [...prev.dataTypes, dataType] : prev.dataTypes.filter((type) => type !== dataType),
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Export
        </CardTitle>
        <CardDescription>Export your pharmacy data for backup, analysis, or reporting purposes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select
            value={options.format}
            onValueChange={(value: "csv" | "excel" | "pdf") => setOptions((prev) => ({ ...prev, format: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
              <SelectItem value="excel">Excel Spreadsheet</SelectItem>
              <SelectItem value="pdf">PDF Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <DatePickerWithRange
            date={options.dateRange}
            onDateChange={(dateRange) => setOptions((prev) => ({ ...prev, dateRange }))}
          />
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <Label>Data to Include</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataTypeOptions.map((dataType) => {
              const Icon = dataType.icon
              return (
                <div key={dataType.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dataType.id}
                    checked={options.dataTypes.includes(dataType.id)}
                    onCheckedChange={(checked) => handleDataTypeChange(dataType.id, checked as boolean)}
                  />
                  <Label htmlFor={dataType.id} className="flex items-center gap-2 cursor-pointer">
                    <Icon className="h-4 w-4" />
                    {dataType.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <Label>Export Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="headers"
                checked={options.includeHeaders}
                onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeHeaders: checked as boolean }))}
              />
              <Label htmlFor="headers" className="cursor-pointer">
                Include column headers
              </Label>
            </div>

            {options.format === "pdf" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeCharts: checked as boolean }))}
                />
                <Label htmlFor="charts" className="cursor-pointer">
                  Include charts and graphs
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleExport} disabled={isExporting || options.dataTypes.length === 0} className="w-full">
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
