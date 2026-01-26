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
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { toast } from '@/hooks/use-toast'
import {
  getUserAssemblies,
  createAssembly,
  deleteAssembly,
} from '@/services/assemblies.service'
import { formatCurrency } from '@/lib/utils'
import type { Assembly, AssemblyItem, LineItem } from '@/types'
import { DIVISIONS_ALL } from '@/data/divisions'
import { Package, Plus, Trash2, Layers, ChevronDown, ChevronUp } from 'lucide-react'

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Miscellaneous' },
]

interface AssemblyManagerProps {
  trigger?: React.ReactNode
}

export function AssemblyManager({ trigger }: AssemblyManagerProps) {
  const { user } = useAuth()
  const { addLineItem, currentProject } = useProject()
  const [open, setOpen] = useState(false)
  const [assemblies, setAssemblies] = useState<Assembly[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // New assembly form state
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newItems, setNewItems] = useState<AssemblyItem[]>([])

  useEffect(() => {
    if (open && user) {
      loadAssemblies()
    }
  }, [open, user])

  const loadAssemblies = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUserAssemblies(user.uid)
      setAssemblies(data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading assemblies',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToProject = async (assembly: Assembly) => {
    if (!currentProject) {
      toast({
        variant: 'destructive',
        title: 'No project selected',
        description: 'Please select a project first',
      })
      return
    }

    try {
      for (const item of assembly.items) {
        await addLineItem({
          division: item.division,
          description: `[${assembly.name}] ${item.description}`,
          type: item.type,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          notes: item.notes,
        })
      }

      toast({
        title: 'Assembly added',
        description: `Added ${assembly.items.length} items from "${assembly.name}"`,
      })
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error adding assembly',
        description: error.message,
      })
    }
  }

  const handleCreateAssembly = async () => {
    if (!user || !newName.trim() || newItems.length === 0) return

    try {
      await createAssembly({
        userId: user.uid,
        name: newName.trim(),
        description: newDescription.trim(),
        items: newItems,
        totalCost: newItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
      })

      toast({
        title: 'Assembly created',
        description: `"${newName}" has been saved`,
      })

      setNewName('')
      setNewDescription('')
      setNewItems([])
      setShowNewForm(false)
      loadAssemblies()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating assembly',
        description: error.message,
      })
    }
  }

  const handleDeleteAssembly = async (assemblyId: string) => {
    try {
      await deleteAssembly(assemblyId)
      toast({ title: 'Assembly deleted' })
      loadAssemblies()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting assembly',
        description: error.message,
      })
    }
  }

  const addNewItem = () => {
    setNewItems([
      ...newItems,
      {
        description: '',
        division: '03',
        type: 'material',
        quantity: 1,
        unit: 'EA',
        unitCost: 0,
      },
    ])
  }

  const updateNewItem = (index: number, updates: Partial<AssemblyItem>) => {
    const updated = [...newItems]
    updated[index] = { ...updated[index], ...updates }
    setNewItems(updated)
  }

  const removeNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index))
  }

  const createFromCurrentItems = () => {
    if (!currentProject || currentProject.lineItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items to save',
        description: 'Add some line items first',
      })
      return
    }

    setNewItems(
      currentProject.lineItems.map((item) => ({
        description: item.description,
        division: item.division,
        type: item.type,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        notes: item.notes,
      }))
    )
    setShowNewForm(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Layers className="w-4 h-4 mr-2" />
            Assemblies
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Assembly Manager
          </DialogTitle>
          <DialogDescription>
            Save and reuse groups of line items as assemblies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setShowNewForm(!showNewForm)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Assembly
            </Button>
            {currentProject && currentProject.lineItems.length > 0 && (
              <Button onClick={createFromCurrentItems} variant="outline" size="sm">
                Create from Current Items
              </Button>
            )}
          </div>

          {/* New Assembly Form */}
          {showNewForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="font-semibold">Create New Assembly</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Standard Bathroom"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Items ({newItems.length})</Label>
                  <Button onClick={addNewItem} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {newItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-2">
                      <Select
                        value={item.division}
                        onChange={(e) => updateNewItem(index, { division: e.target.value })}
                      >
                        {DIVISIONS_ALL.map((div) => (
                          <option key={div.code} value={div.code}>
                            {div.code}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={item.description}
                        onChange={(e) => updateNewItem(index, { description: e.target.value })}
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={item.type}
                        onChange={(e) => updateNewItem(index, { type: e.target.value as LineItem['type'] })}
                      >
                        {ITEM_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateNewItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        value={item.unit}
                        onChange={(e) => updateNewItem(index, { unit: e.target.value })}
                        placeholder="Unit"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateNewItem(index, { unitCost: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                {newItems.length > 0 && (
                  <div className="text-right text-sm font-semibold">
                    Total: {formatCurrency(newItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAssembly}
                  disabled={!newName.trim() || newItems.length === 0}
                >
                  Save Assembly
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Saved Assemblies List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Saved Assemblies</h3>

            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : assemblies.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No assemblies saved yet. Create one to get started.
              </p>
            ) : (
              assemblies.map((assembly) => (
                <div key={assembly.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(expandedId === assembly.id ? null : assembly.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{assembly.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {assembly.items.length} items • {formatCurrency(assembly.totalCost)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToProject(assembly)
                        }}
                      >
                        Add to Project
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAssembly(assembly.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      {expandedId === assembly.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {expandedId === assembly.id && (
                    <div className="border-t bg-muted/20 p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left">Description</th>
                            <th className="text-left">Type</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Unit Cost</th>
                            <th className="text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assembly.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.description}</td>
                              <td className="capitalize">{item.type}</td>
                              <td className="text-right">{item.quantity} {item.unit}</td>
                              <td className="text-right">{formatCurrency(item.unitCost)}</td>
                              <td className="text-right">{formatCurrency(item.quantity * item.unitCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
