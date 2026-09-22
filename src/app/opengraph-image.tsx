import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #ff5530, #ea5ec1)",
            }}
          />
          <div style={{ fontSize: 56, fontWeight: 700, color: "#ffffff" }}>QuickPic</div>
        </div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#a8aab2" }}>
          Book a photo shoot, or find a photographer
        </div>
      </div>
    ),
    { ...size },
  );
}
