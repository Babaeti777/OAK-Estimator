import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFolders } from "@/contexts/FolderContext"
import { Folder, FolderPlus, Trash2, Edit2, Check, X } from "lucide-react"

const FOLDER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

interface FolderManagerProps {
  trigger?: React.ReactNode
}

export function FolderManager({ trigger }: FolderManagerProps) {
  const { folders, createFolder, updateFolder, deleteFolder, selectFolder, selectedFolderId } = useFolders()
  const [open, setOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    await createFolder(newFolderName.trim(), newFolderColor)
    setNewFolderName("")
    setNewFolderColor(FOLDER_COLORS[0])
  }

  const handleStartEdit = (folder: { id: string; name: string }) => {
    setEditingId(folder.id)
    setEditingName(folder.name)
  }

  const handleSaveEdit = async () => {
    if (editingId && editingName.trim()) {
      await updateFolder(editingId, { name: editingName.trim() })
    }
    setEditingId(null)
    setEditingName("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Delete this folder? Projects in this folder will not be deleted.')) {
      await deleteFolder(folderId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Folder className="w-4 h-4 mr-2" />
            Folders
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Project Folders
          </DialogTitle>
          <DialogDescription>
            Organize your projects into folders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Create New Folder */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Create New Folder</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1"
              />
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                <FolderPlus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewFolderColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    newFolderColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Folder List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Folders</Label>

            {/* All Projects option */}
            <button
              onClick={() => selectFolder(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                selectedFolderId === null
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Folder className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">All Projects</span>
            </button>

            {folders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No folders yet. Create one above.
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedFolderId === folder.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <button
                    onClick={() => selectFolder(folder.id)}
                    className="flex-1 flex items-center gap-3"
                  >
                    <Folder
                      className="w-5 h-5"
                      style={{ color: folder.color || '#6b7280' }}
                    />
                    {editingId === folder.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="h-7 text-sm"
                      />
                    ) : (
                      <span className="font-medium">{folder.name}</span>
                    )}
                  </button>

                  <div className="flex gap-1">
                    {editingId === folder.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleSaveEdit}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(folder)
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFolder(folder.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
