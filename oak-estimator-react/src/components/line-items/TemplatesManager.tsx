import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { useProject } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import { getUserTemplates, createTemplate, deleteTemplate } from "@/services/templates.service"
import { getUserAssemblies, createAssembly, deleteAssembly } from "@/services/assemblies.service"
import type { LineItemTemplate, Assembly, AssemblyCategory } from "@/types"
import { ASSEMBLY_CATEGORIES } from "@/data/default-assemblies"
import { LayoutTemplate, Plus, Trash2, FileText, Download, Package, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatCurrency, getErrorMessage } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

interface TemplatesManagerProps {
  trigger?: React.ReactNode
  onOpenLibrary?: () => void
}

type ActiveTab = 'templates' | 'assemblies'
type SaveMode = 'template' | 'assembly'

export function TemplatesManager({ trigger, onOpenLibrary }: TemplatesManagerProps) {
  const { currentProject, addLineItem } = useProject()
  const { user } = useAuth()
  const confirm = useConfirmDialog()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('templates')
  const [templates, setTemplates] = useState<LineItemTemplate[]>([])
  const [assemblies, setAssemblies] = useState<Assembly[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saveMode, setSaveMode] = useState<SaveMode>('template')
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newCategory, setNewCategory] = useState<AssemblyCategory>('custom')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    if (open && user) {
      loadData()
    }
  }, [open, user])

  const loadData = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const [templateData, assemblyData] = await Promise.all([
        getUserTemplates(user.uid),
        getUserAssemblies(user.uid),
      ])
      setTemplates(templateData)
      setAssemblies(assemblyData)
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: getErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!user || !currentProject || !newName.trim()) return

    const selectedLineItems = currentProject.lineItems.filter(
      item => selectedItems.includes(item.id)
    )

    if (selectedLineItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Select at least one line item",
      })
      return
    }

    try {
      setIsLoading(true)

      if (saveMode === 'assembly') {
        // Save as assembly
        const items = selectedLineItems.map(({ id, createdAt, updatedAt, order, ...rest }) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          description: rest.description,
          division: rest.division,
          type: rest.type,
          quantity: rest.quantity,
          unit: rest.unit,
          unitCost: rest.unitCost,
        }))

        await createAssembly({
          userId: user.uid,
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          category: newCategory,
          items,
          totalCost: selectedLineItems.reduce((sum, i) => sum + i.totalCost, 0),
          estimatedDuration: 1,
          durationUnit: 'days',
          isDefault: false,
          isShared: false,
          usageCount: 0,
        })

        toast({
          title: "Assembly created",
          description: `Saved "${newName}" as an assembly kit`,
        })
      } else {
        // Save as template
        const templateItems = selectedLineItems.map(({ id, createdAt, updatedAt, order, ...rest }) => rest)

        await createTemplate({
          userId: user.uid,
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          items: templateItems,
        })

        toast({
          title: "Template created",
          description: `Template "${newName}" has been saved`,
        })
      }

      setNewName("")
      setNewDescription("")
      setNewCategory('custom')
      setSelectedItems([])
      setShowCreateForm(false)
      await loadData()
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: getErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyTemplate = async (template: LineItemTemplate) => {
    if (!currentProject) return
    try {
      for (const item of template.items) {
        await addLineItem(item)
      }
      toast({
        title: "Template applied",
        description: `Added ${template.items.length} items from "${template.name}"`,
      })
      setOpen(false)
    } catch (error: unknown) {
      toast({ variant: "destructive", title: "Failed to apply template", description: getErrorMessage(error) })
    }
  }

  const handleApplyAssembly = async (assembly: Assembly) => {
    if (!currentProject) return
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
        title: "Assembly applied",
        description: `Added ${assembly.items.length} items from "${assembly.name}"`,
      })
      setOpen(false)
    } catch (error: unknown) {
      toast({ variant: "destructive", title: "Failed to apply assembly", description: getErrorMessage(error) })
    }
  }

  const handleDeleteTemplate = async (templateId: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Template",
      description: `Delete "${name}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    })
    if (!confirmed) return
    try {
      await deleteTemplate(templateId)
      toast({ title: "Template deleted" })
      await loadData()
    } catch (error: unknown) {
      toast({ variant: "destructive", title: "Failed to delete", description: getErrorMessage(error) })
    }
  }

  const handleDeleteAssembly = async (assemblyId: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Assembly",
      description: `Delete assembly "${name}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    })
    if (!confirmed) return
    try {
      await deleteAssembly(assemblyId)
      toast({ title: "Assembly deleted" })
      await loadData()
    } catch (error: unknown) {
      toast({ variant: "destructive", title: "Failed to delete", description: getErrorMessage(error) })
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  const selectAllItems = () => {
    if (!currentProject) return
    if (selectedItems.length === currentProject.lineItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(currentProject.lineItems.map(item => item.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            Kits & Templates
          </DialogTitle>
          <DialogDescription>
            Save and reuse line item groups as templates or assembly kits
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('assemblies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-b-2 transition-colors ${
              activeTab === 'assemblies'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            My Assemblies ({assemblies.length})
          </button>
          {onOpenLibrary && (
            <button
              onClick={() => { setOpen(false); onOpenLibrary() }}
              className="ml-auto px-3 py-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Browse Library
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Create Form */}
          {showCreateForm && currentProject ? (
            <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
              {/* Save mode toggle */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setSaveMode('template')}
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
                    saveMode === 'template'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Save as Template
                </button>
                <button
                  onClick={() => setSaveMode('assembly')}
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
                    saveMode === 'assembly'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Save as Assembly Kit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder={saveMode === 'assembly' ? "e.g., Bathroom Rough-In" : "e.g., Standard Foundation"}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                </div>
                {saveMode === 'assembly' && (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as AssemblyCategory)}
                    >
                      {ASSEMBLY_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What is this for?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Item Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Items to Include</Label>
                  <Button variant="ghost" size="sm" onClick={selectAllItems}>
                    {selectedItems.length === currentProject.lineItems.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                  {currentProject.lineItems.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No line items in current project
                    </div>
                  ) : (
                    currentProject.lineItems.map(item => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded"
                        />
                        <span className="text-xs text-muted-foreground">{item.division}</span>
                        <span className="flex-1 truncate text-sm">{item.description}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(item.totalCost)}</span>
                      </label>
                    ))
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedItems.length} items selected
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowCreateForm(false); setSelectedItems([]) }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim() || selectedItems.length === 0 || isLoading}
                >
                  {isLoading ? 'Saving...' : `Save ${saveMode === 'assembly' ? 'Assembly' : 'Template'}`}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateForm(true)}
              disabled={!currentProject}
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Current Items as {activeTab === 'assemblies' ? 'Assembly Kit' : 'Template'}
            </Button>
          )}

          {/* List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {activeTab === 'templates' ? 'Saved Templates' : 'My Assembly Kits'}
            </Label>

            {isLoading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">Loading...</div>
            ) : activeTab === 'templates' ? (
              templates.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No templates saved yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => {
                    const totalCost = template.items.reduce((sum, item) => sum + item.totalCost, 0)
                    return (
                      <div
                        key={template.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {template.items.length} items • {formatCurrency(totalCost)} •{' '}
                            Updated {formatDistanceToNow(template.updatedAt, { addSuffix: true })}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleApplyTemplate(template)} disabled={!currentProject}>
                            <Download className="w-3 h-3 mr-1" /> Apply
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTemplate(template.id, template.name)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              assemblies.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No assembly kits saved yet.
                  {onOpenLibrary && (
                    <button onClick={() => { setOpen(false); onOpenLibrary() }} className="block mx-auto mt-2 text-primary hover:underline text-sm">
                      Browse the Assembly Library
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {assemblies.map((assembly) => (
                    <div
                      key={assembly.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <Package className="w-5 h-5 text-primary/70 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{assembly.name}</div>
                        {assembly.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{assembly.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{assembly.items.length} items</span>
                          <span>•</span>
                          <span>{formatCurrency(assembly.totalCost)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {assembly.estimatedDuration} {assembly.durationUnit}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{assembly.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleApplyAssembly(assembly)} disabled={!currentProject}>
                          <Download className="w-3 h-3 mr-1" /> Apply
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteAssembly(assembly.id, assembly.name)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
