import { useReducer } from "react"
import { Header } from "./layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { SummaryCard } from "./projects/SummaryCard"
import { LineItemsTable } from "./line-items/LineItemsTable"
import { ExportDialog } from "./projects/ExportDialog"
import { VersionHistory } from "./projects/VersionHistory"
import { FolderManager } from "./projects/FolderManager"
import { Dashboard } from "./dashboard/Dashboard"
import { AssemblyManager } from "./assemblies/AssemblyManager"
import { AssemblyLibrary } from "./assemblies/AssemblyLibrary"
import { SmartAssemblyWizard } from "./assemblies/SmartAssemblyWizard"
import { ProjectSchedule } from "./assemblies/ProjectSchedule"
import { ChangeOrderManager } from "./change-orders/ChangeOrderManager"
import { ImportDialog } from "./import/ImportDialog"
import { ShareDialog } from "./sharing/ShareDialog"
import { KeyboardShortcutsDialog } from "./shortcuts/KeyboardShortcutsDialog"
import { AttachmentsPanel } from "./attachments/AttachmentsPanel"
import { LaborRatesManager } from "./labor/LaborRatesManager"
import { ProfitMarginChart } from "./analysis/ProfitMarginChart"
import { MaterialsCatalogManager } from "./materials/MaterialsCatalogManager"
import { AIEstimatorDialog } from "./ai-estimator/AIEstimatorDialog"
import { DivisionSidebar } from "./navigation/DivisionSidebar"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { formatCurrency } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "./ui/dropdown-menu"
import {
  Plus,
  FolderOpen,
  Calculator,
  Download,
  History,
  Folder,
  LayoutDashboard,
  Copy,
  Paperclip,
  Menu,
  X,
  Package,
  Users,
  FileStack,
  PieChart,
  Upload,
  Share2,
  Keyboard,
  ChevronRight,
  Database,
  PanelLeft,
  CalendarDays,
  Undo2,
  Redo2,
  Wrench,
  FileText,
  ChevronDown,
  DollarSign,
  Table2,
  BarChart3,
  FileSpreadsheet,
  ListChecks,
  Lightbulb,
  Sparkles,
  ImageIcon,
  Wand2,
} from "lucide-react"

interface AppState {
  showSummary: boolean
  showDashboard: boolean
  showAttachments: boolean
  showAssemblyLibrary: boolean
  showAssemblyWizard: boolean
  showProjectSchedule: boolean
  selectedDivision: string
  showDivisionPanel: boolean
  mobileMenuOpen: boolean
  showMobileSummary: boolean
  mobileTab: 'items' | 'summary' | 'tools' | 'more'
}

type AppAction =
  | { type: 'TOGGLE_SUMMARY' }
  | { type: 'SET_DASHBOARD'; payload: boolean }
  | { type: 'TOGGLE_ATTACHMENTS' }
  | { type: 'SET_ASSEMBLY_LIBRARY'; payload: boolean }
  | { type: 'SET_ASSEMBLY_WIZARD'; payload: boolean }
  | { type: 'SET_PROJECT_SCHEDULE'; payload: boolean }
  | { type: 'SET_DIVISION'; payload: string }
  | { type: 'CLEAR_DIVISION' }
  | { type: 'TOGGLE_DIVISION_PANEL' }
  | { type: 'SET_MOBILE_MENU'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_SUMMARY' }
  | { type: 'SHOW_ATTACHMENTS_MOBILE' }
  | { type: 'SET_MOBILE_TAB'; payload: 'items' | 'summary' | 'tools' | 'more' }

const initialState: AppState = {
  showSummary: false,
  showDashboard: false,
  showAttachments: false,
  showAssemblyLibrary: false,
  showAssemblyWizard: false,
  showProjectSchedule: false,
  selectedDivision: "",
  showDivisionPanel: false,
  mobileMenuOpen: false,
  showMobileSummary: false,
  mobileTab: 'items',
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_SUMMARY':
      return { ...state, showSummary: !state.showSummary }
    case 'SET_DASHBOARD':
      return { ...state, showDashboard: action.payload }
    case 'TOGGLE_ATTACHMENTS':
      return { ...state, showAttachments: !state.showAttachments }
    case 'SET_ASSEMBLY_LIBRARY':
      return { ...state, showAssemblyLibrary: action.payload }
    case 'SET_ASSEMBLY_WIZARD':
      return { ...state, showAssemblyWizard: action.payload }
    case 'SET_PROJECT_SCHEDULE':
      return { ...state, showProjectSchedule: action.payload }
    case 'SET_DIVISION':
      return { ...state, selectedDivision: action.payload }
    case 'CLEAR_DIVISION':
      return { ...state, selectedDivision: "" }
    case 'TOGGLE_DIVISION_PANEL':
      return { ...state, showDivisionPanel: !state.showDivisionPanel }
    case 'SET_MOBILE_MENU':
      return { ...state, mobileMenuOpen: action.payload }
    case 'TOGGLE_MOBILE_SUMMARY':
      return { ...state, showMobileSummary: !state.showMobileSummary }
    case 'SHOW_ATTACHMENTS_MOBILE':
      return { ...state, showAttachments: !state.showAttachments, showMobileSummary: true, mobileMenuOpen: false }
    case 'SET_MOBILE_TAB':
      return { ...state, mobileTab: action.payload, showMobileSummary: action.payload === 'summary' }
    default:
      return state
  }
}

/* ============================================
   Persistent Mini-Summary Bar (P0 #2)
   Always visible below toolbar showing key totals
   ============================================ */
function MiniSummaryBar({
  showSummary,
  onToggleSummary,
}: {
  showSummary: boolean
  onToggleSummary: () => void
}) {
  const { summary, currentProject } = useProject()

  if (!currentProject) return null

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 mb-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-6 overflow-x-auto text-sm">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
          <span className="text-muted-foreground">Markup:</span>
          <span className="font-medium text-green-500">+{formatCurrency(summary.markup)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
          <span className="text-muted-foreground">Tax:</span>
          <span className="font-medium">{formatCurrency(summary.tax)}</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary text-base">{formatCurrency(summary.totalCost)}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSummary}
        className="shrink-0 text-xs gap-1"
      >
        {showSummary ? "Hide Details" : "Full Summary"}
        <ChevronRight className={`w-3 h-3 transition-transform ${showSummary ? 'rotate-90' : ''}`} />
      </Button>
    </div>
  )
}

/* ============================================
   Breadcrumb Navigation (P1 #4)
   Shows: Dashboard > [Project Name] with status
   ============================================ */
function Breadcrumb({
  currentProject,
  onGoToDashboard,
}: {
  currentProject: any
  onGoToDashboard: () => void
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-3" aria-label="Breadcrumb">
      <button
        onClick={onGoToDashboard}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Dashboard
      </button>
      <ChevronRight className="w-3 h-3 text-muted-foreground" />
      <span className="font-medium text-foreground truncate max-w-[300px]">
        {currentProject.projectSettings.projectName}
      </span>
      {currentProject.status && currentProject.status !== 'draft' && (
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium capitalize ${
          currentProject.status === 'approved' ? 'bg-green-500/15 text-green-500' :
          currentProject.status === 'sent' ? 'bg-yellow-500/15 text-yellow-500' :
          currentProject.status === 'completed' ? 'bg-blue-500/15 text-blue-500' :
          currentProject.status === 'rejected' ? 'bg-red-500/15 text-red-500' :
          'bg-muted text-muted-foreground'
        }`}>
          {currentProject.status}
        </span>
      )}
    </nav>
  )
}

/* ============================================
   Desktop Toolbar (P0 #1) - Consolidated with dropdown menus
   Reduced from ~20 buttons to 6 buttons + 3 dropdown menus
   ============================================ */
function DesktopToolbar({
  state,
  dispatch,
  currentProject,
  duplicateProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  currentProject: any
  duplicateProject: (id: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}) {
  return (
    <div className="hidden lg:flex items-center gap-2 mb-4">
      {/* Core Actions - Always visible */}
      <Button
        variant="outline"
        size="sm"
        title="Undo (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo (Ctrl+Z)"
        className="gap-1.5"
      >
        <Undo2 className="h-4 w-4" />
        <span className="hidden xl:inline">Undo</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        title="Redo (Ctrl+Y)"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo (Ctrl+Y)"
        className="gap-1.5"
      >
        <Redo2 className="h-4 w-4" />
        <span className="hidden xl:inline">Redo</span>
      </Button>

      <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />

      <Button
        variant={state.showDivisionPanel ? "default" : "outline"}
        size="sm"
        title="Toggle Divisions Panel"
        onClick={() => dispatch({ type: 'TOGGLE_DIVISION_PANEL' })}
        aria-label="Toggle Divisions Panel"
        className="gap-1.5"
      >
        <PanelLeft className="h-4 w-4" />
        <span className="hidden xl:inline">Divisions</span>
      </Button>

      {/* Project Menu - Replaces 5 individual buttons */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Project
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={() => currentProject && duplicateProject(currentProject.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Project
          </DropdownMenuItem>
          <FolderManager
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Folder className="h-4 w-4 mr-2" />
                Manage Folders
              </DropdownMenuItem>
            }
          />
          <VersionHistory
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <History className="h-4 w-4 mr-2" />
                Version History
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem onClick={() => dispatch({ type: 'TOGGLE_ATTACHMENTS' })}>
            <Paperclip className="h-4 w-4 mr-2" />
            Attachments
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tools Menu - Replaces 7 individual buttons */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Wrench className="h-4 w-4" />
            Tools
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <MaterialsCatalogManager
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Database className="h-4 w-4 mr-2" />
                Materials Catalog
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_ASSEMBLY_LIBRARY', payload: true })}>
            <Package className="h-4 w-4 mr-2" />
            Assembly Library
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_ASSEMBLY_WIZARD', payload: true })}>
            <Wand2 className="h-4 w-4 mr-2" />
            Assembly Wizard
          </DropdownMenuItem>
          <AssemblyManager
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ListChecks className="h-4 w-4 mr-2" />
                Assembly Manager
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_PROJECT_SCHEDULE', payload: true })}>
            <CalendarDays className="h-4 w-4 mr-2" />
            Project Schedule
          </DropdownMenuItem>
          <LaborRatesManager
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Users className="h-4 w-4 mr-2" />
                Labor Rates
              </DropdownMenuItem>
            }
          />
          <ChangeOrderManager
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <FileStack className="h-4 w-4 mr-2" />
                Change Orders
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <ProfitMarginChart
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PieChart className="h-4 w-4 mr-2" />
                Profit Analysis
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <AIEstimatorDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ImageIcon className="h-4 w-4 mr-2" />
                AI Drawing Estimator
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AI Estimator - Standalone button for visibility */}
      <AIEstimatorDialog />

      {/* Data Menu - Replaces 4 individual buttons */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" />
            Data
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <ImportDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
                <DropdownMenuShortcut>Ctrl+I</DropdownMenuShortcut>
              </DropdownMenuItem>
            }
          />
          <ExportDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Download className="h-4 w-4 mr-2" />
                Export
                <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <ShareDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {/* Keyboard Shortcuts - subtle */}
      <KeyboardShortcutsDialog />
    </div>
  )
}

/* ============================================
   Mobile Bottom Tab Bar (P1 #3)
   Replaces the 15-button bottom sheet with 4 tabs
   ============================================ */
function MobileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: 'items' | 'summary' | 'tools' | 'more') => void
}) {
  const tabs = [
    { id: 'items' as const, label: 'Items', icon: Table2 },
    { id: 'summary' as const, label: 'Summary', icon: Calculator },
    { id: 'tools' as const, label: 'Tools', icon: Wrench },
    { id: 'more' as const, label: 'More', icon: Menu },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40" aria-label="Mobile navigation">
      <div className="flex items-stretch">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 min-h-[56px] transition-colors ${
              activeTab === tab.id
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

/* ============================================
   Mobile Tools Panel - organized in 2-column grid
   ============================================ */
function MobileToolsPanel({
  currentProject,
  duplicateProject,
  dispatch,
}: {
  currentProject: any
  duplicateProject: (id: string) => void
  dispatch: React.Dispatch<AppAction>
}) {
  return (
    <div className="space-y-4 pb-20">
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Project</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="justify-start gap-2 h-11" onClick={() => currentProject && duplicateProject(currentProject.id)}>
            <Copy className="w-4 h-4" /> Duplicate
          </Button>
          <FolderManager trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Folder className="w-4 h-4" /> Folders</Button>} />
          <VersionHistory trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><History className="w-4 h-4" /> History</Button>} />
          <Button variant="outline" size="sm" className="justify-start gap-2 h-11" onClick={() => dispatch({ type: 'SHOW_ATTACHMENTS_MOBILE' })}>
            <Paperclip className="w-4 h-4" /> Files
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">AI</h3>
        <div className="grid grid-cols-2 gap-2">
          <AIEstimatorDialog trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Sparkles className="w-4 h-4" /> AI Estimate</Button>} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Estimation Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <MaterialsCatalogManager trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Database className="w-4 h-4" /> Catalog</Button>} />
          <Button variant="outline" size="sm" className="justify-start gap-2 h-11" onClick={() => dispatch({ type: 'SET_ASSEMBLY_LIBRARY', payload: true })}>
            <Package className="w-4 h-4" /> Library
          </Button>
          <Button variant="outline" size="sm" className="justify-start gap-2 h-11" onClick={() => dispatch({ type: 'SET_ASSEMBLY_WIZARD', payload: true })}>
            <Wand2 className="w-4 h-4" /> Wizard
          </Button>
          <AssemblyManager trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><ListChecks className="w-4 h-4" /> My Kits</Button>} />
          <LaborRatesManager trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Users className="w-4 h-4" /> Labor</Button>} />
          <ChangeOrderManager trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><FileStack className="w-4 h-4" /> Changes</Button>} />
          <ProfitMarginChart trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><PieChart className="w-4 h-4" /> Profit</Button>} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Data</h3>
        <div className="grid grid-cols-2 gap-2">
          <ImportDialog trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Upload className="w-4 h-4" /> Import</Button>} />
          <ExportDialog trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Download className="w-4 h-4" /> Export</Button>} />
          <ShareDialog trigger={<Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full"><Share2 className="w-4 h-4" /> Share</Button>} />
          <Button variant="outline" size="sm" className="justify-start gap-2 h-11" onClick={() => dispatch({ type: 'SET_PROJECT_SCHEDULE', payload: true })}>
            <CalendarDays className="w-4 h-4" /> Schedule
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Mobile More Panel
   ============================================ */
function MobileMorePanel({
  dispatch,
}: {
  dispatch: React.Dispatch<AppAction>
}) {
  return (
    <div className="space-y-4 pb-20">
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2 h-11"
          onClick={() => dispatch({ type: 'SET_DASHBOARD', payload: true })}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2 h-11"
          onClick={() => dispatch({ type: 'TOGGLE_DIVISION_PANEL' })}
        >
          <PanelLeft className="w-4 h-4" /> Division Filter
        </Button>
        <KeyboardShortcutsDialog
          trigger={
            <Button variant="outline" size="sm" className="justify-start gap-2 h-11 w-full">
              <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
            </Button>
          }
        />
      </div>
    </div>
  )
}

// Overlay Side Panel with ARIA attributes (P3 #14)
function OverlaySidePanel({
  isOpen,
  onClose,
  position,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  position: 'left' | 'right'
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 z-40 transition-opacity"
        onClick={onClose}
        role="presentation"
      />
      <div
        className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-80 max-w-[90vw] bg-card border-${position === 'left' ? 'r' : 'l'} border-border z-50 shadow-2xl overflow-hidden flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-card">
          {children}
        </div>
      </div>
    </>
  )
}

export function EstimatorApp() {
  const { currentProject, projects, createProject, duplicateProject, isLoading, undo, redo, canUndo, canRedo } = useProject()
  const [state, dispatch] = useReducer(appReducer, initialState)

  useKeyboardShortcuts([
    { action: 'go_home', handler: () => dispatch({ type: 'SET_DASHBOARD', payload: true }) },
    { action: 'go_projects', handler: () => dispatch({ type: 'SET_DASHBOARD', payload: false }) },
    { action: 'new_project', handler: () => createProject() },
    { action: 'undo', handler: () => { if (canUndo) undo() } },
    { action: 'redo', handler: () => { if (canRedo) redo() } },
  ])

  // Dashboard view
  if (state.showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="px-4 py-6 md:px-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
              Dashboard
            </h1>
            <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_DASHBOARD', payload: false })}>
              Back to Projects
            </Button>
          </div>
          <Dashboard />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="px-4 py-4 md:px-6 md:py-6 pb-20 lg:pb-6">
        {!currentProject && projects.length === 0 ? (
          /* Improved Empty State / Onboarding (P2 #8) */
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <Card className="text-center bg-card">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Welcome to OAK Estimator</CardTitle>
                <CardDescription>
                  Professional construction cost estimation made simple
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">AI Drawing Estimator</p>
                      <p className="text-xs text-muted-foreground">Upload blueprints, get instant estimates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <BarChart3 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Track Costs</p>
                      <p className="text-xs text-muted-foreground">Materials, labor, equipment & more</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Package className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Reusable Kits</p>
                      <p className="text-xs text-muted-foreground">Save assemblies as templates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <FileSpreadsheet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Export Reports</p>
                      <p className="text-xs text-muted-foreground">PDF & Excel for clients</p>
                    </div>
                  </div>
                </div>

                <Button onClick={createProject} disabled={isLoading} size="lg" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>

                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+N</kbd> to quickly create new projects
                </p>
              </CardContent>
            </Card>
          </div>
        ) : currentProject ? (
          <>
            {/* Breadcrumb Navigation (P1 #4) */}
            <Breadcrumb
              currentProject={currentProject}
              onGoToDashboard={() => dispatch({ type: 'SET_DASHBOARD', payload: true })}
            />

            {/* Desktop Toolbar - Consolidated (P0 #1) */}
            <DesktopToolbar
              state={state}
              dispatch={dispatch}
              currentProject={currentProject}
              duplicateProject={duplicateProject}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
            />

            {/* Persistent Mini Summary Bar (P0 #2) - desktop only */}
            <div className="hidden lg:block">
              <MiniSummaryBar
                showSummary={state.showSummary}
                onToggleSummary={() => dispatch({ type: 'TOGGLE_SUMMARY' })}
              />
            </div>

            {/* Mobile content - controlled by tab bar */}
            <div className="lg:hidden">
              {state.mobileTab === 'summary' && (
                <div className="mb-4">
                  <SummaryCard />
                  {state.showAttachments && <div className="mt-4"><AttachmentsPanel /></div>}
                </div>
              )}
              {state.mobileTab === 'tools' && (
                <MobileToolsPanel
                  currentProject={currentProject}
                  duplicateProject={duplicateProject}
                  dispatch={dispatch}
                />
              )}
              {state.mobileTab === 'more' && (
                <MobileMorePanel dispatch={dispatch} />
              )}
            </div>

            {/* Line Items Table - shown on desktop always, mobile only on items tab */}
            <div className={`${state.mobileTab !== 'items' ? 'hidden lg:block' : ''}`}>
              <LineItemsTable
                selectedDivision={state.selectedDivision}
                onClearDivision={() => dispatch({ type: 'CLEAR_DIVISION' })}
              />
            </div>

            {/* Overlay Division Panel (left) */}
            <OverlaySidePanel
              isOpen={state.showDivisionPanel}
              onClose={() => dispatch({ type: 'TOGGLE_DIVISION_PANEL' })}
              position="left"
              title="Divisions"
            >
              <DivisionSidebar
                selectedDivision={state.selectedDivision}
                onSelectDivision={(div) => dispatch({ type: 'SET_DIVISION', payload: div })}
                onClearDivision={() => dispatch({ type: 'CLEAR_DIVISION' })}
              />
            </OverlaySidePanel>

            {/* Overlay Summary Panel (right) */}
            <OverlaySidePanel
              isOpen={state.showSummary}
              onClose={() => dispatch({ type: 'TOGGLE_SUMMARY' })}
              position="right"
              title="Cost Summary"
            >
              <div className="space-y-4">
                <SummaryCard />
                {state.showAttachments && <AttachmentsPanel />}
              </div>
            </OverlaySidePanel>

            {/* Mobile Tab Bar (P1 #3) */}
            <MobileTabBar
              activeTab={state.mobileTab}
              onTabChange={(tab) => dispatch({ type: 'SET_MOBILE_TAB', payload: tab })}
            />

            {/* Assembly Library Dialog */}
            <AssemblyLibrary
              open={state.showAssemblyLibrary}
              onOpenChange={(open) => dispatch({ type: 'SET_ASSEMBLY_LIBRARY', payload: open })}
            />

            {/* Smart Assembly Wizard */}
            <SmartAssemblyWizard
              open={state.showAssemblyWizard}
              onOpenChange={(open) => dispatch({ type: 'SET_ASSEMBLY_WIZARD', payload: open })}
            />

            {/* Project Schedule Dialog */}
            <ProjectSchedule
              open={state.showProjectSchedule}
              onOpenChange={(open) => dispatch({ type: 'SET_PROJECT_SCHEDULE', payload: open })}
            />
          </>
        ) : (
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <Card className="text-center bg-card">
              <CardHeader>
                <CardTitle>Select a Project</CardTitle>
                <CardDescription>
                  You have {projects.length} project(s). Select one to continue or create a new project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createProject} disabled={isLoading} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
