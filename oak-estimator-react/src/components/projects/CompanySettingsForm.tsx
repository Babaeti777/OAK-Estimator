import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import type { CompanySettings } from "@/types"
import { Building2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export function CompanySettingsForm() {
  const { currentProject, updateCompanySettings } = useProject()

  const { register, handleSubmit, formState: { isDirty, isSubmitting } } = useForm<CompanySettings>({
    defaultValues: currentProject?.companySettings || {
      companyName: '',
      address: '',
      phone: '',
      email: '',
    },
  })

  const onSubmit = async (data: CompanySettings) => {
    try {
      await updateCompanySettings(data)
      toast({
        title: "Company settings saved",
        description: "Your company information has been updated successfully.",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>Company Information</CardTitle>
          </div>
          <CardDescription>
            Update your company details for estimates and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="ABC Construction Co."
                  {...register("companyName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
                  {...register("email")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State 12345"
                  {...register("address")}
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
      </Card>
    </motion.div>
  )
}
