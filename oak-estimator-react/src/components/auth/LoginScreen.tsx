import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Building2, BarChart3, Package, Shield } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: BarChart3,
    title: "Detailed Cost Tracking",
    description: "Track materials, labor, equipment by CSI division",
  },
  {
    icon: Package,
    title: "Reusable Templates",
    description: "Save assemblies and kits for faster estimation",
  },
  {
    icon: Shield,
    title: "Cloud Synced & Secure",
    description: "Firebase-backed with automatic syncing",
  },
]

export function LoginScreen() {
  const { signIn, isLoading } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4 relative overflow-hidden">
      {/* Subtle construction-themed background pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern reminiscent of blueprint paper */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Diagonal accent lines like construction markings */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 80px, hsl(var(--primary)) 80px, hsl(var(--primary)) 81px)",
          }}
        />
        {/* Decorative corner brackets */}
        <svg
          className="absolute top-8 left-8 w-24 h-24 text-primary/[0.06]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M0 30 L0 0 L30 0" />
        </svg>
        <svg
          className="absolute bottom-8 right-8 w-24 h-24 text-primary/[0.06]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M100 70 L100 100 L70 100" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="w-full glass">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Building2 className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">OAK Estimator</CardTitle>
              <CardDescription className="mt-2">
                Professional construction cost estimation
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground text-center">
              <p>Sign in to access your estimates, manage projects, and collaborate with your team.</p>
            </div>

            <Button
              onClick={signIn}
              disabled={isLoading}
              className="w-full h-12 text-base"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Feature showcase */}
            <div className="grid gap-3 pt-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-start gap-3 rounded-lg p-2.5 bg-muted/40 transition-colors hover:bg-muted/60"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-xs text-center text-muted-foreground">
              <p>Your data is stored securely in the cloud</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
