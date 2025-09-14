import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { clearToken } from "../lib/auth";

/* Types */
type Product = { id: number; code: string; label: string; active: boolean };
type TariffVersion = Record<string, any>;
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

export default function Admin() {
  const nav = useNavigate();

  /* ---------- PRODUITS ---------- */
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

  /* ---------- VERSIONS TARIF ---------- */
  const [versions, setVersions] = useState<TariffVersion[]>([]);
  const [vLoading, setVLoading] = useState(true);
  const [vErr, setVErr] = useState<string | null>(null);

  const [vCode, setVCode] = useState("");
  const [vFrom, setVFrom] = useState(""); // yyyy-MM-dd
  const [vTo, setVTo] = useState("");     // yyyy-MM-dd
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

  /* ---------- SOUSCRIPTIONS ---------- */
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [sLoading, setSLoading] = useState(true);
  const [sErr, setSErr] = useState<string | null>(null);

  const [qProduct, setQProduct] = useState<string>("");
  const [qStatus, setQStatus]   = useState<string>("");
  const [qFrom, setQFrom]       = useState<string>("");
  const [qTo, setQTo]           = useState<string>("");

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

  function pick(o: Record<string, any>, keys: string[], fallback: string = "-") {
    for (const k of keys) {
      const v = o?.[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
    }
    return fallback;
  }

  function logout() {
    clearToken();
    nav("/login", { replace: true });
  }

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
      "ID","Produit","Version","Civilité","Nom","Prénom","Naissance","Email","Tel","CP","Ville",
      "DateEffet","Périodicité","PrimeTTC","Devise","Statut","CrééLe"
    ];
    const data = rows.map((r: Subscription) => ([
      r.id, r.productCode || "", r.versionCode || "",
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
      alert(e.message || "Erreur téléchargement PDF");
    }
  }

  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      if (qProduct && (s.productCode || "") !== qProduct) return false;
      if (qStatus && (s.status || "").toUpperCase() !== qStatus.toUpperCase()) return false;
      if (qFrom && s.createdAt && new Date(s.createdAt) < new Date(qFrom)) return false;
      if (qTo && s.createdAt && new Date(s.createdAt) > new Date(qTo + "T23:59:59")) return false;
      return true;
    });
  }, [subs, qProduct, qStatus, qFrom, qTo]);

  function isSameDay(iso?: string, ref?: Date) {
    if (!iso || !ref) return false;
    const d = new Date(iso);
    return d.getFullYear() === ref.getFullYear() &&
           d.getMonth() === ref.getMonth() &&
           d.getDate() === ref.getDate();
  }
  function isSameMonth(iso?: string, ref?: Date) {
    if (!iso || !ref) return false;
    const d = new Date(iso);
    return d.getFullYear() === ref.getFullYear() &&
           d.getMonth() === ref.getMonth();
  }

  // KPI
  const kpi = useMemo(() => {
    const arr = filteredSubs;
    const total = arr.length;
    const signed = arr.filter(s => (s.status || "").toUpperCase() === "SIGNED").length;
    const totalPrime = arr.reduce((sum, s) => sum + (Number(s.primeTTC) || 0), 0);
    const avgPrime = total ? totalPrime / total : 0;
    const today = new Date();
    const todayCount = arr.filter(s => isSameDay(s.createdAt, today)).length;
    const monthCount = arr.filter(s => isSameMonth(s.createdAt, today)).length;

    const activeVersionsCount = versions.filter((v: any) => {
      const val = v?.isActive ?? v?.active;
      return val === true || String(val) === "true" || val === 1 || String(val) === "1";
    }).length;

    const ccy = (arr.find(s => s.currency)?.currency) || "EUR";

    const counts: Record<string, number> = {};
    for (const s of arr) {
      const pc = s.productCode || "-";
      counts[pc] = (counts[pc] || 0) + 1;
    }
    const topProductEntry = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0] || null;
    const topProduct = topProductEntry ? { code: topProductEntry[0], count: topProductEntry[1] } : null;

    return { total, signed, totalPrime, avgPrime, todayCount, monthCount, activeVersionsCount, ccy, topProduct };
  }, [filteredSubs, versions]);

  const productCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredSubs) {
      const key = s.productCode || "—";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a,b)=>b[1]-a[1]).slice(0,6);
  }, [filteredSubs]);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredSubs) {
      const key = (s.status || "UNKNOWN").toUpperCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    const arr = Array.from(map.entries());
    const total = arr.reduce((x, [,v])=>x+v,0) || 1;
    return { arr, total };
  }, [filteredSubs]);

  const dailySeries = useMemo(() => {
    const days = 14;
    const labels: string[] = [];
    const counts: number[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      labels.push(key);
      const c = filteredSubs.filter(s => (s.createdAt || "").slice(0,10) === key).length;
      counts.push(c);
    }
    const max = Math.max(1, ...counts);
    return { labels, counts, max };
  }, [filteredSubs]);

  useEffect(() => { loadProducts(); loadVersions(); loadSubs(); }, []);

  // --- Styles tokens (rose) ---
  const theme = {
    primary500: "#fa3899",
    primary600: "#e61b7f",
    primary50:  "#fff0f7",
    primary100: "#ffe3f0",
    text: "#1f2937",
    subtle: "#6b7280",
    border: "#e5e7eb",
    cardBg: "#ffffff",
  };

  return (
    <div style={{minHeight:"100vh", display:"flex", background: theme.primary50, color: theme.text}}>
      {/* ===== Sidebar ===== */}
      <aside style={{
        width: 260, flexShrink:0, background:"#fff",
        borderRight:`1px solid ${theme.primary100}`, padding: 24, display:"flex", flexDirection:"column"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:24}}>
          <div style={{width:32,height:32,borderRadius:8,background:theme.primary500}}/>
          <div style={{fontWeight:800, color:"#821346"}}>Selfassurance</div>
        </div>
        <nav style={{display:"grid", gap:8}}>
          <a href="#dashboard" style={navItemStyle(theme, true)}>Tableau de bord</a>
          <a href="#products"  style={navItemStyle(theme,false)}>Produits</a>
          <a href="#versions"  style={navItemStyle(theme,false)}>Versions tarif</a>
          <a href="#subs"      style={navItemStyle(theme,false)}>Souscriptions</a>
          <a href="#params"    style={navItemStyle(theme,false)}>Paramètres</a>
        </nav>
        <div style={{marginTop:"auto"}}>
          <button onClick={logout} style={{
            width:"100%", marginTop:16, display:"flex", alignItems:"center", justifyContent:"center",
            gap:8, padding:"10px 12px", borderRadius:10, border:`1px solid ${theme.border}`, background:"#fff"
          }}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main style={{flex:1, padding:24}}>
        {/* Header */}
        <header id="dashboard" style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
          <h2 style={{fontSize:28, fontWeight:900, color:"#821346"}}>Tableau de bord</h2>
          <div style={{display:"flex", gap:10}}>
            <Link to="/estimation" style={{
              display:"flex", alignItems:"center", gap:8, padding:"10px 12px",
              background: theme.primary500, color:"#fff", borderRadius:10, border:`1px solid ${theme.primary600}`
            }}>
              Nouveau devis
            </Link>
            <div style={{position:"relative"}}>
              <input placeholder="Rechercher…" style={{
                padding:"10px 12px", border:`1px solid ${theme.border}`, borderRadius:10, minWidth:220, background:"#fff"
              }}/>
            </div>
          </div>
        </header>

        {/* KPI */}
        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:16}}>
          <KpiCard title="Souscriptions" value={kpi.total.toLocaleString("fr-FR")} theme={theme}/>
          <KpiCard title="Signées" value={kpi.signed.toLocaleString("fr-FR")} theme={theme}/>
          <KpiCard title="Prime TTC totale" value={fmtMoney(kpi.totalPrime, kpi.ccy)} theme={theme}/>
          <KpiCard title="Panier moyen" value={fmtMoney(kpi.avgPrime, kpi.ccy)} theme={theme}/>
          <KpiCard title="Aujourd’hui" value={kpi.todayCount.toLocaleString("fr-FR")} theme={theme}/>
          <KpiCard title="Ce mois" value={kpi.monthCount.toLocaleString("fr-FR")} theme={theme}/>
        </section>

        {/* Charts */}
        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12, marginBottom:16}}>
          {/* Barres par produit */}
          <div style={card(theme)}>
            <div style={cardHeader(theme)}>Top produits</div>
            {productCounts.length === 0 ? (
              <EmptyChart/>
            ) : (
              <div style={{display:"grid", gap:8, padding:12}}>
                {productCounts.map(([label, val]) => {
                  const max = productCounts[0][1] || 1;
                  const ratio = Math.max(0.05, val / max);
                  return (
                    <div key={label} style={{display:"grid", gridTemplateColumns:"120px 1fr 40px", alignItems:"center", gap:8}}>
                      <div style={{fontSize:12, color:theme.subtle, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{label}</div>
                      <div style={{height:10, background:"#f3f4f6", borderRadius:999}}>
                        <div style={{height:10, width:`${ratio*100}%`, background:theme.primary500, borderRadius:999}}/>
                      </div>
                      <div style={{fontSize:12, textAlign:"right"}}>{val}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={card(theme)}>
            <div style={cardHeader(theme)}>14 derniers jours</div>
            {dailySeries.counts.every(v=>v===0) ? (
              <EmptyChart/>
            ) : (
              <LineMini labels={dailySeries.labels} data={dailySeries.counts} max={dailySeries.max} theme={theme}/>
            )}
          </div>

          {/* Donut par statut */}
          <div style={card(theme)}>
            <div style={cardHeader(theme)}>Répartition statuts</div>
            {statusCounts.arr.length === 0 ? (
              <EmptyChart/>
            ) : (
              <Donut data={statusCounts.arr} total={statusCounts.total} theme={theme}/>
            )}
          </div>
        </section>

        {/* -------- PRODUITS -------- */}
        <section id="products" style={section(theme)}>
          <h3 style={sectionTitle()}>Catalogue produits</h3>

          <form onSubmit={onCreate} style={{display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:8, alignItems:"end", marginBottom:12}}>
            <label style={{display:"grid", gap:6}}>
              Code
              <input value={code} onChange={e=>setCode(e.target.value)}
                placeholder="ex: PREV-DEC"
                style={input(theme)}/>
            </label>
            <label style={{display:"grid", gap:6}}>
              Libellé
              <input value={label} onChange={e=>setLabel(e.target.value)}
                placeholder="Prévoyance Décès"
                style={input(theme)}/>
            </label>
            <button disabled={busyCreate} style={primaryBtn(theme)}>
              {busyCreate ? "Ajout…" : "Ajouter"}
            </button>
          </form>

          {err && <div style={alertErr()}>{err}</div>}

          {loading ? (
            <div>Chargement…</div>
          ) : (
            <div style={tableWrap(theme)}>
              <div style={tableHead(theme, "80px 1fr 120px 120px")}>
                <div>ID</div><div>Produit</div><div>Statut</div><div>Actions</div>
              </div>
              {items.map(p => (
                <div key={p.id} style={tableRow("80px 1fr 120px 120px")}>
                  <div>{p.id}</div>
                  <div>
                    <div style={{fontWeight:700}}>{p.label}</div>
                    <div style={{fontSize:12, color:theme.subtle}}>{p.code}</div>
                  </div>
                  <div>
                    <span style={badge(p.active ? "Actif":"Inactif", p.active, theme)}/>
                  </div>
                  <div>
                    <button onClick={()=>onDelete(p)} disabled={busyId===p.id}
                      style={{...dangerBtn(), opacity: busyId===p.id?0.7:1}}>
                      {busyId===p.id ? "Supp…" : "Supprimer"}
                    </button>
                  </div>
                </div>
              ))}
              {items.length===0 && <div style={{padding:12, color:theme.subtle}}>Aucun produit.</div>}
            </div>
          )}
        </section>

        {/* -------- VERSIONS TARIF -------- */}
        <section id="versions" style={section(theme)}>
          <h3 style={sectionTitle()}>Versions tarif</h3>

          <form onSubmit={onCreateVersion} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end", marginBottom:12}}>
            <label style={{display:"grid", gap:6}}>
              Code version
              <input value={vCode} onChange={e=>setVCode(e.target.value)}
                placeholder="ex: 2025.09"
                style={input(theme)}/>
            </label>
            <label style={{display:"grid", gap:6}}>
              Effective from
              <input type="date" value={vFrom} onChange={e=>setVFrom(e.target.value)} style={input(theme)}/>
            </label>
            <label style={{display:"grid", gap:6}}>
              Effective to
              <input type="date" value={vTo} onChange={e=>setVTo(e.target.value)} style={input(theme)}/>
            </label>
            <button disabled={vBusyCreate} style={primaryBtn(theme)}>
              {vBusyCreate ? "Création…" : "Créer"}
            </button>
          </form>

          {vErr && <div style={alertErr()}>{vErr}</div>}

          {vLoading ? (
            <div>Chargement…</div>
          ) : (
            <div style={tableWrap(theme)}>
              <div style={tableHead(theme, "80px 1fr 220px 260px")}>
                <div>ID</div><div>Code</div><div>Validité</div><div>Statut / Action</div>
              </div>
              {versions.map(v => {
                const id = pick(v, ["id"]);
                const code = pick(v, ["versionCode","code"]);
                const isActive = pick(v, ["isActive","active"], "false") === "true";
                const created = pick(v, ["createdAt","created","created_date","createdDate"]);
                const updated = pick(v, ["updatedAt","updated","lastModified","modifiedDate"]);
                const from = pick(v, ["effectiveFrom","from"]);
                const to = pick(v, ["effectiveTo","to"]);
                return (
                  <div key={String(id)} style={tableRow("80px 1fr 220px 260px")}>
                    <div>{id}</div>
                    <div>{code}</div>
                    <div style={{fontSize:12, color:theme.subtle}}>{from || "-"}{to ? ` → ${to}` : ""}</div>
                    <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
                      <span style={badge(isActive ? "Active":"Inactive", isActive, theme)}/>
                      {!isActive && (
                        <button onClick={()=>onActivateVersion(id)} disabled={vBusyId===id}
                          style={{...successBtn(theme), opacity: vBusyId===id?0.7:1}}>
                          {vBusyId===id ? "Activation…" : "Activer"}
                        </button>
                      )}
                      <span style={{fontSize:12, color:theme.subtle}}>{created || "-"}{updated ? ` / ${updated}` : ""}</span>
                    </div>
                  </div>
                );
              })}
              {versions.length===0 && <div style={{padding:12, color:theme.subtle}}>Aucune version.</div>}
            </div>
          )}
        </section>

        {/* -------- SOUSCRIPTIONS -------- */}
        <section id="subs" style={section(theme)}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h3 style={sectionTitle()}>Souscriptions</h3>
            <div style={{display:"flex", gap:8}}>
              <button onClick={loadSubs} style={ghostBtn(theme)}>Rafraîchir</button>
              <button onClick={()=>exportCsv(filteredSubs)} style={primaryBtn(theme)}>Export CSV</button>
            </div>
          </div>

          {/* Filtres */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:12}}>
            <label style={{display:"grid", gap:6}}>
              Produit
              <select value={qProduct} onChange={e=>setQProduct(e.target.value)} style={input(theme)}>
                <option value="">Tous</option>
                {Array.from(new Set(subs.map(s => s.productCode).filter(Boolean))).map((pc, i) => (
                  <option key={i} value={pc as string}>{pc}</option>
                ))}
              </select>
            </label>
            <label style={{display:"grid", gap:6}}>
              Statut
              <select value={qStatus} onChange={e=>setQStatus(e.target.value)} style={input(theme)}>
                <option value="">Tous</option>
                {Array.from(new Set(subs.map(s => (s.status || "").toUpperCase()).filter(Boolean))).map((st, i)=>(
                  <option key={i} value={st}>{st}</option>
                ))}
              </select>
            </label>
            <label style={{display:"grid", gap:6}}>
              Du
              <input type="date" value={qFrom} onChange={e=>setQFrom(e.target.value)} style={input(theme)}/>
            </label>
            <label style={{display:"grid", gap:6}}>
              Au
              <input type="date" value={qTo} onChange={e=>setQTo(e.target.value)} style={input(theme)}/>
            </label>
          </div>

          {sErr && <div style={alertErr()}>{sErr}</div>}

          {sLoading ? (
            <div>Chargement…</div>
          ) : (
            <div style={tableWrap(theme)}>
              <div style={tableHead(theme, "80px 1fr 1fr 120px 160px 110px 140px")}>
                <div>ID</div>
                <div>Client</div>
                <div>Produit / Version</div>
                <div>Période</div>
                <div>Contact</div>
                <div>Prime TTC</div>
                <div>Créé le</div>
              </div>

              {filteredSubs.map(s => (
                <div key={s.id} style={tableRow("80px 1fr 1fr 120px 160px 110px 140px")}>
                  <div>{s.id}</div>
                  <div>
                    <div style={{fontWeight:700}}>{[s.civilite, s.prenom, s.nom].filter(Boolean).join(" ") || "-"}</div>
                    <div style={{fontSize:12, color:theme.subtle}}>{s.birthDate || "-"}</div>
                  </div>
                  <div>
                    <div style={{fontWeight:700}}>{s.productCode || "-"}</div>
                    <div style={{fontSize:12, color:theme.subtle}}>{s.versionCode || "-"}</div>
                  </div>
                  <div style={{fontSize:12, color:"#374151"}}>
                    {s.dateEffet || "-"}<br/>{s.periodicite || "-"}
                  </div>
                  <div style={{fontSize:12, color:"#374151"}}>
                    {[s.email, s.tel].filter(Boolean).join(" / ") || "-"}<br/>
                    {[s.cp, s.ville].filter(Boolean).join(" ") || ""}
                  </div>
                  <div style={{fontWeight:800}}>{fmtMoney(s.primeTTC, s.currency)}</div>
                  <div style={{fontSize:12, color:theme.subtle}}>{fmtDate(s.createdAt)}</div>

                  {/* Actions + détails */}
                  <div style={{gridColumn:"1 / -1", paddingTop:8, display:"flex", gap:8, flexWrap:"wrap"}}>
                    <button onClick={()=>downloadPdf(s.id)} style={ghostBtn(theme)}>Télécharger le PDF</button>
                    <button
                      onClick={async ()=>{
                        try {
                          const r = await apiFetch(`/admin/subscriptions/${s.id}/resend-email`, { method: "POST" });
                          if (!r.ok) throw new Error(`HTTP ${r.status}`);
                          alert("Email renvoyé ✅");
                        } catch(e:any) {
                          alert(e.message || "Erreur renvoi email");
                        }
                      }}
                      style={ghostBtn(theme)}
                    >
                      Renvoyer l’email
                    </button>
                    <details>
                      <summary style={{cursor:"pointer", color:theme.subtle}}>Voir détails JSON (req / res)</summary>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:8}}>
                        <pre style={preBox()}>{formatJson(s.reqJson)}</pre>
                        <pre style={preBox()}>{formatJson(s.resJson)}</pre>
                      </div>
                    </details>
                  </div>
                </div>
              ))}

              {filteredSubs.length===0 && <div style={{padding:12, color:theme.subtle}}>Aucune souscription.</div>}
            </div>
          )}
        </section>

        <div id="params" />
      </main>
    </div>
  );
}

function navItemStyle(theme: any, active: boolean): React.CSSProperties {
  return {
    display:"block",
    padding:"10px 12px",
    borderRadius:10,
    color: active ? theme.primary600 : theme.text,
    background: active ? theme.primary100 : "transparent",
    border:`1px solid ${active ? theme.primary100 : "transparent"}`
  };
}

function section(theme:any): React.CSSProperties {
  return { border:`1px solid ${theme.border}`, borderRadius:14, background:"#fff", padding:16, marginBottom:16 };
}
function sectionTitle(): React.CSSProperties {
  return { fontSize:18, fontWeight:800, margin:"0 0 12px 0" };
}
function input(theme:any): React.CSSProperties {
  return { padding:10, border:`1px solid ${theme.border}`, borderRadius:10, background:"#fff" };
}
function primaryBtn(theme:any): React.CSSProperties {
  return { padding:"10px 12px", borderRadius:10, background:theme.primary500, color:"#fff", border:`1px solid ${theme.primary600}` };
}
function ghostBtn(theme:any): React.CSSProperties {
  return { padding:"8px 10px", borderRadius:10, border:`1px solid ${theme.border}`, background:"#fff" };
}
function successBtn(theme:any): React.CSSProperties {
  return { padding:"6px 10px", borderRadius:8, border:"none", background:"#10b981", color:"#fff" };
}
function dangerBtn(): React.CSSProperties {
  return { background:"#ef4444", color:"#fff", padding:"8px 12px", borderRadius:10, border:"none" };
}
function alertErr(): React.CSSProperties {
  return { color:"#b91c1c", background:"#fee2e2", padding:10, borderRadius:10, marginBottom:10 };
}
function tableWrap(theme:any): React.CSSProperties {
  return { border:`1px solid ${theme.border}`, borderRadius:12, overflow:"hidden", background:"#fff" };
}
function tableHead(theme:any, cols:string): React.CSSProperties {
  return { display:"grid", gridTemplateColumns: cols, background: theme.primary50, padding:"10px 12px", fontWeight:700, borderBottom:`1px solid ${theme.border}` };
}
function tableRow(cols:string): React.CSSProperties {
  return { display:"grid", gridTemplateColumns: cols, padding:"10px 12px", borderTop:"1px solid #f1f5f9", alignItems:"center" };
}
function badge(text:string, active:boolean, theme:any): React.CSSProperties {
  return {
    display:"inline-flex", alignItems:"center", gap:6, padding:"2px 8px",
    borderRadius:999, fontSize:12,
    background: active ? "#ecfeff" : "#f3f4f6",
    color: active ? "#0e7490" : theme.subtle,
    border:`1px solid ${theme.border}`
  } as any;
}
function card(theme:any): React.CSSProperties {
  return { background:"#fff", border:`1px solid ${theme.border}`, borderRadius:14, overflow:"hidden" };
}
function cardHeader(theme:any): React.CSSProperties {
  return { padding:"10px 12px", borderBottom:`1px solid ${theme.border}`, fontWeight:800, background: theme.primary50 };
}
function preBox(): React.CSSProperties {
  return { background:"#f9fafb", padding:10, borderRadius:8, overflow:"auto", maxHeight:220, fontSize:12 };
}
function KpiCard({title, value, theme}:{title:string; value:string; theme:any}) {
  return (
    <div style={{background:"#fff", border:`1px solid ${theme.border}`, borderRadius:12, padding:16}}>
      <div style={{fontSize:12, color:"#6b7280"}}>{title}</div>
      <div style={{fontSize:26, fontWeight:800}}>{value}</div>
    </div>
  );
}
function EmptyChart() {
  return <div style={{padding:16, color:"#9ca3af"}}>Pas de données suffisantes.</div>;
}

/* ---- Mini line chart (SVG) ---- */
function LineMini({labels, data, max, theme}:{labels:string[]; data:number[]; max:number; theme:any}) {
  const w = 320, h = 120, pad = 16;
  const stepX = (w - pad*2) / Math.max(1, data.length - 1);
  const scaleY = (v:number) => h - pad - (v / max) * (h - pad*2);
  const points = data.map((v,i)=>`${pad + i*stepX},${scaleY(v)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      <rect x="0" y="0" width={w} height={h} fill="#ffffff"/>
      <polyline points={points} fill="none" stroke={theme.primary500} strokeWidth={2}/>
      {/* dots */}
      {data.map((v,i)=>(
        <circle key={i} cx={pad + i*stepX} cy={scaleY(v)} r={2.5} fill={theme.primary600}/>
      ))}
      <text x={pad} y={h-6} fill="#9ca3af" fontSize="10">
        {labels[0]?.slice(5)}
      </text>
      <text x={w-pad-36} y={h-6} fill="#9ca3af" fontSize="10" textAnchor="end">
        {labels[labels.length-1]?.slice(5)}
      </text>
    </svg>
  );
}

/* Donut chart */
function Donut({data, total, theme}:{data:[string,number][], total:number, theme:any}) {
  const size = 140; const r = 54; const cx = 75; const cy = 75;
  const circ = 2 * Math.PI * r;
  const palette = [theme.primary500, "#fb7185", "#60a5fa", "#10b981", "#f59e0b", "#a78bfa"];
  let offset = 0;
  return (
    <div style={{display:"grid", gridTemplateColumns:"160px 1fr", gap:8, alignItems:"center", padding:"8px 12px"}}>
      <svg width={150} height={150}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={14}/>
        {data.map(([label, val], i) => {
          const frac = val / total;
          const len = circ * frac;
          const dash = `${len} ${circ-len}`;
          const el = (
            <circle key={i}
              cx={cx} cy={cy} r={r}
              fill="none" stroke={palette[i % palette.length]} strokeWidth={14}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              style={{transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px`}}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div style={{display:"grid", gap:6}}>
        {data.map(([label, val], i)=>(
          <div key={i} style={{display:"flex", alignItems:"center", gap:8, fontSize:12}}>
            <span style={{width:10,height:10, borderRadius:2, background:["#fff", ...Array(6)].map((_,k)=>k)[0] ? undefined : undefined,
              backgroundColor: ["#fff",
                "#fb7185","#60a5fa","#10b981","#f59e0b","#a78bfa"
              ][0]}}/>
            <div style={{width:10, height:10, borderRadius:2, background: ["", theme.primary500, "#fb7185", "#60a5fa", "#10b981", "#f59e0b", "#a78bfa"][i+1] }}/>
            <div style={{flex:1}}>{label}</div>
            <div style={{fontWeight:700}}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* helpers locaux */
function formatJson(s?: string) {
  if (!s) return "-";
  try { return JSON.stringify(JSON.parse(s), null, 2); }
  catch { return s; }
}
