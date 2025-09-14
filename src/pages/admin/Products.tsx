import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Alert, Badge, Card, ListHeader, THEME } from "./ui";

type Product = { id: number; code: string; label: string; active: boolean };

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function loadProducts() {
    setLoading(true); setErr(null);
    try {
      const res = await apiFetch("/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Product[] = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ loadProducts(); },[]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !label.trim()) return setErr("Code et Libellé sont requis.");
    setBusyCreate(true); setErr(null);
    try {
      const res = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({ code: code.trim(), label: label.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCode(""); setLabel("");
      await loadProducts();
    } catch (e: any) {
      setErr(e.message || "Erreur création");
    } finally {
      setBusyCreate(false);
    }
  }

  async function onDelete(p: Product) {
    if (!confirm(`Supprimer le produit ${p.label} (${p.code}) ?`)) return;
    setBusyId(p.id); setErr(null);
    try {
      const res = await apiFetch(`/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadProducts();
    } catch (e: any) {
      setErr(e.message || "Erreur suppression");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <Card title="Gestion des produits">
        <form onSubmit={onCreate} style={{display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:8, alignItems:"end", marginBottom:12}}>
          <label style={{display:"grid", gap:6}}>
            Code
            <input value={code} onChange={e=>setCode(e.target.value)}
              placeholder="ex: PREV-DEC"
              style={{padding:10,border:`1px solid ${THEME.border}`,borderRadius:10}}/>
          </label>
          <label style={{display:"grid", gap:6}}>
            Libellé
            <input value={label} onChange={e=>setLabel(e.target.value)}
              placeholder="Prévoyance Décès"
              style={{padding:10,border:`1px solid ${THEME.border}`,borderRadius:10}}/>
          </label>
          <button disabled={busyCreate}
            style={{padding:"10px 12px", borderRadius:10, background:THEME.primary, color:"#fff", border:`1px solid ${THEME.primary}`}}>
            {busyCreate ? "Ajout…" : "Ajouter"}
          </button>
        </form>

        {err && <Alert>{err}</Alert>}

        {loading ? (
          <div>Chargement…</div>
        ) : (
          <div style={{border:`1px solid ${THEME.border}`, borderRadius:12, overflow:"hidden"}}>
            <ListHeader cols="80px 1fr 120px 120px" labels={["ID","Produit","Statut","Actions"]}/>
            {items.map(p => (
              <div key={p.id} style={{display:"grid", gridTemplateColumns:"80px 1fr 120px 120px", padding:"10px 12px", borderTop:`1px solid #f1f5f9`}}>
                <div>{p.id}</div>
                <div>
                  <div style={{fontWeight:700}}>{p.label}</div>
                  <div style={{fontSize:12, color:THEME.textMuted}}>{p.code}</div>
                </div>
                <div><Badge active={p.active}/></div>
                <div>
                  <button
                    onClick={()=>onDelete(p)}
                    disabled={busyId===p.id}
                    style={{background:"#ef4444",color:"#fff",padding:"8px 12px",borderRadius:10,border:"none"}}
                  >
                    {busyId===p.id ? "Supp…" : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
            {items.length===0 && <div style={{padding:12, color:THEME.textMuted}}>Aucun produit.</div>}
          </div>
        )}
      </Card>
    </div>
  );
}
