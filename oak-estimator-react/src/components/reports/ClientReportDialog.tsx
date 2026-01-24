import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useProject } from "@/contexts/ProjectContext"
import { formatCurrency } from "@/lib/utils"
import { Mail, Printer, FileText } from "lucide-react"

export function ClientReportDialog() {
  const { currentProject, summary } = useProject()

  const mailtoLink = useMemo(() => {
    if (!currentProject) return ""
    const subject = `Estimate Summary - ${currentProject.projectSettings.projectName}`
    const bodyLines = [
      `Project: ${currentProject.projectSettings.projectName}`,
      currentProject.projectSettings.projectNumber
        ? `Project #: ${currentProject.projectSettings.projectNumber}`
        : null,
      currentProject.projectSettings.location
        ? `Location: ${currentProject.projectSettings.location}`
        : null,
      `Total: ${formatCurrency(summary.totalCost)}`,
      "",
      "Inclusions:",
      currentProject.projectSettings.inclusions || "(none)",
      "",
      "Exclusions:",
      currentProject.projectSettings.exclusions || "(none)",
      "",
      "Terms:",
      currentProject.projectSettings.terms || "(none)",
    ].filter(Boolean)

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`
  }, [currentProject, summary.totalCost])

  if (!currentProject) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Client Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Estimate Report</DialogTitle>
          <DialogDescription>
            Preview your client-facing summary, then print or email.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" asChild>
            <a href={mailtoLink}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </a>
          </Button>
        </div>

        <div id="client-report-print" className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">
              {currentProject.projectSettings.projectName}
            </h2>
            {currentProject.projectSettings.projectNumber && (
              <p className="text-sm text-muted-foreground">
                Project #{currentProject.projectSettings.projectNumber}
              </p>
            )}
            {currentProject.projectSettings.location && (
              <p className="text-sm text-muted-foreground">
                {currentProject.projectSettings.location}
              </p>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Subtotal</p>
              <p className="text-lg font-semibold">{formatCurrency(summary.subtotal)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Tax</p>
              <p className="text-lg font-semibold">{formatCurrency(summary.tax)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(summary.totalCost)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Line Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left">Division</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Cost</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProject.lineItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{item.division}</td>
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-semibold">Inclusions</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {currentProject.projectSettings.inclusions || "(none)"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Exclusions</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {currentProject.projectSettings.exclusions || "(none)"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Terms & Conditions</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {currentProject.projectSettings.terms || "(none)"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
