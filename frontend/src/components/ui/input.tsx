import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md',
          'bg-bg-elevated border border-bg-muted',
          'px-3 py-2 text-sm text-text-primary font-mono',
          'placeholder:text-text-muted',
          'transition-all duration-200',
          'focus:outline-none focus:border-accent-primary focus:shadow-glow-sm',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
