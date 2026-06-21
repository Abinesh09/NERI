import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, Clock, Library, Loader2, Send, TimerReset, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiRequest, formatPercent } from "@/lib/api"

type TestSummary = {
  id: number
  title: string
  question_count: number
  duration: number
  created_at: string
  last_attempt_score: number | null
}

type Question = {
  id: number
  question: string
  options: string[]
  correct_answer: string
}

type TestDetail = {
  id: number
  title: string
  duration: number
  questions: Question[]
}

export default function Tests() {
  const { id } = useParams()
  return id ? <TestRunner id={id} /> : <TestLibrary />
}

function TestLibrary() {
  const [tests, setTests] = useState<TestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiRequest<TestSummary[]>("/tests")
      .then(setTests)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tests"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Centered icon={Loader2} text="Loading tests..." spin />
  if (error) return <Centered icon={Library} text={error} />

  return (
    <div className="min-h-full p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Test Library</p>
            <h1 className="text-3xl font-bold tracking-tight">Saved Tests</h1>
          </div>
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90" to="/upload">
            <UploadCloud className="h-4 w-4" /> Upload First Question Paper
          </Link>
        </div>

        {tests.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Library className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Data Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">Upload First Question Paper to create your first test.</p>
            <Link className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90" to="/upload">Create First Test</Link>
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => (
              <article key={test.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">{test.title}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Questions" value={`${test.question_count}`} />
                  <Info label="Duration" value={`${test.duration} min`} />
                  <Info label="Created" value={new Date(test.created_at).toLocaleDateString()} />
                  <Info label="Last Score" value={formatPercent(test.last_attempt_score)} />
                </dl>
                <Link className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90" to={`/tests/${test.id}`}>Retake</Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TestRunner({ id }: { id: string }) {
  const [test, setTest] = useState<TestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [active, setActive] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [startedAt] = useState(Date.now())
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    apiRequest<TestDetail>(`/tests/${id}`)
      .then(setTest)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load test"))
      .finally(() => setLoading(false))
  }, [id])

  const answered = Object.keys(answers).length
  const progress = useMemo(() => Math.round((answered / Math.max(test?.questions.length ?? 1, 1)) * 100), [answered, test])
  const question = test?.questions[active]

  const submit = async () => {
    if (!test) return
    setSubmitting(true)
    setError("")
    try {
      await apiRequest("/tests/attempts", {
        method: "POST",
        body: JSON.stringify({
          test_id: test.id,
          time_taken: Math.round((Date.now() - startedAt) / 1000),
          answers,
        }),
      })
      navigate("/analytics")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit attempt")
      setSubmitting(false)
    }
  }

  if (loading) return <Centered icon={Loader2} text="Loading test..." spin />
  if (error && !test) return <Centered icon={Library} text={error} />
  if (!test || test.questions.length === 0) return <Centered icon={Library} text="No Data Found" />
  if (!question) return null

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Retake Test</p>
            <h1 className="text-2xl font-bold tracking-tight">{test.title}</h1>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <Stat icon={Clock} label="Duration" value={`${test.duration} min`} />
            <Stat icon={CheckCircle2} label="Answered" value={`${answered}/${test.questions.length}`} />
            <Stat icon={TimerReset} label="Progress" value={`${progress}%`} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 sm:p-8 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Question {active + 1} of {test.questions.length}</span>
          </div>
          <h2 className="mt-6 text-2xl font-semibold leading-snug">{question.question}</h2>

          <div className="mt-8 grid gap-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option
              return (
                <button
                  key={option}
                  onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                  className={cn(
                    "rounded-xl border p-4 text-left font-medium transition",
                    selected ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {error && <p className="mt-5 text-sm font-medium text-destructive">{error}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" disabled={active === 0} onClick={() => setActive((value) => Math.max(0, value - 1))}>
              Previous
            </Button>
            {active === test.questions.length - 1 ? (
              <Button className="gap-2" disabled={submitting} onClick={submit}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
              </Button>
            ) : (
              <Button onClick={() => setActive((value) => Math.min(test.questions.length - 1, value + 1))}>Next</Button>
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Question Navigator</h3>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {test.questions.map((item, index) => {
              const isAnswered = Boolean(answers[item.id])
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-semibold transition",
                    active === index && "ring-2 ring-primary",
                    isAnswered ? "border-green-500 bg-green-500/10 text-green-500" : "border-border bg-background"
                  )}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </aside>
      </main>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-card px-4 py-3"><div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</div><div className="mt-1 font-bold">{value}</div></div>
}

function Centered({ icon: Icon, text, spin = false }: { icon: typeof Library; text: string; spin?: boolean }) {
  return <div className="flex min-h-full items-center justify-center p-8"><div className="text-center text-muted-foreground"><Icon className={cn("mx-auto mb-3 h-8 w-8", spin && "animate-spin")} /><p>{text}</p></div></div>
}
