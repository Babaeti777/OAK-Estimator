import { Header } from "./layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { Plus, FolderOpen } from "lucide-react"

export function EstimatorApp() {
  const { currentProject, projects, createProject, isLoading } = useProject()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
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
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {currentProject?.projectSettings.projectName || "Select a Project"}
                </h2>
                <p className="text-muted-foreground">
                  {currentProject?.projectSettings.projectNumber
                    ? `Project #${currentProject.projectSettings.projectNumber}`
                    : "No project selected"}
                </p>
              </div>
              <Button onClick={createProject} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Total projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>In current project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {currentProject?.lineItems.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Real-time sync</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold text-green-500">Online</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Construction in Progress</CardTitle>
                <CardDescription>
                  The full estimator interface is being built. Coming soon:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Project settings and company information</li>
                  <li>Line items table with drag & drop</li>
                  <li>Material database browser (2,953 items)</li>
                  <li>Calculator with basic & engineering modes</li>
                  <li>PDF export functionality</li>
                  <li>Real-time cost calculations</li>
                  <li>AI Gap Analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
