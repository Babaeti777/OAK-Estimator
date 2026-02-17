import { useReducer, useCallback } from "react"
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
import { ChangeOrderManager } from "./change-orders/ChangeOrderManager"
import { ImportDialog } from "./import/ImportDialog"
import { ShareDialog } from "./sharing/ShareDialog"
import { KeyboardShortcutsDialog } from "./shortcuts/KeyboardShortcutsDialog"
import { AttachmentsPanel } from "./attachments/AttachmentsPanel"
import { LaborRatesManager } from "./labor/LaborRatesManager"
import { ProfitMarginChart } from "./analysis/ProfitMarginChart"
import { MaterialsCatalogManager } from "./materials/MaterialsCatalogManager"
import { DivisionSidebar } from "./navigation/DivisionSidebar"
import { ProjectTotalBadge } from "./projects/ProjectTotalBadge"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
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
  ChevronUp,
  Database,
  PanelLeft,
} from "lucide-react"

interface AppState {
  showSummary: boolean
  showDashboard: boolean
  showAttachments: boolean
  showAssemblyLibrary: boolean
  selectedDivision: string
  showDivisionPanel: boolean
  mobileMenuOpen: boolean
  showMobileSummary: boolean
}

type AppAction =
  | { type: 'TOGGLE_SUMMARY' }
  | { type: 'SET_DASHBOARD'; payload: boolean }
  | { type: 'TOGGLE_ATTACHMENTS' }
  | { type: 'SET_ASSEMBLY_LIBRARY'; payload: boolean }
  | { type: 'SET_DIVISION'; payload: string }
  | { type: 'CLEAR_DIVISION' }
  | { type: 'TOGGLE_DIVISION_PANEL' }
  | { type: 'SET_MOBILE_MENU'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_SUMMARY' }
  | { type: 'SHOW_ATTACHMENTS_MOBILE' }

const initialState: AppState = {
  showSummary: false,
  showDashboard: false,
  showAttachments: false,
  showAssemblyLibrary: false,
  selectedDivision: "",
  showDivisionPanel: false,
  mobileMenuOpen: false,
  showMobileSummary: false,
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
    default:
      return state
  }
}

function MobileActionButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-accent transition-colors min-w-[44px] min-h-[44px]"
      aria-label={label}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-1.5">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-xs text-foreground font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  )
}

function DesktopToolbar({
  state,
  dispatch,
  currentProject,
  duplicateProject,
}: {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  currentProject: any
  duplicateProject: (id: string) => void
}) {
  return (
    <div className="hidden lg:flex justify-between items-center mb-4">
      {/* Action Buttons - Left */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          title="Dashboard"
          onClick={() => dispatch({ type: 'SET_DASHBOARD', payload: true })}
          aria-label="Dashboard"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Button>
        <Button
          variant={state.showDivisionPanel ? "default" : "outline"}
          size="icon"
          title="Divisions Panel"
          onClick={() => dispatch({ type: 'TOGGLE_DIVISION_PANEL' })}
          aria-label="Toggle Divisions Panel"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <FolderManager
          trigger={
            <Button variant="outline" size="icon" title="Manage Folders" aria-label="Manage Folders">
              <Folder className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          variant="outline"
          size="icon"
          title="Duplicate Project"
          onClick={() => currentProject && duplicateProject(currentProject.id)}
          aria-label="Duplicate Project"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <VersionHistory
          trigger={
            <Button variant="outline" size="icon" title="Version History" aria-label="Version History">
              <History className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          variant="outline"
          size="icon"
          title="Attachments"
          onClick={() => dispatch({ type: 'TOGGLE_ATTACHMENTS' })}
          aria-label="Attachments"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons - Center */}
      <div className="flex items-center gap-2">
        <MaterialsCatalogManager />
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: 'SET_ASSEMBLY_LIBRARY', payload: true })}
          title="Assembly Library"
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          <span className="hidden xl:inline">Library</span>
        </Button>
        <AssemblyManager />
        <LaborRatesManager />
        <ChangeOrderManager />
        <ProfitMarginChart />
      </div>

      {/* Action Buttons - Right */}
      <div className="flex items-center gap-2">
        <ImportDialog />
        <ExportDialog
          trigger={
            <Button variant="outline" size="icon" title="Export" aria-label="Export">
              <Download className="h-4 w-4" />
            </Button>
          }
        />
        <ShareDialog />
        <KeyboardShortcutsDialog />
      </div>
      <ProjectTotalBadge
        showSummary={state.showSummary}
        onToggleSummary={() => dispatch({ type: 'TOGGLE_SUMMARY' })}
      />
    </div>
  )
}

function MobileBottomSheet({
  isOpen,
  onClose,
  currentProject,
  duplicateProject,
  dispatch,
}: {
  isOpen: boolean
  onClose: () => void
  currentProject: any
  duplicateProject: (id: string) => void
  dispatch: React.Dispatch<AppAction>
}) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-40 max-h-[80vh] overflow-hidden">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>
        <div className="px-6 pb-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">Access all project tools</p>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pb-24">
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">Project</h3>
            <div className="grid grid-cols-4 gap-2">
              <MobileActionButton icon={Copy} label="Duplicate" onClick={() => { currentProject && duplicateProject(currentProject.id); onClose() }} />
              <MobileActionButton icon={Paperclip} label="Files" onClick={() => dispatch({ type: 'SHOW_ATTACHMENTS_MOBILE' })} />
              <div onClick={onClose}><FolderManager trigger={<MobileActionButton icon={Folder} label="Folders" />} /></div>
              <div onClick={onClose}><VersionHistory trigger={<MobileActionButton icon={History} label="History" />} /></div>
            </div>
          </div>
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">Tools</h3>
            <div className="grid grid-cols-4 gap-2">
              <div onClick={onClose}><MaterialsCatalogManager trigger={<MobileActionButton icon={Database} label="Catalog" />} /></div>
              <MobileActionButton icon={Package} label="Library" onClick={() => { dispatch({ type: 'SET_ASSEMBLY_LIBRARY', payload: true }); onClose() }} />
              <div onClick={onClose}><AssemblyManager trigger={<MobileActionButton icon={Package} label="My Kits" />} /></div>
              <div onClick={onClose}><LaborRatesManager trigger={<MobileActionButton icon={Users} label="Labor" />} /></div>
              <div onClick={onClose}><ChangeOrderManager trigger={<MobileActionButton icon={FileStack} label="Changes" />} /></div>
              <div onClick={onClose}><ProfitMarginChart trigger={<MobileActionButton icon={PieChart} label="Profit" />} /></div>
            </div>
          </div>
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">Data</h3>
            <div className="grid grid-cols-4 gap-2">
              <div onClick={onClose}><ImportDialog trigger={<MobileActionButton icon={Upload} label="Import" />} /></div>
              <div onClick={onClose}><ExportDialog trigger={<MobileActionButton icon={Download} label="Export" />} /></div>
              <div onClick={onClose}><ShareDialog trigger={<MobileActionButton icon={Share2} label="Share" />} /></div>
              <div onClick={onClose}><KeyboardShortcutsDialog trigger={<MobileActionButton icon={Keyboard} label="Shortcuts" />} /></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
            <ChevronUp className="w-3 h-3" />
            Tap outside to close
          </div>
        </div>
      </div>
    </>
  )
}

// Overlay Side Panel component for Summary and Divisions
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-80 max-w-[90vw] bg-card border-${position === 'left' ? 'r' : 'l'} border-border z-50 shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-card">
          {children}
        </div>
      </div>
    </>
  )
}

export function EstimatorApp() {
  const { currentProject, projects, createProject, duplicateProject, isLoading } = useProject()
  const [state, dispatch] = useReducer(appReducer, initialState)

  useKeyboardShortcuts([
    { action: 'go_home', handler: () => dispatch({ type: 'SET_DASHBOARD', payload: true }) },
    { action: 'go_projects', handler: () => dispatch({ type: 'SET_DASHBOARD', payload: false }) },
    { action: 'new_project', handler: () => createProject() },
  ])

  const closeMobileMenu = useCallback(() => {
    dispatch({ type: 'SET_MOBILE_MENU', payload: false })
  }, [])

  // Show dashboard view
  if (state.showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-6 md:px-6 md:py-8">
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
      <Header />

      {/* Full width main content - no max-width constraint */}
      <main className="px-4 py-4 md:px-6 md:py-6">
        {!currentProject && projects.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <Card className="text-center bg-card">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Welcome to OAK Estimator</CardTitle>
                <CardDescription>
                  Create your first project to get started with cost estimation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm md:text-base">
                  Projects help you organize your construction cost estimates.
                  Start by creating your first project.
                </p>
                <Button onClick={createProject} disabled={isLoading} size="lg" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : currentProject ? (
          <>
            {/* Desktop Action Bar */}
            <DesktopToolbar
              state={state}
              dispatch={dispatch}
              currentProject={currentProject}
              duplicateProject={duplicateProject}
            />

            {/* Mobile Quick Actions Bar */}
            <div className="lg:hidden flex items-center justify-between gap-2 mb-4 overflow-x-auto pb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_DASHBOARD', payload: true })}
                  className="min-h-[44px]"
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Dashboard</span>
                </Button>
                <Button
                  variant={state.showMobileSummary ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: 'TOGGLE_MOBILE_SUMMARY' })}
                  className="min-h-[44px]"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Summary</span>
                </Button>
              </div>
            </div>

            {/* Mobile Summary Panel (collapsible inline) */}
            {state.showMobileSummary && (
              <div className="lg:hidden mb-4">
                <SummaryCard />
                {state.showAttachments && <div className="mt-4"><AttachmentsPanel /></div>}
              </div>
            )}

            {/* Line Items Table - Full Width */}
            <LineItemsTable
              selectedDivision={state.selectedDivision}
              onClearDivision={() => dispatch({ type: 'CLEAR_DIVISION' })}
            />

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

            {/* Mobile Floating Action Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-30">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg shadow-primary/30"
                onClick={() => dispatch({ type: 'SET_MOBILE_MENU', payload: !state.mobileMenuOpen })}
                aria-label={state.mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {state.mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Mobile Bottom Sheet Menu */}
            <MobileBottomSheet
              isOpen={state.mobileMenuOpen}
              onClose={closeMobileMenu}
              currentProject={currentProject}
              duplicateProject={duplicateProject}
              dispatch={dispatch}
            />

            {/* Assembly Library Dialog */}
            <AssemblyLibrary
              open={state.showAssemblyLibrary}
              onOpenChange={(open) => dispatch({ type: 'SET_ASSEMBLY_LIBRARY', payload: open })}
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
