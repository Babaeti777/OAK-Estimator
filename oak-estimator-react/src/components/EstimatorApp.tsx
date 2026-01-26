import { useState } from "react"
import { Header } from "./layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { ProjectSettingsForm } from "./projects/ProjectSettingsForm"
import { SummaryCard } from "./projects/SummaryCard"
import { LineItemsTable } from "./line-items/LineItemsTable"
import { ExportDialog } from "./projects/ExportDialog"
import { VersionHistory } from "./projects/VersionHistory"
import { FolderManager } from "./projects/FolderManager"
import { Dashboard } from "./dashboard/Dashboard"
import { AssemblyManager } from "./assemblies/AssemblyManager"
import { ChangeOrderManager } from "./change-orders/ChangeOrderManager"
import { ImportDialog } from "./import/ImportDialog"
import { ShareDialog } from "./sharing/ShareDialog"
import { KeyboardShortcutsDialog } from "./shortcuts/KeyboardShortcutsDialog"
import { AttachmentsPanel } from "./attachments/AttachmentsPanel"
import { LaborRatesManager } from "./labor/LaborRatesManager"
import { ProfitMarginChart } from "./analysis/ProfitMarginChart"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import {
  Plus,
  FolderOpen,
  PanelRightClose,
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
} from "lucide-react"
import { DivisionSidebar } from "./navigation/DivisionSidebar"
import { ProjectTotalBadge } from "./projects/ProjectTotalBadge"
import { motion, AnimatePresence } from "framer-motion"

// Mobile Action Button component for consistent styling
function MobileActionButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-accent transition-colors"
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

export function EstimatorApp() {
  const { currentProject, projects, createProject, duplicateProject, isLoading } = useProject()
  const [showSummary, setShowSummary] = useState(true)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  // Keyboard shortcuts handlers
  useKeyboardShortcuts([
    { action: 'go_home', handler: () => setShowDashboard(true) },
    { action: 'go_projects', handler: () => setShowDashboard(false) },
    { action: 'new_project', handler: () => createProject() },
  ])

  // Show dashboard view
  if (showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
              Dashboard
            </h1>
            <Button variant="outline" size="sm" onClick={() => setShowDashboard(false)}>
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

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-7xl relative">
        {!currentProject && projects.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <Card className="text-center">
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
                <Button
                  onClick={createProject}
                  disabled={isLoading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : currentProject ? (
          <>
            {/* Desktop Action Bar */}
            <div className="hidden lg:flex justify-between items-center mb-4">
              {/* Action Buttons - Left */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  title="Dashboard"
                  onClick={() => setShowDashboard(true)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <FolderManager
                  trigger={
                    <Button variant="outline" size="icon" title="Manage Folders">
                      <Folder className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  size="icon"
                  title="Duplicate Project"
                  onClick={() => currentProject && duplicateProject(currentProject.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <VersionHistory
                  trigger={
                    <Button variant="outline" size="icon" title="Version History">
                      <History className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  size="icon"
                  title="Attachments"
                  onClick={() => setShowAttachments(!showAttachments)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons - Center */}
              <div className="flex items-center gap-2">
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
                    <Button variant="outline" size="icon" title="Export">
                      <Download className="h-4 w-4" />
                    </Button>
                  }
                />
                <ShareDialog />
                <KeyboardShortcutsDialog />
              </div>
              <ProjectTotalBadge
                showSummary={showSummary}
                onToggleSummary={() => setShowSummary(!showSummary)}
              />
            </div>

            {/* Mobile Quick Actions Bar */}
            <div className="lg:hidden flex items-center justify-between gap-2 mb-4 overflow-x-auto pb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDashboard(true)}
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Dashboard</span>
                </Button>
                <Button
                  variant={showMobileSummary ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMobileSummary(!showMobileSummary)}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Summary</span>
                </Button>
              </div>
            </div>

            {/* Mobile Summary Panel (collapsible) */}
            <AnimatePresence>
              {showMobileSummary && (
                <motion.div
                  className="lg:hidden mb-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <SummaryCard />
                  {showAttachments && <div className="mt-4"><AttachmentsPanel /></div>}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 lg:gap-6">
              <DivisionSidebar
                selectedDivision={selectedDivision}
                onSelectDivision={setSelectedDivision}
                onClearDivision={() => setSelectedDivision("")}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
              />

              {/* Main Content Area */}
              <div className="flex-1 space-y-4 md:space-y-6 transition-all duration-300 min-w-0">
                {/* Project Header with Logo and Settings */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 md:gap-6">
                  {/* Company Logo */}
                  {currentProject.companySettings.logoUrl && (
                    <div className="flex-shrink-0 hidden sm:block">
                      <img
                        src={currentProject.companySettings.logoUrl}
                        alt={currentProject.companySettings.companyName || "Company logo"}
                        className="w-16 h-16 md:w-24 md:h-24 object-contain rounded-lg border-2 border-border bg-muted p-2"
                      />
                    </div>
                  )}

                  {/* Project Settings */}
                  <div className="flex-1 min-w-0">
                    <ProjectSettingsForm />
                  </div>

                  {/* Summary Toggle Button (tablet) */}
                  <div className="hidden md:flex lg:hidden items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSummary(!showSummary)}
                      title={showSummary ? "Hide Summary" : "Show Summary"}
                    >
                      {showSummary ? (
                        <PanelRightClose className="h-4 w-4" />
                      ) : (
                        <Calculator className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Line Items Table */}
                <LineItemsTable
                  selectedDivision={selectedDivision}
                  onClearDivision={() => setSelectedDivision("")}
                />
              </div>

              {/* Collapsible Summary Panel (desktop) */}
              <div
                className={`hidden lg:block transition-all duration-300 ease-in-out overflow-hidden ${
                  showSummary ? 'w-80 opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <div className="w-80 sticky top-24 space-y-4">
                  <SummaryCard />
                  {/* Attachments Panel (collapsible) */}
                  {showAttachments && <AttachmentsPanel />}
                </div>
              </div>
            </div>

            {/* Mobile Floating Action Button */}
            <motion.div
              className="lg:hidden fixed bottom-6 right-6 z-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg shadow-primary/30"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Mobile Bottom Sheet Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  {/* Bottom Sheet */}
                  <motion.div
                    className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-40 max-h-[80vh] overflow-hidden"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 pb-4 border-b border-border">
                      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                      <p className="text-sm text-muted-foreground">Access all project tools</p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[calc(80vh-120px)] pb-24">
                      {/* Project Actions */}
                      <div className="px-4 py-3">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          Project
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          <MobileActionButton
                            icon={Copy}
                            label="Duplicate"
                            onClick={() => { currentProject && duplicateProject(currentProject.id); setMobileMenuOpen(false) }}
                          />
                          <MobileActionButton
                            icon={Paperclip}
                            label="Files"
                            onClick={() => { setShowAttachments(!showAttachments); setShowMobileSummary(true); setMobileMenuOpen(false) }}
                          />
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <FolderManager
                              trigger={<MobileActionButton icon={Folder} label="Folders" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <VersionHistory
                              trigger={<MobileActionButton icon={History} label="History" />}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tools */}
                      <div className="px-4 py-3">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          Tools
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <AssemblyManager
                              trigger={<MobileActionButton icon={Package} label="Assemblies" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <LaborRatesManager
                              trigger={<MobileActionButton icon={Users} label="Labor" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <ChangeOrderManager
                              trigger={<MobileActionButton icon={FileStack} label="Changes" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <ProfitMarginChart
                              trigger={<MobileActionButton icon={PieChart} label="Profit" />}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Data */}
                      <div className="px-4 py-3">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          Data
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <ImportDialog
                              trigger={<MobileActionButton icon={Upload} label="Import" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <ExportDialog
                              trigger={<MobileActionButton icon={Download} label="Export" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <ShareDialog
                              trigger={<MobileActionButton icon={Share2} label="Share" />}
                            />
                          </div>
                          <div onClick={() => setMobileMenuOpen(false)}>
                            <KeyboardShortcutsDialog
                              trigger={<MobileActionButton icon={Keyboard} label="Shortcuts" />}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Swipe hint */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
                        <ChevronUp className="w-3 h-3" />
                        Tap outside to close
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <Card className="text-center">
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
