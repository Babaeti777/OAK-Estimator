import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useProject } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import type { CompanySettings } from "@/types"
import { Save, Upload, X, Image, Globe, FileText, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { uploadCompanyLogo, deleteCompanyLogo } from "@/services/storage.service"

export function CompanySettingsForm() {
  const { user } = useAuth()
  const { currentProject, updateCompanySettings } = useProject()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<CompanySettings>({
    defaultValues: currentProject?.companySettings || {
      companyName: '',
      address: '',
      phone: '',
      email: '',
      logoUrl: '',
      website: '',
      licenseNumber: '',
      certifications: [],
      termsAndConditions: '',
      warrantyInfo: '',
      signatureUrl: '',
    },
  })

  // Reset form when project changes
  useEffect(() => {
    if (currentProject?.companySettings) {
      reset(currentProject.companySettings)
      // Also reset logo preview when project changes
      setLogoFile(null)
      setLogoPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [currentProject?.id, currentProject?.companySettings, reset])

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

  return (
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

                {/* Basic Information */}
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

                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.company.com"
                      {...register("website")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      placeholder="LIC-123456"
                      {...register("licenseNumber")}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Extended Branding */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                    <Textarea
                      id="termsAndConditions"
                      placeholder="Enter your standard terms and conditions..."
                      rows={4}
                      {...register("termsAndConditions")}
                    />
                    <p className="text-xs text-muted-foreground">
                      These will appear on printed estimates and proposals
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warrantyInfo">Warranty Information</Label>
                    <Textarea
                      id="warrantyInfo"
                      placeholder="Enter warranty details..."
                      rows={3}
                      {...register("warrantyInfo")}
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
  )
}
