import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProject } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import { getUserTemplates, createTemplate, deleteTemplate } from "@/services/templates.service"
import type { LineItemTemplate } from "@/types"
import { LayoutTemplate, Plus, Trash2, FileText, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface TemplatesManagerProps {
  trigger?: React.ReactNode
}

export function TemplatesManager({ trigger }: TemplatesManagerProps) {
  const { currentProject, addLineItem } = useProject()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<LineItemTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    if (open && user) {
      loadTemplates()
    }
  }, [open, user])

  const loadTemplates = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await getUserTemplates(user.uid)
      setTemplates(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load templates",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!user || !currentProject || !newTemplateName.trim()) return

    const selectedLineItems = currentProject.lineItems.filter(
      item => selectedItems.includes(item.id)
    )

    if (selectedLineItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Select at least one line item to create a template",
      })
      return
    }

    try {
      setIsLoading(true)

      // Strip IDs and timestamps from items
      const templateItems = selectedLineItems.map(({ id, createdAt, updatedAt, order, ...rest }) => rest)

      await createTemplate({
        userId: user.uid,
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim() || undefined,
        items: templateItems,
      })

      toast({
        title: "Template created",
        description: `Template "${newTemplateName}" has been saved`,
      })

      setNewTemplateName("")
      setNewTemplateDescription("")
      setSelectedItems([])
      setShowCreateForm(false)
      await loadTemplates()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: error.message,
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to apply template",
        description: error.message,
      })
    }
  }

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Delete template "${templateName}"? This cannot be undone.`)) return

    try {
      await deleteTemplate(templateId)
      toast({
        title: "Template deleted",
        description: "The template has been deleted",
      })
      await loadTemplates()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: error.message,
      })
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
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
            Line Item Templates
          </DialogTitle>
          <DialogDescription>
            Save frequently used line items as templates for quick reuse
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Create Template */}
          {showCreateForm && currentProject ? (
            <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g., Standard Foundation, Interior Finishes..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What is this template for?"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
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
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedItems([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateTemplate}
                  disabled={!newTemplateName.trim() || selectedItems.length === 0 || isLoading}
                >
                  Save Template
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
              Create Template from Current Items
            </Button>
          )}

          {/* Template List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saved Templates</Label>

            {isLoading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No templates saved yet. Create a template from your current line items.
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
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {template.items.length} items • {formatCurrency(totalCost)} •{' '}
                          Updated {formatDistanceToNow(template.updatedAt, { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyTemplate(template)}
                          disabled={!currentProject}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
