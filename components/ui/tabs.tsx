'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

const tabsListVariants = {
  segmented:
    'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
  chip:
    '-mx-1 flex h-auto w-full max-w-full flex-wrap items-center gap-1.5 overflow-x-auto bg-transparent p-0 px-1 pb-0.5 text-foreground [-webkit-overflow-scrolling:touch]',
} as const

function TabsList({
  className,
  variant = 'segmented',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: keyof typeof tabsListVariants
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants[variant], className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = {
  segmented:
    "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  chip: cn(
    'inline-flex h-auto max-w-[min(100%,12rem)] shrink-0 items-center justify-start gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-xs font-normal transition-colors sm:max-w-[14rem]',
    'border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
    'data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:hover:bg-primary/15',
    'dark:data-[state=active]:border-primary/35 dark:data-[state=active]:bg-primary/10 dark:data-[state=active]:text-primary',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-3.5',
  ),
} as const

function TabsTrigger({
  className,
  variant = 'segmented',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: keyof typeof tabsTriggerVariants
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant}
      className={cn(tabsTriggerVariants[variant], className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
