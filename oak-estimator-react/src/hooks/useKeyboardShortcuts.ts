import { useEffect, useCallback } from 'react'
import type { KeyboardShortcut } from '@/types'

// Default keyboard shortcuts
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'h', modifiers: ['ctrl'], action: 'go_home', description: 'Go to Dashboard', category: 'navigation' },
  { key: 'p', modifiers: ['ctrl'], action: 'go_projects', description: 'Go to Projects', category: 'navigation' },
  { key: 'n', modifiers: ['ctrl', 'shift'], action: 'new_project', description: 'Create New Project', category: 'navigation' },

  // Editing
  { key: 'a', modifiers: ['ctrl', 'shift'], action: 'add_item', description: 'Add Line Item', category: 'editing' },
  { key: 's', modifiers: ['ctrl'], action: 'save', description: 'Save Project', category: 'editing' },
  { key: 'd', modifiers: ['ctrl'], action: 'duplicate_item', description: 'Duplicate Selected Item', category: 'editing' },
  { key: 'Delete', modifiers: [], action: 'delete_selected', description: 'Delete Selected Items', category: 'editing' },
  { key: 'Escape', modifiers: [], action: 'cancel', description: 'Cancel/Close Dialog', category: 'editing' },

  // Actions
  { key: 'e', modifiers: ['ctrl'], action: 'export', description: 'Export Project', category: 'actions' },
  { key: 'f', modifiers: ['ctrl'], action: 'search', description: 'Search', category: 'actions' },
  { key: 'z', modifiers: ['ctrl'], action: 'undo', description: 'Undo', category: 'actions' },
  { key: 'y', modifiers: ['ctrl'], action: 'redo', description: 'Redo', category: 'actions' },

  // Global
  { key: '/', modifiers: ['ctrl'], action: 'show_shortcuts', description: 'Show Keyboard Shortcuts', category: 'global' },
]

interface ShortcutHandler {
  action: string
  handler: () => void
}

/**
 * Custom hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(handlers: ShortcutHandler[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape in inputs
        if (event.key !== 'Escape') {
          return
        }
      }

      // Find matching shortcut
      for (const shortcut of DEFAULT_SHORTCUTS) {
        const modifiersMatch =
          shortcut.modifiers.includes('ctrl') === (event.ctrlKey || event.metaKey) &&
          shortcut.modifiers.includes('alt') === event.altKey &&
          shortcut.modifiers.includes('shift') === event.shiftKey

        if (modifiersMatch && event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          // Find handler for this action
          const handlerConfig = handlers.find(h => h.action === shortcut.action)
          if (handlerConfig) {
            event.preventDefault()
            handlerConfig.handler()
            return
          }
        }
      }
    },
    [handlers]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.modifiers.includes('ctrl')) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
  }
  if (shortcut.modifiers.includes('alt')) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt')
  }
  if (shortcut.modifiers.includes('shift')) {
    parts.push('⇧')
  }

  // Format special keys
  let key = shortcut.key
  if (key === 'Delete') key = '⌫'
  if (key === 'Escape') key = 'Esc'
  if (key === '/') key = '/'

  parts.push(key.toUpperCase())

  return parts.join(navigator.platform.includes('Mac') ? '' : '+')
}

/**
 * Group shortcuts by category
 */
export function groupShortcutsByCategory(): Record<string, KeyboardShortcut[]> {
  const groups: Record<string, KeyboardShortcut[]> = {
    navigation: [],
    editing: [],
    actions: [],
    global: [],
  }

  DEFAULT_SHORTCUTS.forEach(shortcut => {
    groups[shortcut.category].push(shortcut)
  })

  return groups
}
