"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type FormEvent,
  type MouseEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, RotateCcw, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Models from "@/imports/models.import";

type MessageRole = "bot" | "user";
type SearchCriterion = "location" | "role" | "category";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  linkSuggestions?: { label: string; href: string }[];
  /** Show support email + Send instead of a single Contact link. */
  contactWithMail?: boolean;
  optionChoices?: SearchCriterion[];
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
    optionChoices?: SearchCriterion[];
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
const DEFAULT_OPTION_PROMPT =
  "What type of job search do you need? Choose one: **Location**, **Role**, **Category**.";
const NEXT_SEARCH_TYPE_PROMPT =
  "Great, choose the next search type to continue.";
const IRRELEVANT_HELP_TEXT =
  "I am sorry in this platform we can only help you with the job related concerns";
const JOB_DETAILS_PROMPT =
  "If you'd like more details on any of these, just let me know the number!";

const SUPPORT_EMAIL = "support@facultypro.in";
const CHATBOT_GUEST_STORAGE_KEY = "chatbot_guest_messages_v1";

/** Stored on `chatbot_record` after the main bot text when contact block is shown. */
function buildContactPersistReply(baseText: string): string {
  return `${baseText.trim()}\n\nPlease contact us\n${SUPPORT_EMAIL}`;
}

function splitContactReply(
  stored: string
): { main: string; contactWithMail: boolean } {
  const parts = stored.split(/\n\nPlease contact us\n/i);
  if (parts.length >= 2) {
    return { main: parts[0].trim(), contactWithMail: true };
  }
  return { main: stored.trim(), contactWithMail: false };
}

/** Suffix in persisted `reply` so options survive if the API omits `option_choices` on history GET. */
const FP_OPTIONS_LINE = /(?:\n+)\[fp:options:([a-z, ]+)\]\s*$/i;

function appendFpOptionsToReply(
  mainText: string,
  keys: SearchCriterion[]
): string {
  return `${mainText.trim()}\n\n[fp:options:${keys.join(",")}]`;
}

function splitEmbeddedOptionsFromStored(stored: string): {
  main: string;
  keys: SearchCriterion[];
} {
  const s = stored.replace(/\r\n/g, "\n").trimEnd();
  const m = FP_OPTIONS_LINE.exec(s);
  if (!m) {
    return { main: stored, keys: [] };
  }
  const keys = m[1]
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter((k): k is SearchCriterion =>
      k === "location" || k === "role" || k === "category"
    );
  const main = s.slice(0, m.index).trimEnd();
  return { main, keys };
}

/** API text may have odd whitespace; use for system prompt equality checks. */
function normalizeBotPromptText(s: string): string {
  return s.replace(/\r\n?/g, "\n").replace(/[\s\u00a0]+/g, " ").trim();
}
const SEARCH_OPTIONS: { key: SearchCriterion; label: string }[] = [
  { key: "location", label: "Location" },
  { key: "role", label: "Role" },
  { key: "category", label: "Category" },
];

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


function criterionPrompt(type: SearchCriterion): string {
  if (type === "location") {
    return "Enter what **location-based jobs** you are searching for.";
  }
  if (type === "role") {
    return "Enter what **job role/title** you are searching for.";
  }
  return "Enter what **category-based jobs** you are searching for.";
}

function searchTypeLabel(type: SearchCriterion): string {
  if (type === "location") return "Location";
  if (type === "role") return "Role";
  return "Category";
}

function nextPendingOptions(
  status: Record<SearchCriterion, boolean>
): SearchCriterion[] {
  return SEARCH_OPTIONS.map((x) => x.key).filter((key) => !status[key]);
}

function getDefaultMessages(): ChatMessage[] {
  return [
    makeBotMessage(DEFAULT_GREETING),
    makeBotMessage(DEFAULT_OPTION_PROMPT, {
      optionChoices: SEARCH_OPTIONS.map((x) => x.key),
    }),
  ];
}

function parseStoredMessages(raw: string | null): ChatMessage[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const messages = parsed
      .map((item: any) => {
        if (!item || (item.role !== "bot" && item.role !== "user")) {
          return null;
        }
        return {
          id: typeof item.id === "string" ? item.id : uid(),
          role: item.role as MessageRole,
          text: typeof item.text === "string" ? item.text : "",
          timestamp: new Date(item.timestamp || Date.now()),
          linkSuggestions: Array.isArray(item.linkSuggestions)
            ? item.linkSuggestions.filter(
                (x: any) =>
                  x && typeof x.label === "string" && typeof x.href === "string"
              )
            : undefined,
          contactWithMail: Boolean(item.contactWithMail),
          optionChoices: Array.isArray(item.optionChoices)
            ? item.optionChoices.filter((x: any) =>
                ["location", "role", "category"].includes(String(x))
              )
            : undefined,
        } as ChatMessage;
      })
      .filter(Boolean) as ChatMessage[];

    return messages.length > 0 ? messages : null;
  } catch {
    return null;
  }
}

function getAuthContext(): { isLoggedIn: boolean; userId: number | null } {
  if (typeof window === "undefined") return { isLoggedIn: false, userId: null };
  const hasToken = Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken")
  );
  if (!hasToken) return { isLoggedIn: false, userId: null };

  try {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const id =
      user?.id ??
      user?.user_id ??
      user?.userId ??
      user?.pk ??
      user?.uid ??
      null;
    const userIdNumber = Number(id);
    return {
      isLoggedIn: true,
      userId: Number.isFinite(userIdNumber) ? userIdNumber : null,
    };
  } catch {
    return { isLoggedIn: true, userId: null };
  }
}

/** Use when persisting: refs are only set after async history sync, but user may act earlier. */
function resolvePersistUserId(
  fromRef: number | null | undefined
): number | null {
  if (fromRef != null && Number.isFinite(fromRef)) return fromRef;
  return getAuthContext().userId;
}

function getRecordSortKey(item: any): number {
  const t = item?.created_at || item?.timestamp || item?.createdAt || 0;
  return new Date(t).getTime() || 0;
}

function normalizeOptionChoiceKeys(raw: unknown): SearchCriterion[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(["location", "role", "category"]);
  const out: SearchCriterion[] = [];
  for (const x of raw) {
    const s =
      typeof x === "string"
        ? x
        : x && typeof x === "object"
        ? String(
            (x as { key?: string; value?: string; name?: string }).key ??
              (x as { key?: string; value?: string }).value ??
              (x as { name?: string }).name ??
              ""
          )
        : "";
    if (allowed.has(s)) out.push(s as SearchCriterion);
  }
  return out;
}

/** Read option buttons from API / DB (field names vary). */
function extractOptionChoicesFromRecord(item: any): SearchCriterion[] {
  if (!item || typeof item !== "object") return [];
  const candidates = [
    item.option_choices,
    item.optionChoices,
    item.options,
    item.choices,
    item.search_options,
  ];
  for (const c of candidates) {
    const n = normalizeOptionChoiceKeys(c);
    if (n.length > 0) return n;
    if (typeof c === "string" && c.trim()) {
      try {
        const p = JSON.parse(c);
        const n2 = normalizeOptionChoiceKeys(p);
        if (n2.length > 0) return n2;
      } catch {
        /* ignore */
      }
    }
  }
  return [];
}

function iterRecordChatTurns(
  item: any
): { role: "user" | "bot"; text: string }[] {
  if (!item || typeof item !== "object") return [];
  const messageText = String(
    item.message || item.text || item.reply || ""
  ).trim();
  if (messageText) {
    const roleRaw = String(
      item.role || item.role_name || item.sender || item.type || ""
    ).toLowerCase();
    const isUser =
      roleRaw === "user" ||
      roleRaw === "users" ||
      roleRaw === "human" ||
      roleRaw === "customer";
    return [{ role: isUser ? "user" : "bot", text: messageText }];
  }
  const out: { role: "user" | "bot"; text: string }[] = [];
  const q = String(item.question || item.user_message || "").trim();
  const a = String(item.answer || item.bot_message || item.response || "").trim();
  if (q) out.push({ role: "user", text: q });
  if (a) out.push({ role: "bot", text: a });
  return out;
}

function detectCriterionFromPromptText(text: string): SearchCriterion | null {
  if (!text.includes("Enter what")) return null;
  if (text.includes("location-based")) return "location";
  if (text.includes("job role") && text.includes("title")) return "role";
  if (text.includes("category-based")) return "category";
  return null;
}

/**
 * Reconstructs which search types are still available after prior turns, when
 * `option_choices` was not stored on the record (used only for the
 * "Great, choose the next search type" prompt).
 */
function inferPendingOptionsBeforeRecordIndex(
  recordList: any[],
  endExclusive: number
): SearchCriterion[] {
  const done: Record<SearchCriterion, boolean> = {
    location: false,
    role: false,
    category: false,
  };
  let afterCriterionPrompt: SearchCriterion | null = null;
  let pendingResultFor: SearchCriterion | null = null;

  for (let i = 0; i < endExclusive; i++) {
    for (const ev of iterRecordChatTurns(recordList[i])) {
      if (ev.role === "user") {
        if (afterCriterionPrompt) {
          pendingResultFor = afterCriterionPrompt;
          afterCriterionPrompt = null;
        }
      } else {
        const t = ev.text;
        const noJobsM = t.match(
          /No jobs found for this\s*(Location|Role|Category)\s*search\.?/i
        );
        if (noJobsM) {
          const key = noJobsM[1].toLowerCase();
          if (key === "location" || key === "role" || key === "category") {
            done[key] = true;
          }
          pendingResultFor = null;
        } else if (pendingResultFor) {
          done[pendingResultFor] = true;
          pendingResultFor = null;
        }
        const crit = detectCriterionFromPromptText(t);
        if (crit) {
          afterCriterionPrompt = crit;
        }
      }
    }
  }
  return nextPendingOptions(done);
}

function buildHistoryMessages(raw: any): ChatMessage[] {
  const records = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.results)
    ? raw.results
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.records)
    ? raw.records
    : [];
  const recordList = [...records].sort((a, b) => {
    const byTime = getRecordSortKey(a) - getRecordSortKey(b);
    if (byTime !== 0) return byTime;
    return (Number(a?.id) || 0) - (Number(b?.id) || 0);
  });
  const history: ChatMessage[] = [];

  recordList.forEach((item: any, idx: number) => {
    if (!item || typeof item !== "object") return;
    const timestamp = new Date(
      item.timestamp || item.created_at || item.createdAt || Date.now()
    );
    const roleRaw = String(
      item.role || item.role_name || item.sender || item.type || ""
    ).toLowerCase();
    const messageRaw = String(item.message || item.text || item.reply || "");

    if (messageRaw.trim()) {
      if (
        roleRaw === "user" ||
        roleRaw === "users" ||
        roleRaw === "human" ||
        roleRaw === "customer"
      ) {
        history.push({
          id: uid(),
          role: "user",
          text: messageRaw.trim(),
          timestamp,
        });
      } else {
        const { main: mAfterOpts, keys: optFromReply } =
          splitEmbeddedOptionsFromStored(messageRaw);
        const { main, contactWithMail: contactFromReply } =
          splitContactReply(mAfterOpts);
        const slugList = Array.isArray(item.slug) ? item.slug : [];
        const linkSuggestions = buildJobSlugLinks(
          main || messageRaw,
          slugList
        );
        let fromOptionChoices = extractOptionChoicesFromRecord(item);
        if (fromOptionChoices.length === 0 && optFromReply.length > 0) {
          fromOptionChoices = optFromReply;
        }
        const mainN = normalizeBotPromptText(main);
        const isDefaultOptionPrompt =
          mainN === normalizeBotPromptText(DEFAULT_OPTION_PROMPT);
        const isNextSearchTypePrompt =
          mainN === normalizeBotPromptText(NEXT_SEARCH_TYPE_PROMPT);
        if (fromOptionChoices.length === 0 && isDefaultOptionPrompt) {
          fromOptionChoices = SEARCH_OPTIONS.map((x) => x.key);
        } else if (fromOptionChoices.length === 0 && isNextSearchTypePrompt) {
          const inferred = inferPendingOptionsBeforeRecordIndex(recordList, idx);
          // Include 1–3: 3 means inference is uncertain but buttons beat empty UI.
          if (inferred.length > 0) {
            fromOptionChoices = inferred;
          }
        }
        const displayText =
          linkSuggestions.length > 0
            ? stripNumberedJobLines(main)
            : main;
        history.push({
          id: uid(),
          role: "bot",
          text: displayText,
          timestamp,
          linkSuggestions: linkSuggestions.length > 0 ? linkSuggestions : undefined,
          optionChoices:
            fromOptionChoices.length > 0
              ? fromOptionChoices
              : undefined,
          contactWithMail: contactFromReply,
        });
      }
      return;
    }

    const question = String(item.question || item.user_message || "").trim();
    const answerRaw = String(
      item.answer || item.bot_message || item.response || ""
    );
    if (question) {
      history.push({ id: uid(), role: "user", text: question, timestamp });
    }
    if (answerRaw.trim()) {
      const { main: aAfterOpts, keys: optFromAnswer } =
        splitEmbeddedOptionsFromStored(answerRaw);
      const { main: answerMain, contactWithMail: answerContact } =
        splitContactReply(aAfterOpts);
      const slugList = Array.isArray(item.slug) ? item.slug : [];
      const linkSuggestions = buildJobSlugLinks(answerMain, slugList);
      let fromOptsBot = extractOptionChoicesFromRecord(item);
      if (fromOptsBot.length === 0 && optFromAnswer.length > 0) {
        fromOptsBot = optFromAnswer;
      }
      const mainN2 = normalizeBotPromptText(answerMain);
      if (fromOptsBot.length === 0 && mainN2 === normalizeBotPromptText(DEFAULT_OPTION_PROMPT)) {
        fromOptsBot = SEARCH_OPTIONS.map((x) => x.key);
      } else if (
        fromOptsBot.length === 0 &&
        mainN2 === normalizeBotPromptText(NEXT_SEARCH_TYPE_PROMPT)
      ) {
        const inf = inferPendingOptionsBeforeRecordIndex(recordList, idx);
        if (inf.length > 0) fromOptsBot = inf;
      }
      history.push({
        id: uid(),
        role: "bot",
        text: linkSuggestions.length > 0 ? stripNumberedJobLines(answerMain) : answerMain,
        timestamp,
        linkSuggestions: linkSuggestions.length > 0 ? linkSuggestions : undefined,
        optionChoices: fromOptsBot.length > 0 ? fromOptsBot : undefined,
        contactWithMail: answerContact,
      });
    }
  });

  return history;
}

type ApiSearchResult = {
  reply: string | null;
  rawReply: string | null;
  linkSuggestions: { label: string; href: string }[];
  slug: Array<{ slug?: string }>;
};

function stripNumberedJobLines(reply: string): string {
  const lines = reply
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const cleaned = lines.filter((line) => !/^\d+\.\s+/.test(line));
  return cleaned.join("\n");
}

function buildJobSlugLinks(
  reply: string,
  slugs: Array<{ slug?: string }>
): { label: string; href: string }[] {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];

  const numberedLines = reply
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line));

  return slugs
    .map((item, idx) => {
      const rawSlug = item?.slug;
      if (!rawSlug) return null;
      const label = numberedLines[idx]
        ? numberedLines[idx].replace(/^\d+\.\s+/, "")
        : `Open Job ${idx + 1}`;
      return {
        label,
        href: `/jobs?slug=${rawSlug}`,
      };
    })
    .filter((x): x is { label: string; href: string } => Boolean(x));
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
  const pathname = usePathname();
  const initialCompletion: Record<SearchCriterion, boolean> = {
    location: false,
    role: false,
    category: false,
  };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(getDefaultMessages);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [activeCriterion, setActiveCriterion] = useState<SearchCriterion | null>(
    null
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [criterionDone, setCriterionDone] =
    useState<Record<SearchCriterion, boolean>>(initialCompletion);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  /** Wraps all message rows so ResizeObserver sees height when option chips mount. */
  const messageListContentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);
  const guestStorageReadyRef = useRef(false);
  /** After first paint, do not run guest persist (would overwrite localStorage with default messages). */
  const skipInitialGuestPersistRef = useRef(true);
  /** Guest: restore from localStorage only once; avoids repeat set + interval re-applying. */
  const guestLocalRestoreDoneRef = useRef(false);
  const authModeRef = useRef<"guest" | "user" | null>(null);
  const authUserIdRef = useRef<number | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const subLine = "The team can also help";

  const persistChatRecord = useCallback(
    async (params: {
      userId: number | null;
      role: "bot" | "users";
      text: string;
      slug?: Array<{ slug?: string }>;
      optionChoices?: SearchCriterion[];
      persistText?: string;
    }) => {
      const text = (params.persistText ?? params.text)?.trim();
      const userId = resolvePersistUserId(params.userId);
      if (!userId || !text) return;
      try {
        if (params.role === "bot") {
          const replyToSend =
            params.optionChoices && params.optionChoices.length > 0
              ? appendFpOptionsToReply(text, params.optionChoices)
              : text;
          await Models.auth.chatbot_record({
            user_id: userId,
            role_name: "bot",
            reply: replyToSend,
            ...(params.slug && params.slug.length > 0 ? { slug: params.slug } : {}),
            ...(params.optionChoices && params.optionChoices.length > 0
              ? {
                  option_choices: params.optionChoices,
                  optionChoices: params.optionChoices,
                }
              : {}),
          });
          return;
        }
        await Models.auth.chatbot_record({
          user_id: userId,
          role_name: "users",
          message: text,
        });
      } catch {
        // DB insert failure should not block chat UX.
      }
    },
    []
  );

  /** Greeting first, then option prompt — must be sequential to preserve DB `created_at` order. */
  const persistDefaultBotSeeds = useCallback(
    async (userId: number) => {
      await persistChatRecord({
        userId,
        role: "bot",
        text: DEFAULT_GREETING,
      });
      await persistChatRecord({
        userId,
        role: "bot",
        text: DEFAULT_OPTION_PROMPT,
        optionChoices: SEARCH_OPTIONS.map((x) => x.key),
      });
    },
    [persistChatRecord]
  );

  const appendUserMessage = useCallback(
    async (text: string) => {
      const message = makeUserMessage(text);
      setMessages((prev) => [...prev, message]);
      if (getAuthContext().isLoggedIn) {
        await persistChatRecord({
          userId: resolvePersistUserId(authUserIdRef.current),
          role: "users",
          text,
        });
      }
    },
    [persistChatRecord]
  );

  const appendBotMessage = useCallback(
    async (
      text: string,
      extra?: {
        linkSuggestions?: { label: string; href: string }[];
        contactWithMail?: boolean;
        optionChoices?: SearchCriterion[];
      },
      persistMeta?: {
        slug?: Array<{ slug?: string }>;
        persistText?: string;
      }
    ) => {
      const message = makeBotMessage(text, extra);
      setMessages((prev) => [...prev, message]);
      if (getAuthContext().isLoggedIn) {
        const persistText =
          extra?.contactWithMail === true
            ? buildContactPersistReply(text)
            : persistMeta?.persistText;
        await persistChatRecord({
          userId: resolvePersistUserId(authUserIdRef.current),
          role: "bot",
          text,
          slug: persistMeta?.slug,
          optionChoices: extra?.optionChoices,
          persistText,
        });
      }
    },
    [persistChatRecord]
  );

  const handleApiSearch = useCallback(
    async (q: string): Promise<ApiSearchResult> => {
      try {
        const raw = (await Models.auth.chatbot({ message: q })) as {
          reply?: string;
          slug?: Array<{ slug?: string }>;
        };
        const r = raw?.reply;
        if (typeof r === "string" && r.trim()) {
          const reply = r.trim();
          const links = buildJobSlugLinks(reply, raw?.slug ?? []);
          return {
            reply: links.length > 0 ? stripNumberedJobLines(reply) : reply,
            rawReply: reply,
            linkSuggestions: links,
            slug: Array.isArray(raw?.slug) ? raw.slug : [],
          };
        }
        return { reply: null, rawReply: null, linkSuggestions: [], slug: [] };
    } catch {
        return { reply: null, rawReply: null, linkSuggestions: [], slug: [] };
      }
    },
    []
  );

  const handleCriterionSelect = useCallback(
    (type: SearchCriterion) => {
      shouldAutoScrollRef.current = true;
      setActiveCriterion(type);
      void (async () => {
        await appendUserMessage(searchTypeLabel(type));
        await appendBotMessage(criterionPrompt(type));
      })();
    },
    [appendBotMessage, appendUserMessage]
  );

  const handleSend = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const q = searchInput.trim();
      if (!q || searchBusy) return;

      shouldAutoScrollRef.current = true;
      await appendUserMessage(q);
      setSearchInput("");
      setSearchBusy(true);
      setTyping(true);

      try {
        if (activeCriterion) {
          const apiResult = await handleApiSearch(q);
          const reply = apiResult.reply;
          const noJobs = !reply || shouldShowContactForReply(reply);
          const searchOutcomeText = noJobs
            ? `No jobs found for this ${searchTypeLabel(
                activeCriterion
              )} search.`
            : reply;
          const searchOutcomeExtra = noJobs
            ? undefined
            : { linkSuggestions: apiResult.linkSuggestions };
          const searchOutcomePersist = noJobs
            ? undefined
            : {
                slug: apiResult.slug,
                persistText: apiResult.rawReply ?? reply,
              };

          const updatedStatus = {
            ...criterionDone,
            [activeCriterion]: true,
          };
          setCriterionDone(updatedStatus);
          setActiveCriterion(null);

          const pending = nextPendingOptions(updatedStatus);
          shouldAutoScrollRef.current = true;
          // Search outcome first, then follow-up. Await so DB + UI stay chronological.
          await appendBotMessage(
            searchOutcomeText,
            searchOutcomeExtra,
            searchOutcomePersist
          );
          if (pending.length > 0) {
            shouldAutoScrollRef.current = true;
            await appendBotMessage("Great, choose the next search type to continue.", {
              optionChoices: pending,
            });
          } else {
            shouldAutoScrollRef.current = true;
            await appendBotMessage(
              "You can now search for any jobs. For any more details, ask me."
            );
          }
          return;
        }

        const apiResult = await handleApiSearch(q);
        const reply = apiResult.reply;
        if (reply) {
          if (shouldShowContactForReply(reply)) {
            shouldAutoScrollRef.current = true;
            await appendBotMessage(IRRELEVANT_HELP_TEXT, { contactWithMail: true });
          } else {
            shouldAutoScrollRef.current = true;
            await appendBotMessage(
              reply,
              { linkSuggestions: apiResult.linkSuggestions },
              { slug: apiResult.slug, persistText: apiResult.rawReply ?? reply }
            );
          }
        } else {
          shouldAutoScrollRef.current = true;
          await appendBotMessage(IRRELEVANT_HELP_TEXT, {
            contactWithMail: true,
          });
        }
      } finally {
        setTyping(false);
        setSearchBusy(false);
        // Wait for disabled state to clear before refocusing.
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
    },
    [
      activeCriterion,
      appendBotMessage,
      appendUserMessage,
      criterionDone,
      handleApiSearch,
      searchBusy,
      searchInput,
    ]
  );

  const handleReset = useCallback(async () => {
    const defaults = getDefaultMessages();
    shouldAutoScrollRef.current = true;
    setMessages(defaults);
    setActiveCriterion(null);
    setCriterionDone({
      location: false,
      role: false,
      category: false,
    });
    setMenuOpen(false);

    if (authModeRef.current !== "user" || !authUserIdRef.current) return;
    try {
      await Models.auth.delete_chatbot_history({ user_id: authUserIdRef.current });
    } catch {
      // ignore delete failures on reset
    }
    await persistDefaultBotSeeds(authUserIdRef.current);
  }, [persistDefaultBotSeeds]);

  const handleMessagesScroll = useCallback(() => {
    const node = messagesContainerRef.current;
    if (!node) return;
    const distanceFromBottom =
      node.scrollHeight - (node.scrollTop + node.clientHeight);
    shouldAutoScrollRef.current = distanceFromBottom <= 80;
  }, []);

  /** Scroll the chat pane to the true bottom (option buttons often lay out one frame late). */
  const scrollChatToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const maxScroll = () => {
      el.scrollTop = el.scrollHeight;
    };
    maxScroll();
    requestAnimationFrame(() => {
      maxScroll();
      requestAnimationFrame(maxScroll);
    });
  }, []);

  useLayoutEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    scrollChatToBottom();
  }, [messages, typing, scrollChatToBottom]);

  useEffect(() => {
    if (!open) return;
    const content = messageListContentRef.current;
    const scroller = messagesContainerRef.current;
    if (!content || !scroller) return;
    const tryScroll = () => {
      if (!shouldAutoScrollRef.current) return;
      scroller.scrollTop = scroller.scrollHeight;
    };
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(tryScroll);
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [open, messages, typing]);

  useEffect(() => {
    let isMounted = true;

    const syncHistoryByAuth = async () => {
      const auth = getAuthContext();

      if (auth.isLoggedIn) {
        const isUserChanged =
          authModeRef.current !== "user" || authUserIdRef.current !== auth.userId;
        authModeRef.current = "user";
        authUserIdRef.current = auth.userId;
        guestStorageReadyRef.current = false;

        // Once user logs in, clear guest local history.
        try {
          localStorage.removeItem(CHATBOT_GUEST_STORAGE_KEY);
        } catch {
          // ignore
        }

        if (!isUserChanged || !auth.userId) return;
        try {
          const raw = await Models.auth.chatbot_history({ user_id: auth.userId });
          if (!isMounted) return;
          const history = buildHistoryMessages(raw);
          if (history.length > 0) {
            shouldAutoScrollRef.current = true;
            setMessages(history);
          } else {
            const defaults = getDefaultMessages();
            shouldAutoScrollRef.current = true;
            setMessages(defaults);
            await persistDefaultBotSeeds(auth.userId);
          }
          if (!isMounted) return;
        } catch {
          if (!isMounted) return;
          shouldAutoScrollRef.current = true;
          setMessages(getDefaultMessages());
        }
        return;
      }

      // Guest mode: on logout transition start fresh; on first load restore local history.
      const wasUser = authModeRef.current === "user";
      authModeRef.current = "guest";
      authUserIdRef.current = null;
      guestStorageReadyRef.current = true;

      if (wasUser) {
        try {
          localStorage.removeItem(CHATBOT_GUEST_STORAGE_KEY);
        } catch {
          // ignore
        }
        guestLocalRestoreDoneRef.current = true;
        skipInitialGuestPersistRef.current = true;
        if (isMounted) {
          shouldAutoScrollRef.current = true;
          setMessages(getDefaultMessages());
        }
        return;
      }

      if (!guestLocalRestoreDoneRef.current) {
        guestLocalRestoreDoneRef.current = true;
        const stored = parseStoredMessages(
          localStorage.getItem(CHATBOT_GUEST_STORAGE_KEY)
        );
        if (stored && isMounted) {
          shouldAutoScrollRef.current = true;
          setMessages(stored);
        }
      }
    };

    void syncHistoryByAuth();
    const interval = window.setInterval(() => {
      void syncHistoryByAuth();
    }, 1200);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [persistDefaultBotSeeds]);

  // Guest-only: persist chat whenever messages change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authModeRef.current !== "guest") return;
    if (!guestStorageReadyRef.current) return;
    if (skipInitialGuestPersistRef.current) {
      skipInitialGuestPersistRef.current = false;
      return;
    }

    try {
      localStorage.setItem(CHATBOT_GUEST_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage errors and keep UI responsive.
    }
  }, [messages]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setUnread(true), 5000);
      return () => clearTimeout(t);
    }
    setUnread(false);
  }, [open]);

  // On route change, close only the widget UI (preserve chat history/state).
  useEffect(() => {
    setOpen(false);
    setUnread(false);
  }, [pathname]);

  const toggleOpen = useCallback(() => {
    setOpen((v) => !v);
    setUnread(false);
    setMenuOpen(false);
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

  const openJobAndCloseChat = useCallback(
    (path: string) => {
      setOpen(false);
      setUnread(false);
      navigateWithinApp(path);
    },
    [navigateWithinApp]
  );

  useEffect(() => {
    if (!open) return;
    shouldAutoScrollRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = messagesContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }, [open]);

  return (
    <>
      <div
        className={`fixed bottom-20 right-4 z-[9999] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-[#1E3786]/25 bg-white transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          width: isExpanded
            ? "min(560px, calc(100vw - 1rem))"
            : "min(370px, calc(100vw - 1rem))",
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
              aria-label="Open chat options"
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl z-20 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded((v) => !v);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {isExpanded ? "Collapse window" : "Expand window"}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleOpen}
            className="text-white/80 hover:text-white transition-colors p-1 rounded"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50 px-3 py-3"
        >
          <div
            ref={messageListContentRef}
            className="space-y-3 pb-3"
          >
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
                {msg.role === "bot" &&
                  msg.linkSuggestions &&
                  msg.linkSuggestions.length > 0 &&
                  msg.text &&
                  msg.text.trim().length > 0 && (
                    <div className="w-full max-w-full rounded-2xl border border-gray-300 bg-white p-3">
                      <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                        <RichText
                          text={
                            msg.text.includes(JOB_DETAILS_PROMPT)
                              ? msg.text.replace(JOB_DETAILS_PROMPT, "").trim()
                              : msg.text
                          }
                        />
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        {msg.linkSuggestions.map((s, j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => openJobAndCloseChat(s.href)}
                            className="inline-flex w-full items-center gap-2 text-left text-xs font-semibold px-3 py-2.5 text-[#1E3786] bg-[#edf3ff] border border-[#a6bee9] rounded-xl hover:bg-[#e5eeff]"
                          >
                            <Send size={14} className="shrink-0 opacity-90" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                      {msg.text.includes(JOB_DETAILS_PROMPT) && (
                        <p className="mt-3 text-sm leading-relaxed text-foreground">
                          {JOB_DETAILS_PROMPT}
                        </p>
                      )}
                    </div>
                  )}
                {!(msg.role === "bot" &&
                  msg.linkSuggestions &&
                  msg.linkSuggestions.length > 0 &&
                  msg.text &&
                  msg.text.trim().length > 0) &&
                  msg.text &&
                  msg.text.trim().length > 0 && (
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-[#1E3786] text-white rounded-br-sm"
                        : msg.linkSuggestions && msg.linkSuggestions.length > 0
                        ? "text-foreground bg-white border border-[#a6bee9] rounded-b-none"
                        : "text-foreground bg-white border border-border rounded-bl-sm"
                    )}
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
                {msg.role === "bot" &&
                  msg.optionChoices &&
                  msg.optionChoices.length > 0 && (
                    <div className="flex flex-col gap-2 w-full max-w-full">
                      {msg.optionChoices.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleCriterionSelect(key)}
                          className="inline-flex items-center justify-start rounded-full border border-[#1E3786]/30 bg-white px-3 py-2 text-sm font-medium text-[#1E3786] hover:bg-[#eef4ff]"
                        >
                          {searchTypeLabel(key)}
                        </button>
                      ))}
                    </div>
                  )}
                {!(msg.role === "bot" &&
                  msg.linkSuggestions &&
                  msg.linkSuggestions.length > 0 &&
                  msg.text &&
                  msg.text.trim().length > 0) &&
                  msg.linkSuggestions &&
                  msg.linkSuggestions.length > 0 && (
                  <div
                    className={cn(
                      "w-full max-w-full rounded-2xl border border-[#a6bee9] bg-[#edf3ff] overflow-hidden",
                      msg.text && msg.text.trim().length > 0 && "rounded-t-none border-t-0"
                    )}
                  >
                    {msg.linkSuggestions.map((s, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => openJobAndCloseChat(s.href)}
                        className={cn(
                          "inline-flex w-full items-center gap-2 text-left text-xs font-semibold px-3 py-2.5 text-[#1E3786] hover:bg-[#e5eeff]",
                          j !== msg.linkSuggestions!.length - 1 &&
                            "border-b border-[#a6bee9]/70"
                        )}
                      >
                        <Send size={14} className="shrink-0 opacity-90" />
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
          </div>
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
        // onMouseEnter={openOnHover}
        onClick={onFabClick}
        className="fixed bottom-4 right-4 z-[9999] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30 bg-[#1E3786] text-white shadow-lg shadow-[#1E3786]/40"
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
        {/* {unread && !open && (
          <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center bg-white text-[#1E3786] border border-white">
            1
          </span>
        )} */}
      </button>

      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes introRise {
          from { opacity: 0; transform: translateY(8px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes introFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .introCard {
          animation: introRise 420ms ease-out both;
        }
        .introGlow {
          animation: introFloat 3.6s ease-in-out infinite;
        }
        .introGlowSoft {
          animation: introFloat 4.2s ease-in-out infinite reverse;
        }
        .introItem:nth-child(1) { animation: introRise 500ms ease-out both; }
        .introItem:nth-child(2) { animation: introRise 580ms ease-out both; }
        .introItem:nth-child(3) { animation: introRise 660ms ease-out both; }
      `}</style>
    </>
  );
}
