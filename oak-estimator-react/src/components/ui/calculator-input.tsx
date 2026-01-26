import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { evaluateExpression, isExpression } from "@/utils/calculator"
import { Calculator } from "lucide-react"

export interface CalculatorInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
}

const CalculatorInput = React.forwardRef<HTMLInputElement, CalculatorInputProps>(
  ({ className, value, onChange, onBlur, onKeyDown, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value.toString())
    const [isExpressionMode, setIsExpressionMode] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef

    // Update display when external value changes
    useEffect(() => {
      if (!isExpressionMode) {
        setDisplayValue(value.toString())
      }
    }, [value, isExpressionMode])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setDisplayValue(newValue)
      setIsExpressionMode(isExpression(newValue))

      // If it's just a number, update immediately
      const numValue = parseFloat(newValue)
      if (!isNaN(numValue) && !isExpression(newValue)) {
        onChange(numValue)
      }
    }

    const evaluateAndUpdate = () => {
      if (isExpression(displayValue)) {
        const result = evaluateExpression(displayValue)
        if (result !== null) {
          setDisplayValue(result.toString())
          onChange(result)
          setShowTooltip(true)
          setTimeout(() => setShowTooltip(false), 1500)
        }
      } else {
        const numValue = parseFloat(displayValue) || 0
        setDisplayValue(numValue.toString())
        onChange(numValue)
      }
      setIsExpressionMode(false)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      evaluateAndUpdate()
      onBlur?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        evaluateAndUpdate()
        e.preventDefault()
      }
      onKeyDown?.(e)
    }

    return (
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground",
            isExpressionMode && "pr-8 ring-2 ring-primary/30 border-primary/50",
            className
          )}
          ref={combinedRef}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {isExpressionMode && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calculator className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}
        {showTooltip && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
            = {displayValue}
          </div>
        )}
      </div>
    )
  }
)
CalculatorInput.displayName = "CalculatorInput"

export { CalculatorInput }
