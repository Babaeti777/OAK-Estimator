/**
 * AI Estimator Service
 *
 * Sends construction drawings to the Anthropic Claude API (vision)
 * and returns structured line-item estimates mapped to CSI divisions.
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929'

const DIVISION_LIST = DIVISIONS_ALL.map(d => `${d.code} - ${d.name}`).join('\n')

function buildSystemPrompt(): string {
  return `You are an expert construction cost estimator. You analyze construction drawings, blueprints, floor plans, and site plans to produce preliminary cost estimates.

When given a drawing image, you must:
1. Identify the type of construction project (residential, commercial, industrial, etc.)
2. Identify all visible building systems, materials, and scope of work
3. Estimate quantities based on what you can measure or infer from the drawing
4. Assign each line item to the correct CSI MasterFormat division
5. Provide reasonable unit costs based on current US national averages

Available CSI Divisions:
${DIVISION_LIST}

Rules:
- Be thorough: identify foundations, structure, framing, roofing, finishes, MEP, sitework, etc.
- Use standard construction units: SF, LF, CY, EA, LS, SY, TON, HR, etc.
- Unit costs should reflect 2024-2025 US national averages
- Mark your confidence level for each item: "high" if clearly visible, "medium" if inferred, "low" if estimated
- If you cannot determine an exact quantity, provide your best reasonable estimate
- Include notes explaining your assumptions
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
      "notes": "assumptions/reasoning",
      "confidence": "high | medium | low"
    }
  ]
}`
}

/* ------------------------------------------------------------------ */
/*  Core analysis function                                             */
/* ------------------------------------------------------------------ */

export async function analyzeDrawing(
  imageBase64: string,
  mimeType: string,
  apiKey: string,
  options: AIEstimatorOptions = {},
): Promise<AIEstimateResult> {
  const userPrompt = buildUserPrompt(options)

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    system: buildSystemPrompt(),
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

  // Extract text content from the response
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock?.text) {
    throw new Error('No text response received from AI')
  }

  return parseAIResponse(textBlock.text)
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildUserPrompt(options: AIEstimatorOptions): string {
  let prompt = 'Analyze this construction drawing and generate a detailed preliminary cost estimate.'

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

export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20 MB
