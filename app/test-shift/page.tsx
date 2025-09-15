import { ShiftTest } from "@/components/test/shift-test"

export default function TestShiftPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Shift Management Test</h1>
        <p className="text-muted-foreground">
          Test the shift start/end functionality to verify it's working correctly.
        </p>
      </div>
      
      <ShiftTest />
    </div>
  )
}