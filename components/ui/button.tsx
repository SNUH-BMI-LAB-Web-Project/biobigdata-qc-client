import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold leading-5 outline-none transition-colors disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] active:bg-[var(--primary-pressed)] disabled:bg-disabled disabled:text-disabled-foreground',
        destructive:
          'bg-destructive text-white hover:bg-[var(--destructive-pressed)] active:bg-[var(--destructive-pressed)] disabled:bg-disabled disabled:text-disabled-foreground focus-visible:ring-destructive/20',
        outline:
          'border border-muted-foreground bg-background text-foreground shadow-xs hover:bg-muted active:border-[#58616a] active:bg-muted disabled:border-disabled disabled:bg-[#e6e8ea] disabled:text-disabled-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'border border-primary bg-accent text-primary hover:bg-[#d8e5fd] active:border-[var(--primary-pressed)] active:bg-[#d8e5fd] active:text-[var(--primary-pressed)] disabled:border-disabled disabled:bg-[#e6e8ea] disabled:text-disabled-foreground',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-[#d8e5fd] disabled:text-disabled-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline disabled:text-disabled-foreground',
      },
      size: {
        default:
          'h-10 min-w-[72px] rounded-[6px] px-4 font-bold [&_svg:not([class*="size-"])]:size-5',
        sm: 'h-8 gap-1.5 rounded px-3 has-[>svg]:px-2.5',
        xs: 'h-7 gap-1 rounded px-2 text-sm has-[>svg]:px-2',
        lg: 'h-12 min-w-[90px] rounded-[6px] px-6 text-base font-bold leading-6 [&_svg:not([class*="size-"])]:size-6',
        icon: 'size-10 rounded-[6px] [&_svg:not([class*="size-"])]:size-6',
        'icon-xs': 'size-6 rounded [&_svg:not([class*="size-"])]:size-6',
        'icon-sm': 'size-8 rounded [&_svg:not([class*="size-"])]:size-5',
        'icon-lg': 'size-12 rounded-[6px] [&_svg:not([class*="size-"])]:size-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
