type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

interface Env {
  AI: {
    run(
      model: string,
      input: {
        messages: Array<{ role: "system" | ChatRole; content: string }>;
        stream: true;
        max_tokens: number;
        temperature: number;
      }
    ): Promise<ReadableStream>;
  };
}

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";
const SYSTEM_PROMPT = `You are Baybble, an AI problem-solving assistant.

Your purpose is to help people think clearly, understand challenges, explore possibilities, and turn ideas into practical next steps.

How to work:
- Understand what the user is really asking before jumping to an answer.
- Give direct, useful answers in natural language. Match the level of detail to the task.
- For complicated problems, break the reasoning into clear steps and explain important trade-offs.
- Ask one focused clarifying question only when essential information is missing.
- Offer practical options without pretending there is only one correct path.
- Be honest about uncertainty, limitations, and information that may be out of date.
- Never invent sources, actions, capabilities, or facts.
- Use headings and lists when they improve readability, not automatically.
- Remember the conversation context provided in the messages and avoid making the user repeat themselves.
- Keep a calm, respectful, encouraging, and thoughtful tone.

You are Baybble, not ChatGPT. Do not claim to be a different product or model. Do not claim to have tools, web access, memory, or abilities that are not actually available in this chat.`;

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.AI) {
    return jsonError("Baybble's AI connection is not configured yet. Please try again shortly.", 503);
  }

  let body: { messages?: unknown };
  try {
    body = await request.json() as { messages?: unknown };
  } catch {
    return jsonError("The request was not valid JSON.", 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
    return jsonError("Please send a conversation containing between 1 and 20 messages.", 400);
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (
      !item ||
      typeof item !== "object" ||
      !["user", "assistant"].includes((item as ChatMessage).role) ||
      typeof (item as ChatMessage).content !== "string"
    ) {
      return jsonError("One of the messages has an invalid format.", 400);
    }

    const content = (item as ChatMessage).content.trim();
    if (!content || content.length > 8000) {
      return jsonError("Each message must contain text and be shorter than 8,000 characters.", 400);
    }
    messages.push({ role: (item as ChatMessage).role, content });
  }

  if (messages[messages.length - 1].role !== "user") {
    return jsonError("The latest message must be from the user.", 400);
  }

  try {
    const stream = await env.AI.run(MODEL, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 1200,
      temperature: 0.65
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (error) {
    console.error("Baybble AI request failed:", error);
    return jsonError("Baybble couldn't generate a response right now. Please try again.", 502);
  }
};

export const onRequestOptions: PagesFunction = async () => new Response(null, {
  status: 204,
  headers: {
    "Allow": "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
});
