import { createServerFn } from "@tanstack/react-start";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, Output } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ScanInput = z.object({
  inputType: z.enum(["link", "message", "transaction"]),
  inputText: z.string().min(3).max(4000),
});

const VerdictSchema = z.object({
  risk_level: z.enum(["safe", "low", "medium", "high", "critical"]),
  risk_score: z.number().int().min(0).max(100),
  verdict: z.string().min(4).max(140),
  reasons: z.array(z.string().min(2).max(200)).min(1).max(6),
  advice: z.string().min(10).max(800),
});

export const analyzeFraud = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ScanInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service unavailable");

    const gateway = createOpenAICompatible({
      name: "lovable-ai",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": apiKey },
    });

    const typeLabel = {
      link: "URL / link",
      message: "Text message, email, or chat message",
      transaction: "Payment / transaction request",
    }[data.inputType];

    const systemPrompt = `You are Fraud Shield, a cybersecurity assistant that protects first-time digital users from scams, phishing, and fraudulent financial transactions.

For each input you receive, you must:
- Detect phishing indicators (lookalike domains, urgency, unusual TLDs, suspicious shorteners, mismatched links, requests for OTP/PIN/CVV/seed phrase, fake payment requests, impersonation of banks/govt/UPI apps)
- Score the risk from 0 (completely safe) to 100 (definite scam)
- Map the score to a level: 0-15 safe, 16-35 low, 36-60 medium, 61-85 high, 86-100 critical
- Provide a one-sentence verdict
- List concrete reasons (short bullets, plain language)
- Give simple, beginner-friendly advice the user should take next

Use plain, encouraging language a first-time internet user can understand. Never include code blocks or markdown formatting.`;

    const userPrompt = `Analyze this ${typeLabel}:\n\n"""${data.inputText}"""`;

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({ schema: VerdictSchema }),
    });

    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        input_type: data.inputType,
        input_text: data.inputText,
        risk_level: output.risk_level,
        risk_score: output.risk_score,
        verdict: output.verdict,
        reasons: output.reasons,
        advice: output.advice,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data;
  });

export const deleteScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("scans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
