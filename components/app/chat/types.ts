// Tool call part type for AI SDK 6
export interface ToolCallPart {
  type: string;
  toolName?: string;
  toolCallId?: string;
  // AI SDK 6 states: "partial-call" | "call" | "output-available" | "result"
  state?: string;
  // Input arguments
  input?: Record<string, unknown>;
  args?: Record<string, unknown>;
  // Output data (AI SDK 6 uses "output", some versions use "result")
  output?: unknown;
  result?: unknown;
}
