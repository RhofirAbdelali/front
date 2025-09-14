import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type DevisReq = {
  productCode: string;
  versionCode: string;
  birthDate: string;
  capital: number;
  smoker: "OUI" | "NON";
  couverture?: "BASIQUE" | "INTERMEDIAIRE" | "TOUT_RISQUE";
  niveauProtection?: "BAS" | "MOYEN" | "HAUT";
  indemniteJournaliere?: number;
  franchiseJours?: number;
  assureActuel?: boolean;
  beneficiaire?: "CONJOINT" | "COUPLE" | "ENFANTS" | "LIBRE";
  statutPro?: "SALARIE" | "INDEPENDANT" | "ETUDIANT" | "RETRAITE" | "AUTRE";
  professionCategory?: string;
};

type DevisRes = {
  primeNette?: number;
  frais?: number;
  taxe?: number;
  primeTTC?: number;
  currency?: string;
  versionTarif?: string;
};

export default function Estimation() {
  const PINK = "#db2777";
  const GREY = "#e5e7eb";
  const authed = !!localStorage.getItem("token");
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const loc = useLocation();

  const PRODUCTS: { code: string; label: string }[] = [
    { code: "PREV-DEC-IND", label: "Prévoyance Décès (IND)" },
    { code: "PREV-OBSEQUES", label: "Obsèques" },
    { code: "PREV-IJ", label: "Indemnités Journalières" },
    { code: "PREV-INVAL", label: "Invalidité" },
    { code: "PREV-ACC", label: "Accidents de la vie" },
    { code: "PREV-FAMILLE", label: "Protection famille" },
  ];

  const productParam = (sp.get("product") || "PREV-DEC").toUpperCase();

  const normalizedProduct = useMemo(() => {
    if (productParam === "PREV-DEC") return "PREV-DEC-IND";

    const known = new Set(PRODUCTS.map(p => p.code));
    return known.has(productParam) ? productParam : "PREV-DEC-IND";
  }, [productParam]);


  const versionFromEnv = (import.meta.env.VITE_TARIFF_VERSION as string) || "2025.07";

  const prefillLead = (loc.state as any)?.prefillLead || readLead();

  // ---- STEP control
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as any) : s));
  const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as any) : s));

  // ---- Besoins
  const [productCode, setProductCode] = useState(normalizedProduct);
  const [versionCode, setVersionCode] = useState(versionFromEnv);
  const [capital, setCapital] = useState<number>(100000);
  const [couverture, setCouverture] = useState<DevisReq["couverture"]>("TOUT_RISQUE");
  const [niveauProtection, setNiveauProtection] = useState<DevisReq["niveauProtection"]>("MOYEN");

  // ---- Situation
  const [birthDate, setBirthDate] = useState<string>((prefillLead?.naissance as string) || "");
  const [smoker, setSmoker] = useState<"OUI" | "NON">("NON");
  const [indemniteJournaliere, setIndemniteJournaliere] = useState<number>(30);
  const [franchiseJours, setFranchiseJours] = useState<number>(30);
  const [assureActuel, setAssureActuel] = useState<boolean>(false);
  const [beneficiaire, setBeneficiaire] = useState<DevisReq["beneficiaire"]>("COUPLE");
  const [statutPro, setStatutPro] = useState<DevisReq["statutPro"]>("SALARIE");
  const [professionCategory, setProfessionCategory] = useState<string>("");

  // ---- Coordonnées
  const [civilite, setCivilite] = useState<"Madame" | "Monsieur" | "">(
    prefillLead?.civilite || ""
  );
  const [nom, setNom] = useState<string>(prefillLead?.nom || "");
  const [prenom, setPrenom] = useState<string>(prefillLead?.prenom || "");
  const [email, setEmail] = useState<string>(prefillLead?.email || "");
  const [tel, setTel] = useState<string>(prefillLead?.tel || "");
  const [cp, setCp] = useState<string>(prefillLead?.cp || "");
  const [ville, setVille] = useState<string>(prefillLead?.ville || "");

  // ---- Résultat
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<DevisRes | null>(null);

  useEffect(() => {
    try {
      const lead = { civilite, nom, prenom, naissance: birthDate, tel, email, cp, ville };
      localStorage.setItem("lead_prevoyance", JSON.stringify(lead));
    } catch {}
  }, [civilite, nom, prenom, birthDate, tel, email, cp, ville]);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch("/tariff-versions/active");
        if (!r.ok) return;
        const data = await r.json();
        const v = data?.versionCode || data?.code;
        if (v) setVersionCode(String(v));
      } catch {
      }
    })();
  }, []);


  function buildRequest(): DevisReq {
    return {
      productCode: productCode,
      versionCode: versionCode,
      birthDate,
      capital: Number(capital) || 0,
      smoker,
      couverture,
      niveauProtection,
      indemniteJournaliere: Number(indemniteJournaliere) || 0,
      franchiseJours: Number(franchiseJours) || 0,
      assureActuel: Boolean(assureActuel),
      beneficiaire,
      statutPro,
      professionCategory: professionCategory || undefined,
    };
  }

  async function onEstimate(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!birthDate || !capital) {
      setErr("Merci de renseigner au minimum la date de naissance et le capital.");
      setStep(1);
      return;
    }
    setErr(null);
    setLoading(true);
    setRes(null);
    try {
      const body = buildRequest();
      const r = await apiFetch("/tariffs/devis", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: DevisRes = await r.json();
      setRes(data || {});
      setStep(4);
    } catch (e: any) {
      setErr(e.message || "Erreur de calcul");
    } finally {
      setLoading(false);
    }
  }

  async function onDownloadPdf() {
    if (!res) return;
    try {
      setLoading(true);
      const req = buildRequest();
      const r = await apiFetch(`/tariffs/devis/pdf`, {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis_${productCode}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message || "Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  }
  function goSubscribe() {
    const req = buildRequest();
    const person = { civilite, nom, prenom, birthDate, email, tel, cp, ville };
    nav(`/souscription?product=${encodeURIComponent(productCode)}`, { state: { req, res, person } });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: `1px solid ${GREY}`,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img
              src="https://assurance-animaux.selfassurance.fr/devis/application/views/assets/media/selfassurancelogo.svg"
              alt="Selfassurance"
              style={{ height: 36 }}
            />
          </Link>

          {/* Nav + bouton à droite */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link
              to="/prevoyance"
              style={{
                color: "#374151",
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
                transition: "opacity 120ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Produits
            </Link>

            <Link
              to="/estimation"
              style={{
                color: "#374151",
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
                transition: "opacity 120ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Estimation
            </Link>

            {authed ? (
              <Link
                to="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 10,
                  background: PINK,
                  color: "#fff",
                  border: `1px solid ${PINK}`,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  transition: "transform 120ms ease, opacity 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.95";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Espace admin
              </Link>
            ) : (
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 10,
                  background: "#fff",
                  color: PINK,
                  border: `1px solid ${PINK}`,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  transition: "transform 120ms ease, opacity 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.95";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: "20px auto 56px", padding: "0 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 16px" }}>Estimation — Prévoyance</h1>

        {/* Stepper */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {["Besoins", "Situation", "Coordonnées", "Tarif"].map((label, i) => {
            const active = step === (i + 1);
            const done = step > (i + 1);
            return (
              <div key={label} style={{
                border: `1px solid ${done || active ? PINK : GREY}`,
                background: done ? "#fdf2f8" : active ? "#fff0f6" : "#fff",
                color: done || active ? "#111827" : "#6b7280",
                borderRadius: 12, padding: "10px 12px", textAlign: "center", fontWeight: 800
              }}>
                {i + 1}. {label}
              </div>
            );
          })}
        </div>

        {err && <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", padding: 10, borderRadius: 10, marginBottom: 12 }}>{err}</div>}

        {/* STEP 1 — Besoins */}
        {step === 1 && (
          <form onSubmit={(e)=>{e.preventDefault(); goNext();}}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Produit</span>
                <select
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}
                >
                  {PRODUCTS.map(p => (
                    <option key={p.code} value={p.code}>{p.label}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Version tarifaire</span>
                <input value={versionCode} readOnly
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10, background:"#f9fafb" }} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Capital décès</span>
                <input type="number" min={1000} step={1000} value={capital} onChange={e => setCapital(Number(e.target.value))}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Couverture</span>
                <select value={couverture} onChange={e => setCouverture(e.target.value as any)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="BASIQUE">Basique</option>
                  <option value="INTERMEDIAIRE">Intermédiaire</option>
                  <option value="TOUT_RISQUE">Tout risque</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Niveau de protection</span>
                <select value={niveauProtection} onChange={e => setNiveauProtection(e.target.value as any)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="BAS">Bas</option>
                  <option value="MOYEN">Moyen</option>
                  <option value="HAUT">Haut</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button type="submit"
                style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                Continuer
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 — Situation */}
        {step === 2 && (
          <form onSubmit={(e)=>{e.preventDefault(); goNext();}}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Date de naissance</span>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Fumeur</span>
                <select value={smoker} onChange={e => setSmoker(e.target.value as any)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="NON">Non</option>
                  <option value="OUI">Oui</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Indemnités journalières (€ / jour)</span>
                <input type="number" min={0} step={5} value={indemniteJournaliere}
                  onChange={e => setIndemniteJournaliere(Number(e.target.value))}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Franchise (jours)</span>
                <input type="number" min={0} step={1} value={franchiseJours}
                  onChange={e => setFranchiseJours(Number(e.target.value))}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Déjà assuré ?</span>
                <select value={assureActuel ? "true" : "false"} onChange={e => setAssureActuel(e.target.value === "true")}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Bénéficiaire</span>
                <select value={beneficiaire} onChange={e => setBeneficiaire(e.target.value as any)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="COUPLE">Couple</option>
                  <option value="CONJOINT">Conjoint</option>
                  <option value="ENFANTS">Enfants</option>
                  <option value="LIBRE">Désignation libre</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Statut professionnel</span>
                <select value={statutPro} onChange={e => setStatutPro(e.target.value as any)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="SALARIE">Salarié</option>
                  <option value="INDEPENDANT">Indépendant</option>
                  <option value="ETUDIANT">Étudiant</option>
                  <option value="RETRAITE">Retraité</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Profession (optionnel)</span>
                <input value={professionCategory} onChange={e => setProfessionCategory(e.target.value)}
                  placeholder="ex: Ingénieur"
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button type="button" onClick={goPrev}
                style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                Retour
              </button>
              <button type="submit"
                style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                Continuer
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 — Coordonnées */}
        {step === 3 && (
          <form onSubmit={(e)=>{e.preventDefault(); onEstimate();}}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 800, marginBottom: 6 }}>Civilité</legend>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="civilite" value="Madame" checked={civilite === "Madame"} onChange={() => setCivilite("Madame")} />
                    Mme
                  </label>
                  <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="civilite" value="Monsieur" checked={civilite === "Monsieur"} onChange={() => setCivilite("Monsieur")} />
                    M.
                  </label>
                </div>
              </fieldset>

              <span />

              <label style={{ display: "grid", gap: 6 }}>
                <span>Nom</span>
                <input value={nom} onChange={e => setNom(e.target.value)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Prénom</span>
                <input value={prenom} onChange={e => setPrenom(e.target.value)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>E-mail</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Téléphone</span>
                <input type="tel" value={tel} onChange={e => setTel(e.target.value)} placeholder="06XXXXXXXX" pattern="[0-9]{10,12}"
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Code postal</span>
                <input value={cp} onChange={e => setCp(e.target.value)} maxLength={5} pattern="[0-9]{4,5}"
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Ville</span>
                <input value={ville} onChange={e => setVille(e.target.value)}
                  style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button type="button" onClick={goPrev}
                style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                Retour
              </button>
              <button type="submit" disabled={loading}
                style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                {loading ? "Calcul…" : "Calculer mon tarif"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4 — Tarif */}
        {step === 4 && (
          <div style={{ border: `1px solid ${GREY}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>Résultat de l’estimation</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <KV k="Prime nette" v={fmtMoney(res?.primeNette, res?.currency)} />
              <KV k="Frais" v={fmtMoney(res?.frais, res?.currency)} />
              <KV k="Taxe" v={fmtMoney(res?.taxe, res?.currency)} />
              <KV k="Prime TTC" v={fmtMoney(res?.primeTTC, res?.currency)} />
              <KV k="Version tarif appliquée" v={res?.versionTarif || "-"} />
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap:"wrap" }}>
              <button onClick={onDownloadPdf} disabled={loading}
                style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                {loading ? "Génération…" : "Télécharger le PDF"}
              </button>
              <button onClick={goSubscribe}
                style={{ background: "#111827", color: "#fff", padding: "10px 14px", border: `1px solid #111827`, borderRadius: 10 }}>
                Souscrire maintenant
              </button>
              <button onClick={()=>nav("/prevoyance")}
                style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                Retour aux produits
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Helpers */
function readLead() {
  try { return JSON.parse(localStorage.getItem("lead_prevoyance") || "null"); } catch { return null; }
}
function fmtMoney(v?: number, ccy?: string) {
  if (v == null) return "-";
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: ccy || "EUR" }).format(v); }
  catch { return `${v} ${ccy || "EUR"}`; }
}
function KV({k, v}:{k:string; v:any}) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, alignItems:"center" }}>
      <div style={{ color:"#6b7280" }}>{k}</div>
      <div style={{ fontWeight:800 }}>{String(v)}</div>
    </div>
  );
}
