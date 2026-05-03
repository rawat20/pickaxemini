import { NextRequest } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (!body.system_prompt || !body.messages?.length) {
    return new Response(
      JSON.stringify({ error: "system_prompt and messages are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Call FastAPI streaming endpoint
  const fastapiRes = await fetch(`${FASTAPI_URL}/api/v1/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_prompt: body.system_prompt,
      messages: body.messages,
      agent_name: body.agent_name || "Assistant",
    }),
  });

  if (!fastapiRes.ok) {
    return new Response(JSON.stringify({ error: "FastAPI stream failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pipe FastAPI SSE stream directly to browser
  return new Response(fastapiRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
