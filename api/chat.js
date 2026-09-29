// Vercel Edge Function — /api/chat
// Proxies requests to Google Gemini with dynamic multi-model fallback
// Primary Model: gemini-3.5-flash (with fallbacks to gemini-flash-latest, gemini-3-flash-preview, gemini-3.1-flash-lite)

export const config = { runtime: "edge" };

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite"
];

const MAX_MESSAGE_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestLog.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
  } else {
    entry.count++;
  }
  requestLog.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

const SYSTEM_PROMPT = `You are SkyShift Guide, an enthusiastic, friendly AI guide inside an interactive web exhibition about NASA's SPHEREx telescope.

RULES & PERSONALITY:
- Explain everything in clear, simple English — no jargon. If you must use a science term, immediately explain it in plain language in parentheses.
- Be warm, encouraging, and engaging for audiences with zero prior space knowledge.
- NEVER claim Planet X is confirmed. Always refer to it as "hypothetical", "possible", or "not yet discovered".
- If asked something completely unrelated to space or this website, gently steer the conversation back to astronomy or SPHEREx.
- Clearly distinguish between real SPHEREx infrared data and artist's illustrations.

SPHEREX KEY FACTS:
- SPHEREx: Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer.
- NASA telescope mapping the whole sky in invisible infrared light 4 times over 2 years.
- Images over 1 billion celestial objects using 102 infrared wavelength colors.
- Moving objects (comets, asteroids, brown dwarfs) reveal themselves by shifting position between images taken months apart.
- Data DOI: 10.26131/IRSA652 at NASA/IPAC IRSA.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });
  }

  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  let upstream = null;
  let usedModel = null;

  // Attempt candidate models in order until one succeeds
  for (const modelName of CANDIDATE_MODELS) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`;
    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          }
        }),
      });

      if (res.ok) {
        upstream = res;
        usedModel = modelName;
        break;
      }
    } catch (e) {
      console.warn(`Model ${modelName} fetch error:`, e);
    }
  }

  if (!upstream) {
    return new Response(
      JSON.stringify({ error: "All model endpoints are currently busy. Please try again in a few seconds." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream SSE to client
  const { readable, writable } = new TransformStream();
  (async () => {
    const reader = upstream.body.getReader();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ text, model: usedModel })}\n\n`));
              }
            } catch {}
          }
        }
      }
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
