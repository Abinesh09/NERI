import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BookOpen, Clock, Loader2, Medal, TrendingUp } from "lucide-react"
import { apiRequest, formatPercent } from "@/lib/api"

type AnalyticsData = {
  has_data: boolean
  total_tests?: number
  average_score?: number
  highest_score?: number
  average_time?: number
  trend?: { date: string; score: number; test: string }[]
  subject_breakdown?: { subject: string; score: number }[]
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiRequest<AnalyticsData>("/analytics")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <EmptyState icon={Loader2} text="Loading analytics..." spin />
  if (error) return <EmptyState icon={BookOpen} text={error} />
  if (!data?.has_data) return <EmptyState icon={BookOpen} text="No Data Found" detail="Complete a test attempt to generate analytics." />

  const trend = data.trend?.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString(),
    score: Math.round(item.score),
  })) ?? []
  const breakdown = data.subject_breakdown?.map((item) => ({ ...item, score: Math.round(item.score) })) ?? []

  return (
    <div className="min-h-full p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Learning Intelligence</p>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Metric icon={BookOpen} label="Total Tests" value={`${data.total_tests ?? 0}`} />
          <Metric icon={TrendingUp} label="Average Score" value={formatPercent(data.average_score)} />
          <Metric icon={Medal} label="Highest Score" value={formatPercent(data.highest_score)} />
          <Metric icon={Clock} label="Average Time" value={`${Math.round((data.average_time ?? 0) / 60)} min`} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Score Trend">
            {trend.length === 0 ? <NoData /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#C62828" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Panel>
          <Panel title="Subject Breakdown">
            {breakdown.length === 0 ? <NoData /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={breakdown}>
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#F4B400" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="mb-4 text-xl font-bold">{title}</h2>{children}</section>
}

function NoData() {
  return <div className="flex h-[280px] items-center justify-center text-muted-foreground">No Data Found</div>
}

function EmptyState({ icon: Icon, text, detail, spin = false }: { icon: typeof BookOpen; text: string; detail?: string; spin?: boolean }) {
  return <div className="flex min-h-full items-center justify-center p-8"><div className="text-center text-muted-foreground"><Icon className={`mx-auto mb-3 h-8 w-8 ${spin ? "animate-spin" : ""}`} /><h2 className="text-xl font-semibold text-foreground">{text}</h2>{detail && <p className="mt-2 text-sm">{detail}</p>}</div></div>
}
