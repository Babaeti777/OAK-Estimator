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
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { toast } from '@/hooks/use-toast'
import {
  getProjectChangeOrders,
  createChangeOrder,
  approveChangeOrder,
  rejectChangeOrder,
  deleteChangeOrder,
} from '@/services/change-orders.service'
import { formatCurrency } from '@/lib/utils'
import type { ChangeOrder } from '@/types'
import {
  FileEdit,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const CHANGE_REASONS = [
  { value: 'scope_change', label: 'Scope Change' },
  { value: 'client_request', label: 'Client Request' },
  { value: 'unforeseen_conditions', label: 'Unforeseen Conditions' },
  { value: 'design_change', label: 'Design Change' },
  { value: 'other', label: 'Other' },
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500',
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <FileEdit className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />,
  approved: <Check className="w-4 h-4" />,
  rejected: <X className="w-4 h-4" />,
}

export function ChangeOrderManager() {
  const { user } = useAuth()
  const { currentProject, summary } = useProject()
  const [open, setOpen] = useState(false)
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // New change order form
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newReason, setNewReason] = useState<ChangeOrder['reason']>('scope_change')
  const [newNetChange, setNewNetChange] = useState(0)

  useEffect(() => {
    if (open && currentProject) {
      loadChangeOrders()
    }
  }, [open, currentProject])

  const loadChangeOrders = async () => {
    if (!currentProject) return
    setLoading(true)
    try {
      const data = await getProjectChangeOrders(currentProject.id)
      setChangeOrders(data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading change orders',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChangeOrder = async () => {
    if (!user || !currentProject || !newTitle.trim()) return

    try {
      await createChangeOrder({
        projectId: currentProject.id,
        userId: user.uid,
        title: newTitle.trim(),
        description: newDescription.trim(),
        reason: newReason,
        status: 'draft',
        addedItems: [],
        removedItemIds: [],
        modifiedItems: [],
        originalTotal: summary.totalCost,
        newTotal: summary.totalCost + newNetChange,
        netChange: newNetChange,
      })

      toast({
        title: 'Change order created',
        description: `CO created for "${newTitle}"`,
      })

      setNewTitle('')
      setNewDescription('')
      setNewReason('scope_change')
      setNewNetChange(0)
      setShowNewForm(false)
      loadChangeOrders()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating change order',
        description: error.message,
      })
    }
  }

  const handleApprove = async (co: ChangeOrder) => {
    if (!user) return
    try {
      await approveChangeOrder(co.id, user.displayName || user.email || 'Unknown')
      toast({ title: 'Change order approved' })
      loadChangeOrders()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error approving change order',
        description: error.message,
      })
    }
  }

  const handleReject = async (co: ChangeOrder) => {
    try {
      await rejectChangeOrder(co.id)
      toast({ title: 'Change order rejected' })
      loadChangeOrders()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error rejecting change order',
        description: error.message,
      })
    }
  }

  const handleDelete = async (coId: string) => {
    try {
      await deleteChangeOrder(coId)
      toast({ title: 'Change order deleted' })
      loadChangeOrders()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting change order',
        description: error.message,
      })
    }
  }

  const totalApproved = changeOrders
    .filter((co) => co.status === 'approved')
    .reduce((sum, co) => sum + co.netChange, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileEdit className="w-4 h-4 mr-2" />
          Change Orders
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Change Order Management
          </DialogTitle>
          <DialogDescription>
            Track scope changes and modifications to the original estimate
          </DialogDescription>
        </DialogHeader>

        {!currentProject ? (
          <div className="flex items-center gap-2 text-muted-foreground p-4">
            <AlertCircle className="w-5 h-5" />
            <span>Please select a project first</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Original Total</p>
                <p className="text-lg font-semibold">{formatCurrency(summary.totalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Changes</p>
                <p className={`text-lg font-semibold ${totalApproved >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalApproved >= 0 ? '+' : ''}{formatCurrency(totalApproved)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revised Total</p>
                <p className="text-lg font-semibold">{formatCurrency(summary.totalCost + totalApproved)}</p>
              </div>
            </div>

            <Button onClick={() => setShowNewForm(!showNewForm)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Change Order
            </Button>

            {/* New Change Order Form */}
            {showNewForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h3 className="font-semibold">Create Change Order</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Additional Electrical Outlets"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Select
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value as ChangeOrder['reason'])}
                    >
                      {CHANGE_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe the change..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Net Change Amount ($)</Label>
                  <Input
                    type="number"
                    value={newNetChange}
                    onChange={(e) => setNewNetChange(parseFloat(e.target.value) || 0)}
                    placeholder="Positive for additions, negative for deductions"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter positive value for additions, negative for deductions
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChangeOrder} disabled={!newTitle.trim()}>
                    Create Change Order
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Change Orders List */}
            <div className="space-y-2">
              <h3 className="font-semibold">Change Orders ({changeOrders.length})</h3>

              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : changeOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No change orders yet
                </p>
              ) : (
                changeOrders.map((co) => (
                  <div key={co.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedId(expandedId === co.id ? null : co.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[co.status]}`} />
                        <div>
                          <p className="font-medium">
                            CO #{co.changeOrderNumber}: {co.title}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            {STATUS_ICONS[co.status]}
                            <span className="capitalize">{co.status}</span>
                            <span>•</span>
                            <span>{new Date(co.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${co.netChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {co.netChange >= 0 ? '+' : ''}{formatCurrency(co.netChange)}
                        </span>
                        {expandedId === co.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {expandedId === co.id && (
                      <div className="border-t bg-muted/20 p-3 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Reason</p>
                          <p className="capitalize">{co.reason.replace(/_/g, ' ')}</p>
                        </div>
                        {co.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p>{co.description}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Original</p>
                            <p>{formatCurrency(co.originalTotal)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Change</p>
                            <p className={co.netChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {co.netChange >= 0 ? '+' : ''}{formatCurrency(co.netChange)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">New Total</p>
                            <p>{formatCurrency(co.newTotal)}</p>
                          </div>
                        </div>
                        {co.approvedBy && (
                          <div>
                            <p className="text-sm text-muted-foreground">Approved By</p>
                            <p>{co.approvedBy} on {new Date(co.approvedAt!).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {co.status === 'draft' || co.status === 'pending' ? (
                            <>
                              <Button size="sm" onClick={() => handleApprove(co)}>
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleReject(co)}>
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : null}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(co.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
