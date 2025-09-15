"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Building2, User, Package, Settings, ArrowRight, ArrowLeft } from "lucide-react"

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Outlet Information
    outletName: "",
    address: "",
    phone: "",
    managerName: "",
    managerEmail: "",

    // System Configuration
    currency: "SLE",
    taxRate: "15",
    receiptFooter: "Thank you for your business!",

    // Initial Admin User
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  })

  const steps: SetupStep[] = [
    {
      id: "outlet",
      title: "Outlet Information",
      description: "Set up your pharmacy location details",
      icon: <Building2 className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "admin",
      title: "Admin Account",
      description: "Create your administrator account",
      icon: <User className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "system",
      title: "System Settings",
      description: "Configure basic system preferences",
      icon: <Settings className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "complete",
      title: "Setup Complete",
      description: "Your pharmacy POS is ready to use",
      icon: <CheckCircle className="h-5 w-5" />,
      completed: false,
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleComplete = async () => {
    // TODO: Submit setup data to backend
    console.log("Setup completed with data:", formData)
    // Redirect to main application
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome to PharmaPOS</CardTitle>
          <CardDescription>Let's set up your pharmacy management system</CardDescription>

          <div className="mt-6">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Outlet Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="outletName">Pharmacy Name *</Label>
                      <Input
                        id="outletName"
                        placeholder="e.g., Central Pharmacy"
                        value={formData.outletName}
                        onChange={(e) => handleInputChange("outletName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Full pharmacy address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+232-XX-XXXXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="managerName">Manager Name *</Label>
                      <Input
                        id="managerName"
                        placeholder="Pharmacy manager's full name"
                        value={formData.managerName}
                        onChange={(e) => handleInputChange("managerName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="managerEmail">Manager Email *</Label>
                      <Input
                        id="managerEmail"
                        type="email"
                        placeholder="manager@yourpharmacy.com"
                        value={formData.managerEmail}
                        onChange={(e) => handleInputChange("managerEmail", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Administrator Account</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="adminName">Full Name *</Label>
                      <Input
                        id="adminName"
                        placeholder="Your full name"
                        value={formData.adminName}
                        onChange={(e) => handleInputChange("adminName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminEmail">Email Address *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@yourpharmacy.com"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminPassword">Password *</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SLE">Sierra Leonean Leone (SLE)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        placeholder="15"
                        value={formData.taxRate}
                        onChange={(e) => handleInputChange("taxRate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                      <Textarea
                        id="receiptFooter"
                        placeholder="Thank you for your business!"
                        value={formData.receiptFooter}
                        onChange={(e) => handleInputChange("receiptFooter", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your pharmacy POS system has been successfully configured and is ready to use.
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4 text-left">
                  <h4 className="font-medium mb-3">What's Next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Add your first products to inventory
                    </li>
                    <li className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Create staff accounts for your team
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Start processing your first sales
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Complete Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
