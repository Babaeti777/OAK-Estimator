import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "./button"
import { createLogger } from "@/services/logging.service"

const logger = createLogger("ErrorBoundary")

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to structured logging service
    logger.error("Uncaught error in component tree", {
      componentStack: errorInfo.componentStack,
    }, error)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      {onReset && (
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}

ErrorFallback.displayName = "ErrorFallback"
