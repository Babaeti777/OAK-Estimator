/**
 * AI Estimator Dialog
 *
 * Allows users to upload construction drawings and receive
 * AI-generated preliminary cost estimates mapped to CSI divisions.
 */

import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useProject } from '@/contexts/ProjectContext'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { getDivisionLabel } from '@/data/divisions'
import {
  analyzeDrawing,
  fileToBase64,
  SUPPORTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from '@/services/ai-estimator.service'
import type { AIEstimateItem, AIEstimateResult } from '@/services/ai-estimator.service'
import {
  Sparkles,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  FileImage,
  Eye,
  EyeOff,
  Plus,
  Info,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 'upload' | 'analyzing' | 'review'

interface AIEstimatorDialogProps {
  trigger?: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  Confidence badge                                                   */
/* ------------------------------------------------------------------ */

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-green-500/15 text-green-600 dark:text-green-400',
    medium: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
    low: 'bg-red-500/15 text-red-600 dark:text-red-400',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${styles[level]}`}>
      {level}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AIEstimatorDialog({ trigger }: AIEstimatorDialogProps) {
  const { currentProject, addLineItem } = useProject()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('upload')

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('oak_anthropic_key') || '')
  const [context, setContext] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Analysis state
  const [result, setResult] = useState<AIEstimateResult | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [showNotes, setShowNotes] = useState(false)

  // Import state
  const [importing, setImporting] = useState(false)

  /* ---- Reset ---- */
  const reset = useCallback(() => {
    setStep('upload')
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setSelectedItems(new Set())
    setContext('')
    setShowNotes(false)
    setImporting(false)
  }, [])

  /* ---- File handling ---- */
  const handleFile = useCallback((file: File) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported file type',
        description: 'Please upload a PNG, JPEG, GIF, or WebP image.',
      })
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Maximum file size is 20 MB.',
      })
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const removeFile = useCallback(() => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [previewUrl])

  /* ---- Analyze ---- */
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !apiKey.trim()) return

    // Persist key for convenience
    localStorage.setItem('oak_anthropic_key', apiKey.trim())

    setStep('analyzing')

    try {
      const base64 = await fileToBase64(selectedFile)
      const res = await analyzeDrawing(base64, selectedFile.type, apiKey.trim(), {
        projectName: currentProject?.projectSettings.projectName,
        location: currentProject?.projectSettings.location,
        additionalContext: context || undefined,
      })

      setResult(res)
      // Select all items by default
      setSelectedItems(new Set(res.items.map((_, i) => i)))
      setStep('review')
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: getErrorMessage(error) || 'Failed to analyze drawing.',
      })
      setStep('upload')
    }
  }, [selectedFile, apiKey, currentProject, context])

  /* ---- Import selected items ---- */
  const handleImport = useCallback(async () => {
    if (!result || selectedItems.size === 0) return

    setImporting(true)
    let successCount = 0
    let failCount = 0

    const itemsToImport = result.items.filter((_, i) => selectedItems.has(i))

    try {
      for (const item of itemsToImport) {
        try {
          await addLineItem({
            division: item.division,
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            unit: item.unit,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
            notes: item.notes ? `AI Generated: ${item.notes}` : 'AI Generated from drawing',
          })
          successCount++
        } catch {
          failCount++
        }
      }

      toast({
        title: 'Import complete',
        description: `${successCount} item(s) added${failCount > 0 ? `, ${failCount} failed` : ''}.`,
      })

      setOpen(false)
      reset()
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: getErrorMessage(error),
      })
    } finally {
      setImporting(false)
    }
  }, [result, selectedItems, addLineItem, reset])

  /* ---- Selection helpers ---- */
  const toggleItem = (index: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleAll = () => {
    if (!result) return
    if (selectedItems.size === result.items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(result.items.map((_, i) => i)))
    }
  }

  const selectedTotal = result
    ? result.items
        .filter((_, i) => selectedItems.has(i))
        .reduce((sum, item) => sum + item.totalCost, 0)
    : 0

  /* ---- Render ---- */
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            AI Estimate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle>AI Drawing Estimator</DialogTitle>
              <DialogDescription>
                Upload a construction drawing to generate a preliminary estimate
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ============ STEP 1: UPLOAD ============ */}
        {step === 'upload' && (
          <div className="space-y-4">
            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Anthropic API Key</label>
              <Input
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your key is stored locally and never sent to our servers.
                Get one at{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${selectedFile ? 'p-4' : 'p-8'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_IMAGE_TYPES.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />

              {selectedFile && previewUrl ? (
                <div className="flex items-start gap-4">
                  <img
                    src={previewUrl}
                    alt="Drawing preview"
                    className="w-32 h-32 object-contain rounded border bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile()
                      }}
                      className="mt-2 text-destructive hover:text-destructive h-7 px-2 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Drop a drawing here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPEG, GIF, WebP up to 20 MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional context */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Additional Context (optional)</label>
              <Input
                placeholder="e.g. 2-story residential, wood frame, 2,400 SF..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted text-sm">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                The AI will analyze your drawing to identify building systems, estimate quantities,
                and generate line items mapped to CSI divisions. You can review and edit everything before importing.
              </p>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || !apiKey.trim()}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Drawing
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ============ STEP 2: ANALYZING ============ */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-medium">Analyzing your drawing...</p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take 15-30 seconds depending on the complexity.
              </p>
            </div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Analyzing"
                className="w-48 h-48 object-contain rounded border bg-muted mt-4 opacity-60"
              />
            )}
          </div>
        )}

        {/* ============ STEP 3: REVIEW ============ */}
        {step === 'review' && result && (
          <div className="space-y-4">
            {/* Summary card */}
            <Card className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Analysis Complete
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{result.summary}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-muted font-medium">
                  {result.projectType}
                </span>
              </div>

              {result.warnings.length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {result.warnings.map((w, i) => (
                      <p key={i} className="text-yellow-700 dark:text-yellow-400">{w}</p>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleAll} className="text-xs h-7">
                  {selectedItems.size === result.items.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {selectedItems.size} of {result.items.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs h-7 gap-1"
                >
                  {showNotes ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  Notes
                </Button>
                <span className="text-sm font-semibold">
                  {formatCurrency(selectedTotal)}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 w-8"></th>
                    <th className="px-2 py-2 text-left text-xs">Division</th>
                    <th className="px-2 py-2 text-left text-xs">Description</th>
                    <th className="px-2 py-2 text-left text-xs w-14">Type</th>
                    <th className="px-2 py-2 text-right text-xs">Qty</th>
                    <th className="px-2 py-2 text-left text-xs w-12">Unit</th>
                    <th className="px-2 py-2 text-right text-xs">Unit Cost</th>
                    <th className="px-2 py-2 text-right text-xs">Total</th>
                    <th className="px-2 py-2 text-center text-xs w-12">Conf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((item, index) => (
                    <ReviewRow
                      key={index}
                      item={item}
                      index={index}
                      selected={selectedItems.has(index)}
                      showNotes={showNotes}
                      onToggle={toggleItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <DialogFooter className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('upload')
                  setResult(null)
                }}
              >
                Re-upload
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedItems.size === 0 || importing}
                className="gap-2"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Import {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Review row                                                         */
/* ------------------------------------------------------------------ */

function ReviewRow({
  item,
  index,
  selected,
  showNotes,
  onToggle,
}: {
  item: AIEstimateItem
  index: number
  selected: boolean
  showNotes: boolean
  onToggle: (i: number) => void
}) {
  return (
    <>
      <tr
        className={`cursor-pointer transition-colors ${
          selected ? 'bg-primary/5' : 'hover:bg-muted/30'
        }`}
        onClick={() => onToggle(index)}
      >
        <td className="px-2 py-2 text-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(index)}
            className="cursor-pointer"
          />
        </td>
        <td className="px-2 py-2 text-xs text-muted-foreground" title={getDivisionLabel(item.division)}>
          {item.division}
        </td>
        <td className="px-2 py-2 text-sm">{item.description}</td>
        <td className="px-2 py-2 text-xs text-muted-foreground capitalize">{item.type}</td>
        <td className="px-2 py-2 text-right tabular-nums">{item.quantity}</td>
        <td className="px-2 py-2 text-xs">{item.unit}</td>
        <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(item.unitCost)}</td>
        <td className="px-2 py-2 text-right font-medium tabular-nums">{formatCurrency(item.totalCost)}</td>
        <td className="px-2 py-2 text-center">
          <ConfidenceBadge level={item.confidence} />
        </td>
      </tr>
      {showNotes && item.notes && (
        <tr className={selected ? 'bg-primary/5' : ''}>
          <td></td>
          <td colSpan={8} className="px-2 pb-2 text-xs text-muted-foreground italic">
            {item.notes}
          </td>
        </tr>
      )}
    </>
  )
}
