import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DEFAULT_SHORTCUTS,
  formatShortcut,
  groupShortcutsByCategory,
} from '@/hooks/useKeyboardShortcuts'
import { Keyboard, Navigation, Edit3, Zap, Globe } from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  navigation: <Navigation className="w-4 h-4" />,
  editing: <Edit3 className="w-4 h-4" />,
  actions: <Zap className="w-4 h-4" />,
  global: <Globe className="w-4 h-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  editing: 'Editing',
  actions: 'Actions',
  global: 'Global',
}

interface KeyboardShortcutsDialogProps {
  trigger?: React.ReactNode
}

export function KeyboardShortcutsDialog({ trigger }: KeyboardShortcutsDialogProps) {
  const [open, setOpen] = useState(false)
  const groupedShortcuts = groupShortcutsByCategory()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Keyboard className="w-4 h-4" />
            <span className="hidden md:inline">Shortcuts</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and work faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {CATEGORY_ICONS[category]}
                <h3 className="font-semibold">{CATEGORY_LABELS[category]}</h3>
              </div>

              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.action}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>

              {category !== 'global' && <Separator className="mt-4" />}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">/</kbd> anytime to show this dialog
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Inline keyboard shortcut hint component
 */
export function ShortcutHint({ action }: { action: string }) {
  const shortcut = DEFAULT_SHORTCUTS.find((s) => s.action === action)
  if (!shortcut) return null

  return (
    <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted/50 rounded opacity-60">
      {formatShortcut(shortcut)}
    </kbd>
  )
}
