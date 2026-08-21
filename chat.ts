import { invokeLLM } from "../_core/llm";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const EMOJI_PATTERN = /(?:[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF])/g;
const MAX_CONTEXT_TURNS = 12;

export function sanitizeAssistantResponse(value: string): string {
  return value
    .replace(EMOJI_PATTERN, "")
    .replace(/[\u200D\uFE0E\uFE0F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildChatContext(turns: ChatTurn[]) {
  const sanitizedTurns = turns
    .slice(-MAX_CONTEXT_TURNS)
    .map((turn) => ({
      role: turn.role,
      content: turn.content.trim().slice(0, 2000),
    }))
    .filter((turn) => turn.content.length > 0);

  return [
    {
      role: "system" as const,
      content: `You are Nova, a calm, professional AI assistant inside a futuristic interface. Answer with accurate, relevant, concise information. Do not use emoji characters under any circumstances. Do not pretend to have emotions, personal experiences, web browsing, real-time data, or completed actions that you did not actually perform. If a factual detail is uncertain or unavailable, say so plainly. Ask one focused clarification question when the request is ambiguous. Use headings, bullets, or numbered steps only when they make a complex answer clearer. Do not fabricate sources, dates, statistics, links, APIs, or technical specifications.`,
    },
    ...sanitizedTurns,
  ];
}

export async function generateChatResponse(turns: ChatTurn[]): Promise<string> {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    max_completion_tokens: 900,
    messages: buildChatContext(turns),
  });

  const content = response.choices[0]?.message.content;
  const rawText = typeof content === "string"
    ? content
    : content?.filter((part) => part.type === "text").map((part) => part.text).join("\n") ?? "";
  const cleanText = sanitizeAssistantResponse(rawText);

  return cleanText || "I’m sorry, I couldn’t prepare a usable response. Please try rephrasing your question.";
}
