export default function SuppliersLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
      </div>

      <section>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </section>

      <section>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </section>
    </div>
  )
}
