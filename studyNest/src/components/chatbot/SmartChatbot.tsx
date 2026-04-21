'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, MessageCircle, SendHorizontal, Sparkles, User, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ChatbotIntent } from '@/lib/chatbot/types'

type ChatRole = 'user' | 'bot'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}

interface ChatbotApiResponse {
  success?: boolean
  response?: string
  intent?: ChatbotIntent
}

interface StoredUser {
  student_id?: string
  role?: string
}

const QUICK_ACTIONS = [
  'Give me a complaint summary',
  'Show pending complaints',
  'What is the most complained lecture hall?',
  'Which study area is most crowded?',
  'Show free lecture halls',
  'What is the status of my complaint?',
]

function createMessage(role: ChatRole, content: string): ChatMessage {
  const uniquePart = Math.random().toString(36).slice(2, 8)
  return {
    id: `${Date.now()}-${uniquePart}`,
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

function getSessionContext(): { studentId?: string; role?: string } {
  if (typeof window === 'undefined') {
    return {}
  }

  const rawUser = localStorage.getItem('user')
  const studentId = (localStorage.getItem('studentId') || '').trim()

  if (!rawUser) {
    return {
      studentId: studentId || undefined,
    }
  }

  try {
    const user = JSON.parse(rawUser) as StoredUser
    return {
      studentId: (user.student_id || studentId || '').trim() || undefined,
      role: user.role || undefined,
    }
  } catch {
    return {
      studentId: studentId || undefined,
    }
  }
}

export default function SmartChatbot() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      'bot',
      'Hi! I can answer complaint and hall questions in natural language. Try English or simple Sinhala transliterated phrasing.'
    ),
  ])

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])
  const shouldHide = pathname.startsWith('/login')

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading, open])

  const sendMessage = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, createMessage('user', trimmed)])
    setInput('')
    setLoading(true)

    try {
      const context = getSessionContext()

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          context,
        }),
      })

      const data = (await response.json()) as ChatbotApiResponse

      if (!response.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          createMessage('bot', data.response || 'I could not process that request right now.'),
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        createMessage('bot', data.response || 'I do not have a response right now.'),
      ])
    } catch (error) {
      console.error('Smart chatbot request failed:', error)
      setMessages((prev) => [
        ...prev,
        createMessage('bot', 'The chatbot service is temporarily unavailable. Please try again.'),
      ])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSend) return
    await sendMessage(input)
  }

  if (shouldHide) return null

  return (
    <>
      <button
        type="button"
        aria-label="Open chatbot"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2E6F95] to-[#3AAFA9] text-white shadow-xl shadow-slate-900/20 transition hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <section className="fixed bottom-24 right-4 z-50 flex h-[74vh] w-[min(96vw,26rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:right-6">
          <header className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#2E6F95] to-[#3AAFA9] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1.5">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">StudyNest Smart Assistant</h3>
                <p className="text-[11px] text-cyan-50">Natural language complaint copilot</p>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-100 px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => void sendMessage(action)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-[#2E6F95]/30 hover:bg-[#2E6F95]/10 hover:text-[#2E6F95] disabled:opacity-60"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/80 px-3 py-3">
            {messages.map((message) => {
              const isUser = message.role === 'user'
              return (
                <div key={message.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2E6F95] to-[#3AAFA9] text-white">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      isUser
                        ? 'rounded-br-md bg-[#2E6F95] text-white'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`mt-1 text-[10px] ${isUser ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {message.timestamp}
                    </p>
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <User size={16} />
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#2E6F95]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#2E6F95] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#2E6F95] [animation-delay:300ms]" />
                <span className="ml-1">Thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 focus-within:border-[#2E6F95] focus-within:bg-white">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything about complaints, halls, or study areas..."
                className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#2E6F95] text-white transition hover:bg-[#245a79] disabled:bg-slate-300"
                aria-label="Send"
              >
                <SendHorizontal size={16} />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  )
}
