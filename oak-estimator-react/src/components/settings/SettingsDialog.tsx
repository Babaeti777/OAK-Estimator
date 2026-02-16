import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Settings, Keyboard, Database, Palette, ChevronDown, ChevronUp, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserSettings, saveUserSettings, type UserSettings } from "@/services/userSettings.service"
import { toast } from "@/hooks/use-toast"

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

const ACCENT_COLORS = [
  { id: 'orange', color: 'bg-orange-500', name: 'Orange' },
  { id: 'blue', color: 'bg-blue-500', name: 'Blue' },
  { id: 'green', color: 'bg-green-500', name: 'Green' },
  { id: 'purple', color: 'bg-purple-500', name: 'Purple' },
  { id: 'pink', color: 'bg-pink-500', name: 'Pink' },
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
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    defaultUnit: 'EA',
    defaultMarkup: 15,
    autoSave: true,
    notifications: true,
    theme: 'dark',
    accentColor: 'orange',
  })
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings when dialog opens
  useEffect(() => {
    if (open && user) {
      loadSettings()
    }
  }, [open, user])

  const loadSettings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const userSettings = await getUserSettings(user.uid)
      setSettings(userSettings)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveUserSettings(user.uid, settings)
      setHasChanges(false)
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message || "Please try again later.",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
                      <Input
                        id="defaultUnit"
                        value={settings.defaultUnit}
                        onChange={(e) => updateSetting('defaultUnit', e.target.value)}
                        placeholder="EA, SF, LF, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                      <Input
                        id="defaultMarkup"
                        type="number"
                        value={settings.defaultMarkup}
                        onChange={(e) => updateSetting('defaultMarkup', parseFloat(e.target.value) || 0)}
                        placeholder="15"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Auto-save</p>
                      <p className="text-xs text-muted-foreground">Automatically save changes as you work</p>
                    </div>
                    <Button
                      variant={settings.autoSave ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('autoSave', !settings.autoSave)}
                    >
                      {settings.autoSave ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Notifications</p>
                      <p className="text-xs text-muted-foreground">Show notifications for updates</p>
                    </div>
                    <Button
                      variant={settings.notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('notifications', !settings.notifications)}
                    >
                      {settings.notifications ? 'On' : 'Off'}
                    </Button>
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
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
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

                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-500">Firebase Configuration</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Firebase settings are configured in the source code (<code className="bg-muted px-1 rounded">src/services/firebase.ts</code>).
                          To use your own Firebase project:
                        </p>
                        <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                          <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.firebase.google.com</a></li>
                          <li>Enable Authentication (Google sign-in)</li>
                          <li>Create a Firestore database</li>
                          <li>Enable Storage</li>
                          <li>Copy your config to <code className="bg-muted px-1 rounded">firebase.ts</code></li>
                          <li>Deploy security rules from the <code className="bg-muted px-1 rounded">firebase/</code> folder</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Export All Data
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
                      <p className="text-sm font-medium">Theme</p>
                      <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <div className="flex gap-1">
                      {(['dark', 'light', 'system'] as const).map((theme) => (
                        <Button
                          key={theme}
                          variant={settings.theme === theme ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting('theme', theme)}
                          className="capitalize"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      {ACCENT_COLORS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateSetting('accentColor', item.id)}
                          className={`w-8 h-8 rounded-full ${item.color} transition-all ${
                            settings.accentColor === item.id
                              ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110'
                              : 'hover:scale-110'
                          }`}
                          title={item.name}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select your preferred accent color (theme changes coming soon)
                    </p>
                  </div>
                </div>
              </SettingsSection>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges || saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
