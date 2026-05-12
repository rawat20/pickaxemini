"use client";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/core/utils";

const PICKAXE_BUNDLE = "https://studio.pickaxe.co/api/embed/bundle.js";
const PICKAXE_DEPLOYMENT_ID = `${process.env.PICKAXE_DEPLOYMENT_ID}`;

if (!PICKAXE_DEPLOYMENT_ID) {
  throw new Error('Missing environment variable: "PICKAXE_DEPLOYMENT_ID"');
}

function injectPickaxeScript(): void {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[data-pickaxe-embed="true"]`)) return;
  const el = document.getElementById(PICKAXE_DEPLOYMENT_ID);
  if (!el) return;
  const script = document.createElement("script");
  script.src = PICKAXE_BUNDLE;
  script.defer = true;
  script.setAttribute("data-pickaxe-embed", "true");
  document.body.appendChild(script);
}

const PANEL_W = "min(720px, 100vw)";
const PANEL_H = "min(500px, 65vh)";

export function PickaxeEmbed() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => injectPickaxeScript());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .pickaxe-fab {
          animation: float 3s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pickaxe-fab:hover {
          animation: none;
          transform: scale(1.1);
          box-shadow: 0 12px 28px rgba(0,0,0,0.25);
        }
        .pickaxe-fab.is-open {
          animation: none;
        }
        .pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #6366f1;
          opacity: 0.45;
          animation: pulse-ring 2s ease-out infinite;
        }
        .pulse-ring-delay {
          animation-delay: 0.7s;
        }
      `}</style>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed right-0 bottom-0 z-[200] flex flex-col overflow-hidden",
          "rounded-tl-2xl border-l border-t border-gray-200",
          "shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.22)]",
          "transition-all duration-300 ease-in-out",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        style={{
          width: PANEL_W,
          height: PANEL_H,
          transform: open ? "translateY(0)" : "translateY(100%)",
          background: "#ffffff",
        }}
        aria-hidden={!open}
      >
        <div
          id={PICKAXE_DEPLOYMENT_ID}
          style={{
            flex: "1 1 0",
            minHeight: 0,
            overflow: "auto",
            background: "#ffffff",
            width: "100%",
          }}
        />
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close help chat" : "Open help chat"}
        className={cn("pickaxe-fab", open && "is-open")}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 210,
          width: "56px",
          height: "56px",
          borderRadius: "9999px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(99,102,241,0.45)",
          outline: "none",
        }}
      >
        {/* Pulse rings — only when closed */}
        {!open && (
          <>
            <span className="pulse-ring" />
            <span className="pulse-ring pulse-ring-delay" />
          </>
        )}
        <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.3s ease", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </span>
      </button>
    </>
  );
}