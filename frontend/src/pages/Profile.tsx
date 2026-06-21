import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, CalendarDays, Clock, History, Library, Loader2, Trophy, User } from "lucide-react"
import { apiRequest, formatPercent } from "@/lib/api"

type ProfileData = {
  user: { name: string; email: string; created_at: string }
  tests_completed: number
  top_score: number | null
  study_time: number
}

type TestSummary = {
  id: number
  title: string
  question_count: number
  duration: number
  created_at: string
  last_attempt_score: number | null
}

type Attempt = {
  id: number
  test_id: number
  score: number
  total: number
  completed_at: string
}

type ScheduledTest = {
  id: number
  scheduled_time: string
  status: string
  test: { title: string }
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [tests, setTests] = useState<TestSummary[]>([])
  const [history, setHistory] = useState<Attempt[]>([])
  const [scheduled, setScheduled] = useState<ScheduledTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      apiRequest<ProfileData>("/profile"),
      apiRequest<TestSummary[]>("/tests"),
      apiRequest<Attempt[]>("/history"),
      apiRequest<ScheduledTest[]>("/scheduled-tests"),
    ])
      .then(([profileData, testData, historyData, scheduledData]) => {
        setProfile(profileData)
        setTests(testData)
        setHistory(historyData)
        setScheduled(scheduledData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Empty icon={Loader2} text="Loading profile..." spin />
  if (error) return <Empty icon={User} text={error} />
  if (!profile) return <Empty icon={User} text="No Data Found" />

  return (
    <div className="min-h-full p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="h-28 bg-gradient-to-r from-[#C62828] via-[#F4B400] to-[#FFD54F]" />
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="-mt-14 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-background shadow-xl">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.user.name}</h1>
                <p className="text-muted-foreground">{profile.user.email}</p>
              </div>
            </div>
            <Link className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 font-medium text-foreground transition-colors hover:bg-muted" to="/upload">Upload First Question Paper</Link>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={BookOpen} label="Tests Completed" value={`${profile.tests_completed}`} />
          <Stat icon={Trophy} label="Top Score" value={formatPercent(profile.top_score)} />
          <Stat icon={Clock} label="Study Time" value={`${Math.round(profile.study_time / 60)} min`} />
          <Stat icon={Library} label="Saved Tests" value={`${tests.length}`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel icon={History} title="Recent Activity">
            {history.length === 0 ? <NoData text="No Data Found" /> : history.slice(0, 5).map((attempt) => (
              <p key={attempt.id} className="rounded-xl bg-background p-4 text-sm text-muted-foreground">
                Score {attempt.score} / {attempt.total} on {new Date(attempt.completed_at).toLocaleDateString()}
              </p>
            ))}
          </Panel>
          <Panel icon={CalendarDays} title="Scheduled Tests">
            {scheduled.length === 0 ? <NoData text="No Data Found" /> : scheduled.map((item) => (
              <p key={item.id} className="rounded-xl bg-background p-4 text-sm font-medium">
                {item.test?.title ?? "No Data Found"} - {new Date(item.scheduled_time).toLocaleString()} - {item.status}
              </p>
            ))}
          </Panel>
        </div>

        <Panel icon={Library} title="Test Library">
          {tests.length === 0 ? <NoData text="Upload First Question Paper" /> : (
            <div className="grid gap-3 md:grid-cols-3">
              {tests.map((item) => (
                <Link key={item.id} to={`/tests/${item.id}`} className="rounded-xl border border-border bg-background p-5 transition hover:border-primary">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.question_count} questions - {item.duration} min</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
}

function Panel({ icon: Icon, title, children }: { icon: typeof History; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">{title}</h2></div><div className="space-y-3">{children}</div></section>
}

function NoData({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">{text}</div>
}

function Empty({ icon: Icon, text, spin = false }: { icon: typeof User; text: string; spin?: boolean }) {
  return <div className="flex min-h-full items-center justify-center p-8"><div className="text-center text-muted-foreground"><Icon className={`mx-auto mb-3 h-8 w-8 ${spin ? "animate-spin" : ""}`} /><p>{text}</p></div></div>
}
