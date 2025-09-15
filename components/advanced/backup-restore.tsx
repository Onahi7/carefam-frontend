"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Download, Upload, Shield, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface BackupInfo {
  id: string
  name: string
  size: string
  date: string
  type: "manual" | "automatic"
  status: "completed" | "failed" | "in-progress"
}

export function BackupRestore() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreProgress, setRestoreProgress] = useState(0)

  const recentBackups: BackupInfo[] = [
    {
      id: "1",
      name: "Daily Backup - 2024-01-15",
      size: "45.2 MB",
      date: "2024-01-15 02:00:00",
      type: "automatic",
      status: "completed",
    },
    {
      id: "2",
      name: "Manual Backup - 2024-01-14",
      size: "44.8 MB",
      date: "2024-01-14 16:30:00",
      type: "manual",
      status: "completed",
    },
    {
      id: "3",
      name: "Daily Backup - 2024-01-14",
      size: "44.1 MB",
      date: "2024-01-14 02:00:00",
      type: "automatic",
      status: "completed",
    },
  ]

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    setBackupProgress(0)

    try {
      // Simulate backup process
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      console.log("Backup created successfully")
    } catch (error) {
      console.error("Backup failed:", error)
    } finally {
      setIsCreatingBackup(false)
      setBackupProgress(0)
    }
  }

  const handleRestore = async (backupId: string) => {
    setIsRestoring(true)
    setRestoreProgress(0)

    try {
      // Simulate restore process
      for (let i = 0; i <= 100; i += 5) {
        setRestoreProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      console.log(`Restored from backup: ${backupId}`)
    } catch (error) {
      console.error("Restore failed:", error)
    } finally {
      setIsRestoring(false)
      setRestoreProgress(0)
    }
  }

  const getStatusIcon = (status: BackupInfo["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "in-progress":
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />
    }
  }

  const getStatusColor = (status: BackupInfo["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground"
      case "failed":
        return "bg-destructive text-destructive-foreground"
      case "in-progress":
        return "bg-primary text-primary-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Backup Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create Backup
          </CardTitle>
          <CardDescription>Create a complete backup of your pharmacy data for safekeeping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreatingBackup && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Creating backup...</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Backups include all your data: products, sales, customers, and settings. Store backups securely and test
              restoration regularly.
            </AlertDescription>
          </Alert>

          <Button onClick={handleCreateBackup} disabled={isCreatingBackup || isRestoring} className="w-full">
            {isCreatingBackup ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Create Manual Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Backups
          </CardTitle>
          <CardDescription>View and restore from your recent backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isRestoring && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Restoring backup...</span>
                <span>{restoreProgress}%</span>
              </div>
              <Progress value={restoreProgress} />
            </div>
          )}

          <div className="space-y-3">
            {recentBackups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(backup.status)}
                  <div>
                    <h4 className="font-medium">{backup.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{backup.date}</span>
                      <span>{backup.size}</span>
                      <Badge
                        variant="outline"
                        className={backup.type === "automatic" ? "text-primary border-primary" : ""}
                      >
                        {backup.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(backup.status)}>{backup.status}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(backup.id)}
                    disabled={isRestoring || isCreatingBackup || backup.status !== "completed"}
                    className="bg-transparent"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Backup Settings</CardTitle>
          <CardDescription>Configure automatic backup schedule and retention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Frequency</h4>
              <p className="text-2xl font-bold text-primary">Daily</p>
              <p className="text-sm text-muted-foreground">at 2:00 AM</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Retention</h4>
              <p className="text-2xl font-bold text-primary">30</p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Storage</h4>
              <p className="text-2xl font-bold text-primary">Local</p>
              <p className="text-sm text-muted-foreground">+ Cloud sync</p>
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            Configure Backup Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
