import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[140px] max-h-[320px] w-full rounded-md',
          'bg-bg-elevated border border-bg-muted',
          'px-3 py-2.5 text-sm text-text-primary font-sans',
          'placeholder:text-text-muted',
          'resize-y',
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
Textarea.displayName = 'Textarea'

export { Textarea }
