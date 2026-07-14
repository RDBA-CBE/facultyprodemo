"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, Send, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Models from "@/imports/models.import";

type MessageRole = "bot" | "user";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  linkSuggestions?: { label: string; href: string }[];
  /** Show support email + Send instead of a single Contact link. */
  contactWithMail?: boolean;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeUserMessage(text: string): ChatMessage {
  return { id: uid(), role: "user", text, timestamp: new Date() };
}

function makeBotMessage(
  text: string,
  extra?: {
    linkSuggestions?: { label: string; href: string }[];
    contactWithMail?: boolean;
  }
): ChatMessage {
  return {
    id: uid(),
    role: "bot",
    text,
    timestamp: new Date(),
    ...extra,
  };
}

const DEFAULT_GREETING =
  "Hi! I’m FacultyBot — ask how to **apply**, **register**, or **profile** help, or type a **city** or **job title** to find listings.";

const SUPPORT_EMAIL = "support@facultypro.in";

function shouldShowContactForReply(text: string): boolean {
  const value = text.toLowerCase();
  return (
    value.includes("no matching jobs") ||
    value.includes("couldn't find any jobs matching your request")
  );
}

function supportMailto(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("FacultyPro — support")}`;
}

function isContactIntent(normalized: string): boolean {
  return ["contact", "support", "customer care", "help desk"].some((k) =>
    normalized.includes(k)
  );
}

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Static FAQ before calling the search API. First matching rule wins.
 */
function tryFaqReply(normalized: string): string | null {
  if (!normalized) return null;

  const rules: { keys: string[]; reply: string }[] = [
    {
      keys: ["how to login", "login"],
      reply: "Go to the login page, enter your email and password, and click **Login**.",
    },
    {
      keys: ["forgot password", "reset password"],
      reply: "Click **Forgot Password**, enter your email, and follow the reset instructions.",
    },
    {
      keys: ["how to register", "sign up", "create account"],
      reply: "Click **Register**, fill your details, and create your account.",
    },
    {
      keys: ["show latest jobs", "latest jobs", "new jobs"],
      reply:
        "Here are the latest faculty opportunities. You can explore the  **Jobs** page to view available postings",
    },
    {
      keys: ["search jobs", "job search", "find job", "looking for job"],
      reply: "You can search jobs using keywords, location, and filters on the Jobs page.",
    },
    {
      keys: ["react jobs in chennai"],
      reply: "You can search **React jobs in Chennai** from Jobs using role + location filters.",
    },
    {
      keys: ["how to apply job", "how to apply", "apply job", "apply for job"],
      reply: "Open the job details and click the **Apply** button to submit your application.",
    },
    {
      keys: ["show job details", "job details"],
      reply: "Job details include role, requirements, location, and institution information.",
    },
    {
      keys: ["how to save job", "save job", "bookmark job"],
      reply: "Click the save icon on a job card to add it to your saved jobs list.",
    },
    {
      keys: ["show saved jobs", "saved jobs"],
      reply: "You can view saved jobs in your Profile under Saved Jobs.",
    },
    {
      keys: ["remove saved job", "delete saved job"],
      reply: "Open the saved job and click remove to delete it from your list.",
    },
    {
      keys: ["my applications"],
      reply: "You can view jobs you applied for along with status in **My Applications**.",
    },
    {
      keys: ["application status", "application tracking"],
      reply: "Check your application status in the **Applications** section in Profile.",
    },
    {
      keys: ["update profile", "edit profile", "profile update"],
      reply: "Go to the Profile section and update your details.",
    },
    {
      keys: ["upload resume", "resume", "cv"],
      reply: "You can upload your resume from the Profile section.",
    },
    {
      keys: ["add education", "education details"],
      reply: "Go to the Education section and click add to enter your details.",
    },
    {
      keys: ["edit experience", "update experience"],
      reply: "Select your experience entry and click edit to update it.",
    },
    {
      keys: ["delete project", "remove project"],
      reply: "Open the project entry and click delete to remove it.",
    },
    {
      keys: ["update skills", "edit skills", "skills"],
      reply: "Go to the Skills section and update your skills.",
    },
    {
      keys: ["set preferences", "job preferences", "update preferences"],
      reply: "Go to the Preferences section and update your job preferences.",
    },
    {
      keys: ["view preferences", "show preferences"],
      reply: "You can view your current job preferences in Profile → Preferences.",
    },
    {
      keys: ["category jobs", "jobs by category"],
      reply: "Use category filters in Jobs to view jobs by selected categories.",
    },
    {
      keys: ["college jobs", "jobs by college"],
      reply: "Use college filter in Jobs to view jobs by selected colleges.",
    },
    {
      keys: ["contact hr", "hr contact"],
      reply: "You can contact HR through the HR request option in settings.",
    },
    {
      keys: ["what can i do here", "what can i do"],
      reply: "You can search jobs, apply, manage profile, and track applications.",
    },
    {
      keys: ["help"],
      reply: "You can ask about jobs, profile, applications, or settings.",
    },
  ];

  for (const { keys, reply } of rules) {
    if (keys.some((k) => normalized.includes(k))) return reply;
  }

  return null;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]*\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\*\*([^*]*)\*\*$/);
        if (m) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {m[1]}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export default function ChatbotWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    makeBotMessage(DEFAULT_GREETING),
  ]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);

  const subLine = "Message FacultyBot";

  const handleApiSearch = useCallback(
    async (q: string): Promise<string | null> => {
      try {
        const raw = (await Models.auth.chatbot({ message: q })) as {
          reply?: string;
        };
        const r = raw?.reply;
        if (typeof r === "string" && r.trim()) return r.trim();
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const handleSend = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const q = searchInput.trim();
      if (!q || searchBusy) return;

      setMessages((prev) => [...prev, makeUserMessage(q)]);
      setSearchInput("");
      setSearchBusy(true);
      setTyping(true);

      try {
        const normalized = normalizeQuery(q);
        if (isContactIntent(normalized)) {
          setMessages((prev) => [...prev, makeBotMessage("", { contactWithMail: true })]);
          return;
        }
        const faq = tryFaqReply(normalized);
        if (faq) {
          setMessages((prev) => [...prev, makeBotMessage(faq)]);
          return;
        }

        const reply = await handleApiSearch(q);
        if (reply) {
          if (shouldShowContactForReply(reply)) {
            setMessages((prev) => [
              ...prev,
              makeBotMessage("", { contactWithMail: true }),
            ]);
          } else {
            setMessages((prev) => [...prev, makeBotMessage(reply)]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            makeBotMessage("Sorry, I could not get a response.", {
              contactWithMail: true,
            }),
          ]);
        }
      } finally {
        setTyping(false);
        setSearchBusy(false);
        searchInputRef.current?.focus();
      }
    },
    [handleApiSearch, searchBusy, searchInput]
  );

  const handleReset = useCallback(() => {
    setMessages([makeBotMessage(DEFAULT_GREETING)]);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setUnread(true), 5000);
      return () => clearTimeout(t);
    }
    setUnread(false);
  }, [open]);

  const toggleOpen = useCallback(() => {
    setOpen((v) => !v);
    setUnread(false);
  }, []);

  const openOnHover = useCallback(() => {
    setOpen(true);
    setUnread(false);
  }, []);

  const onFabClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (open) {
        setOpen(false);
        setUnread(false);
      } else {
        setOpen(true);
        setUnread(false);
      }
    },
    [open]
  );

  const navigateWithinApp = useCallback(
    (path: string) => {
      if (!path) return;
      if (path.startsWith("/")) {
        router.push(path);
        return;
      }
      window.location.href = path;
    },
    [router]
  );

  return (
    <>
      <div
        className={`fixed bottom-20 right-1 z-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-[#1E3786]/25 bg-white transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          width: "min(370px, calc(100vw - 1rem))",
          height: "min(680px, calc(100vh - 110px))",
        }}
        aria-hidden={!open}
        role="dialog"
        aria-label="FacultyBot chat assistant"
      >
        <div className="flex items-center gap-3 px-3.5 py-2.5 shrink-0 bg-[#1E3786] text-white">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white overflow-hidden">
            <img
              src="/assets/images/Faculty/favicon.png"
              alt="FacultyBot"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight text-white">
              FacultyBot
            </p>
            <div
              className="text-white/90 text-xs leading-snug"
              title={subLine}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-white/50 mr-1"
                style={{ verticalAlign: "middle" }}
              />
              {subLine}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-white/80 hover:text-white transition-colors p-1 rounded"
            title="Clear chat"
            aria-label="Clear chat"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={toggleOpen}
            className="text-white/80 hover:text-white transition-colors p-1 rounded"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 px-3 py-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5 bg-white border border-[#1E3786]/20 overflow-hidden">
                  <img
                    src="/assets/images/Faculty/favicon.png"
                    alt="FacultyBot"
                    className="w-4 h-4 object-contain"
                  />
                </div>
              )}
              <div
                className={`max-w-[78%] flex flex-col gap-2 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.text && msg.text.trim().length > 0 && (
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#1E3786] text-white rounded-br-sm"
                        : "text-foreground bg-white border border-border rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.text
                    ) : (
                      <RichText text={msg.text} />
                    )}
                  </div>
                )}
                {msg.role === "bot" && msg.contactWithMail && (
                  <div className="w-full max-w-full rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1.5">
                      Please contact us
                    </p>
                    <a
                      href={supportMailto()}
                      className="text-[13px] font-semibold text-[#1E3786] break-all hover:underline block"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = supportMailto();
                      }}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3786]  py-2 px-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      <Send size={16} className="shrink-0" />
                      Send
                    </button>
                  </div>
                )}
                {msg.linkSuggestions && msg.linkSuggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 w-full max-w-full">
                    {msg.linkSuggestions.map((s, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => navigateWithinApp(s.href)}
                        className="inline-block text-center text-xs font-medium rounded-lg px-2 py-1.5 border border-[#1E3786]/30 text-[#1E3786] bg-[#1E3786]/10 hover:bg-[#1E3786]/15"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 bg-white border border-[#1E3786]/20 overflow-hidden">
                <img
                  src="/assets/images/Faculty/favicon.png"
                  alt="FacultyBot"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-border">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block w-2 h-2 rounded-full bg-[#1E3786]"
                      style={{
                        animation: `chatDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 relative bg-white border-t border-gray-200 px-4 pt-3 pb-4 min-h-[108px]"
        >
          <textarea
            ref={searchInputRef}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey) return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              void handleSend(e);
            }}
            disabled={searchBusy || typing}
            placeholder="Type your message…"
            className={cn(
              "w-full min-h-[72px] max-h-[140px] resize-none overflow-y-auto bg-transparent text-[15px] leading-[1.35] text-foreground placeholder:text-gray-400 focus:outline-none disabled:opacity-50",
              searchInput.trim() ? "pr-14" : "pr-0"
            )}
            rows={3}
            maxLength={500}
            aria-label="Message"
          />
          {searchInput.trim() && (
            <button
              type="submit"
              disabled={searchBusy || typing}
              className="absolute right-4 bottom-4 shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#1E3786] text-white disabled:opacity-40 transition-opacity hover:opacity-90"
              aria-label="Send"
            >
              <Send size={16} className="text-white" />
            </button>
          )}
        </form>
      </div>

      <button
        type="button"
        onMouseEnter={openOnHover}
        onClick={onFabClick}
        className="fixed bottom-4 right-1 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30 bg-[#1E3786] text-white shadow-lg shadow-[#1E3786]/40"
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}
        {open ? (
          <X className="text-white" size={20} />
        ) : (
          <MessageCircle className="text-white" size={20} />
        )}
        {unread && !open && (
          <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center bg-white text-[#1E3786] border border-white">
            1
          </span>
        )}
      </button>

      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </>
  );
}
