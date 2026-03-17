import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-gradient-to-r from-primary to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5',
      outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5',
      secondary: 'bg-gradient-to-r from-secondary to-orange-500 text-white hover:from-orange-500 hover:to-secondary shadow-lg hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5',
      ghost: 'hover:bg-primary/10 text-primary hover:text-primary-700',
      link: 'text-primary underline-offset-4 hover:underline hover:text-primary-600',
      gradient: 'bg-gradient-to-r from-primary via-accent to-secondary text-white hover:from-secondary hover:via-accent hover:to-primary shadow-lg hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 animate-gradient-shift bg-[length:200%_200%]',
      glow: 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-[0_0_20px_rgba(13,148,136,0.5)] hover:shadow-[0_0_30px_rgba(13,148,136,0.7)] hover:-translate-y-0.5',
    }

    const sizes = {
      default: 'h-11 px-6 py-2 rounded-xl',
      sm: 'h-9 rounded-lg px-4',
      lg: 'h-12 rounded-xl px-8 text-base',
      icon: 'h-11 w-11 rounded-xl',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 touch-manipulation',
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
