import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { ProjectProvider } from "@/contexts/ProjectContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { LoadingScreen } from "@/components/auth/LoadingScreen"
import { EstimatorApp } from "@/components/EstimatorApp"
import { Toaster } from "@/components/ui/toaster"

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <ProjectProvider>
      <EstimatorApp />
    </ProjectProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
