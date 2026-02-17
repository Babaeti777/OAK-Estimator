import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { ProjectProvider } from "@/contexts/ProjectContext"
import { FolderProvider } from "@/contexts/FolderContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { LoadingScreen } from "@/components/auth/LoadingScreen"
import { EstimatorApp } from "@/components/EstimatorApp"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog"

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <FolderProvider>
      <ProjectProvider>
        <EstimatorApp />
      </ProjectProvider>
    </FolderProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ConfirmDialogProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </ConfirmDialogProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
