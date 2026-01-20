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
import { useTheme } from "@/contexts/ThemeContext"
import { Building2, LogOut, User, FolderOpen, Plus, Moon, Sun, Check, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

export function Header() {
  const { user, signOut } = useAuth()
  const { currentProject, projects, trashedProjects, loadProject, createProject, trashProject } = useProject()
  const { theme, toggleTheme } = useTheme()
  const [showTrash, setShowTrash] = useState(false)

  const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="%23667eea"/></svg>'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">OAK Estimator</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Construction Cost Estimating</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Projects Dropdown */}
          {projects.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentProject?.projectSettings.projectName || "Select Project"}
                  </span>
                  <span className="inline sm:hidden">Projects</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end">
                <DropdownMenuLabel>
                  {showTrash ? `Trash (${trashedProjects.length})` : `Your Projects (${projects.length})`}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {showTrash ? (
                    trashedProjects.length > 0 ? (
                      trashedProjects.map((project) => {
                        const daysLeft = project.trashedAt
                          ? Math.max(0, 30 - Math.floor((Date.now() - project.trashedAt) / (1000 * 60 * 60 * 24)))
                          : 0
                        return (
                          <DropdownMenuItem
                            key={project.id}
                            className="flex items-start gap-3 p-3"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate text-muted-foreground">
                                  {project.projectSettings.projectName}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {daysLeft} days left
                              </p>
                            </div>
                          </DropdownMenuItem>
                        )
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No projects in trash
                      </div>
                    )
                  ) : (
                    projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        className="flex items-start gap-3 p-3 cursor-pointer group"
                        onSelect={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => loadProject(project.id)}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {project.projectSettings.projectName}
                            </p>
                            {currentProject?.id === project.id && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          {project.projectSettings.projectNumber && (
                            <p className="text-xs text-muted-foreground">
                              #{project.projectSettings.projectNumber}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {project.lineItems.length} items • Updated{" "}
                            {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            trashProject(project.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowTrash(!showTrash)}
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{showTrash ? "Back to Projects" : `Trash (${trashedProjects.length})`}</span>
                </DropdownMenuItem>
                {!showTrash && (
                  <DropdownMenuItem onClick={createProject} className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create New Project</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <img
                    src={user.photoURL || defaultAvatar}
                    alt={user.displayName || "User"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
