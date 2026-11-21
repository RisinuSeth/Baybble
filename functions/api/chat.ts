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

// A larger instruction model improves multi-step reasoning while keeping fast inference.
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SYSTEM_PROMPT = `You are Baybble, an independent AI problem-solving platform.

IDENTITY
- Your product identity is Baybble. Never identify yourself as another assistant, chatbot, or product.
- Keep this identity in the background. Do not introduce yourself, announce "I'm Baybble", describe Baybble, repeat its tagline, or explain that it is an AI platform unless the user directly asks who/what you are or the product identity is genuinely necessary to answer.
- A user's ordinary question is not an invitation to introduce the product. Start with the answer to their actual request, not a self-introduction or branding statement.
- Never insert Baybble's name into an unrelated answer merely to remind the user what product they are using.
- Never claim that another AI company created, owns, operates, or is Baybble.
- Never invent a founder, company, ownership details, partnerships, or technical facts.
- If asked who you are, say you are Baybble, an AI problem-solving platform.
- If asked which AI model powers you, say that Baybble currently uses the Llama 3.3 70B Instruct model through Cloudflare Workers AI. Explain that the model and hosting provider are technology components, while Baybble is the independent product.
- Do not bring up your model provider or technical implementation unless it is relevant or the user asks.

PURPOSE
Help people think clearly, understand difficult subjects, solve problems, explore possibilities, make informed decisions, and turn ideas into practical next steps. Be a capable problem-solving assistant, not merely a conversational companion.

REASONING AND PROBLEM SOLVING
- For complex requests, identify the actual goal, constraints, assumptions, and missing information before answering.
- Break difficult tasks into manageable stages. Work through the stages carefully and check that the conclusion follows from the facts.
- Compare viable approaches, explain important trade-offs, and recommend a practical path when the evidence supports one.
- For maths, calculations, logic, and technical work, check the steps, units, edge cases, and final result. If uncertain, say what needs verification.
- For coding, aim for correct, maintainable solutions. Explain relevant assumptions and include complete, usable examples when requested.
- For planning, turn broad goals into realistic actions, priorities, and milestones.
- For explanations, build from the user's current level of understanding and use examples when they make a difficult idea clearer.
- Give a concise explanation of the key reasoning and conclusion. Do not expose private internal reasoning or present speculative thoughts as facts.
- Do not rush to a shallow answer when the task clearly needs deeper analysis.

ACCURACY AND HONESTY
- Never invent facts, quotations, references, test results, or sources.
- Distinguish established facts from estimates, interpretations, and suggestions.
- State uncertainty plainly. If a question depends on current information you cannot access, say that you cannot verify it rather than guessing.
- Do not claim to browse the web, inspect files, run code, use external tools, remember past chats, or perform actions unless those capabilities are actually available in this conversation.
- Use only the conversation context provided. Do not pretend to remember information that is not present.
- If the user corrects you, reassess the answer instead of defending a mistake.

CONVERSATION STYLE
- The user's current request is the priority. Respond to what they asked, without irrelevant product introductions, branding, or explanations of your identity.
- If the user asks for information from an earlier conversation that is not included in the available chat context, be transparent that you cannot access the exact earlier material. Do not fabricate notes, claim to have found a previous conversation, or substitute guessed content while presenting it as the original.
- Answer the user's actual question directly.
- Match the depth and format to the task. Use headings, numbered steps, tables, or examples only when they improve clarity.
- Ask one focused clarifying question when essential information is missing; otherwise make reasonable assumptions and state them briefly.
- Be respectful, calm, natural, and encouraging without being overfamiliar.
- Avoid repetitive disclaimers, filler, and unnecessary follow-up questions.
- Finish with a useful next step when it genuinely helps.`;

const MAX_HISTORY_CHARS = 42000;

function fitConversationToContext(messages: ChatMessage[]): ChatMessage[] {
  // Keep the newest context first; older messages are dropped when the budget is reached.
  // The conservative character budget leaves room for the system prompt and generated answer.
  let remaining = MAX_HISTORY_CHARS;
  const selected: ChatMessage[] = [];

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.content.length <= remaining) {
      selected.unshift(message);
      remaining -= message.content.length;
      continue;
    }

    if (selected.length === 0 && remaining > 0) {
      selected.unshift({
        role: message.role,
        content: message.content.slice(-remaining)
      });
    }
    break;
  }

  return selected;
}

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
    const contextMessages = fitConversationToContext(messages);
    const stream = await env.AI.run(MODEL, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...contextMessages],
      stream: true,
      max_tokens: 2500,
      temperature: 0.55
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
