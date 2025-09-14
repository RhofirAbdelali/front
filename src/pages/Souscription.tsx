import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function Souscription() {
  const PINK = "#db2777";
  const GREY = "#e5e7eb";
  const authed = !!localStorage.getItem("token");
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();

  const productCode = sp.get("product") || (loc.state as any)?.req?.productCode || "PREV-DEC-IND";
  const reqFromEstimation = (loc.state as any)?.req || null;
  const resFromEstimation = (loc.state as any)?.res || null;
  const person = (loc.state as any)?.person || {};

  const productLabel = useMemo(() => {
    const map: Record<string, string> = {
      "PREV-DEC-IND": "Prévoyance Décès (IND)",
      "PREV-DEC": "Prévoyance Décès",
      "PREV-OBSEQUES": "Obsèques",
      "PREV-IJ": "Indemnités Journalières",
    };
    return map[productCode] || productCode;
  }, [productCode]);

  // Stepper
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const next = () => setStep(s => (s < 4 ? ((s + 1) as any) : s));
  const prev = () => setStep(s => (s > 1 ? ((s - 1) as any) : s));

  // Étape 1 — Identité
  const [civilite, setCivilite] = useState<"Madame" | "Monsieur" | "">(
    person.civilite || ""
  );
  const [nom, setNom] = useState<string>(person.nom || "");
  const [prenom, setPrenom] = useState<string>(person.prenom || "");
  const [birthDate, setBirthDate] = useState<string>(person.birthDate || "");
  const [email, setEmail] = useState<string>(person.email || "");
  const [tel, setTel] = useState<string>(person.tel || "");
  const [cp, setCp] = useState<string>(person.cp || "");
  const [ville, setVille] = useState<string>(person.ville || "");

  // Étape 2 — Contrat
  const today = new Date();
  const plus2 = new Date(today.getTime() + 2 * 24 * 3600 * 1000);
  const defStart = plus2.toISOString().slice(0, 10);
  const [dateEffet, setDateEffet] = useState(defStart);
  const [periodicite, setPeriodicite] = useState<"MENSUELLE" | "ANNUELLE">("MENSUELLE");
  const [iban, setIban] = useState("");

  // Étape 3 — Finalisation
  const [accept1, setAccept1] = useState(false); // conditions
  const [accept2, setAccept2] = useState(false); // information exacte

  // Étape 4 — Signature
  const [signature, setSignature] = useState("");
  const [signed, setSigned] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onIdentite(e: FormEvent) {
    e.preventDefault();
    if (!civilite || !nom.trim() || !prenom.trim() || !birthDate || !email.trim()) {
      setErr("Merci de compléter les champs obligatoires.");
      return;
    }
    setErr(null);
    next();
  }

  function onContrat(e: FormEvent) {
    e.preventDefault();
    if (!dateEffet || !periodicite) {
      setErr("Sélectionnez une date d’effet et la périodicité.");
      return;
    }
    if (iban && !/^([A-Z]{2}\d{2}[A-Z0-9]{1,30})$/.test(iban.replaceAll(" ", "").toUpperCase())) {
      setErr("IBAN invalide (ex: FR76…)");
      return;
    }
    setErr(null);
    next();
  }

  function onFinalisation(e: FormEvent) {
    e.preventDefault();
    if (!accept1 || !accept2) {
      setErr("Merci de cocher les confirmations requises.");
      return;
    }
    setErr(null);
    next();
  }

  async function downloadDevisPdf() {
    if (!reqFromEstimation) return;
    try {
      setLoading(true);
      const r = await apiFetch(`/tariffs/devis/pdf`, {
        method: "POST",
        body: JSON.stringify(reqFromEstimation),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis_${productCode}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message || "Erreur téléchargement PDF");
    } finally {
      setLoading(false);
    }
  }

  function buildPayload() {
    const req = (loc.state as any)?.req || null;
    const res = (loc.state as any)?.res || null;
    return {
      productCode: req?.productCode || productCode,
      versionCode: req?.versionCode || null,

      civilite, nom, prenom,
      birthDate,
      email, tel, cp, ville,

      dateEffet,
      periodicite,
      iban,

      primeNette: res?.primeNette ?? null,
      frais: res?.frais ?? null,
      taxe: res?.taxe ?? null,
      primeTTC: res?.primeTTC ?? null,
      currency: res?.currency ?? "EUR",

      reqJson: JSON.stringify(req || {}),
      resJson: JSON.stringify(res || {}),
      status: "SIGNED",
      signature
    };
  }

  async function onSigner(e: FormEvent) {
    e.preventDefault();
    if (!signature.trim()) { setErr("Merci de renseigner votre nom en guise de signature."); return; }
    setErr(null);
    try {
      setLoading(true);
      const payload = buildPayload();
      const r = await apiFetch("/subscriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setSigned(true);
    } catch (ex: any) {
      setErr(ex.message || "Erreur enregistrement souscription");
    } finally {
      setLoading(false);
    }
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
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 16px" }}>Souscription — {productLabel}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {["Identité", "Contrat", "Finalisation", "Signature"].map((label, i) => {
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

        {step === 1 && (
          <form onSubmit={onIdentite}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 800, marginBottom: 6 }}>Civilité *</legend>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="civilite" value="Madame" checked={civilite === "Madame"} onChange={() => setCivilite("Madame")} required />
                    Mme
                  </label>
                  <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="civilite" value="Monsieur" checked={civilite === "Monsieur"} onChange={() => setCivilite("Monsieur")} required />
                    M.
                  </label>
                </div>
              </fieldset>
              <span />
              <label style={{ display: "grid", gap: 6 }}>
                <span>Nom *</span>
                <input value={nom} onChange={e => setNom(e.target.value)} required style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Prénom *</span>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} required style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Date de naissance *</span>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>E-mail *</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Téléphone</span>
                <input type="tel" value={tel} onChange={e => setTel(e.target.value)} pattern="[0-9]{10,12}" placeholder="06XXXXXXXX" style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Code postal</span>
                <input value={cp} onChange={e => setCp(e.target.value)} maxLength={5} pattern="[0-9]{4,5}" style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Ville</span>
                <input value={ville} onChange={e => setVille(e.target.value)} style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button type="submit" style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                Continuer
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={onContrat}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Date d’effet *</span>
                <input type="date" value={dateEffet} onChange={e => setDateEffet(e.target.value)} required style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Périodicité *</span>
                <select value={periodicite} onChange={e => setPeriodicite(e.target.value as any)} style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }}>
                  <option value="MENSUELLE">Mensuelle</option>
                  <option value="ANNUELLE">Annuelle</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>IBAN (optionnel)</span>
                <input value={iban} onChange={e => setIban(e.target.value)} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
              </label>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button type="button" onClick={prev} style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                Retour
              </button>
              <button type="submit" style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                Continuer
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={onFinalisation}>
            <div style={{ border: `1px solid ${GREY}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Récapitulatif</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <KV k="Produit" v={productLabel} />
                <KV k="Date d’effet" v={dateEffet} />
                <KV k="Périodicité" v={periodicite === "MENSUELLE" ? "Mensuelle" : "Annuelle"} />
                <KV k="Souscripteur" v={`${civilite || ""} ${prenom || ""} ${nom || ""}`.trim()} />
                <KV k="Naissance" v={birthDate || "-"} />
                <KV k="Contact" v={[email, tel].filter(Boolean).join(" / ") || "-"} />
                {resFromEstimation?.primeTTC != null && (
                  <KV k="Prime TTC" v={fmtMoney(resFromEstimation.primeTTC, resFromEstimation.currency)} />
                )}
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={accept1} onChange={e => setAccept1(e.target.checked)} />
                J’accepte les conditions générales et la politique de confidentialité.
              </label>
              <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={accept2} onChange={e => setAccept2(e.target.checked)} />
                Je certifie l’exactitude des informations fournies.
              </label>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button type="button" onClick={prev} style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                Retour
              </button>
              <button type="submit" style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                Continuer
              </button>
              <button type="button" onClick={downloadDevisPdf} disabled={loading || !reqFromEstimation}
                style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                {loading ? "Téléchargement…" : "Télécharger le devis"}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={onSigner}>
            <div style={{ border: `1px solid ${GREY}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Signature</div>
              {!signed ? (
                <>
                  <p style={{ color: "#374151", marginTop: 0 }}>
                    Saisissez votre nom et prénom pour signer électroniquement la souscription.
                  </p>
                  <label style={{ display: "grid", gap: 6, maxWidth: 420 }}>
                    <span>Nom et prénom *</span>
                    <input value={signature} onChange={e => setSignature(e.target.value)} required
                      placeholder="Ex: Jean Dupont"
                      style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
                  </label>
                  <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                    <button type="button" onClick={prev} style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                      Retour
                    </button>
                    <button type="submit" style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                      Signer
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: "#ecfdf5", border: "1px solid #d1fae5", color: "#065f46", padding: 12, borderRadius: 10 }}>
                    ✅ Souscription signée par <strong>{signature}</strong>. Un conseiller vous contactera si nécessaire.
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                    <button type="button" onClick={()=>nav("/prevoyance")}
                      style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, background: "#fff" }}>
                      Retour aux produits
                    </button>
                    <button type="button" onClick={downloadDevisPdf} disabled={loading || !reqFromEstimation}
                      style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
                      {loading ? "Téléchargement…" : "Télécharger le devis PDF"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
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
