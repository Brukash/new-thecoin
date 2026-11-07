"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const INTRO: Message = {
  role: "assistant",
  content:
    "Hello. I can answer questions about membership, savings, credit, projects and events from this website. For anything about your own account, the Secretariat will help you directly.",
};

const SUGGESTIONS = [
  "How do I join the Society?",
  "What loans are available?",
  "Where is the Secretariat?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((message) => message.role === "user" || message.content !== INTRO.content) }),
      });
      const data = (await response.json()) as { ok?: boolean; reply?: string; message?: string };

      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.ok && data.reply
              ? data.reply
              : data.message ?? "That could not be answered just now. Please contact the Secretariat.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Network error. Please check your connection and try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close the website assistant" : "Ask the website assistant"}
        className="fixed bottom-6 left-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-navy text-white shadow-lg transition-colors hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:left-6"
      >
        {open ? <X className="size-5" aria-hidden /> : <MessageCircle className="size-5" aria-hidden />}
      </button>

      {open ? (
        <div
          id="chat-panel"
          role="dialog"
          aria-label="Website assistant"
          className="fixed bottom-24 left-4 z-30 flex max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] flex-col border border-line bg-white shadow-2xl sm:left-6"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line bg-bone px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                Website assistant
              </p>
              <p className="mt-0.5 text-xs text-slate">Answers from published pages</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-slate hover:text-navy"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <p
                key={index}
                className={
                  message.role === "user"
                    ? "ml-8 bg-navy px-3 py-2 text-[14px] leading-relaxed text-white"
                    : "mr-4 bg-bone px-3 py-2 text-[14px] leading-relaxed text-navy"
                }
              >
                {message.content}
              </p>
            ))}
            {busy ? <p className="mr-4 text-[14px] italic text-slate">Looking that up…</p> : null}

            {messages.length === 1 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="border border-line px-2 py-1 text-[12px] text-navy hover:border-navy"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-line px-3 py-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Your question
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about membership, credit…"
              maxLength={500}
              className="field h-10 flex-1 text-[14px]"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              aria-label="Send question"
              className="inline-flex size-10 items-center justify-center bg-navy text-white disabled:opacity-40"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>

          <p className="border-t border-line px-4 py-2 text-[11px] leading-relaxed text-slate">
            Automated answers only. For your account,{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-navy">
              contact the Secretariat
            </Link>
            .
          </p>
        </div>
      ) : null}
    </>
  );
}
