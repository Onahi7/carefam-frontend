export default function AdminLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
      </div>

      <section>
        <div className="h-6 bg-muted rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </section>

      <section>
        <div className="h-6 bg-muted rounded w-64 mb-4"></div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </section>
    </div>
  )
}
