import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-accent-gradient text-white shadow-glow-sm hover:shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98]',
        outline:
          'border border-bg-muted bg-transparent text-text-primary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-glow',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
        destructive:
          'bg-risk-high text-white hover:opacity-90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-12 rounded-md px-8 text-base',
        icon:    'h-9 w-9',
        full:    'h-12 w-full px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
