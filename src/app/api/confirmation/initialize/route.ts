import { initializeDriveStructure } from "@/modules/confirmation/drive";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  try {
    return Response.json(await initializeDriveStructure());
  } catch {
    return Response.json({ error: { message: "Struktur Google Drive tidak dapat diinisialisasi." } }, { status: 503 });
  }
}
