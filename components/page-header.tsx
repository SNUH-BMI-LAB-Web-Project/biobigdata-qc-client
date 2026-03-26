interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold break-words">{title}</h1>
        {description && (
          <p className="mt-1 break-words text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex w-full min-w-0 shrink-0 items-center justify-start p-0 md:w-auto md:max-w-full md:justify-end">
          {children}
        </div>
      )}
    </div>
  )
}
