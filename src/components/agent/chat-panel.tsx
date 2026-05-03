'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import ReactMarkdown from 'react-markdown';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  agentId: string;
  agentName: string;
  agentColor: string;
  systemPrompt: string;
  initialGreeting: string;
}

export function ChatPanel({
  agentId,
  agentName,
  agentColor,
  systemPrompt,
  initialGreeting,
}: ChatPanelProps) {
    const utils = trpc.useUtils();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', role: 'assistant', content: initialGreeting },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing conversation from DB
  const { data: conversation } = trpc.conversations.getByAgent.useQuery(
    { agentId },
    { enabled: !!agentId }
  );

  const addMessage = trpc.conversations.addMessage.useMutation();

  // Load history from DB on mount
  useEffect(() => {
    if (conversation?.messages?.length) {
      const history: Message[] = conversation.messages.map((m, i) => ({
        id: `history-${i}`,
        role: m.role,
        content: m.content,
      }));
      setMessages(history);
    }
  }, [conversation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Save user message to DB
    await addMessage.mutateAsync({
      agentId,
      role: 'user',
      content: userMessage.content,
    });
    utils.agents.list.invalidate();
    // Add empty assistant message
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    try {
      // Build message history for context
      const chatHistory = messages
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({ role: m.role, content: m.content }));

      chatHistory.push({ role: 'user', content: userMessage.content });

      // Call streaming endpoint
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          agent_name: agentName,
          messages: chatHistory,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  fullResponse += data.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: fullResponse }
                        : m
                    )
                  );
                }
              } catch {}
            }
          }
        }
      }

      // Save assistant response to DB
      if (fullResponse) {
        await addMessage.mutateAsync({
          agentId,
          role: 'assistant',
          content: fullResponse,
        });
        utils.agents.list.invalidate();
      }
    } catch (err) {
      console.error('Streaming error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: agentColor }}
        >
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{agentName}</h3>
          <p className="text-xs text-muted-foreground">
            {isStreaming ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
{message.role === 'assistant' && message.content && (
  <div
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
    style={{ backgroundColor: agentColor }}
  >
    <Bot className="h-4 w-4 text-white" />
  </div>
)}
{message.content && (
  <div
    className={cn(
      'max-w-[75%] rounded-2xl px-4 py-2.5',
      message.role === 'user'
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-foreground'
    )}
  >
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  </div>
)}
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: agentColor }}
            >
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}