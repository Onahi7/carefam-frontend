"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Package, Plus, Star, Filter } from "lucide-react"
import { InventoryService } from "@/lib/inventory-service"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface ProductSearchProps {
  onProductSelected: (product: Product) => void
}

export function ProductSearch({ onProductSelected }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchTerm)
      }, 300)
    } else {
      setSearchResults([])
      setShowResults(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, selectedCategory])

  const loadInitialData = async () => {
    try {
      // Load popular products (mock data for now)
      const mockPopularProducts: Product[] = [
        {
          id: "1",
          name: "Paracetamol 500mg",
          description: "Pain relief and fever reducer",
          barcode: "1234567890123",
          category: "Pain Relief",
          unitPrice: 2500,
          costPrice: 1500,
          wholesalePrice: 2000,
          requiresPrescription: false,
          manufacturer: "SL Pharma",
          batchNumber: "PAR2024001",
          expiryDate: new Date("2025-12-31"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          name: "Amoxicillin 250mg",
          description: "Antibiotic for bacterial infections",
          barcode: "1234567890124",
          category: "Antibiotics",
          unitPrice: 8500,
          costPrice: 6000,
          wholesalePrice: 7500,
          requiresPrescription: true,
          manufacturer: "Global Meds",
          batchNumber: "AMX2024005",
          expiryDate: new Date("2025-08-15"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "3",
          name: "Vitamin C 1000mg",
          description: "Immune system support",
          barcode: "1234567890125",
          category: "Vitamins",
          unitPrice: 4200,
          costPrice: 2800,
          wholesalePrice: 3500,
          requiresPrescription: false,
          manufacturer: "HealthBoost",
          batchNumber: "VTC2024012",
          expiryDate: new Date("2026-03-20"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      setPopularProducts(mockPopularProducts)
      
      // Load categories
      const allCategories = ["Pain Relief", "Antibiotics", "Vitamins", "Cold & Flu", "Digestive Health", "First Aid"]
      setCategories(allCategories)
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  const searchProducts = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      // Simulate API search - in real implementation, this would call InventoryService.searchProducts
      const mockResults: Product[] = [
        ...popularProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        ),
        // Add more mock results based on search term
        {
          id: "4",
          name: "Ibuprofen 400mg",
          description: "Anti-inflammatory pain relief",
          barcode: "1234567890126",
          category: "Pain Relief",
          unitPrice: 3500,
          costPrice: 2200,
          wholesalePrice: 2800,
          requiresPrescription: false,
          manufacturer: "PainAway Ltd",
          batchNumber: "IBU2024008",
          expiryDate: new Date("2025-11-10"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      let filteredResults = mockResults.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
        product.manufacturer.toLowerCase().includes(query.toLowerCase())
      )

      if (selectedCategory !== "all") {
        filteredResults = filteredResults.filter(product =>
          product.category === selectedCategory
        )
      }

      setSearchResults(filteredResults)
      setShowResults(true)
    } catch (error) {
      console.error("Product search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleProductSelect = (product: Product) => {
    onProductSelected(product)
    setSearchTerm("")
    setShowResults(false)
    searchInputRef.current?.focus()
  }

  const handleQuickAdd = (product: Product) => {
    onProductSelected(product)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Product Search
        </CardTitle>
        <CardDescription>Search products by name, description, or manufacturer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="product-search">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              id="product-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type product name, brand, or description..."
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Category Filter
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="space-y-2">
            <Label>Search Results ({searchResults.length})</Label>
            <ScrollArea className="h-48 border rounded">
              <div className="p-2 space-y-2">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{product.name}</h4>
                        {product.requiresPrescription && (
                          <Badge variant="destructive" className="text-xs">Rx</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Barcode: {product.barcode}</span>
                        <span className="font-medium text-primary">{formatCurrency(product.unitPrice)}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Popular Products */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Popular Products
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-accent"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{product.name}</span>
                    {product.requiresPrescription && (
                      <Badge variant="destructive" className="text-xs">Rx</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Category: {product.category}</span>
                    <span className="font-medium text-primary">{formatCurrency(product.unitPrice)}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleQuickAdd(product)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {showResults && searchResults.length === 0 && searchTerm && (
          <div className="text-center py-6">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No products found for "{searchTerm}"</p>
            <p className="text-sm text-muted-foreground">Try a different search term or check the category filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}