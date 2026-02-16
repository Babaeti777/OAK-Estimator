import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Settings, Keyboard, Database, Palette, ChevronDown, ChevronUp } from "lucide-react"

// Keyboard shortcuts definition
const SHORTCUTS = [
  { keys: ["Ctrl", "N"], action: "New Project", description: "Create a new project" },
  { keys: ["Ctrl", "S"], action: "Save", description: "Save current changes" },
  { keys: ["Ctrl", "E"], action: "Export", description: "Open export dialog" },
  { keys: ["Ctrl", "I"], action: "Import", description: "Open import dialog" },
  { keys: ["Ctrl", "/"], action: "Search", description: "Focus search bar" },
  { keys: ["Ctrl", "D"], action: "Dashboard", description: "Go to dashboard" },
  { keys: ["Ctrl", ","], action: "Settings", description: "Open settings" },
  { keys: ["Esc"], action: "Close", description: "Close dialogs/panels" },
  { keys: ["?"], action: "Help", description: "Show keyboard shortcuts" },
]

interface SettingsDialogProps {
  trigger?: React.ReactNode
}

function SettingsSection({
  title,
  icon: Icon,
  description,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ElementType
  description: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-xs">{description}</CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" title="Settings" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your application preferences and configurations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-2">
          {/* General Settings */}
          <SettingsSection
            title="General"
            icon={Settings}
            description="App preferences and default values"
            defaultOpen={true}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultUnit">Default Unit</Label>
                  <Input id="defaultUnit" defaultValue="EA" placeholder="EA, SF, LF, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                  <Input id="defaultMarkup" type="number" defaultValue="15" placeholder="15" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Auto-save</p>
                  <p className="text-xs text-muted-foreground">Automatically save changes as you work</p>
                </div>
                <span className="text-xs text-green-500 font-medium">Enabled</span>
              </div>
            </div>
          </SettingsSection>

          {/* Keyboard Shortcuts */}
          <SettingsSection
            title="Keyboard Shortcuts"
            icon={Keyboard}
            description="Quick actions to speed up your workflow"
          >
            <div className="space-y-1">
              {SHORTCUTS.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{shortcut.action}</p>
                    <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex}>
                        <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-muted-foreground">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Firebase Settings */}
          <SettingsSection
            title="Firebase & Data"
            icon={Database}
            description="Connection status and data management"
          >
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Connected to Firebase</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth Provider:</span>
                    <span>Google OAuth</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database:</span>
                    <span>Cloud Firestore</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span>Firebase Storage</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Firebase configuration is managed through environment variables.
                Contact your administrator to modify these settings.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Export All Data
                </Button>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Appearance Settings */}
          <SettingsSection
            title="Appearance"
            icon={Palette}
            description="Theme and visual preferences"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Currently using dark theme</p>
                </div>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  {[
                    { color: 'bg-orange-500', name: 'Orange', active: true },
                    { color: 'bg-blue-500', name: 'Blue', active: false },
                    { color: 'bg-green-500', name: 'Green', active: false },
                    { color: 'bg-purple-500', name: 'Purple', active: false },
                    { color: 'bg-pink-500', name: 'Pink', active: false },
                  ].map((item) => (
                    <button
                      key={item.color}
                      className={`w-8 h-8 rounded-full ${item.color} transition-all ${
                        item.active ? 'ring-2 ring-offset-2 ring-offset-background ring-white' : 'hover:scale-110'
                      }`}
                      title={item.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select your preferred accent color
                </p>
              </div>
            </div>
          </SettingsSection>
        </div>
      </DialogContent>
    </Dialog>
  )
}
