import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, actions, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60
      }}
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          width: "min(720px, 92vw)", background: "#fff", borderRadius: 16,
          border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
        }}
      >
        <div style={{padding: "14px 16px", borderBottom: "1px solid #f1f5f9"}}>
          <div style={{fontWeight: 900, fontSize: 18}}>{title}</div>
        </div>
        <div style={{padding: 16}}>
          {children}
        </div>
        <div style={{padding: 12, borderTop: "1px solid #f1f5f9", display:"flex", gap:8, justifyContent:"flex-end"}}>
          {actions}
        </div>
      </div>
    </div>
  );
}
