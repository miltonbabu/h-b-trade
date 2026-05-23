import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // Cleaner, more modern button styles:
    // - Subtle hover lift (1px) instead of jumpy translate
    // - Softer shadows (shadow-soft / shadow-soft-lg from globals.css)
    // - Solid color primary instead of double-gradient noise
    const variants = {
      default: 'bg-primary text-white hover:bg-primary-600 shadow-soft hover:shadow-soft-lg hover:-translate-y-px active:translate-y-0',
      destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-soft hover:shadow-soft-lg hover:-translate-y-px active:translate-y-0',
      outline: 'border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white shadow-soft hover:shadow-soft-lg hover:-translate-y-px active:translate-y-0',
      secondary: 'bg-secondary text-white hover:bg-orange-600 shadow-soft hover:shadow-soft-lg hover:-translate-y-px active:translate-y-0',
      ghost: 'text-primary hover:bg-primary/10 hover:text-primary-700',
      link: 'text-primary underline-offset-4 hover:underline hover:text-primary-600',
      gradient: 'bg-gradient-to-r from-primary via-accent to-secondary text-white hover:opacity-95 shadow-soft hover:shadow-soft-lg hover:-translate-y-px active:translate-y-0',
      glow: 'bg-primary text-white shadow-[0_0_20px_rgba(13,148,136,0.4)] hover:shadow-[0_0_28px_rgba(13,148,136,0.6)] hover:-translate-y-px active:translate-y-0',
    }

    // Sizes tuned for accessibility — min-44px tap target on mobile.
    const sizes = {
      default: 'h-11 px-6 rounded-xl',
      sm: 'h-10 px-4 rounded-lg text-sm',
      lg: 'h-12 px-8 rounded-xl text-base',
      icon: 'h-11 w-11 rounded-xl',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-manipulation select-none',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
