import type { Project } from "@/types"

function escapeCsvValue(value: string | number) {
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function downloadLineItemsCsv(project: Project) {
  const rows: Array<Array<string | number>> = [
    [
      "Division",
      "Description",
      "Type",
      "Quantity",
      "Unit",
      "Schedule",
      "Unit Cost",
      "Total Cost",
      "Notes",
    ],
  ]

  project.lineItems.forEach((item) => {
    rows.push([
      item.division,
      item.description,
      item.type,
      item.quantity,
      item.unit,
      item.schedule || "",
      item.unitCost,
      item.totalCost,
      item.notes || "",
    ])
  })

  const csvContent = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${project.projectSettings.projectName || "estimate"}-line-items.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
