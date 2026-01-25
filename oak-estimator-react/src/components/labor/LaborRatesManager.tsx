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
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import {
  getUserLaborRates,
  createLaborRate,
  updateLaborRate,
  deleteLaborRate,
  calculateEffectiveRate,
  DEFAULT_LABOR_CATEGORIES,
} from '@/services/labor-rates.service'
import { formatCurrency } from '@/lib/utils'
import type { LaborRate } from '@/types'
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  DollarSign,
  Calculator,
} from 'lucide-react'

export function LaborRatesManager() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [laborRates, setLaborRates] = useState<LaborRate[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New/Edit form state
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    tradeName: '',
    tradeCode: '',
    description: '',
    hourlyRate: 50,
    overtimeMultiplier: 1.5,
    benefitsRate: 30,
    burdenRate: 15,
  })

  useEffect(() => {
    if (open && user) {
      loadLaborRates()
    }
  }, [open, user])

  const loadLaborRates = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUserLaborRates(user.uid)
      setLaborRates(data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading labor rates',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tradeName: '',
      tradeCode: '',
      description: '',
      hourlyRate: 50,
      overtimeMultiplier: 1.5,
      benefitsRate: 30,
      burdenRate: 15,
    })
    setEditingId(null)
    setShowNewForm(false)
  }

  const handleCreate = async () => {
    if (!user || !formData.tradeName.trim()) return

    try {
      await createLaborRate({
        userId: user.uid,
        tradeName: formData.tradeName.trim(),
        tradeCode: formData.tradeCode.trim() || formData.tradeName.slice(0, 4).toUpperCase(),
        description: formData.description.trim(),
        hourlyRate: formData.hourlyRate,
        overtimeMultiplier: formData.overtimeMultiplier,
        benefitsRate: formData.benefitsRate,
        burdenRate: formData.burdenRate,
      })

      toast({ title: 'Labor rate created' })
      resetForm()
      loadLaborRates()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating labor rate',
        description: error.message,
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return

    try {
      await updateLaborRate(editingId, {
        tradeName: formData.tradeName.trim(),
        tradeCode: formData.tradeCode.trim(),
        description: formData.description.trim(),
        hourlyRate: formData.hourlyRate,
        overtimeMultiplier: formData.overtimeMultiplier,
        benefitsRate: formData.benefitsRate,
        burdenRate: formData.burdenRate,
      })

      toast({ title: 'Labor rate updated' })
      resetForm()
      loadLaborRates()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating labor rate',
        description: error.message,
      })
    }
  }

  const handleDelete = async (rateId: string) => {
    try {
      await deleteLaborRate(rateId)
      toast({ title: 'Labor rate deleted' })
      loadLaborRates()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting labor rate',
        description: error.message,
      })
    }
  }

  const startEditing = (rate: LaborRate) => {
    setFormData({
      tradeName: rate.tradeName,
      tradeCode: rate.tradeCode,
      description: rate.description || '',
      hourlyRate: rate.hourlyRate,
      overtimeMultiplier: rate.overtimeMultiplier,
      benefitsRate: rate.benefitsRate || 0,
      burdenRate: rate.burdenRate || 0,
    })
    setEditingId(rate.id)
    setShowNewForm(true)
  }

  const effectiveRate = calculateEffectiveRate(
    formData.hourlyRate,
    formData.benefitsRate,
    formData.burdenRate
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Labor Rates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Labor Rate Management
          </DialogTitle>
          <DialogDescription>
            Manage hourly rates by trade for accurate labor cost calculations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetForm()
                setShowNewForm(!showNewForm)
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showNewForm && !editingId ? 'Cancel' : 'New Rate'}
            </Button>
          </div>

          {/* New/Edit Form */}
          {showNewForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="font-semibold">
                {editingId ? 'Edit Labor Rate' : 'Create New Labor Rate'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trade Name *</Label>
                  <Input
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="e.g., Electrician"
                    list="trade-suggestions"
                  />
                  <datalist id="trade-suggestions">
                    {DEFAULT_LABOR_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.name} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Trade Code</Label>
                  <Input
                    value={formData.tradeCode}
                    onChange={(e) => setFormData({ ...formData, tradeCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., ELEC"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Hourly Rate
                  </Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>OT Multiplier</Label>
                  <Input
                    type="number"
                    value={formData.overtimeMultiplier}
                    onChange={(e) => setFormData({ ...formData, overtimeMultiplier: parseFloat(e.target.value) || 1 })}
                    min="1"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Benefits %</Label>
                  <Input
                    type="number"
                    value={formData.benefitsRate}
                    onChange={(e) => setFormData({ ...formData, benefitsRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Burden %</Label>
                  <Input
                    type="number"
                    value={formData.burdenRate}
                    onChange={(e) => setFormData({ ...formData, burdenRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="text-sm">Effective Rate (with burden):</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(effectiveRate)}/hr
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={editingId ? handleUpdate : handleCreate}>
                  <Save className="w-4 h-4 mr-1" />
                  {editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Labor Rates List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Saved Labor Rates ({laborRates.length})</h3>

            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : laborRates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No labor rates configured yet</p>
                <p className="text-sm">Add rates to calculate accurate labor costs</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Trade</th>
                      <th className="text-right p-2">Hourly</th>
                      <th className="text-right p-2">Benefits</th>
                      <th className="text-right p-2">Burden</th>
                      <th className="text-right p-2">Effective</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laborRates.map((rate) => (
                      <tr key={rate.id} className="border-t hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <span className="font-medium">{rate.tradeName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              [{rate.tradeCode}]
                            </span>
                          </div>
                          {rate.description && (
                            <p className="text-xs text-muted-foreground">{rate.description}</p>
                          )}
                        </td>
                        <td className="text-right p-2">{formatCurrency(rate.hourlyRate)}</td>
                        <td className="text-right p-2">{rate.benefitsRate || 0}%</td>
                        <td className="text-right p-2">{rate.burdenRate || 0}%</td>
                        <td className="text-right p-2 font-semibold text-primary">
                          {formatCurrency(rate.effectiveRate)}
                        </td>
                        <td className="text-right p-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(rate)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rate.id)}
                            >
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
