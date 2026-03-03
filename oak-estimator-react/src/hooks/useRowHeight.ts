/**
 * useRowHeight — manages a user-adjustable row height with
 * localStorage persistence and vertical mouse-drag resizing.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

const STORAGE_KEY_PREFIX = 'oak-row-height'

export interface RowHeightConfig {
  defaultHeight: number
  minHeight: number
  maxHeight: number
}

function loadHeight(storageKey: string, defaultHeight: number): number {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${storageKey}`)
    if (raw) {
      const val = JSON.parse(raw)
      if (typeof val === 'number' && val > 0) return val
    }
  } catch {
    // Ignore corrupt storage.
  }
  return defaultHeight
}

function saveHeight(storageKey: string, height: number) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:${storageKey}`, JSON.stringify(height))
  } catch {
    // Silently ignore quota errors.
  }
}

export function useRowHeight(storageKey: string, config: RowHeightConfig) {
  const [height, setHeight] = useState(() => loadHeight(storageKey, config.defaultHeight))

  const heightRef = useRef(height)
  heightRef.current = height

  const configRef = useRef(config)
  configRef.current = config

  const dragState = useRef<{
    startY: number
    startHeight: number
  } | null>(null)

  const onMouseMove = useCallback((e: MouseEvent) => {
    const ds = dragState.current
    if (!ds) return
    const cfg = configRef.current
    const delta = e.clientY - ds.startY
    const newHeight = Math.max(cfg.minHeight, Math.min(cfg.maxHeight, ds.startHeight + delta))
    setHeight(newHeight)
  }, [])

  const onMouseUp = useCallback(() => {
    if (dragState.current) {
      dragState.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      saveHeight(storageKey, heightRef.current)
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }, [storageKey, onMouseMove])

  /** Attach to a resize handle's onMouseDown. */
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragState.current = {
        startY: e.clientY,
        startHeight: heightRef.current,
      }
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [onMouseMove, onMouseUp],
  )

  /** Reset to default height. */
  const resetHeight = useCallback(() => {
    setHeight(configRef.current.defaultHeight)
    saveHeight(storageKey, configRef.current.defaultHeight)
  }, [storageKey])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return { height, startResize, resetHeight }
}
