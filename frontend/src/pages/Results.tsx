import { ClipboardCheck } from "lucide-react"

export default function Results() {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="text-center text-muted-foreground">
        <ClipboardCheck className="mx-auto mb-3 h-8 w-8" />
        <h1 className="text-xl font-semibold text-foreground">No Data Found</h1>
        <p className="mt-2 text-sm">Complete a test attempt to view results.</p>
      </div>
    </div>
  )
}
