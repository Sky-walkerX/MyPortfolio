import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE.name} · Portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#050505",
          color: "#f0ede8",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(123, 97, 255, 0.6)",
            pointerEvents: "none",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", gap: 12, color: "#888", fontSize: 22 }}>
          <span style={{ color: "#7b61ff" }}>naman</span>
          <span style={{ color: "#555" }}>@</span>
          <span style={{ color: "#6ce5b2" }}>portfolio</span>
          <span style={{ color: "#555" }}>:</span>
          <span style={{ color: "#6bcde5" }}>~</span>
          <span style={{ color: "#f0ede8" }}>$</span>
          <span style={{ color: "#f0ede8" }}>./welcome.sh</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 48,
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ color: "#888", fontSize: 20, letterSpacing: 4, marginBottom: 16 }}>
            › HELLO WORLD. I&apos;M
          </div>
          <div
            style={{
              color: "#f0ede8",
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -4,
              display: "flex",
            }}
          >
            naman<span style={{ color: "#7b61ff" }}>.</span>
          </div>
          <div
            style={{
              color: "#f0ede8",
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -4,
              marginTop: 8,
              display: "flex",
            }}
          >
            khandelwal
          </div>
          <div style={{ color: "#b8b3aa", fontSize: 28, marginTop: 32, display: "flex" }}>
            full-stack developer · distributed systems · open source
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            color: "#555",
            fontSize: 20,
          }}
        >
          <span>IIIT Lucknow · CS &apos;28</span>
          <span style={{ color: "#7b61ff" }}>namankhandelwal.me</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
