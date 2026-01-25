import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-popover [&>option]:text-popover-foreground cursor-pointer appearance-none bg-no-repeat bg-right pr-10",
          "bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20fill%3d%22none%22%20viewBox%3d%220%200%2020%2020%22%3e%3cpath%20stroke%3d%22%236b7280%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%20stroke-width%3d%221.5%22%20d%3d%22M6%208l4%204%204-4%22%2f%3e%3c%2fsvg%3e')]",
          "bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
