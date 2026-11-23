import { ConfirmationResponseClient } from "@/components/confirmation/confirmation-response-client";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getPublicConfirmation } from "@/modules/confirmation/service";

export const dynamic = "force-dynamic";

async function loadConfirmation(kodeKlien: string, token: string) {
  try { return await getPublicConfirmation(kodeKlien, token); }
  catch { return null; }
}

export default async function ConfirmationPage({ params }: { params: Promise<{ kodeKlien: string; token: string }> }) {
  const { kodeKlien, token } = await params;
  const confirmation = await loadConfirmation(kodeKlien, token);
  if (!confirmation) return <><SiteHeader currentKey="kerja-bersama" /><main className="confirmation-page"><section className="confirmation-shell card card-pad"><span className="eyebrow text-sirih">Konfirmasi</span><h1>Tautan tidak dapat digunakan</h1><p>Tautan konfirmasi tidak valid, sudah tidak aktif, atau sudah kedaluwarsa. Silakan hubungi pihak yang mengirimkan permintaan konfirmasi.</p></section></main><SiteFooter /></>;
  return <><SiteHeader currentKey="kerja-bersama" /><ConfirmationResponseClient confirmation={confirmation} /><SiteFooter /></>;
}
