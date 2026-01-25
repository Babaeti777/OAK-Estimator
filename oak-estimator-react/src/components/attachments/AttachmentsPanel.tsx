import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { toast } from '@/hooks/use-toast'
import {
  uploadAttachment,
  getProjectAttachments,
  deleteAttachment,
  formatFileSize,
  isAllowedFileType,
  getFileIcon,
} from '@/services/attachments.service'
import type { Attachment } from '@/types'
import {
  Paperclip,
  Upload,
  Trash2,
  Download,
  Image,
  FileText,
  Table,
  File,
  AlertCircle,
} from 'lucide-react'

const FILE_ICONS: Record<string, React.ReactNode> = {
  image: <Image className="w-8 h-8 text-blue-500" />,
  'file-text': <FileText className="w-8 h-8 text-red-500" />,
  table: <Table className="w-8 h-8 text-green-500" />,
  file: <File className="w-8 h-8 text-gray-500" />,
}

export function AttachmentsPanel() {
  const { user } = useAuth()
  const { currentProject } = useProject()
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && currentProject) {
      loadAttachments()
    }
  }, [open, currentProject])

  const loadAttachments = async () => {
    if (!currentProject) return
    setLoading(true)
    try {
      const data = await getProjectAttachments(currentProject.id)
      setAttachments(data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading attachments',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user || !currentProject) return

    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (const file of Array.from(files)) {
      if (!isAllowedFileType(file)) {
        toast({
          variant: 'destructive',
          title: 'File type not allowed',
          description: `${file.name} is not a supported file type`,
        })
        failCount++
        continue
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `${file.name} exceeds the 10MB limit`,
        })
        failCount++
        continue
      }

      try {
        const attachment = await uploadAttachment(
          file,
          currentProject.id,
          user.uid
        )
        setAttachments((prev) => [attachment, ...prev])
        successCount++
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: `Failed to upload ${file.name}: ${error.message}`,
        })
        failCount++
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast({
        title: 'Upload complete',
        description: `${successCount} file(s) uploaded${failCount > 0 ? `, ${failCount} failed` : ''}`,
      })
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    try {
      await deleteAttachment(attachment)
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
      toast({ title: 'Attachment deleted' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting attachment',
        description: error.message,
      })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip className="w-4 h-4 mr-2" />
          Attachments
          {currentProject && attachments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 rounded-full">
              {attachments.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Project Attachments
          </DialogTitle>
          <DialogDescription>
            Upload photos, documents, and files related to this project
          </DialogDescription>
        </DialogHeader>

        {!currentProject ? (
          <div className="flex items-center gap-2 text-muted-foreground p-4">
            <AlertCircle className="w-5 h-5" />
            <span>Please select a project first</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm mb-2">
                Drag and drop files here, or{' '}
                <button
                  className="text-primary underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: Images, PDF, Word, Excel, CSV (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              />
            </div>

            {uploading && (
              <div className="text-center text-sm text-muted-foreground">
                Uploading...
              </div>
            )}

            {/* Attachments List */}
            <div className="space-y-2">
              <h3 className="font-semibold">Files ({attachments.length})</h3>

              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : attachments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No attachments yet. Upload files to get started.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      {/* Thumbnail/Icon */}
                      {attachment.mimeType.startsWith('image/') && attachment.thumbnailUrl ? (
                        <img
                          src={attachment.thumbnailUrl}
                          alt={attachment.originalName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                          {FILE_ICONS[getFileIcon(attachment.mimeType)]}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} •{' '}
                          {new Date(attachment.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={attachment.originalName}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attachment)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
