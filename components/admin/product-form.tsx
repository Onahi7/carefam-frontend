"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Package, Stethoscope, FlaskConical, ShoppingCart } from "lucide-react"

export const PRODUCT_TYPES = {
  drug: "Drug/Medication",
  lab_equipment: "Lab Equipment", 
  medical_device: "Medical Device",
  general_pharmacy: "General Pharmacy"
} as const

export const PRODUCT_CATEGORIES = {
  // Drug categories
  prescription_drugs: "Prescription Drugs",
  otc_drugs: "Over-the-Counter Drugs",
  antibiotics: "Antibiotics",
  vitamins_supplements: "Vitamins & Supplements",
  pain_relief: "Pain Relief",
  chronic_disease: "Chronic Disease Medication",
  pediatric: "Pediatric Medication",
  
  // Lab Equipment
  diagnostic_equipment: "Diagnostic Equipment",
  testing_kits: "Testing Kits",
  lab_consumables: "Lab Consumables",
  microscopy: "Microscopy Equipment",
  blood_pressure_monitors: "Blood Pressure Monitors",
  glucometers: "Glucometers",
  
  // Medical Devices
  surgical_instruments: "Surgical Instruments",
  monitoring_devices: "Monitoring Devices",
  mobility_aids: "Mobility Aids",
  wound_care: "Wound Care Products",
  respiratory_devices: "Respiratory Devices",
  thermometers: "Thermometers",
  
  // General Pharmacy
  personal_care: "Personal Care",
  baby_care: "Baby Care",
  first_aid: "First Aid",
  hygiene_products: "Hygiene Products",
  cosmetics: "Cosmetics",
  health_accessories: "Health Accessories"
} as const

interface ProductFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ProductForm({ initialData, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    barcode: "",
    productType: "drug", // Default to drug instead of empty string
    category: "",
    retailPrice: "",
    wholesalePrice: "",
    costPrice: "",
    manufacturer: "",
    brand: "",
    model: "",
    batchNumber: "",
    expiryDate: "",
    warrantyPeriod: "",
    requiresPrescription: false,
    isControlledSubstance: false,
    activeIngredient: "",
    strength: "",
    dosageForm: "",
    packSize: "",
    storageConditions: "",
    ...initialData
  })

  const getCategoriesForType = (type: string) => {
    const categoryMap = {
      drug: [
        "prescription_drugs", "otc_drugs", "antibiotics", "vitamins_supplements", 
        "pain_relief", "chronic_disease", "pediatric"
      ],
      lab_equipment: [
        "diagnostic_equipment", "testing_kits", "lab_consumables", 
        "microscopy", "blood_pressure_monitors", "glucometers"
      ],
      medical_device: [
        "surgical_instruments", "monitoring_devices", "mobility_aids", 
        "wound_care", "respiratory_devices", "thermometers"
      ],
      general_pharmacy: [
        "personal_care", "baby_care", "first_aid", 
        "hygiene_products", "cosmetics", "health_accessories"
      ]
    }
    return categoryMap[type as keyof typeof categoryMap] || []
  }

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      productType: type,
      category: "" // Reset category when type changes
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "drug": return <Package className="h-4 w-4" />
      case "lab_equipment": return <FlaskConical className="h-4 w-4" />
      case "medical_device": return <Stethoscope className="h-4 w-4" />
      case "general_pharmacy": return <ShoppingCart className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const availableCategories = getCategoriesForType(formData.productType)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential product details and identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode/SKU *</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                placeholder="Scan or enter barcode"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Product description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Product Classification</CardTitle>
          <CardDescription>
            Categorize your product for better organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productType">Product Type *</Label>
            <Select value={formData.productType || "drug"} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(key)}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category || ""} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length === 0 ? (
                  <SelectItem value="no_categories" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {PRODUCT_CATEGORIES[cat as keyof typeof PRODUCT_CATEGORIES]}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="Manufacturer name"
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="Brand name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
          <CardDescription>
            Set pricing for different customer types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="costPrice">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="wholesalePrice">Wholesale Price *</Label>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({...formData, wholesalePrice: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="retailPrice">Retail Price *</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) => setFormData({...formData, retailPrice: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific Fields */}
      {formData.productType === "drug" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Drug-Specific Information
            </CardTitle>
            <CardDescription>
              Additional details for pharmaceutical products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activeIngredient">Active Ingredient</Label>
                <Input
                  id="activeIngredient"
                  value={formData.activeIngredient}
                  onChange={(e) => setFormData({...formData, activeIngredient: e.target.value})}
                  placeholder="e.g., Paracetamol"
                />
              </div>
              <div>
                <Label htmlFor="strength">Strength/Concentration</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => setFormData({...formData, strength: e.target.value})}
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosageForm">Dosage Form</Label>
                <Select value={formData.dosageForm || ""} onValueChange={(value) => setFormData({...formData, dosageForm: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dosage form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_form" disabled>
                      Select dosage form
                    </SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="capsule">Capsule</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                    <SelectItem value="cream">Cream</SelectItem>
                    <SelectItem value="ointment">Ointment</SelectItem>
                    <SelectItem value="drops">Drops</SelectItem>
                    <SelectItem value="inhaler">Inhaler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                  placeholder="Batch/Lot number"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onCheckedChange={(checked) => setFormData({...formData, requiresPrescription: checked})}
                />
                <Label htmlFor="requiresPrescription">Requires Prescription</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isControlledSubstance"
                  checked={formData.isControlledSubstance}
                  onCheckedChange={(checked) => setFormData({...formData, isControlledSubstance: checked})}
                />
                <Label htmlFor="isControlledSubstance">Controlled Substance</Label>
              </div>
            </div>

            {formData.isControlledSubstance && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Controlled Substance</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  This product requires special handling and documentation as per regulations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(formData.productType === "lab_equipment" || formData.productType === "medical_device") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {formData.productType === "lab_equipment" ? <FlaskConical className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
              {formData.productType === "lab_equipment" ? "Equipment" : "Device"} Information
            </CardTitle>
            <CardDescription>
              Technical specifications and warranty details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model Number</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Model/part number"
                />
              </div>
              <div>
                <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                <Input
                  id="warrantyPeriod"
                  value={formData.warrantyPeriod}
                  onChange={(e) => setFormData({...formData, warrantyPeriod: e.target.value})}
                  placeholder="e.g., 2 years, 12 months"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <CardDescription>
            Storage, packaging, and other important information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="packSize">Package Size</Label>
              <Input
                id="packSize"
                value={formData.packSize}
                onChange={(e) => setFormData({...formData, packSize: e.target.value})}
                placeholder="e.g., 100 tablets, 1 unit"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="storageConditions">Storage Conditions</Label>
            <Textarea
              id="storageConditions"
              value={formData.storageConditions}
              onChange={(e) => setFormData({...formData, storageConditions: e.target.value})}
              placeholder="e.g., Store in cool, dry place. Keep refrigerated."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
        </Button>
      </div>
    </form>
  )
}