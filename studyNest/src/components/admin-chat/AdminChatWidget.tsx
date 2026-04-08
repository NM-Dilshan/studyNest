'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal, X, Sparkles } from 'lucide-react';
import ChatMessage, { ChatRole } from './ChatMessage';

interface ChatItem {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

const QUICK_ACTIONS = [
  'Complaint Summary',
  'Most Complained Hall',
  'Pending Complaints',
  'Today Summary',
];

const welcomeMessage: ChatItem = {
  id: 'welcome',
  role: 'bot',
  content: 'Hello Admin, I can help you with complaint analytics and hall insights.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

function buildChatItem(role: ChatRole, content: string): ChatItem {
  const uniquePart = Math.random().toString(36).slice(2, 8);
  return {
    id: `${Date.now()}-${uniquePart}`,
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([welcomeMessage]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, isOpen]);

  const sendMessage = async (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }

    setMessages((prev) => [...prev, buildChatItem('user', cleanQuestion)]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanQuestion }),
      });

      const data = (await response.json()) as { reply?: string };

      if (!response.ok) {
        const errorReply = data.reply || 'Something went wrong while analyzing complaints.';
        setMessages((prev) => [...prev, buildChatItem('bot', errorReply)]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        buildChatItem('bot', data.reply || 'No response available right now.'),
      ]);
    } catch (error) {
      console.error('Admin chat request failed:', error);
      setMessages((prev) => [
        ...prev,
        buildChatItem('bot', 'I could not reach the analytics service. Please try again.'),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    await sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Toggle StudyNest Assistant"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-900/20 transition hover:scale-105 hover:shadow-2xl"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {isOpen && (
        <section className="fixed bottom-24 right-4 z-50 flex h-[74vh] w-[min(96vw,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 md:right-6 md:w-[25rem]">
          <header className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1.5">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">StudyNest Assistant</h3>
                <p className="text-[11px] text-blue-50">Admin Analytics Copilot</p>
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
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-3 py-3">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]" />
                <span className="ml-1">Assistant is analyzing complaint data...</span>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 focus-within:border-blue-400 focus-within:bg-white">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about complaints and halls..."
                className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                <SendHorizontal size={16} />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
