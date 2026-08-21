import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, ChevronRight, Eraser, Loader2, Send, UserRound } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

export type Message = {
  id?: string;
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatMessage = Message & {
  id: string;
  role: "user" | "assistant";
};

type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  error?: string | null;
  suggestedPrompts?: string[];
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
  placeholder?: string;
  height?: string | number;
  emptyStateMessage?: string;
};

export function AIChatBox({
  messages,
  onSendMessage,
  onClear,
  isLoading = false,
  error,
  suggestedPrompts = [],
  inputRef,
  className,
  placeholder = "Ask Nova anything...",
  height,
  emptyStateMessage = "Ask a clear question, or begin with one of the focused prompts below.",
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const composerRef = inputRef ?? localInputRef;
  const displayMessages = messages.filter((message): message is ChatMessage => message.role !== "system");

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement | null;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading, error]);

  const submit = () => {
    const content = input.trim();
    if (!content || isLoading) return;
    onSendMessage(content);
    setInput("");
    window.requestAnimationFrame(() => composerRef.current?.focus());
  };

  return (
    <section className={cn("glass-console", className)} aria-label="AI assistant chat" style={height ? { height } : undefined}>
      <header className="console-header">
        <div className="console-identity">
          <span className="console-avatar" aria-hidden="true"><Bot size={16} /></span>
          <div>
            <p>Nova Assistant</p>
            <span>{isLoading ? "Processing your context" : "Session-ready intelligence"}</span>
          </div>
        </div>
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="console-clear"
            onClick={onClear}
            disabled={displayMessages.length === 0 || isLoading}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Eraser size={16} />
          </Button>
        )}
      </header>

      <div ref={scrollAreaRef} className="console-scroll">
        {displayMessages.length === 0 ? (
          <div className="console-empty">
            <div className="empty-sigil" aria-hidden="true"><Bot size={22} /></div>
            <p className="eyebrow">START A CONVERSATION</p>
            <h2>What would you like to explore?</h2>
            <p>{emptyStateMessage}</p>
            <div className="prompt-stack">
              {suggestedPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  className="prompt-chip"
                  onClick={() => onSendMessage(prompt)}
                  disabled={isLoading}
                >
                  <span>{prompt}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="message-stack">
              {displayMessages.map((message, index) => (
                <article className={cn("chat-message", `chat-message--${message.role}`)} key={message.id ?? `${message.role}-${index}`}>
                  <span className="message-avatar" aria-hidden="true">
                    {message.role === "assistant" ? <Bot size={14} /> : <UserRound size={14} />}
                  </span>
                  <div className="message-content">
                    <p className="message-label">{message.role === "assistant" ? "NOVA" : "YOU"}</p>
                    {message.role === "assistant" ? (
                      message.content ? (
                        <div className="assistant-markdown"><Streamdown>{message.content}</Streamdown></div>
                      ) : (
                        <span className="response-caret" aria-label="Assistant response is being revealed" />
                      )
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </article>
              ))}
              {isLoading && (
                <div className="thinking-row" aria-live="polite">
                  <span className="message-avatar" aria-hidden="true"><Bot size={14} /></span>
                  <span>Processing context<span className="typing-dots" aria-hidden="true"><i /><i /><i /></span></span>
                </div>
              )}
              {error && <p className="chat-error" role="alert">{error}</p>}
            </div>
          </ScrollArea>
        )}
      </div>

      <form
        className="console-composer"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Textarea
          ref={composerRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={placeholder}
          aria-label="Message Nova Assistant"
          className="console-input"
        />
        <Button type="submit" size="icon" className="send-button" disabled={!input.trim() || isLoading} aria-label="Send message">
          {isLoading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
        </Button>
      </form>
      <p className="composer-note">Enter to send <span>•</span> Shift + Enter for a new line</p>
    </section>
  );
}