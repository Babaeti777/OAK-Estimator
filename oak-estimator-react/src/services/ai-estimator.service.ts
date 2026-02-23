/**
 * AI Estimator Service
 *
 * Sends construction drawings to the Anthropic Claude API (vision)
 * and returns structured line-item estimates mapped to CSI divisions.
 * Supports images (PNG, JPEG, GIF, WebP) and multi-page PDFs.
 */

import { DIVISIONS_ALL } from '@/data/divisions'
import type { LineItem } from '@/types'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AIEstimateItem {
  division: string
  description: string
  type: LineItem['type']
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  notes?: string
  confidence: 'high' | 'medium' | 'low'
  sourcePage?: number  // Which PDF page this came from (1-indexed)
}

export interface AIEstimateResult {
  items: AIEstimateItem[]
  summary: string
  projectType: string
  warnings: string[]
}

export interface AIEstimatorOptions {
  projectName?: string
  location?: string
  additionalContext?: string
}

/** A rendered PDF page as a base64 PNG */
export interface PDFPageImage {
  pageNumber: number  // 1-indexed
  base64: string      // base64-encoded PNG
  width: number
  height: number
  thumbnailUrl: string // Object URL for the thumbnail display
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929'

const DIVISION_LIST = DIVISIONS_ALL.map(d => `${d.code} - ${d.name}`).join('\n')

/** Max pages we can send in a single API call (image tokens add up) */
const MAX_PAGES_PER_CALL = 10

/** Render scale for PDF pages (1.5 = ~150 DPI, good balance) */
const PDF_RENDER_SCALE = 1.5

/** Thumbnail render scale (smaller for previews) */
const PDF_THUMBNAIL_SCALE = 0.4

export const SUPPORTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
]

export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20 MB
export const MAX_PDF_SIZE = 50 * 1024 * 1024    // 50 MB (PDFs can be larger)

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(isMultiPage: boolean): string {
  const multiPageInstructions = isMultiPage
    ? `\n\nIMPORTANT: You are analyzing MULTIPLE PAGES of a construction drawing set. Each image is a separate page.
- Cross-reference information across all pages for accuracy
- Different pages may show different views/details of the same project (floor plans, elevations, sections, details, MEP)
- Avoid double-counting items that appear on multiple pages
- In the notes field, reference which page(s) each item was identified from (e.g., "Page 1 floor plan", "Page 3 electrical")
- Combine quantities from the same item across pages when applicable`
    : ''

  return `You are an expert construction cost estimator. You analyze construction drawings, blueprints, floor plans, and site plans to produce preliminary cost estimates.

When given a drawing image, you must:
1. Identify the type of construction project (residential, commercial, industrial, etc.)
2. Identify all visible building systems, materials, and scope of work
3. Estimate quantities based on what you can measure or infer from the drawing
4. Assign each line item to the correct CSI MasterFormat division
5. Provide reasonable unit costs based on current US national averages
${multiPageInstructions}

Available CSI Divisions:
${DIVISION_LIST}

Rules:
- Be thorough: identify foundations, structure, framing, roofing, finishes, MEP, sitework, etc.
- Use standard construction units: SF, LF, CY, EA, LS, SY, TON, HR, etc.
- Unit costs should reflect 2024-2025 US national averages
- Mark your confidence level for each item: "high" if clearly visible, "medium" if inferred, "low" if estimated
- If you cannot determine an exact quantity, provide your best reasonable estimate
- Include notes explaining your assumptions${isMultiPage ? ' and which page(s) informed each item' : ''}
- Do NOT hallucinate items that are clearly not shown in the drawing

Respond ONLY with valid JSON matching this exact structure:
{
  "projectType": "string describing the project type",
  "summary": "brief 1-2 sentence description of what you see in the drawing",
  "warnings": ["any caveats or limitations"],
  "items": [
    {
      "division": "XX",
      "description": "Line item description",
      "type": "material | labor | equipment | subcontractor | misc",
      "quantity": 0,
      "unit": "SF",
      "unitCost": 0.00,
      "totalCost": 0.00,
      "notes": "assumptions/reasoning${isMultiPage ? ' (include page reference)' : ''}",
      "confidence": "high | medium | low"${isMultiPage ? ',\n      "sourcePage": 1' : ''}
    }
  ]
}`
}

/* ------------------------------------------------------------------ */
/*  Core analysis – single image                                       */
/* ------------------------------------------------------------------ */

export async function analyzeDrawing(
  imageBase64: string,
  mimeType: string,
  apiKey: string,
  options: AIEstimatorOptions = {},
): Promise<AIEstimateResult> {
  const userPrompt = buildUserPrompt(options, false)

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    system: buildSystemPrompt(false),
    messages: [
      {
        role: 'user' as const,
        content: [
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text' as const,
            text: userPrompt,
          },
        ],
      },
    ],
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API request failed (${response.status}): ${errorBody}`)
  }

  const data = await response.json()

  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock?.text) {
    throw new Error('No text response received from AI')
  }

  return parseAIResponse(textBlock.text)
}

/* ------------------------------------------------------------------ */
/*  Core analysis – multi-page (PDF pages sent as multiple images)     */
/* ------------------------------------------------------------------ */

export async function analyzeMultiplePages(
  pages: PDFPageImage[],
  apiKey: string,
  options: AIEstimatorOptions = {},
  onProgress?: (message: string) => void,
): Promise<AIEstimateResult> {
  if (pages.length === 0) {
    throw new Error('No pages selected for analysis')
  }

  // If pages fit in a single call, send them all at once
  if (pages.length <= MAX_PAGES_PER_CALL) {
    onProgress?.(`Analyzing ${pages.length} page${pages.length > 1 ? 's' : ''}...`)
    return analyzePageBatch(pages, apiKey, options)
  }

  // Otherwise batch the pages and merge results
  const batches: PDFPageImage[][] = []
  for (let i = 0; i < pages.length; i += MAX_PAGES_PER_CALL) {
    batches.push(pages.slice(i, i + MAX_PAGES_PER_CALL))
  }

  const allResults: AIEstimateResult[] = []
  for (let i = 0; i < batches.length; i++) {
    onProgress?.(`Analyzing batch ${i + 1} of ${batches.length} (pages ${batches[i][0].pageNumber}-${batches[i][batches[i].length - 1].pageNumber})...`)
    const batchResult = await analyzePageBatch(batches[i], apiKey, options)
    allResults.push(batchResult)
  }

  return mergeResults(allResults)
}

async function analyzePageBatch(
  pages: PDFPageImage[],
  apiKey: string,
  options: AIEstimatorOptions,
): Promise<AIEstimateResult> {
  const isMultiPage = pages.length > 1
  const userPrompt = buildUserPrompt(options, isMultiPage, pages.map(p => p.pageNumber))

  // Build content array: one image block per page, then the text prompt
  const content: Array<
    | { type: 'image'; source: { type: 'base64'; media_type: 'image/png'; data: string } }
    | { type: 'text'; text: string }
  > = []

  for (const page of pages) {
    content.push({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: 'image/png' as const,
        data: page.base64,
      },
    })
  }

  content.push({
    type: 'text' as const,
    text: userPrompt,
  })

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    system: buildSystemPrompt(isMultiPage),
    messages: [
      {
        role: 'user' as const,
        content,
      },
    ],
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API request failed (${response.status}): ${errorBody}`)
  }

  const data = await response.json()

  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock?.text) {
    throw new Error('No text response received from AI')
  }

  return parseAIResponse(textBlock.text)
}

function mergeResults(results: AIEstimateResult[]): AIEstimateResult {
  const allItems: AIEstimateItem[] = []
  const allWarnings: string[] = []
  const summaries: string[] = []
  let projectType = 'Unknown'

  for (const r of results) {
    allItems.push(...r.items)
    allWarnings.push(...r.warnings)
    if (r.summary) summaries.push(r.summary)
    if (r.projectType !== 'Unknown') projectType = r.projectType
  }

  // Deduplicate warnings
  const uniqueWarnings = [...new Set(allWarnings)]
  uniqueWarnings.push('Results were merged from multiple analysis batches. Review for potential duplicates.')

  return {
    items: allItems,
    summary: summaries[0] || 'Multi-page drawing analysis complete.',
    projectType,
    warnings: uniqueWarnings,
  }
}

/* ------------------------------------------------------------------ */
/*  PDF → Image conversion using PDF.js                                */
/* ------------------------------------------------------------------ */

let pdfjsLoaded = false

async function loadPdfJs() {
  if (pdfjsLoaded) return
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).href
  pdfjsLoaded = true
}

/**
 * Get total page count of a PDF without rendering all pages.
 */
export async function getPDFPageCount(file: File): Promise<number> {
  await loadPdfJs()
  const pdfjs = await import('pdfjs-dist')
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const count = pdf.numPages
  pdf.destroy()
  return count
}

/**
 * Render specific pages of a PDF to PNG base64 images.
 * Returns both the high-res base64 (for API) and a thumbnail URL (for UI).
 */
export async function renderPDFPages(
  file: File,
  pageNumbers: number[],
  onProgress?: (page: number, total: number) => void,
): Promise<PDFPageImage[]> {
  await loadPdfJs()
  const pdfjs = await import('pdfjs-dist')
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const results: PDFPageImage[] = []

  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNum = pageNumbers[i]
    onProgress?.(pageNum, pageNumbers.length)

    const page = await pdf.getPage(pageNum)

    // High-res render for API
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]

    // Thumbnail render for UI
    const thumbViewport = page.getViewport({ scale: PDF_THUMBNAIL_SCALE })
    const thumbCanvas = document.createElement('canvas')
    thumbCanvas.width = thumbViewport.width
    thumbCanvas.height = thumbViewport.height
    const thumbCtx = thumbCanvas.getContext('2d')!
    await page.render({ canvasContext: thumbCtx, viewport: thumbViewport }).promise

    const thumbnailUrl = thumbCanvas.toDataURL('image/png')

    results.push({
      pageNumber: pageNum,
      base64,
      width: viewport.width,
      height: viewport.height,
      thumbnailUrl,
    })

    // Clean up
    page.cleanup()
  }

  pdf.destroy()
  return results
}

/**
 * Quick render of ALL page thumbnails only (no high-res).
 * Used for the page selector grid.
 */
export async function renderPDFThumbnails(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<{ pageNumber: number; thumbnailUrl: string }[]> {
  await loadPdfJs()
  const pdfjs = await import('pdfjs-dist')
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const results: { pageNumber: number; thumbnailUrl: string }[] = []

  for (let p = 1; p <= pdf.numPages; p++) {
    onProgress?.(p, pdf.numPages)
    const page = await pdf.getPage(p)
    const thumbViewport = page.getViewport({ scale: PDF_THUMBNAIL_SCALE })
    const canvas = document.createElement('canvas')
    canvas.width = thumbViewport.width
    canvas.height = thumbViewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport: thumbViewport }).promise
    results.push({ pageNumber: p, thumbnailUrl: canvas.toDataURL('image/png') })
    page.cleanup()
  }

  pdf.destroy()
  return results
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildUserPrompt(
  options: AIEstimatorOptions,
  isMultiPage: boolean,
  pageNumbers?: number[],
): string {
  let prompt = isMultiPage
    ? `Analyze these ${pageNumbers?.length ?? 'multiple'} pages of construction drawings (pages ${pageNumbers?.join(', ') ?? 'all'}) and generate a comprehensive preliminary cost estimate combining information from all pages.`
    : 'Analyze this construction drawing and generate a detailed preliminary cost estimate.'

  if (options.projectName) {
    prompt += `\n\nProject name: ${options.projectName}`
  }
  if (options.location) {
    prompt += `\nLocation: ${options.location}`
  }
  if (options.additionalContext) {
    prompt += `\nAdditional context: ${options.additionalContext}`
  }

  prompt += '\n\nProvide your response as JSON only, no markdown fencing.'
  return prompt
}

function parseAIResponse(text: string): AIEstimateResult {
  // Strip markdown code fences if present
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Failed to parse AI response as JSON. The model may have returned an invalid format.')
  }

  const validDivisions = new Set(DIVISIONS_ALL.map(d => d.code))
  const validTypes = new Set(['material', 'labor', 'equipment', 'subcontractor', 'misc'])

  const rawItems = Array.isArray(parsed.items) ? parsed.items : []
  const items: AIEstimateItem[] = rawItems
    .filter((item: Record<string, unknown>) => item && typeof item === 'object')
    .map((item: Record<string, unknown>) => {
      const division = String(item.division ?? '01').padStart(2, '0')
      const quantity = Number(item.quantity) || 0
      const unitCost = Number(item.unitCost) || 0

      return {
        division: validDivisions.has(division) ? division : '01',
        description: String(item.description ?? 'Unknown item'),
        type: validTypes.has(String(item.type)) ? (String(item.type) as LineItem['type']) : 'material',
        quantity,
        unit: String(item.unit ?? 'EA'),
        unitCost,
        totalCost: quantity * unitCost,
        notes: item.notes ? String(item.notes) : undefined,
        confidence: (['high', 'medium', 'low'].includes(String(item.confidence))
          ? String(item.confidence) as 'high' | 'medium' | 'low'
          : 'medium'),
        sourcePage: item.sourcePage ? Number(item.sourcePage) : undefined,
      }
    })

  return {
    items,
    summary: String(parsed.summary ?? 'Drawing analysis complete.'),
    projectType: String(parsed.projectType ?? 'Unknown'),
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
  }
}

/* ------------------------------------------------------------------ */
/*  File → base64 helper                                               */
/* ------------------------------------------------------------------ */

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data:image/...;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
