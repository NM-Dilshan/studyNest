import { Bot, User } from 'lucide-react';

export type ChatRole = 'user' | 'bot';

interface ChatMessageProps {
  role: ChatRole;
  content: string;
  timestamp: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm">
          <Bot size={16} />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-line ${
          isUser
            ? 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
        }`}
      >
        <p>{content}</p>
        <p className={`mt-1 text-[10px] ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>{timestamp}</p>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
