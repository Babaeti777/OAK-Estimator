import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useProject } from "@/contexts/ProjectContext"
import { Building2, LogOut, FolderOpen, Plus, Check, Trash2, RotateCcw, ChevronDown, SlidersHorizontal, Pencil, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import { ProjectDetailsDialog } from "@/components/projects/ProjectDetailsDialog"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

export function Header() {
  const { user, signOut } = useAuth()
  const { currentProject, projects, trashedProjects, loadProject, createProject, trashProject, restoreProject, deleteProjectPermanently } = useProject()
  const [showTrash, setShowTrash] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const confirm = useConfirmDialog()

  const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="%23f97316"/></svg>'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-orange-500 to-amber-600 shadow-lg shadow-primary/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground">OAK Estimator</h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block leading-none">Construction Cost Estimating</p>
          </div>
        </div>

        {/* Center - Project Name */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center max-w-xl">
            <span className="text-lg font-semibold text-foreground truncate max-w-[300px] lg:max-w-[400px]" title={currentProject.projectSettings.projectName}>
              {currentProject.projectSettings.projectName}
            </span>
            {currentProject.projectSettings.projectNumber && (
              <span className="text-sm text-muted-foreground font-medium">
                #{currentProject.projectSettings.projectNumber}
              </span>
            )}
            <ProjectDetailsDialog
              trigger={
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10" title="Edit Project Details">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                </Button>
              }
            />
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Settings - Quick Access */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border bg-background hover:bg-accent"
            title="Settings"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Projects Dropdown */}
          {(projects.length > 0 || trashedProjects.length > 0) && (
            <DropdownMenu onOpenChange={(open) => { if (!open) setShowTrash(false) }}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 px-3 border-border bg-background hover:bg-accent">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="hidden sm:inline text-foreground">Projects</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-card border border-border shadow-xl" align="end" sideOffset={8}>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {showTrash ? `Trash (${trashedProjects.length})` : `Your Projects (${projects.length})`}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[320px] overflow-y-auto">
                  {showTrash ? (
                    trashedProjects.length > 0 ? (
                      trashedProjects.map((project) => {
                        const daysLeft = project.trashedAt
                          ? Math.max(0, 30 - Math.floor((Date.now() - project.trashedAt) / (1000 * 60 * 60 * 24)))
                          : 0
                        return (
                          <DropdownMenuItem
                            key={project.id}
                            className="flex items-start gap-3 p-3 cursor-default"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-foreground">
                                {project.projectSettings.projectName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Auto-deletes in {daysLeft} days
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  restoreProject(project.id)
                                }}
                                title="Restore project"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-destructive/10"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const confirmed = await confirm({
                                    title: "Delete Project Permanently",
                                    description: "Permanently delete this project? This cannot be undone.",
                                    confirmText: "Delete Forever",
                                    variant: "destructive",
                                  })
                                  if (confirmed) {
                                    deleteProjectPermanently(project.id)
                                  }
                                }}
                                title="Delete forever"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </DropdownMenuItem>
                        )
                      })
                    ) : (
                      <div className="p-6 text-center">
                        <Trash2 className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Trash is empty</p>
                      </div>
                    )
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        className="flex items-start gap-3 p-3 cursor-pointer group"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => loadProject(project.id)}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate text-foreground">
                              {project.projectSettings.projectName}
                            </p>
                            {currentProject?.id === project.id && (
                              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20">
                                <Check className="w-2.5 h-2.5 text-primary" />
                              </div>
                            )}
                          </div>
                          {project.projectSettings.projectNumber && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              #{project.projectSettings.projectNumber}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {project.lineItems.length} items • {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            trashProject(project.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No active projects</p>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    setShowTrash((prev) => !prev)
                  }}
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{showTrash ? "Back to Projects" : `Trash (${trashedProjects.length})`}</span>
                </DropdownMenuItem>
                {!showTrash && (
                  <DropdownMenuItem onClick={createProject} className="cursor-pointer text-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="font-medium">Create New Project</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all">
                  <img
                    src={currentProject?.companySettings.logoUrl || user.photoURL || defaultAvatar}
                    alt={currentProject?.companySettings.companyName || user.displayName || "User"}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-border/50"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 bg-card border border-border shadow-xl" align="end" sideOffset={8}>
                <div className="px-3 py-3 border-b border-border/50">
                  <p className="text-sm font-medium text-foreground">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem
                  className="cursor-pointer py-2.5"
                  onSelect={() => setSettingsOpen(true)}
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2.5"
                  onSelect={() => setSettingsOpen(true)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer py-2.5 text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Settings Dialog - controlled by settingsOpen state, shared between header button and user dropdown */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  )
}
