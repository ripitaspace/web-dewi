import { printableConfirmation } from "@/modules/confirmation/service";
import { ConfirmationError } from "@/modules/confirmation/errors";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ kodeKlien: string; token: string }> }) {
  try {
    const { kodeKlien, token } = await context.params;
    const pdf = await printableConfirmation(kodeKlien, token);
    return new Response(pdf as unknown as BodyInit, { headers: { "content-type": "application/pdf", "content-disposition": "inline; filename=Formulir_Jawaban_Konfirmasi.pdf", "cache-control": "private, no-store" } });
  } catch (error) {
    const status = error instanceof ConfirmationError ? error.status : 500;
    return Response.json({ error: { message: "Dokumen tidak dapat dibuat." } }, { status });
  }
}
