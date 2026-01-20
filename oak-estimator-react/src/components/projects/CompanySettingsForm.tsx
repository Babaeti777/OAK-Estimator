import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useProject } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import type { CompanySettings } from "@/types"
import { Building2, Save, ChevronDown, ChevronUp, Upload, X, Image } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { uploadCompanyLogo, deleteCompanyLogo } from "@/services/storage.service"

export function CompanySettingsForm() {
  const { user } = useAuth()
  const { currentProject, updateCompanySettings } = useProject()
  const [isOpen, setIsOpen] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { isDirty, isSubmitting } } = useForm<CompanySettings>({
    defaultValues: currentProject?.companySettings || {
      companyName: '',
      address: '',
      phone: '',
      email: '',
      logoUrl: '',
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    if (currentProject?.companySettings.logoUrl) {
      try {
        await deleteCompanyLogo(currentProject.companySettings.logoUrl)
        await updateCompanySettings({
          ...currentProject.companySettings,
          logoUrl: '',
        })
        toast({
          title: "Logo removed",
          description: "Company logo has been removed successfully.",
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to remove logo",
          description: error.message,
        })
      }
    }
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: CompanySettings) => {
    try {
      setIsUploading(true)

      let logoUrl = data.logoUrl || ''

      // Upload new logo if selected
      if (logoFile && user) {
        // Delete old logo if exists
        if (currentProject?.companySettings.logoUrl) {
          try {
            await deleteCompanyLogo(currentProject.companySettings.logoUrl)
          } catch (error) {
            console.error('Failed to delete old logo:', error)
          }
        }

        // Upload new logo
        logoUrl = await uploadCompanyLogo(user.uid, logoFile)
      }

      await updateCompanySettings({
        ...data,
        logoUrl,
      })

      toast({
        title: "Company settings saved",
        description: "Your company information has been updated successfully.",
      })

      // Reset logo state
      setLogoFile(null)
      setLogoPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (!currentProject) {
    return null
  }

  const hasData = currentProject.companySettings.companyName ||
                  currentProject.companySettings.email ||
                  currentProject.companySettings.phone ||
                  currentProject.companySettings.address

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-2 text-left">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Company Information</CardTitle>
                    {hasData && !isOpen && (
                      <CardDescription className="text-xs mt-1">
                        {currentProject.companySettings.companyName || "Not set"}
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
                {/* Logo Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {/* Logo Preview */}
                    <div className="flex-shrink-0">
                      {logoPreview || currentProject.companySettings.logoUrl ? (
                        <div className="relative w-24 h-24 rounded-lg border-2 border-border overflow-hidden bg-muted">
                          <img
                            src={logoPreview || currentProject.companySettings.logoUrl}
                            alt="Company logo"
                            className="w-full h-full object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={handleRemoveLogo}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="logo"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, or SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

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
                  <Button type="submit" disabled={((!isDirty && !logoFile) || isSubmitting || isUploading)}>
                    <Save className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Changes"}
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
