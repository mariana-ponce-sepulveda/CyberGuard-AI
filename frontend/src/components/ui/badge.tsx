import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'border-bg-muted bg-bg-elevated text-text-secondary',
        low:      'border-risk-low bg-risk-low-bg text-risk-low',
        medium:   'border-risk-medium bg-risk-medium-bg text-risk-medium',
        high:     'border-risk-high bg-risk-high-bg text-risk-high',
        accent:   'border-accent-primary bg-accent-glow text-accent-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
