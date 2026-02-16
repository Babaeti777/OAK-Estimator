import { useState, useRef } from 'react'
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
import { useProject } from '@/contexts/ProjectContext'
import { toast } from '@/hooks/use-toast'
import {
  parseCSV,
  autoDetectMapping,
  importLineItems,
  readFileAsText,
} from '@/lib/import-utils'
import type { ImportMapping, ImportResult } from '@/types'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react'

interface ImportDialogProps {
  trigger?: React.ReactNode
}

export function ImportDialog({ trigger }: ImportDialogProps) {
  const { addLineItem, currentProject } = useProject()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<ImportMapping>({
    description: '0',
    quantity: '1',
    unit: '2',
    unitCost: '3',
  })
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)

    try {
      const content = await readFileAsText(selectedFile)
      const rows = parseCSV(content)

      if (rows.length < 2) {
        toast({
          variant: 'destructive',
          title: 'Invalid file',
          description: 'File must have at least a header row and one data row',
        })
        return
      }

      setHeaders(rows[0])
      setPreviewRows(rows.slice(1, 6)) // Show first 5 data rows

      // Auto-detect mapping
      const detected = autoDetectMapping(rows[0])
      setMapping({
        division: detected.division,
        description: detected.description || '0',
        type: detected.type,
        quantity: detected.quantity || '1',
        unit: detected.unit || '2',
        unitCost: detected.unitCost || '3',
        notes: detected.notes,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error reading file',
        description: error.message,
      })
    }
  }

  const handleImport = async () => {
    if (!file || !currentProject) return

    setImporting(true)
    try {
      const content = await readFileAsText(file)
      const rows = parseCSV(content)
      const importResult = importLineItems(rows, mapping, true)

      setResult(importResult)

      if (importResult.success > 0) {
        // Fix #10: Chunk import to avoid blocking UI on large datasets
        const BATCH_SIZE = 25
        const items = importResult.items
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE)
          for (const item of batch) {
            await addLineItem(item)
          }
          // Yield to browser between batches
          if (i + BATCH_SIZE < items.length) {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }

        toast({
          title: 'Import complete',
          description: `Successfully imported ${importResult.success} items`,
        })
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error.message,
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFile(null)
    setHeaders([])
    setPreviewRows([])
    setResult(null)
  }

  const updateMapping = (field: keyof ImportMapping, value: string) => {
    setMapping({ ...mapping, [field]: value })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import from CSV/Excel
          </DialogTitle>
          <DialogDescription>
            Import line items from a CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        {!currentProject ? (
          <div className="flex items-center gap-2 text-muted-foreground p-4">
            <AlertCircle className="w-5 h-5" />
            <span>Please select a project first</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Selection */}
            <div className="space-y-2">
              <Label>Select File</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {file && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setFile(null)
                    setHeaders([])
                    setPreviewRows([])
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>

            {/* Column Mapping */}
            {headers.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Column Mapping</Label>
                  <p className="text-xs text-muted-foreground">
                    Map your file columns to the line item fields
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Division (optional)</Label>
                      <Select
                        value={mapping.division || ''}
                        onChange={(e) => updateMapping('division', e.target.value)}
                      >
                        <option value="">-- Not Mapped --</option>
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Description *</Label>
                      <Select
                        value={mapping.description}
                        onChange={(e) => updateMapping('description', e.target.value)}
                      >
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Type (optional)</Label>
                      <Select
                        value={mapping.type || ''}
                        onChange={(e) => updateMapping('type', e.target.value)}
                      >
                        <option value="">-- Not Mapped --</option>
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Quantity *</Label>
                      <Select
                        value={mapping.quantity}
                        onChange={(e) => updateMapping('quantity', e.target.value)}
                      >
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Unit *</Label>
                      <Select
                        value={mapping.unit}
                        onChange={(e) => updateMapping('unit', e.target.value)}
                      >
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Unit Cost *</Label>
                      <Select
                        value={mapping.unitCost}
                        onChange={(e) => updateMapping('unitCost', e.target.value)}
                      >
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Notes (optional)</Label>
                      <Select
                        value={mapping.notes || ''}
                        onChange={(e) => updateMapping('notes', e.target.value)}
                      >
                        <option value="">-- Not Mapped --</option>
                        {headers.map((h, i) => (
                          <option key={i} value={i.toString()}>
                            {h || `Column ${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview (first 5 rows)</Label>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          {headers.map((h, i) => (
                            <th key={i} className="px-2 py-1 text-left whitespace-nowrap">
                              {h || `Column ${i + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="border-t">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-2 py-1 whitespace-nowrap">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Import Result */}
            {result && (
              <div className={`p-4 rounded-lg ${result.failed > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.failed > 0 ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="font-semibold">Import Complete</span>
                </div>
                <p className="text-sm">
                  Successfully imported {result.success} items
                  {result.failed > 0 && `, ${result.failed} failed`}
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        Row {err.row}: {err.message}
                      </p>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ...and {result.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                {result ? 'Close' : 'Cancel'}
              </Button>
              {!result && headers.length > 0 && (
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? 'Importing...' : 'Import Items'}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
