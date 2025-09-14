import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Alert, Badge, Card, ListHeader, THEME } from "./ui";

type TariffVersion = Record<string, any>;

export default function Versions() {
  const [versions, setVersions] = useState<TariffVersion[]>([]);
  const [vLoading, setVLoading] = useState(true);
  const [vErr, setVErr] = useState<string | null>(null);

  const [vCode, setVCode] = useState("");
  const [vFrom, setVFrom] = useState("");
  const [vTo, setVTo] = useState("");
  const [vBusyCreate, setVBusyCreate] = useState(false);
  const [vBusyId, setVBusyId] = useState<string | number | null>(null);

  async function loadVersions() {
    setVLoading(true); setVErr(null);
    try {
      const res = await apiFetch("/admin/tariff-versions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TariffVersion[] = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setVErr(e.message || "Erreur");
    } finally {
      setVLoading(false);
    }
  }
  useEffect(()=>{ loadVersions(); },[]);

  async function onCreateVersion(e: React.FormEvent) {
    e.preventDefault();
    if (!vCode.trim()) return setVErr("Code version requis.");
    setVBusyCreate(true); setVErr(null);
    try {
      const body: Record<string, any> = { versionCode: vCode.trim(), code: vCode.trim() };
      if (vFrom) body.effectiveFrom = vFrom;
      if (vTo) body.effectiveTo = vTo;
      const res = await apiFetch("/admin/tariff-versions", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setVCode(""); setVFrom(""); setVTo("");
      await loadVersions();
    } catch (e: any) {
      setVErr(e.message || "Erreur création version");
    } finally {
      setVBusyCreate(false);
    }
  }

  async function onActivateVersion(id: string | number) {
    setVBusyId(id); setVErr(null);
    try {
      let res = await apiFetch(`/admin/tariff-versions/${id}/activate`, { method: "PUT" });
      if (!res.ok) {
        if (res.status === 404 || res.status === 405) {
          res = await apiFetch(`/admin/tariff-versions/${id}`, {
            method: "PUT",
            body: JSON.stringify({ isActive: true }),
          });
        }
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadVersions();
    } catch (e: any) {
      setVErr(e.message || "Erreur activation");
    } finally {
      setVBusyId(null);
    }
  }

  function pick(o: Record<string, any>, keys: string[], fallback: string = "-") {
    for (const k of keys) {
      const v = o?.[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
    }
    return fallback;
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <Card title="Versions tarif">
        <form onSubmit={onCreateVersion} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end", marginBottom:12}}>
          <label style={{display:"grid", gap:6}}>
            Code version
            <input value={vCode} onChange={e=>setVCode(e.target.value)}
              placeholder="ex: 2025.09"
              style={{padding:10,border:`1px solid ${THEME.border}`,borderRadius:10}}/>
          </label>
          <label style={{display:"grid", gap:6}}>
            Effective from
            <input type="date" value={vFrom} onChange={e=>setVFrom(e.target.value)}
              style={{padding:10,border:`1px solid ${THEME.border}`,borderRadius:10}}/>
          </label>
          <label style={{display:"grid", gap:6}}>
            Effective to
            <input type="date" value={vTo} onChange={e=>setVTo(e.target.value)}
              style={{padding:10,border:`1px solid ${THEME.border}`,borderRadius:10}}/>
          </label>
          <button disabled={vBusyCreate}
            style={{padding:"10px 12px", borderRadius:10, background:THEME.primary, color:"#fff", border:`1px solid ${THEME.primary}`}}>
            {vBusyCreate ? "Création…" : "Créer"}
          </button>
        </form>

        {vErr && <Alert>{vErr}</Alert>}

        {vLoading ? (
          <div>Chargement…</div>
        ) : (
          <div style={{border:`1px solid ${THEME.border}`, borderRadius:12, overflow:"hidden"}}>
            <ListHeader cols="80px 1fr 220px 220px" labels={["ID","Code","Validité","Statut / Action"]}/>
            {versions.map(v => {
              const id = pick(v, ["id"]);
              const code = pick(v, ["versionCode","code"]);
              const isActive = pick(v, ["isActive","active"], "false") === "true";
              const created = pick(v, ["createdAt","created","created_date","createdDate"]);
              const updated = pick(v, ["updatedAt","updated","lastModified","modifiedDate"]);
              const from = pick(v, ["effectiveFrom","from"]);
              const to = pick(v, ["effectiveTo","to"]);
              return (
                <div key={String(id)} style={{display:"grid", gridTemplateColumns:"80px 1fr 220px 220px", padding:"10px 12px", borderTop:"1px solid #f1f5f9"}}>
                  <div>{id}</div>
                  <div>{code}</div>
                  <div style={{fontSize:12, color:THEME.textMuted}}>{from || "-"}{to ? ` → ${to}` : ""}</div>
                  <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
                    <Badge active={isActive}/>
                    {!isActive && (
                      <button
                        onClick={()=>onActivateVersion(id)}
                        disabled={vBusyId===id}
                        style={{background:"#10b981",color:"#fff",padding:"6px 10px",borderRadius:8,border:"none"}}
                      >
                        {vBusyId===id ? "Activation…" : "Activer"}
                      </button>
                    )}
                    <span style={{fontSize:12, color:THEME.textMuted}}>{created || "-"}{updated ? ` / ${updated}` : ""}</span>
                  </div>
                </div>
              );
            })}
            {versions.length===0 && <div style={{padding:12, color:THEME.textMuted}}>Aucune version.</div>}
          </div>
        )}
      </Card>
    </div>
  );
}
