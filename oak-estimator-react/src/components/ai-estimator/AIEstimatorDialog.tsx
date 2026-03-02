/**
 * AI Estimator Dialog
 *
 * Allows users to upload construction drawings (images or PDFs) and receive
 * AI-generated preliminary cost estimates mapped to CSI divisions.
 * Supports multi-page PDF handling with page selection.
 */

import { useState, useRef, useCallback, useMemo } from 'react'
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
  analyzeMultiplePages,
  renderPDFThumbnails,
  renderPDFPages,
  fileToBase64,
  SUPPORTED_FILE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_PDF_SIZE,
} from '@/services/ai-estimator.service'
import type { AIEstimateItem, AIEstimateResult, PDFPageImage } from '@/services/ai-estimator.service'
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
  FileText,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Hash,
  DollarSign,
  BarChart3,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 'upload' | 'page-select' | 'analyzing' | 'review'

interface AIEstimatorDialogProps {
  trigger?: React.ReactNode
}

interface PDFThumbnail {
  pageNumber: number
  thumbnailUrl: string
}

/* ------------------------------------------------------------------ */
/*  Small UI components                                                */
/* ------------------------------------------------------------------ */

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    low: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${styles[level]}`}>
      {level}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    material: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    labor: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    equipment: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    subcontractor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
    misc: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${styles[type] || styles.misc}`}>
      {type}
    </span>
  )
}

function PageBadge({ page }: { page?: number }) {
  if (!page) return null
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">
      pg {page}
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

  // PDF state
  const [isPDF, setIsPDF] = useState(false)
  const [pdfThumbnails, setPdfThumbnails] = useState<PDFThumbnail[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [pdfLoadProgress, setPdfLoadProgress] = useState('')

  // Analysis state
  const [result, setResult] = useState<AIEstimateResult | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [showNotes, setShowNotes] = useState(true)
  const [analyzeProgress, setAnalyzeProgress] = useState('')

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
    setShowNotes(true)
    setImporting(false)
    setIsPDF(false)
    setPdfThumbnails([])
    setSelectedPages(new Set())
    setLoadingPDF(false)
    setPdfLoadProgress('')
    setAnalyzeProgress('')
  }, [])

  /* ---- File handling ---- */
  const handleFile = useCallback(async (file: File) => {
    const isFilePDF = file.type === 'application/pdf'

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported file type',
        description: 'Please upload a PNG, JPEG, GIF, WebP image, or PDF file.',
      })
      return
    }

    const maxSize = isFilePDF ? MAX_PDF_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: isFilePDF ? 'Maximum PDF size is 50 MB.' : 'Maximum image size is 20 MB.',
      })
      return
    }

    setSelectedFile(file)
    setIsPDF(isFilePDF)

    if (isFilePDF) {
      setLoadingPDF(true)
      setPdfLoadProgress('Loading PDF...')
      try {
        const thumbnails = await renderPDFThumbnails(file, (page, total) => {
          setPdfLoadProgress(`Rendering page ${page} of ${total}...`)
        })
        setPdfThumbnails(thumbnails)
        setSelectedPages(new Set(thumbnails.map(t => t.pageNumber)))
        if (thumbnails.length > 0) {
          setPreviewUrl(thumbnails[0].thumbnailUrl)
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load PDF',
          description: getErrorMessage(error),
        })
        setSelectedFile(null)
        setIsPDF(false)
      } finally {
        setLoadingPDF(false)
        setPdfLoadProgress('')
      }
    } else {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
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
    if (previewUrl && !isPDF) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setIsPDF(false)
    setPdfThumbnails([])
    setSelectedPages(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [previewUrl, isPDF])

  /* ---- PDF page selection ---- */
  const togglePage = useCallback((pageNum: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev)
      if (next.has(pageNum)) next.delete(pageNum)
      else next.add(pageNum)
      return next
    })
  }, [])

  const toggleAllPages = useCallback(() => {
    if (selectedPages.size === pdfThumbnails.length) {
      setSelectedPages(new Set())
    } else {
      setSelectedPages(new Set(pdfThumbnails.map(t => t.pageNumber)))
    }
  }, [selectedPages, pdfThumbnails])

  /* ---- Analyze ---- */
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !apiKey.trim()) return

    localStorage.setItem('oak_anthropic_key', apiKey.trim())
    setStep('analyzing')

    try {
      let res: AIEstimateResult

      if (isPDF) {
        const pagesToAnalyze = Array.from(selectedPages).sort((a, b) => a - b)

        if (pagesToAnalyze.length === 0) {
          toast({ variant: 'destructive', title: 'No pages selected', description: 'Please select at least one page.' })
          setStep('page-select')
          return
        }

        setAnalyzeProgress('Rendering PDF pages for analysis...')
        const renderedPages: PDFPageImage[] = await renderPDFPages(
          selectedFile,
          pagesToAnalyze,
          (page, total) => {
            setAnalyzeProgress(`Rendering page ${page} (${total} total)...`)
          },
        )

        setAnalyzeProgress(`Sending ${renderedPages.length} page(s) to AI...`)
        res = await analyzeMultiplePages(
          renderedPages,
          apiKey.trim(),
          {
            projectName: currentProject?.projectSettings.projectName,
            location: currentProject?.projectSettings.location,
            additionalContext: context || undefined,
          },
          (msg) => setAnalyzeProgress(msg),
        )
      } else {
        setAnalyzeProgress('Analyzing drawing...')
        const base64 = await fileToBase64(selectedFile)
        res = await analyzeDrawing(base64, selectedFile.type, apiKey.trim(), {
          projectName: currentProject?.projectSettings.projectName,
          location: currentProject?.projectSettings.location,
          additionalContext: context || undefined,
        })
      }

      setResult(res)
      setSelectedItems(new Set(res.items.map((_, i) => i)))
      setStep('review')
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: getErrorMessage(error) || 'Failed to analyze drawing.',
      })
      setStep(isPDF ? 'page-select' : 'upload')
    } finally {
      setAnalyzeProgress('')
    }
  }, [selectedFile, apiKey, currentProject, context, isPDF, selectedPages])

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
            notes: item.notes
              ? `AI Generated${item.sourcePage ? ` (Page ${item.sourcePage})` : ''}: ${item.notes}`
              : `AI Generated from ${isPDF ? 'PDF drawing' : 'drawing'}`,
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
  }, [result, selectedItems, addLineItem, reset, isPDF])

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

  // Stats for the review summary
  const reviewStats = useMemo(() => {
    if (!result) return null
    const selected = result.items.filter((_, i) => selectedItems.has(i))
    const byType: Record<string, number> = {}
    const byConfidence: Record<string, number> = { high: 0, medium: 0, low: 0 }
    for (const item of selected) {
      byType[item.type] = (byType[item.type] || 0) + item.totalCost
      byConfidence[item.confidence]++
    }
    return { byType, byConfidence, count: selected.length }
  }, [result, selectedItems])

  const hasSourcePages = useMemo(() =>
    result?.items.some(item => item.sourcePage != null) ?? false,
  [result])

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
              <DialogTitle className="text-base">AI Drawing Estimator</DialogTitle>
              <DialogDescription className="text-xs">
                Upload a construction drawing or PDF to generate a preliminary estimate
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ============ STEP 1: UPLOAD ============ */}
        {step === 'upload' && (
          <div className="space-y-3">
            {/* API Key */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Anthropic API Key</label>
              <Input
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-8 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Stored locally, never sent to our servers.{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Get a key
                </a>
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !selectedFile && !loadingPDF && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${selectedFile ? 'p-3' : 'p-6'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_FILE_TYPES.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />

              {loadingPDF ? (
                <div className="flex flex-col items-center gap-2 text-center py-3">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Loading PDF...</p>
                    <p className="text-xs text-muted-foreground">{pdfLoadProgress}</p>
                  </div>
                </div>
              ) : selectedFile && (isPDF ? pdfThumbnails.length > 0 : previewUrl) ? (
                <div className="flex items-center gap-3">
                  {isPDF ? (
                    <div className="w-20 h-24 rounded border bg-muted flex-shrink-0 relative overflow-hidden">
                      <img
                        src={pdfThumbnails[0]?.thumbnailUrl}
                        alt="PDF preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-px leading-tight">
                        {pdfThumbnails.length} pg{pdfThumbnails.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewUrl!}
                      alt="Drawing preview"
                      className="w-20 h-24 object-contain rounded border bg-muted flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isPDF ? (
                        <FileText className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      ) : (
                        <FileImage className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      {isPDF && ` \u00B7 ${pdfThumbnails.length} page${pdfThumbnails.length !== 1 ? 's' : ''}`}
                    </p>
                    {isPDF && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                        PDF detected \u2013 select specific pages to analyze
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile()
                      }}
                      className="mt-1 text-destructive hover:text-destructive h-6 px-1.5 text-[11px]"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop a drawing here or click to browse</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PNG, JPEG, WebP up to 20 MB &bull; PDF up to 50 MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional context */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Additional Context (optional)</label>
              <Input
                placeholder="e.g. 2-story residential, wood frame, 2,400 SF..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/60 text-[11px] leading-relaxed">
              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                AI identifies building systems, estimates quantities, and generates CSI-mapped line items.
                {isPDF && ' For multi-page PDFs, select which pages to include.'}
                {' '}Review everything before importing.
              </p>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {isPDF && pdfThumbnails.length > 1 ? (
                <Button
                  size="sm"
                  onClick={() => setStep('page-select')}
                  disabled={!selectedFile || !apiKey.trim()}
                  className="gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Select Pages ({pdfThumbnails.length})
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={!selectedFile || !apiKey.trim() || loadingPDF}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze {isPDF ? 'PDF' : 'Drawing'}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* ============ STEP 1.5: PAGE SELECTOR (PDF only) ============ */}
        {step === 'page-select' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleAllPages} className="text-xs h-7 gap-1">
                  {selectedPages.size === pdfThumbnails.length ? (
                    <><CheckSquare className="h-3 w-3" /> Deselect All</>
                  ) : (
                    <><Square className="h-3 w-3" /> Select All</>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {selectedPages.size} of {pdfThumbnails.length} selected
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Click to toggle
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[380px] overflow-y-auto p-0.5">
              {pdfThumbnails.map((thumb) => {
                const isSelected = selectedPages.has(thumb.pageNumber)
                return (
                  <button
                    key={thumb.pageNumber}
                    onClick={() => togglePage(thumb.pageNumber)}
                    className={`relative rounded-lg border-2 overflow-hidden transition-all
                      ${isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                        : 'border-border hover:border-primary/40 opacity-50 hover:opacity-90'
                      }`}
                  >
                    <img
                      src={thumb.thumbnailUrl}
                      alt={`Page ${thumb.pageNumber}`}
                      className="w-full aspect-[8.5/11] object-contain bg-white"
                    />
                    <div className={`absolute bottom-0 left-0 right-0 text-center py-px text-[10px] font-medium
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {thumb.pageNumber}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="h-4 w-4 text-primary drop-shadow" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <DialogFooter className="border-t pt-3">
              <Button variant="outline" size="sm" onClick={() => setStep('upload')} className="gap-1">
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={selectedPages.size === 0}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analyze {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ============ STEP 2: ANALYZING ============ */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Analyzing your {isPDF ? 'PDF' : 'drawing'}...</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {analyzeProgress || (isPDF
                  ? `Processing ${selectedPages.size} page${selectedPages.size !== 1 ? 's' : ''}. This may take 30\u201360 seconds.`
                  : 'This may take 15\u201330 seconds.')}
              </p>
            </div>
            {isPDF && pdfThumbnails.length > 0 ? (
              <div className="flex gap-1.5 mt-2 flex-wrap justify-center max-w-sm">
                {pdfThumbnails
                  .filter(t => selectedPages.has(t.pageNumber))
                  .slice(0, 8)
                  .map(t => (
                    <div key={t.pageNumber} className="relative">
                      <img
                        src={t.thumbnailUrl}
                        alt={`Page ${t.pageNumber}`}
                        className="w-12 h-16 object-contain rounded border bg-white opacity-50"
                      />
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/40 text-white rounded-b">
                        {t.pageNumber}
                      </span>
                    </div>
                  ))}
                {selectedPages.size > 8 && (
                  <div className="w-12 h-16 rounded border bg-muted flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">+{selectedPages.size - 8}</span>
                  </div>
                )}
              </div>
            ) : previewUrl && (
              <img
                src={previewUrl}
                alt="Analyzing"
                className="w-36 h-36 object-contain rounded border bg-muted mt-2 opacity-50"
              />
            )}
          </div>
        )}

        {/* ============ STEP 3: REVIEW ============ */}
        {step === 'review' && result && (
          <div className="space-y-3">
            {/* Summary card with stats */}
            <Card className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    Analysis Complete
                    {isPDF && selectedPages.size > 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {selectedPages.size} pages
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{result.summary}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-medium whitespace-nowrap shrink-0">
                  {result.projectType}
                </span>
              </div>

              {/* Stats row */}
              {reviewStats && reviewStats.count > 0 && (
                <div className="flex items-center gap-3 pt-1.5 border-t text-[11px]">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    <span>{reviewStats.count} items</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-semibold text-foreground">{formatCurrency(selectedTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <BarChart3 className="h-3 w-3 text-muted-foreground" />
                    <div className="flex gap-1">
                      {reviewStats.byConfidence.high > 0 && (
                        <span className="text-green-600 dark:text-green-400">{reviewStats.byConfidence.high}H</span>
                      )}
                      {reviewStats.byConfidence.medium > 0 && (
                        <span className="text-yellow-600 dark:text-yellow-400">{reviewStats.byConfidence.medium}M</span>
                      )}
                      {reviewStats.byConfidence.low > 0 && (
                        <span className="text-red-600 dark:text-red-400">{reviewStats.byConfidence.low}L</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="flex items-start gap-1.5 p-2 rounded bg-yellow-500/10 text-[11px]">
                  <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {result.warnings.map((w, i) => (
                      <p key={i} className="text-yellow-700 dark:text-yellow-400 leading-relaxed">{w}</p>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleAll} className="text-[11px] h-6 px-2">
                  {selectedItems.size === result.items.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  {selectedItems.size}/{result.items.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] h-6 px-2 gap-1"
              >
                {showNotes ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showNotes ? 'Hide' : 'Show'} Details
              </Button>
            </div>

            {/* Items list (card-based) */}
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-0.5">
              {result.items.map((item, index) => (
                <ReviewItemCard
                  key={index}
                  item={item}
                  index={index}
                  selected={selectedItems.has(index)}
                  showDetails={showNotes}
                  showSourcePage={hasSourcePages}
                  onToggle={toggleItem}
                />
              ))}
            </div>

            {/* Footer */}
            <DialogFooter className="border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isPDF && pdfThumbnails.length > 1) {
                    setStep('page-select')
                  } else {
                    setStep('upload')
                  }
                  setResult(null)
                }}
              >
                {isPDF && pdfThumbnails.length > 1 ? 'Change Pages' : 'Re-upload'}
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={selectedItems.size === 0 || importing}
                className="gap-1.5"
              >
                {importing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Import {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''} ({formatCurrency(selectedTotal)})
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Review item card                                                   */
/* ------------------------------------------------------------------ */

function ReviewItemCard({
  item,
  index,
  selected,
  showDetails,
  showSourcePage,
  onToggle,
}: {
  item: AIEstimateItem
  index: number
  selected: boolean
  showDetails: boolean
  showSourcePage: boolean
  onToggle: (i: number) => void
}) {
  const divLabel = getDivisionLabel(item.division)

  return (
    <div
      onClick={() => onToggle(index)}
      className={`rounded-lg border px-3 py-2 cursor-pointer transition-all
        ${selected
          ? 'border-primary/40 bg-primary/[0.03] shadow-sm'
          : 'border-transparent bg-muted/30 hover:bg-muted/50 opacity-60 hover:opacity-100'
        }`}
    >
      {/* Row 1: Checkbox + Description + Total */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(index)}
          className="cursor-pointer mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{item.description}</p>
        </div>
        <div className="text-right shrink-0 pl-2">
          <p className="text-sm font-semibold tabular-nums">{formatCurrency(item.totalCost)}</p>
        </div>
      </div>

      {/* Row 2: Badges + qty breakdown */}
      <div className="flex items-center gap-1.5 mt-1.5 ml-6 flex-wrap">
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-px rounded">
          {item.division}
        </span>
        <TypeBadge type={item.type} />
        <ConfidenceBadge level={item.confidence} />
        {showSourcePage && <PageBadge page={item.sourcePage} />}
        <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
          {item.quantity} {item.unit} &times; {formatCurrency(item.unitCost)}
        </span>
      </div>

      {/* Row 3: Details (division label + notes) */}
      {showDetails && (
        <div className="mt-1.5 ml-6 space-y-0.5">
          <p className="text-[11px] text-muted-foreground">
            {divLabel}
          </p>
          {item.notes && (
            <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">
              {item.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
