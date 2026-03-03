/**
 * useColumnWidths — manages user-resizable column widths with
 * localStorage persistence and mouse-drag resizing.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface ColumnDef {
  /** Unique key for the column (used in storage and lookup). */
  key: string
  /** Default width in pixels. */
  defaultWidth: number
  /** Minimum width the column can be resized to. */
  minWidth?: number
  /** Maximum width the column can be resized to. */
  maxWidth?: number
}

const STORAGE_KEY_PREFIX = 'oak-col-widths'

function loadWidths(storageKey: string, columns: ColumnDef[]): Record<string, number> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${storageKey}`)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, number>
      // Merge with defaults so new columns get their default width.
      const merged: Record<string, number> = {}
      for (const col of columns) {
        merged[col.key] = typeof saved[col.key] === 'number' ? saved[col.key] : col.defaultWidth
      }
      return merged
    }
  } catch {
    // Ignore corrupt storage.
  }
  return Object.fromEntries(columns.map(c => [c.key, c.defaultWidth]))
}

function saveWidths(storageKey: string, widths: Record<string, number>) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:${storageKey}`, JSON.stringify(widths))
  } catch {
    // Silently ignore quota errors.
  }
}

export function useColumnWidths(storageKey: string, columns: ColumnDef[]) {
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    loadWidths(storageKey, columns),
  )

  // Persist whenever widths change.
  const widthsRef = useRef(widths)
  widthsRef.current = widths

  const columnsRef = useRef(columns)
  columnsRef.current = columns

  // Track active drag state in a ref so mousemove/mouseup don't need state deps.
  const dragState = useRef<{
    colKey: string
    startX: number
    startWidth: number
    minW: number
    maxW: number
  } | null>(null)

  const onMouseMove = useCallback((e: MouseEvent) => {
    const ds = dragState.current
    if (!ds) return
    const delta = e.clientX - ds.startX
    const newWidth = Math.max(ds.minW, Math.min(ds.maxW, ds.startWidth + delta))
    setWidths(prev => ({ ...prev, [ds.colKey]: newWidth }))
  }, [])

  const onMouseUp = useCallback(() => {
    if (dragState.current) {
      dragState.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Persist after drag ends.
      saveWidths(storageKey, widthsRef.current)
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }, [storageKey, onMouseMove])

  /** Attach to a resize handle's onMouseDown. */
  const startResize = useCallback(
    (colKey: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const col = columnsRef.current.find(c => c.key === colKey)
      if (!col) return
      dragState.current = {
        colKey,
        startX: e.clientX,
        startWidth: widthsRef.current[colKey] ?? col.defaultWidth,
        minW: col.minWidth ?? 40,
        maxW: col.maxWidth ?? 600,
      }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [onMouseMove, onMouseUp],
  )

  /** Reset all columns to their default widths. */
  const resetWidths = useCallback(() => {
    const defaults = Object.fromEntries(columnsRef.current.map(c => [c.key, c.defaultWidth]))
    setWidths(defaults)
    saveWidths(storageKey, defaults)
  }, [storageKey])

  // Cleanup listeners on unmount.
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return { widths, startResize, resetWidths }
}
