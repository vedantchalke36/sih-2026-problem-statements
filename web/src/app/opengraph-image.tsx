import { ImageResponse } from "next/og";

import { stats } from "@/lib/ps";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "SIH 2026 Problem Statements - all 226 Smart India Hackathon problem statements in one searchable place";

export const dynamic = "force-static";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 14,
              backgroundColor: "#fafafa",
              color: "#0a0a0a",
              fontWeight: 800,
              fontSize: 28,
            }}
          >
            SIH
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            SIH 2026 Problem Statements
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -1, textAlign: "center" }}>
          All {stats.total} statements.
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          <span>{stats.software} Software</span>
          <span>·</span>
          <span>{stats.hardware} Hardware</span>
          <span>·</span>
          <span>{stats.orgs.length} Organizations</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
