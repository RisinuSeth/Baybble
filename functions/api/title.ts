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

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.AI) return Response.json({ error: "Title generation is unavailable." }, { status: 503 });

  let body: { messages?: unknown };
  try {
    body = await request.json() as { messages?: unknown };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 20) {
    return Response.json({ error: "Invalid conversation." }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (
      !item ||
      typeof item !== "object" ||
      !["user", "assistant"].includes((item as ChatMessage).role) ||
      typeof (item as ChatMessage).content !== "string"
    ) {
      return Response.json({ error: "Invalid message." }, { status: 400 });
    }
    const content = (item as ChatMessage).content.trim().slice(0, 4000);
    if (content) messages.push({ role: (item as ChatMessage).role, content });
  }

  if (!messages.length) return Response.json({ error: "Empty conversation." }, { status: 400 });

  const userMessages = messages.filter((message) => message.role === "user");
  const greetingOnly = userMessages.length === 1 && /^(hi|hello|hey|hiya|yo|good morning|good afternoon|good evening|howdy)[!,.?\s]*$/i.test(userMessages[0].content);
  if (greetingOnly) {
    return new Response('data: {"response":"A Fresh Start"}\n\ndata: [DONE]\n\n', {
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" }
    });
  }

  try {
    const stream = await env.AI.run(MODEL, {
      messages: [
        {
          role: "system",
          content: "Create a concise, natural title for this conversation in Baybble's own voice. Understand the central topic from the full conversation, not just the first message. If it is casual small talk with no meaningful subject, use the neutral title A Little Conversation. If it is about a clear question, challenge, idea, decision, or plan, name that actual subject directly. Never invent a topic or imply the user discussed something they did not. Return only the title, with no quotation marks, prefix, punctuation at the end, or explanation. Use 2 to 7 words, natural title case, and keep it under 55 characters."
        },
        ...messages
      ],
      stream: true,
      max_tokens: 24,
      temperature: 0.2
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (error) {
    console.error("Baybble title generation failed:", error);
    return Response.json({ error: "Could not generate a conversation title." }, { status: 502 });
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
