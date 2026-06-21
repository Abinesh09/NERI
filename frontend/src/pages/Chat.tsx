import { useEffect, useRef, useState } from "react"
import { ArrowUp, Bot, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/lib/api"

type Message = {
  id: number
  role: "user" | "model"
  message: string
}

type Conversation = {
  id: number
  title: string
  messages: Message[]
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const active = conversations.find((conversation) => conversation.id === activeId) ?? null

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiRequest<Conversation[]>("/chat/conversations")
      setConversations(data)
      setActiveId(data[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat")
    } finally {
      setLoading(false)
    }
  }

  const newChat = async () => {
    setError("")
    const conversation = await apiRequest<Conversation>("/chat/conversations", { method: "POST" })
    setConversations((current) => [conversation, ...current])
    setActiveId(conversation.id)
  }

  const deleteChat = async (id: number) => {
    await apiRequest(`/chat/conversations/${id}`, { method: "DELETE" })
    setConversations((current) => current.filter((conversation) => conversation.id !== id))
    if (activeId === id) {
      const remaining = conversations.filter((conversation) => conversation.id !== id)
      setActiveId(remaining[0]?.id ?? null)
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || !activeId) return
    setInput("")
    setSending(true)
    setError("")
    textareaRef.current?.style.setProperty("height", "44px")
    try {
      const updated = await apiRequest<Conversation>(`/chat/conversations/${activeId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      })
      setConversations((current) => current.map((conversation) => conversation.id === updated.id ? updated : conversation))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border/70 bg-card/70 p-4 backdrop-blur-xl lg:block">
        <Button className="h-11 w-full justify-start gap-2 rounded-xl" onClick={newChat}>
          <Plus className="h-4 w-4" /> New Chat
        </Button>
        <div className="mt-6 space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved Conversations</p>
          {conversations.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">No Data Found</p>
          ) : conversations.map((chat) => (
            <div key={chat.id} className={cn("group flex items-center rounded-xl transition", activeId === chat.id && "bg-muted")}>
              <button onClick={() => setActiveId(chat.id)} className="min-w-0 flex-1 px-3 py-3 text-left text-sm text-muted-foreground group-hover:text-foreground">
                <span className="block truncate">{chat.title}</span>
              </button>
              <Button variant="ghost" size="icon" className="mr-1 h-8 w-8" onClick={() => deleteChat(chat.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex min-h-0 flex-col">
        <div className="border-b border-border/70 px-4 py-5 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">AI learning workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{active?.title ?? "New Chat"}</h1>
            </div>
            <Button className="gap-2 lg:hidden" onClick={newChat}><Plus className="h-4 w-4" /> New Chat</Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-5">
            {loading ? (
              <Centered text="Loading chat..." spin />
            ) : error ? (
              <Centered text={error} />
            ) : !active ? (
              <Centered text="No Data Found" detail="Start a new chat to save a conversation." />
            ) : active.messages.length === 0 ? (
              <Centered text="No Data Found" detail="Send a message to begin this conversation." />
            ) : active.messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                {message.role === "model" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div className={cn("max-w-[86%] rounded-2xl border px-5 py-4 shadow-sm", message.role === "user" ? "border-primary/20 bg-primary text-primary-foreground" : "border-border bg-card")}>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                </div>
              </div>
            ))}
            {sending && <Centered text="NERI is thinking..." spin />}
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/80 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-border bg-card p-2 shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              disabled={!activeId || sending}
              onChange={(event) => {
                setInput(event.target.value)
                event.currentTarget.style.height = "44px"
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 140)}px`
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
              className="max-h-[140px] min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none disabled:cursor-not-allowed"
              placeholder={activeId ? "Type your message" : "Create a chat to begin"}
            />
            <Button size="icon" className="h-11 w-11 rounded-xl" onClick={send} disabled={!input.trim() || !activeId || sending}>
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function Centered({ text, detail, spin = false }: { text: string; detail?: string; spin?: boolean }) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <Loader2 className={cn("mx-auto mb-3 h-6 w-6", !spin && "hidden", spin && "animate-spin")} />
      <p className="font-medium">{text}</p>
      {detail && <p className="mt-1 text-sm">{detail}</p>}
    </div>
  )
}
