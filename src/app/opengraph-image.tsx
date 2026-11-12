import { ImageResponse } from "next/og";

export const alt = "PuspitaCore — alat kerja pajak, sistem, dan pembelajaran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", color: "#1e1b18", background: "#f3e7d3" }}>
      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 5 }}>PUSPITA<span style={{ color: "#9a2635" }}>CORE</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", color: "#9a2635", fontSize: 26, letterSpacing: 4 }}>RUPA INDONESIA · AKAL MASA DEPAN</div>
        <div style={{ display: "flex", maxWidth: 880, fontSize: 66, lineHeight: 1.08, fontWeight: 700 }}>Tools kerja pajak, sistem, dan pembelajaran yang lebih tertata.</div>
      </div>
      <div style={{ display: "flex", color: "#b65a27", fontSize: 25 }}>puspitacore.com</div>
    </div>,
    size,
  );
}
