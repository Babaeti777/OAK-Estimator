import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProject } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import { getProjectVersions, createVersion, deleteVersion } from "@/services/versions.service"
import type { ProjectVersion } from "@/types"
import { History, Plus, Trash2, FileText, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface VersionHistoryProps {
  trigger?: React.ReactNode
}

export function VersionHistory({ trigger }: VersionHistoryProps) {
  const { currentProject } = useProject()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<ProjectVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newVersionName, setNewVersionName] = useState("")
  const [newVersionNotes, setNewVersionNotes] = useState("")

  useEffect(() => {
    if (open && currentProject) {
      loadVersions()
    }
  }, [open, currentProject])

  const loadVersions = async () => {
    if (!currentProject) return

    try {
      setIsLoading(true)
      const data = await getProjectVersions(currentProject.id)
      setVersions(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load versions",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateVersion = async () => {
    if (!currentProject || !newVersionName.trim()) return

    try {
      setIsLoading(true)
      await createVersion(
        currentProject,
        newVersionName.trim(),
        newVersionNotes.trim() || undefined,
        user?.displayName || user?.email || undefined
      )

      toast({
        title: "Version created",
        description: `Version "${newVersionName}" has been saved`,
      })

      setNewVersionName("")
      setNewVersionNotes("")
      setShowCreateForm(false)
      await loadVersions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create version",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVersion = async (versionId: string, versionName: string) => {
    if (!confirm(`Delete version "${versionName}"? This cannot be undone.`)) return

    try {
      await deleteVersion(versionId)
      toast({
        title: "Version deleted",
        description: "The version has been deleted",
      })
      await loadVersions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete version",
        description: error.message,
      })
    }
  }

  if (!currentProject) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            Versions
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Version History
          </DialogTitle>
          <DialogDescription>
            Save and manage versions of your estimate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Create Version */}
          {showCreateForm ? (
            <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Version Name</Label>
                <Input
                  placeholder="e.g., Initial Estimate, Rev A, Final..."
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="What changed in this version?"
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateVersion}
                  disabled={!newVersionName.trim() || isLoading}
                >
                  Save Version
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Version Snapshot
            </Button>
          )}

          {/* Version List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saved Versions</Label>

            {isLoading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No versions saved yet. Create a snapshot to track changes.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{version.versionNumber}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="truncate">{version.name}</span>
                      </div>
                      {version.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {version.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                        </span>
                        {version.createdBy && (
                          <>
                            <span>by</span>
                            <span>{version.createdBy}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {version.snapshot.lineItems.length} line items •{' '}
                        ${version.snapshot.lineItems.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteVersion(version.id, version.name)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
