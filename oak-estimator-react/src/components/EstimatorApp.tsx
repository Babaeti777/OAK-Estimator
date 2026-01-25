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
import { Plus, FolderOpen, PanelRightClose, Calculator, Download, History, Folder } from "lucide-react"

export function EstimatorApp() {
  const { currentProject, projects, createProject, isLoading } = useProject()
  const [showSummary, setShowSummary] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!currentProject && projects.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-20">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to OAK Estimator</CardTitle>
                <CardDescription>
                  Create your first project to get started with cost estimation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground">
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
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className={`flex-1 space-y-6 transition-all duration-300 ${showSummary ? 'lg:pr-0' : ''}`}>
              {/* Project Header with Logo and Settings */}
              <div className="flex items-start gap-6">
                {/* Company Logo */}
                {currentProject.companySettings.logoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={currentProject.companySettings.logoUrl}
                      alt={currentProject.companySettings.companyName || "Company logo"}
                      className="w-24 h-24 object-contain rounded-lg border-2 border-border bg-muted p-2"
                    />
                  </div>
                )}

                {/* Project Settings */}
                <div className="flex-1">
                  <ProjectSettingsForm />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FolderManager
                    trigger={
                      <Button variant="outline" size="icon" title="Manage Folders">
                        <Folder className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <VersionHistory
                    trigger={
                      <Button variant="outline" size="icon" title="Version History">
                        <History className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <ExportDialog
                    trigger={
                      <Button variant="outline" size="icon" title="Export">
                        <Download className="h-4 w-4" />
                      </Button>
                    }
                  />
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
              <LineItemsTable />
            </div>

            {/* Collapsible Summary Panel */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showSummary ? 'w-80 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div className="w-80 sticky top-24">
                <SummaryCard />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-20">
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
