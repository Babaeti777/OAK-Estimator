import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useProject } from "@/contexts/ProjectContext"
import { downloadProjectCSV, openPrintPreview } from "@/lib/export-utils"
import type { ExportOptions } from "@/types"
import { Download, Printer, FileSpreadsheet, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ExportDialogProps {
  trigger?: React.ReactNode
}

export function ExportDialog({ trigger }: ExportDialogProps) {
  const { currentProject, summary } = useProject()
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    includeCompanyLogo: true,
    includeTerms: true,
    includeSignatureLine: true,
    includeNotes: true,
    groupByDivision: true,
    showUnitCosts: true,
    showLineItemNotes: false,
  })

  if (!currentProject) {
    return null
  }

  const handleExportCSV = () => {
    try {
      downloadProjectCSV(currentProject, summary)
      toast({
        title: "Export successful",
        description: "CSV file has been downloaded",
      })
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message,
      })
    }
  }

  const handlePrint = () => {
    try {
      openPrintPreview(currentProject, summary, options)
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Print failed",
        description: error.message,
      })
    }
  }

  const OptionCheckbox = ({ id, label, checked, onChange }: {
    id: string
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
  }) => (
    <label
      htmlFor={id}
      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm">{label}</span>
    </label>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Estimate
          </DialogTitle>
          <DialogDescription>
            Export your estimate as CSV or print-ready format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Formats */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleExportCSV}
              >
                <FileSpreadsheet className="w-6 h-6 text-green-500" />
                <span>CSV / Excel</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handlePrint}
              >
                <Printer className="w-6 h-6 text-blue-500" />
                <span>Print / PDF</span>
              </Button>
            </div>
          </div>

          {/* Print Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Print Options</Label>
            <div className="grid gap-2">
              <OptionCheckbox
                id="includeCompanyLogo"
                label="Include company logo"
                checked={options.includeCompanyLogo}
                onChange={(checked) => setOptions({ ...options, includeCompanyLogo: checked })}
              />
              <OptionCheckbox
                id="groupByDivision"
                label="Group by division"
                checked={options.groupByDivision}
                onChange={(checked) => setOptions({ ...options, groupByDivision: checked })}
              />
              <OptionCheckbox
                id="showUnitCosts"
                label="Show unit costs"
                checked={options.showUnitCosts}
                onChange={(checked) => setOptions({ ...options, showUnitCosts: checked })}
              />
              <OptionCheckbox
                id="showLineItemNotes"
                label="Show line item notes"
                checked={options.showLineItemNotes}
                onChange={(checked) => setOptions({ ...options, showLineItemNotes: checked })}
              />
              <OptionCheckbox
                id="includeTerms"
                label="Include terms & conditions"
                checked={options.includeTerms}
                onChange={(checked) => setOptions({ ...options, includeTerms: checked })}
              />
              <OptionCheckbox
                id="includeSignatureLine"
                label="Include signature lines"
                checked={options.includeSignatureLine}
                onChange={(checked) => setOptions({ ...options, includeSignatureLine: checked })}
              />
              <OptionCheckbox
                id="includeNotes"
                label="Include project notes"
                checked={options.includeNotes}
                onChange={(checked) => setOptions({ ...options, includeNotes: checked })}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
