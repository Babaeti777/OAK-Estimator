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
/*  Page badge (shows which PDF page an item came from)                */
/* ------------------------------------------------------------------ */

function PageBadge({ page }: { page?: number }) {
  if (!page) return null
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
      p.{page}
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
  const [showNotes, setShowNotes] = useState(false)
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
    setShowNotes(false)
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
      // Load PDF thumbnails
      setLoadingPDF(true)
      setPdfLoadProgress('Loading PDF...')
      try {
        const thumbnails = await renderPDFThumbnails(file, (page, total) => {
          setPdfLoadProgress(`Rendering page ${page} of ${total}...`)
        })
        setPdfThumbnails(thumbnails)
        // Select all pages by default
        setSelectedPages(new Set(thumbnails.map(t => t.pageNumber)))
        // Use first page thumbnail as preview
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

    // Persist key for convenience
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

        // Render selected pages at high res
        setAnalyzeProgress('Rendering PDF pages for analysis...')
        const renderedPages: PDFPageImage[] = await renderPDFPages(
          selectedFile,
          pagesToAnalyze,
          (page, total) => {
            setAnalyzeProgress(`Rendering page ${page} (${total} total)...`)
          },
        )

        // Send to AI
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
        // Single image flow (unchanged)
        setAnalyzeProgress('Analyzing drawing...')
        const base64 = await fileToBase64(selectedFile)
        res = await analyzeDrawing(base64, selectedFile.type, apiKey.trim(), {
          projectName: currentProject?.projectSettings.projectName,
          location: currentProject?.projectSettings.location,
          additionalContext: context || undefined,
        })
      }

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

  // Check if any items have source pages (multipage mode)
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
              <DialogTitle>AI Drawing Estimator</DialogTitle>
              <DialogDescription>
                Upload a construction drawing or PDF to generate a preliminary estimate
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
              onClick={() => !selectedFile && !loadingPDF && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${selectedFile ? 'p-4' : 'p-8'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_FILE_TYPES.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />

              {loadingPDF ? (
                <div className="flex flex-col items-center gap-3 text-center py-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Loading PDF...</p>
                    <p className="text-xs text-muted-foreground mt-1">{pdfLoadProgress}</p>
                  </div>
                </div>
              ) : selectedFile && (isPDF ? pdfThumbnails.length > 0 : previewUrl) ? (
                <div className="flex items-start gap-4">
                  {isPDF ? (
                    <div className="w-32 h-32 rounded border bg-muted flex items-center justify-center relative overflow-hidden">
                      <img
                        src={pdfThumbnails[0]?.thumbnailUrl}
                        alt="PDF preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                        {pdfThumbnails.length} page{pdfThumbnails.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewUrl!}
                      alt="Drawing preview"
                      className="w-32 h-32 object-contain rounded border bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isPDF ? (
                        <FileText className="h-4 w-4 text-red-500 shrink-0" />
                      ) : (
                        <FileImage className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      {isPDF && ` \u00B7 ${pdfThumbnails.length} page${pdfThumbnails.length !== 1 ? 's' : ''}`}
                    </p>
                    {isPDF && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        PDF detected \u2013 you can select specific pages to analyze
                      </p>
                    )}
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
                      PNG, JPEG, GIF, WebP up to 20 MB &bull; PDF up to 50 MB
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
                and generate line items mapped to CSI divisions.
                {isPDF && ' For multi-page PDFs, you can select which pages to include in the analysis.'}
                {' '}You can review and edit everything before importing.
              </p>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {isPDF && pdfThumbnails.length > 1 ? (
                <Button
                  onClick={() => setStep('page-select')}
                  disabled={!selectedFile || !apiKey.trim()}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Select Pages ({pdfThumbnails.length})
                </Button>
              ) : (
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || !apiKey.trim() || loadingPDF}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze {isPDF ? 'PDF' : 'Drawing'}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* ============ STEP 1.5: PAGE SELECTOR (PDF only) ============ */}
        {step === 'page-select' && (
          <div className="space-y-4">
            {/* Page selector toolbar */}
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
                  {selectedPages.size} of {pdfThumbnails.length} pages selected
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Click pages to toggle selection
              </span>
            </div>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-1">
              {pdfThumbnails.map((thumb) => {
                const isSelected = selectedPages.has(thumb.pageNumber)
                return (
                  <button
                    key={thumb.pageNumber}
                    onClick={() => togglePage(thumb.pageNumber)}
                    className={`relative rounded-lg border-2 overflow-hidden transition-all group
                      ${isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                        : 'border-border hover:border-primary/40 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={thumb.thumbnailUrl}
                      alt={`Page ${thumb.pageNumber}`}
                      className="w-full aspect-[8.5/11] object-contain bg-white"
                    />
                    {/* Page number label */}
                    <div className={`absolute bottom-0 left-0 right-0 text-center py-0.5 text-[10px] font-medium
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {thumb.pageNumber}
                    </div>
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="h-4 w-4 text-primary drop-shadow" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setStep('upload')} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={selectedPages.size === 0}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Analyze {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ============ STEP 2: ANALYZING ============ */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-medium">Analyzing your {isPDF ? 'PDF' : 'drawing'}...</p>
              <p className="text-sm text-muted-foreground mt-1">
                {analyzeProgress || (isPDF
                  ? `Processing ${selectedPages.size} page${selectedPages.size !== 1 ? 's' : ''}. This may take 30-60 seconds.`
                  : 'This may take 15-30 seconds depending on the complexity.')}
              </p>
            </div>
            {isPDF && pdfThumbnails.length > 0 ? (
              <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-md">
                {pdfThumbnails
                  .filter(t => selectedPages.has(t.pageNumber))
                  .slice(0, 6)
                  .map(t => (
                    <img
                      key={t.pageNumber}
                      src={t.thumbnailUrl}
                      alt={`Page ${t.pageNumber}`}
                      className="w-16 h-20 object-contain rounded border bg-white opacity-60"
                    />
                  ))}
                {selectedPages.size > 6 && (
                  <div className="w-16 h-20 rounded border bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{selectedPages.size - 6}</span>
                  </div>
                )}
              </div>
            ) : previewUrl && (
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
                    {isPDF && selectedPages.size > 1 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        {selectedPages.size} pages
                      </span>
                    )}
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
                    {hasSourcePages && (
                      <th className="px-2 py-2 text-center text-xs w-10">Pg</th>
                    )}
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
                      showSourcePage={hasSourcePages}
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
  showSourcePage,
  onToggle,
}: {
  item: AIEstimateItem
  index: number
  selected: boolean
  showNotes: boolean
  showSourcePage: boolean
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
        {showSourcePage && (
          <td className="px-2 py-2 text-center">
            <PageBadge page={item.sourcePage} />
          </td>
        )}
      </tr>
      {showNotes && item.notes && (
        <tr className={selected ? 'bg-primary/5' : ''}>
          <td></td>
          <td colSpan={showSourcePage ? 9 : 8} className="px-2 pb-2 text-xs text-muted-foreground italic">
            {item.notes}
          </td>
        </tr>
      )}
    </>
  )
}
