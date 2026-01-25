import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { toast } from '@/hooks/use-toast'
import {
  createSharedProject,
  getProjectShares,
  deleteSharedProject,
} from '@/services/sharing.service'
import type { SharedProject } from '@/types'
import {
  Share2,
  Link,
  Copy,
  Trash2,
  Eye,
  Calendar,
  Lock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'

export function ShareDialog() {
  const { user } = useAuth()
  const { currentProject } = useProject()
  const [open, setOpen] = useState(false)
  const [shares, setShares] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  // New share options
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(30)
  const [allowComments, setAllowComments] = useState(false)
  const [showUnitCosts, setShowUnitCosts] = useState(true)
  const [showMarkup, setShowMarkup] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (open && currentProject) {
      loadShares()
    }
  }, [open, currentProject])

  const loadShares = async () => {
    if (!currentProject) return
    setLoading(true)
    try {
      const data = await getProjectShares(currentProject.id)
      setShares(data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading shares',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShare = async () => {
    if (!user || !currentProject) return

    setCreating(true)
    try {
      const share = await createSharedProject(currentProject.id, user.uid, {
        expiresInDays,
        allowComments,
        showUnitCosts,
        showMarkup,
        password: password || undefined,
      })

      setShares([share, ...shares])
      toast({
        title: 'Share link created',
        description: 'Copy the link to share with your client',
      })

      // Reset form
      setPassword('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating share link',
        description: error.message,
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteShare = async (shareId: string) => {
    try {
      await deleteSharedProject(shareId)
      setShares(shares.filter((s) => s.id !== shareId))
      toast({ title: 'Share link deleted' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting share',
        description: error.message,
      })
    }
  }

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied to clipboard' })
  }

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/shared/${token}`
  }

  const isExpired = (share: SharedProject): boolean => {
    return Boolean(share.expiresAt && share.expiresAt < Date.now())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Project
          </DialogTitle>
          <DialogDescription>
            Create a shareable link for clients to view this estimate
          </DialogDescription>
        </DialogHeader>

        {!currentProject ? (
          <div className="flex items-center gap-2 text-muted-foreground p-4">
            <AlertCircle className="w-5 h-5" />
            <span>Please select a project first</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Create New Share */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold">Create New Share Link</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expires In
                  </Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={expiresInDays || ''}
                    onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">Never</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password (optional)
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnitCosts}
                    onChange={(e) => setShowUnitCosts(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Show unit costs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMarkup}
                    onChange={(e) => setShowMarkup(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Show markup</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Allow comments
                  </span>
                </label>
              </div>

              <Button onClick={handleCreateShare} disabled={creating}>
                <Link className="w-4 h-4 mr-2" />
                {creating ? 'Creating...' : 'Create Share Link'}
              </Button>
            </div>

            {/* Existing Shares */}
            <div className="space-y-2">
              <h3 className="font-semibold">Active Share Links ({shares.length})</h3>

              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : shares.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No share links created yet
                </p>
              ) : (
                <div className="space-y-2">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className={`p-3 border rounded-lg ${isExpired(share) ? 'opacity-50 bg-muted' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-muted-foreground" />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {getShareUrl(share.shareToken).slice(0, 50)}...
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(share.shareToken)}
                            disabled={isExpired(share)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteShare(share.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {share.viewCount} views
                        </span>
                        {share.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {isExpired(share)
                              ? 'Expired'
                              : `Expires ${new Date(share.expiresAt).toLocaleDateString()}`}
                          </span>
                        )}
                        {share.password && (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Password protected
                          </span>
                        )}
                        {share.allowComments && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Comments enabled
                          </span>
                        )}
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
