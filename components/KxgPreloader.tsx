"use client";

import { useEffect, useState } from "react";

export default function KxgPreloader() {
  const [stage, setStage] = useState<"init" | "in" | "exit" | "done">("init");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("kxg_seen_intro") === "true") {
        setStage("done");
        return;
      }
    } catch {
      // Ignore storage restrictions
    }

    const t1 = setTimeout(() => {
      setStage("in");
    }, 50);

    const t2 = setTimeout(() => {
      setStage("exit");
    }, 1450);

    const t3 = setTimeout(() => {
      try {
        sessionStorage.setItem("kxg_seen_intro", "true");
      } catch {
        // Ignore storage restrictions
      }
      setStage("done");
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (stage === "done") return null;

  const isIn = stage === "in" || stage === "exit";
  const isExit = stage === "exit";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        zIndex: 2147483647,
        backgroundColor: "#F5EED8",
        display: "grid",
        placeItems: "center",
        clipPath: isExit ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
        transform: isExit ? "translate3d(0, -36px, 0)" : "translate3d(0, 0, 0)",
        transition:
          "clip-path 0.65s cubic-bezier(0.77, 0, 0.175, 1), transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)",
        pointerEvents: isExit ? "none" : "auto",
        willChange: "clip-path, transform",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "460px",
          padding: "0 24px",
          margin: "0 auto",
          textAlign: "center",
          transform: isExit ? "translateY(-14px)" : "translateY(0)",
          opacity: isExit ? 0.35 : 1,
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            borderRadius: "18px",
            boxShadow: isIn ? "0 18px 40px rgba(44, 21, 9, 0.12)" : "none",
            transition: "box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
          }}
        >
          <img
            src="https://res.cloudinary.com/rl3bynob/image/upload/v1795515682/photo_2026-11-24_11-20-45.jpg"
            alt="KXG"
            style={{
              display: "block",
              width: "clamp(165px, 25vw, 235px)",
              height: "auto",
              transform: isIn ? "translateY(0) scale(1)" : "translateY(24%) scale(1.05)",
              opacity: isIn ? 1 : 0,
              transition:
                "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
            }}
          />
        </div>

        <span
          style={{
            display: "block",
            width: "76px",
            height: "2px",
            marginTop: "18px",
            marginBottom: "14px",
            backgroundColor: "#2C1509",
            transform: isIn ? "scaleX(1)" : "scaleX(0)",
            opacity: isIn ? 1 : 0,
            transition:
              "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, opacity 0.3s ease 0.15s",
          }}
        />

        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(12px, 1.7vw, 15px)",
              fontWeight: 900,
              letterSpacing: isIn ? "0.24em" : "0.14em",
              lineHeight: 1.35,
              color: "#2C1509",
              textTransform: "uppercase",
              transform: isIn ? "translateY(0)" : "translateY(110%)",
              opacity: isIn ? 1 : 0,
              transition:
                "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, letter-spacing 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 0.35s ease 0.2s",
            }}
          >
            ALWAYS STAY FLY,NEVER FOLLOW.
          </p>
        </div>
      </div>
    </div>
  );
}
