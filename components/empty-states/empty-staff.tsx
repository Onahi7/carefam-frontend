"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, FileText } from "lucide-react"

interface EmptyStaffProps {
  onAddStaff?: () => void
  showActions?: boolean
}

export function EmptyStaff({ onAddStaff, showActions = true }: EmptyStaffProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>

        <CardTitle className="text-xl mb-2">No Staff Members</CardTitle>
        <CardDescription className="text-center mb-6 max-w-md">
          Add staff members to your pharmacy to manage roles, permissions, and track performance.
        </CardDescription>

        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onAddStaff} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Staff Management Guide
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
