import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProject } from "@/contexts/ProjectContext"
import type { ProjectSettings } from "@/types"
import { FileText, Save, Pencil } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProjectDetailsDialogProps {
  trigger?: React.ReactNode
}

export function ProjectDetailsDialog({ trigger }: ProjectDetailsDialogProps) {
  const { currentProject, updateProjectSettings } = useProject()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<ProjectSettings>({
    defaultValues: currentProject?.projectSettings || {
      projectName: '',
      projectNumber: '',
      location: '',
      architect: '',
      estimator: '',
      date: new Date().toISOString().split('T')[0],
      inclusions: '',
      exclusions: '',
      terms: '',
    },
  })

  // Reset form when project changes or dialog opens
  useEffect(() => {
    if (currentProject?.projectSettings && open) {
      reset({
        ...currentProject.projectSettings,
        inclusions: currentProject.projectSettings.inclusions || '',
        exclusions: currentProject.projectSettings.exclusions || '',
        terms: currentProject.projectSettings.terms || '',
      })
    }
  }, [currentProject?.id, currentProject?.projectSettings, reset, open])

  const onSubmit = async (data: ProjectSettings) => {
    try {
      await updateProjectSettings(data)
      toast({
        title: "Project details saved",
        description: "Your project information has been updated successfully.",
      })
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message,
      })
    }
  }

  if (!currentProject) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            Project Details
          </DialogTitle>
          <DialogDescription>
            Edit your project information, location, and scope details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="Downtown Office Building Renovation"
                  className="text-lg font-medium"
                  {...register("projectName", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectNumber">Project Number</Label>
                <Input
                  id="projectNumber"
                  placeholder="PRJ-2026-001"
                  {...register("projectNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Project Location / Address</Label>
                <Input
                  id="location"
                  placeholder="123 Main Street, City, State 12345"
                  {...register("location")}
                />
              </div>
            </div>
          </div>

          {/* People */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Project Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="architect">Architect / Designer</Label>
                <Input
                  id="architect"
                  placeholder="Smith & Associates Architects"
                  {...register("architect")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimator">Estimator</Label>
                <Input
                  id="estimator"
                  placeholder="John Doe"
                  {...register("estimator")}
                />
              </div>
            </div>
          </div>

          {/* Scope Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Scope & Terms
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inclusions">Inclusions</Label>
                <Textarea
                  id="inclusions"
                  placeholder="List included scope items and assumptions..."
                  rows={5}
                  {...register("inclusions")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exclusions">Exclusions</Label>
                <Textarea
                  id="exclusions"
                  placeholder="List exclusions or owner-provided items..."
                  rows={5}
                  {...register("exclusions")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Payment terms, schedule notes, or special conditions..."
                  rows={5}
                  {...register("terms")}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
