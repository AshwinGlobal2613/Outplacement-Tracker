interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">{children}</div>
      )}
    </div>
  );
}
