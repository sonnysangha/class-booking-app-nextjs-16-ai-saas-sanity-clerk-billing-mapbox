import { createAgentUIStreamResponse } from "ai";
import { fitnessAgent } from "@/lib/ai/agent";

export async function POST(request: Request) {
  const { messages } = await request.json();

  return createAgentUIStreamResponse({
    agent: fitnessAgent,
    messages,
  });
}
