import "server-only";
import { site } from "@/content/site";
import { getFaqGroups, getRates, listServices } from "@/content/queries";

/**
 * Website assistant.
 *
 * Answers are grounded in the same verified content the pages render — the FAQ,
 * service summaries and the contact block in `site.ts` — and the model is told
 * to refuse anything outside that context. It must never invent rates, balances,
 * dates or account details: those live with the Secretariat.
 *
 * No provider is hard-coded. The endpoint is OpenAI-compatible and configured
 * through the environment, so the Society can point it at whichever provider it
 * approves. Without a key the route reports that the assistant is not connected.
 */

export type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 10;
const MAX_CHARS = 1200;

export function assistantConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY);
}

async function knowledge(): Promise<string> {
  const [faq, services] = await Promise.all([getFaqGroups(), listServices()]);

  const answers = faq
    .flatMap((group) => group.items.map((item) => `Q: ${item.q}\nA: ${item.a}`))
    .join("\n\n");

  const serviceLines = services
    .map((service) => `- ${service.title}: ${service.summary}`)
    .join("\n");

  const contact = [
    `Telephone: ${site.contact.phones[0].value}`,
    `Email: ${site.contact.emails[0].value}`,
    `Address: ${site.contact.address}`,
    `Office hours: ${site.contact.hours.map((row) => `${row.days} ${row.time}`).join("; ")}`,
  ].join("\n");

  return `SOCIETY\n${site.legalName}. ${site.description}\n\nSERVICES\n${serviceLines}\n\nCONTACT\n${contact}\n\nFREQUENTLY ASKED QUESTIONS\n${answers}`;
}

export async function answerQuestion(messages: ChatMessage[]): Promise<string> {
  const key = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!key) throw new Error("not-configured");

  const base = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  const context = await knowledge();

  const system = [
    "You are the assistant on the public website of the CBN Staff Multipurpose Cooperative Society Ltd.",
    "Answer ONLY from the CONTEXT below. If the answer is not there, say you do not have it and point to the Secretariat using the contact details in the context.",
    "Never invent or estimate interest rates, loan limits, dividends, balances, dates or account numbers.",
    "For anything about a person's own membership, account, loan status or payment, direct them to the Secretariat.",
    "Keep replies under 110 words, in plain Nigerian English, with no markdown headings or bullet lists.",
    "CONTEXT:",
    context,
  ].join("\n\n");

  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 320,
      messages: [{ role: "system", content: system }, ...messages.slice(-MAX_MESSAGES)],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`provider-${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = payload.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("empty-reply");
  return reply.slice(0, MAX_CHARS);
}

/* -------------------------------------------------------------------------- *
 * Answers without a model
 *
 * The widget should still help when no provider key is configured, or when the
 * provider is down. Every sentence below is assembled from the same verified
 * copy the pages render — FAQ answers, service summaries and `site.ts` — so the
 * fallback cannot invent a rate, a balance or an account number. Anything it
 * cannot match is routed to the Secretariat.
 * ------------------------------------------------------------------------ */

const STOPWORDS = new Set(
  "a about after all also am an and any are as at be been before but by can could did do does doing for from get got had has have he her him his how i if in into is it its just me more most my no not of on or our out over she should so some than that the their them then there these they this those to too up us was we were what when where which who why will with would you your".split(
    " ",
  ),
);

const SYNONYMS: Record<string, string[]> = {
  join: ["member", "membership", "register", "registration"],
  register: ["join", "membership", "signup"],
  member: ["membership", "join"],
  loan: ["credit", "facility", "borrow"],
  credit: ["loan", "facility"],
  savings: ["saving", "contribution", "deposit"],
  contribution: ["savings", "deposit"],
  address: ["location", "office", "located"],
  location: ["address", "office", "located"],
  phone: ["telephone", "call", "whatsapp", "number"],
  contact: ["phone", "email", "reach", "whatsapp"],
  hours: ["open", "opening", "close", "closing", "time"],
  withdraw: ["withdrawal", "withdrawing"],
  withdrawal: ["withdraw"],
  property: ["land", "house", "housing", "real", "estate"],
  payment: ["pay", "deposit", "transfer", "remit"],
  invest: ["investment", "bond", "series"],
  investment: ["invest", "bond"],
  password: ["login", "portal", "reset"],
  guarantor: ["guarantee", "surety"],
  insurance: ["insure"],
};

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokens(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u20a6]+/g, " ");

  const seen = new Set<string>();
  for (const raw of cleaned.split(" ")) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    seen.add(stem(raw));
  }
  return [...seen];
}

function relevance(question: string[], text: string): number {
  if (question.length === 0) return 0;
  const document = new Set(tokens(text));
  if (document.size === 0) return 0;

  let matched = 0;
  for (const token of question) {
    if (document.has(token)) {
      matched += 1;
      continue;
    }
    const alternatives = SYNONYMS[token] ?? [];
    if (alternatives.some((alternative) => document.has(stem(alternative)))) matched += 1;
  }
  return matched / question.length;
}

function contactDetails(): string {
  const phone = site.contact.phones[0]?.value ?? "";
  const emails = site.contact.emails.map((entry) => entry.value).join(" or ");
  return `Telephone and WhatsApp: ${phone}. Email: ${emails}.`;
}

function officeDetails(): string {
  const hours = site.contact.hours.map((row) => `${row.days}, ${row.time}`).join("; ");
  return `${site.contact.address} The office is open ${hours}.`;
}

export type SiteAnswer = { reply: string; topic: string };

/**
 * Deterministic answer for the widget when no model is available. The reply is
 * always quoted or assembled from published copy; unknown questions are handed
 * to the Secretariat rather than guessed at.
 */
export async function answerFromSite(messages: ChatMessage[]): Promise<SiteAnswer> {
  const question = [...messages].reverse().find((message) => message.role === "user")?.content.trim() ?? "";
  const normalised = question.toLowerCase();
  const words = tokens(question);

  const [groups, services] = await Promise.all([getFaqGroups(), listServices()]);
  const items = groups.flatMap((group) => group.items);

  const byQuestion = (pattern: RegExp) => items.find((item) => pattern.test(item.q));

  if (/\b(address|located|location|office|directions?)\b/.test(normalised) || /\bwhere\b/.test(normalised)) {
    return { reply: `${officeDetails()} ${contactDetails()}`, topic: "address" };
  }

  if (/\b(hours?|opening|open|closing|close[sd]?|what time)\b/.test(normalised)) {
    return { reply: `${officeDetails()} ${contactDetails()}`, topic: "hours" };
  }

  if (/\b(phone|telephone|call|whatsapp|contact|email|reach)\b/.test(normalised)) {
    return { reply: `${contactDetails()} ${officeDetails()}`, topic: "contact" };
  }

  if (/\b(interest|rates?|percent|percentage|charges?)\b/.test(normalised)) {
    if (/\b(loans?|credit|facility|borrow|repay)\b/.test(normalised) && !/\bsavings?\b/.test(normalised)) {
      const rates = await getRates();
      const lines = rates.loanRates.map((row) => `${row.label}: ${row.current}`).join("; ");
      return {
        reply: `Under the ${rates.notice.title}, effective ${rates.notice.effectiveFrom}: ${lines}. The Secretariat confirms the rate that applies to your facility.`,
        topic: "rates",
      };
    }

    return {
      reply: `The Society's rates are set in an approved schedule, and the Secretariat confirms the rate that applies to your transaction. ${contactDetails()}`,
      topic: "rates",
    };
  }

  if (/\b(services?|products?)\b/.test(normalised) || (words.includes("loan") && /\b(available|types?|kinds?|offer|which)\b/.test(normalised))) {
    const servicesFaq = byQuestion(/services does the Cooperative provide/i);
    const list = services.map((service) => `${service.title} — ${service.summary}`).join("\n");
    return { reply: servicesFaq?.a ?? list, topic: "services" };
  }

  if (/\b(join|register|sign\s?up|become a member|membership fee)\b/.test(normalised)) {
    const membership = byQuestion(/how do i become a member/i);
    if (membership) return { reply: membership.a, topic: "membership" };
  }

  if (/\b(password|login|log in|sign in|portal)\b/.test(normalised)) {
    const reset = byQuestion(/how do i reset my password/i);
    if (reset) return { reply: reset.a, topic: "login" };
  }

  const ranked = items
    .map((item) => ({
      item,
      score: Math.max(relevance(words, item.q), relevance(words, `${item.q} ${item.a}`) * 0.85),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const confident = best && (best.score >= 0.6 || (words.length <= 2 && best.score >= 0.9));

  if (confident) {
    return { reply: best.item.a.slice(0, MAX_CHARS), topic: best.item.q.slice(0, 60) };
  }

  return {
    reply: `I could not find that on this website, and I will not guess. For anything about your own membership, savings or loan, the Secretariat will help you directly: ${contactDetails()} You can also visit ${site.contact.address}`,
    topic: "unmatched",
  };
}
