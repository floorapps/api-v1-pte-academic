'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type AlertProps = React.ComponentProps<'div'> & {
  variant?: 'default' | 'destructive'
}

function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border p-4 text-sm flex items-start gap-2',
        variant === 'default' && 'bg-muted/30 border-border/50',
        variant === 'destructive' && 'bg-destructive/10 text-destructive border-destructive',
        className
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-semibold', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }