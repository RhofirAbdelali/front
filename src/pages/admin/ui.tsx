import React from "react";

export const THEME = {
  primary: "#fa3899",
  primary700: "#c20f66",
  primary900: "#8a1346",
  bg: "#fcf8fa",
  card: "#ffffff",
  border: "#f0e1ea",
  text: "#1f2937",
  textMuted: "#6b7280",
};

export function Card({ title, right, children }:{
  title: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section style={{border:`1px solid ${THEME.border}`, borderRadius:14, background:"#fff"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:`1px solid ${THEME.border}`}}>
        <h3 style={{margin:0, fontSize:18, fontWeight:800}}>{title}</h3>
        {right}
      </div>
      <div style={{padding:16}}>
        {children}
      </div>
    </section>
  );
}

export function ListHeader({ cols, labels }:{ cols:string; labels:string[] }) {
  return (
    <div style={{display:"grid", gridTemplateColumns:cols, background:"#f9fafb", padding:"10px 12px", fontWeight:700}}>
      {labels.map((l,i)=><div key={i}>{l}</div>)}
    </div>
  );
}

export function Badge({ active }:{ active:boolean }) {
  return (
    <span style={{
      fontSize:12, padding:"2px 8px", borderRadius:999,
      background: active ? "#ecfeff" : "#f3f4f6",
      color: active ? "#0e7490" : THEME.textMuted, border:`1px solid ${THEME.border}`
    }}>
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

export function Alert({ children }:{ children:React.ReactNode }) {
  return <div style={{color:"#b91c1c",background:"#fee2e2",padding:10,borderRadius:10,marginBottom:10}}>{children}</div>;
}

export function inputStyle(): React.CSSProperties {
  return { padding:10, border:`1px solid ${THEME.border}`, borderRadius:10, background:"#fff" };
}
export function btnPrimary(): React.CSSProperties {
  return { padding:"8px 10px", borderRadius:10, background:THEME.primary, color:"#fff", border:`1px solid ${THEME.primary}` };
}
export function btnGhost(): React.CSSProperties {
  return { padding:"8px 10px", borderRadius:10, border:`1px solid ${THEME.border}`, background:"#fff" };
}
