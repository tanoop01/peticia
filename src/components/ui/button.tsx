import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20 hover:shadow-accent/30",
        destructive: "bg-error text-white hover:bg-error-hover shadow-lg shadow-error/20 hover:shadow-error/30",
        outline: "border-2 border-border-strong bg-transparent text-text-primary hover:bg-surface-hover hover:border-accent",
        secondary: "bg-surface-card border border-border-strong text-text-primary hover:bg-surface-hover hover:border-accent",
        ghost: "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-hover",
        success: "bg-success text-white hover:bg-success-hover shadow-lg shadow-success/20 hover:shadow-success/30",
        warning: "bg-warning text-white hover:bg-warning-hover shadow-lg shadow-warning/20 hover:shadow-warning/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
