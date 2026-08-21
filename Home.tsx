import { AICore, type AssistantState } from "@/components/AICore";
import { AIChatBox, type ChatMessage } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Cpu, MessageSquareText, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const prompts = [
  "Explain machine learning simply.",
  "Help me plan a project.",
  "Analyse this problem.",
  "Teach me this concept step by step.",
];

const makeMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  content,
});

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const revealTimerRef = useRef<number | null>(null);

  const chatMutation = trpc.ai.chat.useMutation();

  useEffect(() => () => {
    if (revealTimerRef.current) window.clearInterval(revealTimerRef.current);
  }, []);

  const focusComposer = () => {
    document.getElementById("assistant-console")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inputRef.current?.focus(), 350);
  };

  const revealResponse = (content: string) => {
    const assistantMessage = makeMessage("assistant", "");
    setMessages((current) => [...current, assistantMessage]);
    setAssistantState("responding");
    let revealed = "";
    const chunkSize = Math.max(1, Math.ceil(content.length / 90));

    revealTimerRef.current = window.setInterval(() => {
      revealed = content.slice(0, revealed.length + chunkSize);
      setMessages((current) => current.map((message) => (
        message.id === assistantMessage.id ? { ...message, content: revealed } : message
      )));
      if (revealed.length >= content.length && revealTimerRef.current) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
        setAssistantState("idle");
      }
    }, 18);
  };

  const sendMessage = (content: string) => {
    if (chatMutation.isPending || !content.trim()) return;
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    setError(null);
    const userMessage = makeMessage("user", content.trim());
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setAssistantState("thinking");

    chatMutation.mutate(
      { messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })) },
      {
        onSuccess: ({ content: response }) => revealResponse(response),
        onError: () => {
          setAssistantState("error");
          setError("The assistant could not complete that request. Please try again.");
        },
      }
    );
  };

  const clearConversation = () => {
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setMessages([]);
    setError(null);
    setAssistantState("idle");
    inputRef.current?.focus();
  };

  return (
    <div className="ai-lab">
      <div className="ambient ambient--violet" aria-hidden="true" />
      <div className="ambient ambient--cyan" aria-hidden="true" />
      <div className="star-field" aria-hidden="true" />

      <header className="site-header container">
        <a href="#top" className="brand" aria-label="Nova AI home">
          <span className="brand-mark"><Cpu size={18} /></span>
          <span>NOVA<span className="brand-dot">.</span>AI</span>
        </a>
        <p className="header-status"><span /> SYSTEM ONLINE</p>
        <Button type="button" variant="ghost" className="header-action" onClick={focusComposer}>
          <MessageSquareText size={15} /> <span className="header-action-label">Open chat</span>
        </Button>
      </header>

      <main id="top">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> HUMAN-CENTRED INTELLIGENCE</p>
            <h1 id="hero-title">Thoughtful answers.<br /><em>Designed for depth.</em></h1>
            <p className="hero-description">A focused AI workspace with contextual conversation, transparent limitations, and a calm interface for complex thinking.</p>
            <div className="hero-actions">
              <Button type="button" className="primary-cta" onClick={focusComposer}>Talk to AI <ArrowUpRight size={17} /></Button>
              <a className="text-link" href="#assistant-console">Explore the interface <span>↘</span></a>
            </div>
            <div className="signal-row" aria-label="Assistant capabilities">
              <span><ShieldCheck size={15} /> Server-secure</span>
              <span><Cpu size={15} /> Context aware</span>
              <span><MessageSquareText size={15} /> Clear by design</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-corner visual-corner--top" aria-hidden="true" />
            <div className="visual-corner visual-corner--bottom" aria-hidden="true" />
            <AICore state={assistantState} onActivate={focusComposer} />
          </div>
        </section>

        <section id="assistant-console" className="chat-section container" aria-labelledby="chat-title">
          <div className="section-intro">
            <p className="eyebrow"><span /> CONVERSATION INTERFACE</p>
            <h2 id="chat-title">A calm surface for complex work.</h2>
            <p>Each prompt is sent to the assistant through a protected server-side connection. Your session context stays with the current conversation.</p>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={sendMessage}
            onClear={clearConversation}
            isLoading={chatMutation.isPending}
            error={error}
            suggestedPrompts={prompts}
            inputRef={inputRef}
          />
        </section>
      </main>

      <footer className="site-footer container">
        <div className="footer-rule" />
        <div className="creator-credit">
          <p>Made by Mohammed Irsath M</p>
          <span>AI &amp; ML Engineering</span>
        </div>
        <p className="footer-note">NOVA.AI / HUMAN-CENTRED INTELLIGENCE</p>
      </footer>
    </div>
  );
}