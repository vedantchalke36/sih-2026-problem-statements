import { ImageResponse } from "next/og";

import { PS_BY_NUMBER, problemStatements } from "@/lib/ps";

export const alt = "SIH 2026 problem statement details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamic = "force-static";

export function generateStaticParams() {
  return problemStatements.map((ps) => ({ id: ps.ps_number }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ps = PS_BY_NUMBER.get(id);
  const isSoftware = ps?.category === "Software";

  const bg = "#0a0a0a";
  const accent = isSoftware ? "#0070f7" : "#ffb200";
  const title = ps?.title ?? "SIH 2026 Problem Statement";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: bg,
          color: "#fafafa",
          padding: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#fafafa",
                color: "#0a0a0a",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              SIH
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 600 }}>
              Smart India Hackathon 2026
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: 999,
                backgroundColor: accent,
                color: "#0a0a0a",
                fontFamily: "monospace",
              }}
            >
              {ps?.category ?? ""}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              fontSize: 22,
              color: accent,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            {ps?.ps_number ?? ""} · {ps?.theme ?? ""}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 20, color: "#a1a1aa" }}>
          <span>{ps?.org ?? ""}</span>
          <span>·</span>
          <span>{ps?.deadline ?? ""}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
