import { clientIp } from "@/modules/booking/http";
import { ConfirmationError } from "@/modules/confirmation/errors";
import { submitConfirmation } from "@/modules/confirmation/service";
import type { AnswerInput } from "@/modules/confirmation/types";

export const runtime = "nodejs";

function value(form: FormData, key: string): string { const item = form.get(key); return typeof item === "string" ? item : ""; }

export async function POST(request: Request, context: { params: Promise<{ kodeKlien: string; token: string }> }) {
  try {
    const { kodeKlien, token } = await context.params;
    const form = await request.formData();
    const balance = value(form, "respondentBalance").trim();
    const answer: AnswerInput = {
      method: value(form, "method") === "UPLOAD" ? "UPLOAD" : "ONLINE",
      responseStatus: value(form, "responseStatus") as AnswerInput["responseStatus"],
      respondentBalance: balance ? Number(balance) : null,
      differenceExplanation: value(form, "differenceExplanation"), notes: value(form, "notes"),
      respondentName: value(form, "respondentName"), respondentRole: value(form, "respondentRole"), respondentDate: value(form, "respondentDate"),
      agreed: value(form, "agreed") === "true", idempotencyKey: value(form, "idempotencyKey"),
    };
    const file = form.get("file");
    const result = await submitConfirmation({ clientCode: kodeKlien, token, answer, file: file instanceof File ? file : null, rateKey: `${clientIp(request)}:${kodeKlien}` });
    return Response.json(result, { status: result.duplicate ? 200 : 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    const safe = error instanceof ConfirmationError ? error : new ConfirmationError("INTERNAL_ERROR", "Jawaban tidak dapat diproses. Silakan coba lagi.", 500);
    return Response.json({ error: { code: safe.code, message: safe.message } }, { status: safe.status });
  }
}
