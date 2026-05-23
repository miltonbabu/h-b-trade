import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Match Button: rounded-xl, h-11, primary-color focus ring,
          // bigger text for mobile readability (text-base avoids iOS auto-zoom).
          "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 shadow-soft transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
