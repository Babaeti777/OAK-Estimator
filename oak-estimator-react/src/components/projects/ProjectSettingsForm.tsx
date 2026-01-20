import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useProject } from "@/contexts/ProjectContext"
import type { ProjectSettings } from "@/types"
import { FileText, Save, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export function ProjectSettingsForm() {
  const { currentProject, updateProjectSettings } = useProject()
  const [isOpen, setIsOpen] = useState(false)

  const { register, handleSubmit, formState: { isDirty, isSubmitting } } = useForm<ProjectSettings>({
    defaultValues: currentProject?.projectSettings || {
      projectName: '',
      projectNumber: '',
      location: '',
      architect: '',
      estimator: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: ProjectSettings) => {
    try {
      await updateProjectSettings(data)
      toast({
        title: "Project settings saved",
        description: "Your project information has been updated successfully.",
      })
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

  const settings = currentProject.projectSettings
  const hasData = settings.projectNumber || settings.location || settings.architect

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-2 text-left">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Project Details</CardTitle>
                    {hasData && !isOpen && (
                      <CardDescription className="text-xs mt-1">
                        {settings.projectNumber && `#${settings.projectNumber}`}
                        {settings.projectNumber && settings.location && " • "}
                        {settings.location}
                      </CardDescription>
                    )}
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      placeholder="Downtown Office Building"
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="123 Main Street, City, State"
                      {...register("location")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="architect">Architect</Label>
                    <Input
                      id="architect"
                      placeholder="Smith & Associates"
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

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      {...register("date")}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={!isDirty || isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  )
}
