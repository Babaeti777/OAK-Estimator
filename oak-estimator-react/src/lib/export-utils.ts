import * as XLSX from 'xlsx'
import type { Project, Summary, ExportOptions, LineItem } from '@/types'
import { formatCurrency } from './utils'

/**
 * Group line items by division
 */
export function groupLineItemsByDivision(lineItems: LineItem[]): Map<string, LineItem[]> {
  const grouped = new Map<string, LineItem[]>()

  lineItems.forEach(item => {
    const division = item.division || '00'
    if (!grouped.has(division)) {
      grouped.set(division, [])
    }
    grouped.get(division)!.push(item)
  })

  // Sort by division code
  return new Map([...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}

/**
 * Export project to Excel format with formulas and table formatting
 */
export function exportToExcel(project: Project, summary: Summary): void {
  const wb = XLSX.utils.book_new()

  // Create line items data with formulas
  const headers = ['Division', 'Description', 'Type', 'Quantity', 'Unit', 'Unit Cost', 'Total', 'Notes']
  const data: any[][] = [headers]

  // Add line items with Total formula (Quantity * Unit Cost)
  project.lineItems.forEach((item, index) => {
    const rowNum = index + 2 // Excel rows are 1-indexed, and row 1 is header
    data.push([
      item.division,
      item.description,
      item.type,
      item.quantity,
      item.unit,
      item.unitCost,
      { f: `D${rowNum}*F${rowNum}` }, // Formula: Quantity * Unit Cost
      item.notes || '',
    ])
  })

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Set column widths
  ws['!cols'] = [
    { wch: 10 },  // Division
    { wch: 45 },  // Description
    { wch: 12 },  // Type
    { wch: 10 },  // Quantity
    { wch: 8 },   // Unit
    { wch: 12 },  // Unit Cost
    { wch: 14 },  // Total
    { wch: 30 },  // Notes
  ]

  // Define table range
  const lastRow = project.lineItems.length + 1
  const tableRef = `A1:H${lastRow}`

  // Add table formatting (Excel Table)
  if (!ws['!tables']) ws['!tables'] = []
  ws['!tables'].push({
    name: 'LineItems',
    ref: tableRef,
    headerRow: true,
    totalsRow: false,
    style: {
      name: 'TableStyleMedium2',
      showFirstColumn: false,
      showLastColumn: false,
      showRowStripes: true,
      showColumnStripes: false,
    },
  })

  // Add number formatting for currency columns
  const currencyFormat = '"$"#,##0.00'
  for (let row = 2; row <= lastRow; row++) {
    const unitCostCell = `F${row}`
    const totalCell = `G${row}`
    if (ws[unitCostCell]) ws[unitCostCell].z = currencyFormat
    if (ws[totalCell]) ws[totalCell].z = currencyFormat
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Line Items')

  // Create Summary sheet
  const summaryData: any[][] = [
    ['Cost Summary', ''],
    ['', ''],
    ['Category', 'Amount'],
    ['Materials', { f: `SUMIF('Line Items'!C:C,"material",'Line Items'!G:G)` }],
    ['Labor', { f: `SUMIF('Line Items'!C:C,"labor",'Line Items'!G:G)` }],
    ['Equipment', { f: `SUMIF('Line Items'!C:C,"equipment",'Line Items'!G:G)` }],
    ['Subcontractor', { f: `SUMIF('Line Items'!C:C,"subcontractor",'Line Items'!G:G)` }],
    ['Miscellaneous', { f: `SUMIF('Line Items'!C:C,"misc",'Line Items'!G:G)` }],
    ['', ''],
    ['Subtotal', { f: `SUM(B4:B8)` }],
    [`Markup (${summary.markupPercentage}%)`, { f: `B10*${summary.markupPercentage}/100` }],
    [`Tax (${summary.taxPercentage}%)`, { f: `(B10+B11)*${summary.taxPercentage}/100` }],
    ['', ''],
    ['TOTAL', { f: `B10+B11+B12` }],
  ]

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)

  // Set column widths for summary
  summaryWs['!cols'] = [
    { wch: 20 },
    { wch: 15 },
  ]

  // Apply currency formatting to summary amounts
  for (let row = 4; row <= 14; row++) {
    const cell = `B${row}`
    if (summaryWs[cell]) summaryWs[cell].z = currencyFormat
  }

  // Merge title cell
  summaryWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  // Create Project Info sheet
  const projectInfoData: any[][] = [
    ['Project Information', ''],
    ['', ''],
    ['Project Name', project.projectSettings.projectName || ''],
    ['Project Number', project.projectSettings.projectNumber || ''],
    ['Date', project.projectSettings.date || ''],
    ['Location', project.projectSettings.location || ''],
    ['Client', project.projectSettings.clientName || ''],
    ['Estimator', project.projectSettings.estimator || ''],
    ['Architect', project.projectSettings.architect || ''],
    ['Valid Until', project.projectSettings.validUntil || ''],
    ['', ''],
    ['Company', project.companySettings.companyName || ''],
    ['Address', project.companySettings.address || ''],
    ['Phone', project.companySettings.phone || ''],
    ['Email', project.companySettings.email || ''],
  ]

  const projectInfoWs = XLSX.utils.aoa_to_sheet(projectInfoData)
  projectInfoWs['!cols'] = [{ wch: 15 }, { wch: 40 }]
  projectInfoWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]

  XLSX.utils.book_append_sheet(wb, projectInfoWs, 'Project Info')

  // Generate filename and download
  const filename = `${project.projectSettings.projectName || 'estimate'}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, filename)
}

/**
 * Export project to CSV format (legacy)
 */
export function exportToCSV(project: Project, summary: Summary): string {
  const lines: string[] = []

  // Header row
  lines.push('Division,Description,Type,Quantity,Unit,Unit Cost,Total Cost,Notes')

  // Line items
  project.lineItems.forEach(item => {
    lines.push([
      item.division,
      `"${item.description.replace(/"/g, '""')}"`,
      item.type,
      item.quantity,
      item.unit,
      item.unitCost.toFixed(2),
      item.totalCost.toFixed(2),
      item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '',
    ].join(','))
  })

  // Empty row
  lines.push('')

  // Summary
  lines.push(`,,,,,,Materials,${summary.materialsCost.toFixed(2)}`)
  lines.push(`,,,,,,Labor,${summary.laborCost.toFixed(2)}`)
  lines.push(`,,,,,,Equipment,${summary.equipmentCost.toFixed(2)}`)
  lines.push(`,,,,,,Subcontractor,${summary.subcontractorCost.toFixed(2)}`)
  lines.push(`,,,,,,Miscellaneous,${summary.miscCost.toFixed(2)}`)
  lines.push(`,,,,,,Subtotal,${summary.subtotal.toFixed(2)}`)
  lines.push(`,,,,,,Markup (${summary.markupPercentage}%),${summary.markup.toFixed(2)}`)
  lines.push(`,,,,,,Tax (${summary.taxPercentage}%),${summary.tax.toFixed(2)}`)
  lines.push(`,,,,,,Total,${summary.totalCost.toFixed(2)}`)

  return lines.join('\n')
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export project data to CSV and download (legacy function)
 */
export function downloadProjectCSV(project: Project, summary: Summary): void {
  // Use Excel export instead of CSV for better formatting
  exportToExcel(project, summary)
}

/**
 * Generate print-friendly HTML for estimate
 */
export function generatePrintHTML(
  project: Project,
  summary: Summary,
  options: ExportOptions
): string {
  const { companySettings, projectSettings, lineItems } = project
  const groupedItems = options.groupByDivision ? groupLineItemsByDivision(lineItems) : null

  const divisionNames: Record<string, string> = {
    '01': 'General Requirements',
    '02': 'Existing Conditions',
    '03': 'Concrete',
    '04': 'Masonry',
    '05': 'Metals',
    '06': 'Wood, Plastics & Composites',
    '07': 'Thermal & Moisture Protection',
    '08': 'Openings',
    '09': 'Finishes',
    '10': 'Specialties',
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${projectSettings.projectName || 'Estimate'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-info { flex: 1; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .company-details { font-size: 11px; color: #666; }
    .logo { max-width: 150px; max-height: 80px; }
    .project-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; background: #f5f5f5; padding: 15px; border-radius: 4px; }
    .info-item label { font-size: 10px; color: #666; text-transform: uppercase; }
    .info-item span { display: block; font-weight: 500; }
    h2 { font-size: 16px; margin: 20px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; font-size: 11px; text-transform: uppercase; }
    .number { text-align: right; }
    .summary-table { width: 300px; margin-left: auto; }
    .summary-table td { border: none; }
    .summary-table .total { font-size: 16px; font-weight: bold; border-top: 2px solid #333; }
    .terms { margin-top: 40px; padding: 15px; background: #f9f9f9; border-radius: 4px; }
    .terms h3 { font-size: 12px; margin-bottom: 10px; }
    .terms p { font-size: 10px; color: #666; white-space: pre-wrap; }
    .signature { margin-top: 60px; display: flex; gap: 100px; }
    .signature-line { flex: 1; border-top: 1px solid #333; padding-top: 5px; }
    .signature-label { font-size: 10px; color: #666; }
    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${companySettings.companyName || 'Company Name'}</div>
      <div class="company-details">
        ${companySettings.address ? `${companySettings.address}<br>` : ''}
        ${companySettings.phone ? `Phone: ${companySettings.phone}<br>` : ''}
        ${companySettings.email ? `Email: ${companySettings.email}<br>` : ''}
        ${companySettings.website ? `Web: ${companySettings.website}<br>` : ''}
        ${companySettings.licenseNumber ? `License: ${companySettings.licenseNumber}` : ''}
      </div>
    </div>
    ${options.includeCompanyLogo && companySettings.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Logo" class="logo">` : ''}
  </div>

  <div class="project-info">
    <div class="info-item">
      <label>Project Name</label>
      <span>${projectSettings.projectName || '-'}</span>
    </div>
    <div class="info-item">
      <label>Project Number</label>
      <span>${projectSettings.projectNumber || '-'}</span>
    </div>
    <div class="info-item">
      <label>Date</label>
      <span>${projectSettings.date || '-'}</span>
    </div>
    <div class="info-item">
      <label>Location</label>
      <span>${projectSettings.location || '-'}</span>
    </div>
    <div class="info-item">
      <label>Estimator</label>
      <span>${projectSettings.estimator || '-'}</span>
    </div>
    <div class="info-item">
      <label>Architect</label>
      <span>${projectSettings.architect || '-'}</span>
    </div>
    ${projectSettings.clientName ? `
    <div class="info-item">
      <label>Client</label>
      <span>${projectSettings.clientName}</span>
    </div>
    ` : ''}
    ${projectSettings.validUntil ? `
    <div class="info-item">
      <label>Valid Until</label>
      <span>${projectSettings.validUntil}</span>
    </div>
    ` : ''}
  </div>

  ${projectSettings.scope ? `
  <div style="margin-bottom: 20px;">
    <h2>Scope of Work</h2>
    <p style="white-space: pre-wrap;">${projectSettings.scope}</p>
  </div>
  ` : ''}

  <h2>Line Items</h2>
  ${groupedItems ? Array.from(groupedItems.entries()).map(([division, items]) => `
    <h3 style="font-size: 13px; margin: 15px 0 5px; color: #666;">${division} - ${divisionNames[division] || 'Other'}</h3>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Type</th>
          <th class="number">Qty</th>
          <th>Unit</th>
          ${options.showUnitCosts ? '<th class="number">Unit Cost</th>' : ''}
          <th class="number">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>
              ${item.description}
              ${options.showLineItemNotes && item.notes ? `<br><small style="color: #666;">${item.notes}</small>` : ''}
            </td>
            <td>${item.type}</td>
            <td class="number">${item.quantity}</td>
            <td>${item.unit}</td>
            ${options.showUnitCosts ? `<td class="number">${formatCurrency(item.unitCost)}</td>` : ''}
            <td class="number">${formatCurrency(item.totalCost)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('') : `
    <table>
      <thead>
        <tr>
          <th>Div</th>
          <th>Description</th>
          <th>Type</th>
          <th class="number">Qty</th>
          <th>Unit</th>
          ${options.showUnitCosts ? '<th class="number">Unit Cost</th>' : ''}
          <th class="number">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems.map(item => `
          <tr>
            <td>${item.division}</td>
            <td>
              ${item.description}
              ${options.showLineItemNotes && item.notes ? `<br><small style="color: #666;">${item.notes}</small>` : ''}
            </td>
            <td>${item.type}</td>
            <td class="number">${item.quantity}</td>
            <td>${item.unit}</td>
            ${options.showUnitCosts ? `<td class="number">${formatCurrency(item.unitCost)}</td>` : ''}
            <td class="number">${formatCurrency(item.totalCost)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `}

  <h2>Cost Summary</h2>
  <table class="summary-table">
    <tr><td>Materials</td><td class="number">${formatCurrency(summary.materialsCost)}</td></tr>
    <tr><td>Labor</td><td class="number">${formatCurrency(summary.laborCost)}</td></tr>
    <tr><td>Equipment</td><td class="number">${formatCurrency(summary.equipmentCost)}</td></tr>
    <tr><td>Subcontractor</td><td class="number">${formatCurrency(summary.subcontractorCost)}</td></tr>
    <tr><td>Miscellaneous</td><td class="number">${formatCurrency(summary.miscCost)}</td></tr>
    <tr><td><strong>Subtotal</strong></td><td class="number"><strong>${formatCurrency(summary.subtotal)}</strong></td></tr>
    <tr><td>Markup (${summary.markupPercentage}%)</td><td class="number">${formatCurrency(summary.markup)}</td></tr>
    <tr><td>Tax (${summary.taxPercentage}%)</td><td class="number">${formatCurrency(summary.tax)}</td></tr>
    <tr class="total"><td><strong>TOTAL</strong></td><td class="number"><strong>${formatCurrency(summary.totalCost)}</strong></td></tr>
  </table>

  ${options.includeNotes && projectSettings.notes ? `
  <div class="terms">
    <h3>Notes</h3>
    <p>${projectSettings.notes}</p>
  </div>
  ` : ''}

  ${options.includeTerms && companySettings.termsAndConditions ? `
  <div class="terms">
    <h3>Terms and Conditions</h3>
    <p>${companySettings.termsAndConditions}</p>
  </div>
  ` : ''}

  ${companySettings.warrantyInfo ? `
  <div class="terms">
    <h3>Warranty Information</h3>
    <p>${companySettings.warrantyInfo}</p>
  </div>
  ` : ''}

  ${options.includeSignatureLine ? `
  <div class="signature">
    <div class="signature-line">
      <div class="signature-label">Client Signature</div>
    </div>
    <div class="signature-line">
      <div class="signature-label">Date</div>
    </div>
    ${companySettings.signatureUrl ? `
    <div>
      <img src="${companySettings.signatureUrl}" alt="Signature" style="max-height: 50px;">
      <div class="signature-label">Contractor Signature</div>
    </div>
    ` : `
    <div class="signature-line">
      <div class="signature-label">Contractor Signature</div>
    </div>
    `}
  </div>
  ` : ''}

  <div class="footer">
    Generated by OAK Estimator on ${new Date().toLocaleDateString()}
  </div>

  <script>
    // Auto-print if opened in print mode
    if (window.location.hash === '#print') {
      window.print();
    }
  </script>
</body>
</html>
`
}

/**
 * Open print preview in new window
 */
export function openPrintPreview(project: Project, summary: Summary, options: ExportOptions): void {
  const html = generatePrintHTML(project, summary, options)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
