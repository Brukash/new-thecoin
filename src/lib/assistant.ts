import "server-only";
import { site } from "@/content/site";
import { getFaqGroups, listServices } from "@/content/queries";

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
