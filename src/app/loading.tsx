import { RipitaMark } from "@/components/brand/ripita-mark";

export default function Loading() {
  return (
    <main className="route-loading" aria-busy="true" aria-label="Memuat halaman">
      <RipitaMark className="route-loading__mark" />
    </main>
  );
}
