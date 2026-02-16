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
import { toast } from '@/hooks/use-toast'
import {
  getUserCustomMaterials,
  createCustomMaterial,
  updateCustomMaterial,
  deleteCustomMaterial,
  getUserPriceOverrides,
  deletePriceOverride,
  checkForCatalogUpdates,
  acknowledgeCatalogUpdate,
  getCurrentCatalogVersion,
} from '@/services/materials-catalog.service'
import { formatCurrency } from '@/lib/utils'
import type { CustomMaterial, PriceOverride } from '@/types'
import { DIVISIONS_ALL } from '@/data/divisions'
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Package,
  DollarSign,
  Search,
  Tag,
} from 'lucide-react'

interface MaterialsCatalogManagerProps {
  trigger?: React.ReactNode
}

export function MaterialsCatalogManager({ trigger }: MaterialsCatalogManagerProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'custom' | 'overrides' | 'catalog'>('catalog')
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([])
  const [priceOverrides, setPriceOverrides] = useState<PriceOverride[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [checkingUpdates, setCheckingUpdates] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{
    hasUpdates: boolean
    currentVersion: string
    userVersion: string | null
  } | null>(null)

  // Form state for new custom material
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    division: '01',
    category: '',
    description: '',
    unit: 'EA',
    materialCost: 0,
    laborCost: 0,
    equipmentCost: 0,
    notes: '',
    source: 'manual',
    tags: '',
  })

  useEffect(() => {
    if (open && user) {
      loadData()
    }
  }, [open, user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [materials, overrides] = await Promise.all([
        getUserCustomMaterials(user.uid),
        getUserPriceOverrides(user.uid),
      ])
      setCustomMaterials(materials)
      setPriceOverrides(overrides)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckUpdates = async () => {
    if (!user) return
    setCheckingUpdates(true)
    try {
      const result = await checkForCatalogUpdates(user.uid)
      setUpdateStatus(result)

      if (result.hasUpdates) {
        toast({
          title: 'Updates Available',
          description: `New catalog version ${result.currentVersion} is available with ${result.newItemsCount} materials`,
        })
      } else {
        toast({
          title: 'Up to Date',
          description: `Your catalog is running the latest version (${result.currentVersion})`,
        })
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error checking updates',
        description: error.message,
      })
    } finally {
      setCheckingUpdates(false)
    }
  }

  const handleAcknowledgeUpdate = async () => {
    if (!user) return
    try {
      await acknowledgeCatalogUpdate(user.uid)
      setUpdateStatus(prev => prev ? { ...prev, hasUpdates: false } : null)
      toast({
        title: 'Catalog Updated',
        description: 'Your catalog has been marked as up to date',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    }
  }

  const resetForm = () => {
    setFormData({
      division: '01',
      category: '',
      description: '',
      unit: 'EA',
      materialCost: 0,
      laborCost: 0,
      equipmentCost: 0,
      notes: '',
      source: 'manual',
      tags: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleCreateMaterial = async () => {
    if (!user || !formData.description.trim()) return

    try {
      await createCustomMaterial({
        userId: user.uid,
        division: formData.division,
        category: formData.category.trim() || 'General',
        description: formData.description.trim(),
        unit: formData.unit.trim() || 'EA',
        materialCost: formData.materialCost,
        laborCost: formData.laborCost,
        equipmentCost: formData.equipmentCost,
        notes: formData.notes.trim() || undefined,
        source: formData.source,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        isActive: true,
      })

      toast({ title: 'Material added to your catalog' })
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating material',
        description: error.message,
      })
    }
  }

  const handleUpdateMaterial = async () => {
    if (!editingId) return

    try {
      await updateCustomMaterial(editingId, {
        division: formData.division,
        category: formData.category.trim() || 'General',
        description: formData.description.trim(),
        unit: formData.unit.trim() || 'EA',
        materialCost: formData.materialCost,
        laborCost: formData.laborCost,
        equipmentCost: formData.equipmentCost,
        notes: formData.notes.trim() || undefined,
        source: formData.source,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      })

      toast({ title: 'Material updated' })
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating material',
        description: error.message,
      })
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Delete this custom material?')) return
    try {
      await deleteCustomMaterial(id)
      toast({ title: 'Material deleted' })
      loadData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting material',
        description: error.message,
      })
    }
  }

  const handleDeleteOverride = async (id: string) => {
    if (!confirm('Remove this price override? Original prices will be restored.')) return
    try {
      await deletePriceOverride(id)
      toast({ title: 'Price override removed' })
      loadData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error removing override',
        description: error.message,
      })
    }
  }

  const startEditing = (material: CustomMaterial) => {
    setFormData({
      division: material.division,
      category: material.category,
      description: material.description,
      unit: material.unit,
      materialCost: material.materialCost,
      laborCost: material.laborCost,
      equipmentCost: material.equipmentCost,
      notes: material.notes || '',
      source: material.source || 'manual',
      tags: material.tags?.join(', ') || '',
    })
    setEditingId(material.id)
    setShowForm(true)
  }

  const catalogInfo = getCurrentCatalogVersion()

  const filteredCustomMaterials = customMaterials.filter(m =>
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUnitCost = formData.materialCost + formData.laborCost + formData.equipmentCost

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Materials Catalog
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Materials Catalog Manager
          </DialogTitle>
          <DialogDescription>
            Manage your materials database, custom materials, and price updates
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('catalog')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === 'catalog'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <RefreshCw className="w-4 h-4 inline mr-1.5" />
            Catalog & Updates
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === 'custom'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="w-4 h-4 inline mr-1.5" />
            Custom Materials ({customMaterials.length})
          </button>
          <button
            onClick={() => setTab('overrides')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === 'overrides'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-1.5" />
            Price Overrides ({priceOverrides.length})
          </button>
        </div>

        {/* Catalog Info Tab */}
        {tab === 'catalog' && (
          <div className="space-y-6">
            {/* Current Version */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Materials Database
                </h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  v{catalogInfo.version}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Materials</p>
                  <p className="font-semibold text-lg">{catalogInfo.totalItems.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">{catalogInfo.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Custom Materials</p>
                  <p className="font-semibold text-lg">{customMaterials.length}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCheckUpdates}
                  disabled={checkingUpdates}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${checkingUpdates ? 'animate-spin' : ''}`} />
                  Check for Updates
                </Button>

                {updateStatus && (
                  <div className={`flex items-center gap-2 text-sm ${
                    updateStatus.hasUpdates ? 'text-primary' : 'text-green-500'
                  }`}>
                    {updateStatus.hasUpdates ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Update available: v{updateStatus.currentVersion}</span>
                        <Button size="sm" onClick={handleAcknowledgeUpdate}>
                          Update Now
                        </Button>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Up to date</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Database Stats */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Your Catalog Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{catalogInfo.totalItems.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Built-in Materials</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{customMaterials.length}</p>
                  <p className="text-xs text-muted-foreground">Custom Materials</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{priceOverrides.length}</p>
                  <p className="text-xs text-muted-foreground">Price Overrides</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {(catalogInfo.totalItems + customMaterials.length).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Available</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">How Database Updates Work</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>The materials database is updated regularly with:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>New materials from suppliers and manufacturers</li>
                  <li>Updated pricing reflecting current market rates</li>
                  <li>New CSI division categories and subcategories</li>
                  <li>Corrected specifications and unit definitions</li>
                </ul>
                <p className="mt-3">Your <strong>custom materials</strong> and <strong>price overrides</strong> are always preserved during updates.</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Materials Tab */}
        {tab === 'custom' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => { resetForm(); setShowForm(!showForm) }}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm && !editingId ? 'Cancel' : 'Add Custom Material'}
              </Button>

              {customMaterials.length > 0 && (
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search custom materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              )}
            </div>

            {/* New/Edit Form */}
            {showForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h3 className="font-semibold">
                  {editingId ? 'Edit Material' : 'Add Custom Material'}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Division *</Label>
                    <Select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    >
                      {DIVISIONS_ALL.map(div => (
                        <option key={div.code} value={div.code}>
                          {div.code} - {div.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Specialty Items"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="EA, LF, SF, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Material description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Material Cost
                    </Label>
                    <Input
                      type="number"
                      value={formData.materialCost}
                      onChange={(e) => setFormData({ ...formData, materialCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Labor Cost</Label>
                    <Input
                      type="number"
                      value={formData.laborCost}
                      onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Equipment Cost</Label>
                    <Input
                      type="number"
                      value={formData.equipmentCost}
                      onChange={(e) => setFormData({ ...formData, equipmentCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="text-sm font-medium">Total Unit Cost:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(totalUnitCost)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Tags (comma-separated)
                    </Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., concrete, specialty"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button
                    onClick={editingId ? handleUpdateMaterial : handleCreateMaterial}
                    disabled={!formData.description.trim()}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {editingId ? 'Update' : 'Save Material'}
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Custom Materials List */}
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : filteredCustomMaterials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No custom materials yet</p>
                <p className="text-sm">Add materials that aren't in the built-in database</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Division</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Unit Cost</th>
                      <th className="text-center p-2">Unit</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomMaterials.map(material => (
                      <tr key={material.id} className="border-t hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{material.division}</td>
                        <td className="p-2">
                          <span className="font-medium">{material.description}</span>
                          {material.tags && material.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {material.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground">{material.category}</td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrency(material.materialCost + material.laborCost + material.equipmentCost)}
                        </td>
                        <td className="p-2 text-center">{material.unit}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => startEditing(material)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Price Overrides Tab */}
        {tab === 'overrides' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Price overrides let you adjust costs for built-in materials without modifying the original database.</p>
              <p className="mt-1">To override a price, click "Override Price" on any material in the Material Browser.</p>
            </div>

            <Separator />

            {priceOverrides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No price overrides set</p>
                <p className="text-sm">Override prices from the Material Browser to customize costs</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Material ID</th>
                      <th className="text-right p-2">Material $</th>
                      <th className="text-right p-2">Labor $</th>
                      <th className="text-right p-2">Equipment $</th>
                      <th className="text-left p-2">Notes</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceOverrides.map(override => (
                      <tr key={override.id} className="border-t hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{override.materialId}</td>
                        <td className="p-2 text-right">
                          {override.materialCost !== undefined ? formatCurrency(override.materialCost) : '-'}
                        </td>
                        <td className="p-2 text-right">
                          {override.laborCost !== undefined ? formatCurrency(override.laborCost) : '-'}
                        </td>
                        <td className="p-2 text-right">
                          {override.equipmentCost !== undefined ? formatCurrency(override.equipmentCost) : '-'}
                        </td>
                        <td className="p-2 text-muted-foreground">{override.notes || '-'}</td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteOverride(override.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
