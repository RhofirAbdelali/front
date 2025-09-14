import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Alert, Card, ListHeader, THEME, btnGhost, btnPrimary, inputStyle } from "./ui";

type Subscription = {
  id: number;
  productCode?: string;
  versionCode?: string;
  civilite?: string;
  nom?: string;
  prenom?: string;
  birthDate?: string;
  email?: string;
  tel?: string;
  cp?: string;
  ville?: string;
  dateEffet?: string;
  periodicite?: "MENSUELLE" | "ANNUELLE" | string;
  iban?: string;
  primeNette?: number;
  frais?: number;
  taxe?: number;
  primeTTC?: number;
  currency?: string;
  reqJson?: string;
  resJson?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [sLoading, setSLoading] = useState(true);
  const [sErr, setSErr] = useState<string | null>(null);

  const [qProduct, setQProduct] = useState<string>("");
  const [qStatus, setQStatus]   = useState<string>("");
  const [qFrom, setQFrom]       = useState<string>("");
  const [qTo, setQTo]           = useState<string>("");

  const [modal, setModal] = useState<{open:boolean; title:string; message:string; variant:"success"|"error"}>({
    open:false, title:"", message:"", variant:"success"
  });

  async function loadSubs() {
    setSLoading(true); setSErr(null);
    try {
      const res = await apiFetch("/admin/subscriptions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Subscription[] = await res.json();
      setSubs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setSErr(e.message || "Erreur");
    } finally {
      setSLoading(false);
    }
  }
  useEffect(()=>{ loadSubs(); },[]);

  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      if (qProduct && (s.productCode || "") !== qProduct) return false;
      if (qStatus && (s.status || "").toUpperCase() !== qStatus.toUpperCase()) return false;
      if (qFrom && s.createdAt && new Date(s.createdAt) < new Date(qFrom)) return false;
      if (qTo && s.createdAt && new Date(s.createdAt) > new Date(qTo + "T23:59:59")) return false;
      return true;
    });
  }, [subs, qProduct, qStatus, qFrom, qTo]);

  function fmtDate(d?: string) {
    if (!d) return "-";
    try { return new Date(d).toLocaleString("fr-FR"); } catch { return d; }
  }
  function fmtMoney(v?: number, ccy?: string) {
    if (v == null) return "-";
    try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: ccy || "EUR" }).format(v); }
    catch { return `${v} ${ccy || "EUR"}`; }
  }

  function exportCsv(rows: any[]) {
    const head = [
      "Produit","Version","Civilité","Nom","Prénom","Naissance","Email","Tel","CP","Ville",
      "DateEffet","Périodicité","PrimeTTC","Devise","Statut","CrééLe"
    ];
    const data = rows.map((r: Subscription) => ([
      r.productCode || "", r.versionCode || "",
      r.civilite || "", r.nom || "", r.prenom || "", r.birthDate || "",
      r.email || "", r.tel || "", r.cp || "", r.ville || "",
      r.dateEffet || "", r.periodicite || "", r.primeTTC ?? "", r.currency || "",
      r.status || "", r.createdAt || ""
    ]));
    const all = [head, ...data]
      .map(line => line.map(cell => {
        const s = String(cell ?? "");
        return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + all], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `subscriptions_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  async function downloadPdf(subId: number) {
    try {
      const r = await apiFetch(`/admin/subscriptions/${subId}/pdf`, { method: "GET" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscription_${subId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e:any) {
      setModal({open:true, title:"Erreur", message:e.message || "Erreur téléchargement PDF", variant:"error"});
    }
  }

  async function resendEmail(s: Subscription) {
    try {
      const r = await apiFetch(`/admin/subscriptions/${s.id}/resend-email`, { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setModal({
        open:true,
        title:"Email renvoyé",
        message:`Le devis PDF a été renvoyé ${s.email ? `à ${s.email}` : "au client"} avec succès.`,
        variant:"success"
      });
    } catch(e:any) {
      setModal({
        open:true,
        title:"Échec de l’envoi",
        message:e.message || "Impossible de renvoyer l’email.",
        variant:"error"
      });
    }
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <Card
        title="Souscriptions"
        right={
          <div style={{display:"flex", gap:8}}>
            <button onClick={loadSubs} style={btnGhost()}>Rafraîchir</button>
            <button onClick={()=>exportCsv(filteredSubs)} style={btnPrimary()}>Export CSV</button>
          </div>
        }
      >
        {/* Filtres */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:12}}>
          <label style={{display:"grid", gap:6}}>
            Produit
            <select value={qProduct} onChange={e=>setQProduct(e.target.value)}
              style={inputStyle()}>
              <option value="">Tous</option>
              {Array.from(new Set(subs.map(s => s.productCode).filter(Boolean))).map((pc, i) => (
                <option key={i} value={pc as string}>{pc}</option>
              ))}
            </select>
          </label>
          <label style={{display:"grid", gap:6}}>
            Statut
            <select value={qStatus} onChange={e=>setQStatus(e.target.value)}
              style={inputStyle()}>
              <option value="">Tous</option>
              {Array.from(new Set(subs.map(s => (s.status || "").toUpperCase()).filter(Boolean))).map((st, i)=>(
                <option key={i} value={st}>{st}</option>
              ))}
            </select>
          </label>
          <label style={{display:"grid", gap:6}}>
            Du
            <input type="date" value={qFrom} onChange={e=>setQFrom(e.target.value)} style={inputStyle()}/>
          </label>
          <label style={{display:"grid", gap:6}}>
            Au
            <input type="date" value={qTo} onChange={e=>setQTo(e.target.value)} style={inputStyle()}/>
          </label>
        </div>

        {sErr && <Alert>{sErr}</Alert>}

        {sLoading ? (
          <div>Chargement…</div>
        ) : (
          <div style={{border:`1px solid ${THEME.border}`, borderRadius:12, overflow:"hidden"}}>
            {/* En-têtes : SANS ID */}
            <ListHeader
              cols="1fr 1fr 120px 160px 110px 110px 90px"
              labels={["Client","Produit / Version","Période","Contact","Prime TTC","Créé le","Actions"]}
            />

            {filteredSubs.map(s => (
              <div
                key={s.id}
                style={{
                  display:"grid",
                  gridTemplateColumns:"1fr 1fr 120px 160px 110px 110px 90px",
                  padding:"10px 12px",
                  borderTop:"1px solid #f1f5f9",
                  alignItems:"center"
                }}
              >
                <div>
                  <div style={{fontWeight:700}}>
                    {[s.civilite, s.prenom, s.nom].filter(Boolean).join(" ") || "-"}
                  </div>
                  <div style={{fontSize:12, color:THEME.textMuted}}>{s.birthDate || "-"}</div>
                </div>

                <div>
                  <div style={{fontWeight:700}}>{s.productCode || "-"}</div>
                  <div style={{fontSize:12, color:THEME.textMuted}}>{s.versionCode || "-"}</div>
                </div>

                <div style={{fontSize:12, color:"#374151"}}>
                  {s.dateEffet || "-"}<br/>
                  {s.periodicite || "-"}
                </div>

                <div style={{fontSize:12, color:"#374151"}}>
                  {[s.email, s.tel].filter(Boolean).join(" / ") || "-"}<br/>
                  {[s.cp, s.ville].filter(Boolean).join(" ") || ""}
                </div>

                <div style={{fontWeight:800}}>{fmtMoney(s.primeTTC, s.currency)}</div>
                <div style={{fontSize:12, color:THEME.textMuted}}>{fmtDate(s.createdAt)}</div>

                {/* Actions (icônes) */}
                <div style={{display:"flex", gap:8}}>
                  <IconButton title="Télécharger le devis" onClick={()=>downloadPdf(s.id)}>
                    <DownloadIcon/>
                  </IconButton>
                  <IconButton title="Renvoyer le PDF par email" onClick={()=>resendEmail(s)}>
                    <SendIcon/>
                  </IconButton>
                </div>
              </div>
            ))}

            {filteredSubs.length===0 && <div style={{padding:12, color:THEME.textMuted}}>Aucune souscription.</div>}
          </div>
        )}
      </Card>

      {/* Modal d’info */}
      <InfoModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onClose={()=>setModal(m => ({...m, open:false}))}
      />
    </div>
  );
}


function IconButton({ title, onClick, children }:{
  title:string; onClick:()=>void; children:React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        border:`1px solid ${THEME.border}`,
        background:"#fff",
        width:36, height:36, borderRadius:10,
        display:"grid", placeItems:"center",
        cursor:"pointer"
      }}
      onMouseOver={(e)=>{ (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
      onMouseOut={(e)=>{ (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
    >
      {children}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v10m0 0l4-4m-4 4l-4-4" stroke={THEME.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke={THEME.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="#6b7280" strokeWidth="2" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function InfoModal({
  open, title, message, variant, onClose
}:{
  open:boolean; title:string; message:string; variant:"success"|"error"; onClose:()=>void;
}) {
  if (!open) return null;
  const isSuccess = variant === "success";
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(17,24,39,0.45)",
      display:"grid", placeItems:"center", zIndex:50
    }}>
      <div style={{
        width: "min(520px, 92vw)",
        background:"#fff",
        borderRadius:16,
        border:`1px solid ${THEME.border}`,
        boxShadow:"0 10px 30px rgba(0,0,0,0.15)",
        overflow:"hidden"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:12, padding:"16px 18px", borderBottom:`1px solid ${THEME.border}`}}>
          <span style={{
            width:28, height:28, borderRadius:9999,
            background: isSuccess ? "#dcfce7" : "#fee2e2",
            display:"grid", placeItems:"center", flexShrink:0
          }}>
            {isSuccess ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <h4 style={{margin:0, fontSize:18, fontWeight:800}}>{title}</h4>
        </div>
        <div style={{padding:"16px 18px", color:"#374151"}}>
          {message}
        </div>
        <div style={{display:"flex", justifyContent:"flex-end", gap:8, padding:"12px 18px", borderTop:`1px solid ${THEME.border}`}}>
          <button onClick={onClose} style={btnPrimary()}>OK</button>
        </div>
      </div>
    </div>
  );
}
