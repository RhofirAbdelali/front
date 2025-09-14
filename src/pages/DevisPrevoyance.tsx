import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function DevisPrevoyance() {
  const PINK = "#db2777";
  const GREY = "#e5e7eb";
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const productCode = sp.get("product") || "PREV-DEC";

  const productLabel = useMemo(() => {
    const map: Record<string, string> = {
      "PREV-DEC": "Prévoyance Décès",
      "PREV-OBSEQUES": "Obsèques",
      "PREV-IJ": "Indemnités Journalières",
      "PREV-INVAL": "Invalidité",
      "PREV-ACC": "Accidents de la vie",
      "PREV-FAMILLE": "Protection famille",
    };
    return map[productCode] || "Prévoyance";
  }, [productCode]);

  const [civilite, setCivilite] = useState<"Madame" | "Monsieur" | "">("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [naissance, setNaissance] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [cp, setCp] = useState("");
  const [ville, setVille] = useState("");
  const [optinEmail, setOptinEmail] = useState(false);
  const [optinSms, setOptinSms] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!civilite || !nom.trim() || !prenom.trim() || !naissance || !email.trim() || !cp.trim() || !ville.trim()) {
      setErr("Merci de compléter les champs obligatoires.");
      return;
    }
    const lead = { civilite, nom, prenom, naissance, tel, email, cp, ville, optinEmail, optinSms, productCode };
    try { localStorage.setItem("lead_prevoyance", JSON.stringify(lead)); } catch {}
    nav(`/estimation?product=${encodeURIComponent(productCode)}`, { state: { prefillLead: lead } });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header style={{ position: "sticky", top: 0, background: "#fff", borderBottom: `1px solid ${GREY}`, zIndex: 10 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ fontWeight: 900, color: "#111827", textDecoration: "none" }}>Selfassurance</Link>
          <nav style={{ display: "flex", gap: 16 }}>
            <Link to="/prevoyance" style={{ color: "#4b5563", textDecoration: "none" }}>Prévoyance</Link>
            <Link to="/login" style={{ background: PINK, color: "#fff", padding: "8px 12px", borderRadius: 10, textDecoration: "none" }}>Espace admin</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "24px auto 56px", padding: "0 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 4px" }}>Demande de devis — {productLabel}</h1>
        <p style={{ color: "#374151", marginTop: 0 }}>Les champs marqués d’un astérisque (*) sont obligatoires.</p>

        {err && <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", padding: 10, borderRadius: 10, marginBottom: 12 }}>{err}</div>}

        <form onSubmit={onSubmit} noValidate>
          <fieldset style={{ border: "none", padding: 0, margin: 0, marginBottom: 12 }}>
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

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Nom *</span>
              <input value={nom} onChange={e => setNom(e.target.value)} required
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Prénom *</span>
              <input value={prenom} onChange={e => setPrenom(e.target.value)} required
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Date de naissance *</span>
              <input type="date" value={naissance} onChange={e => setNaissance(e.target.value)} required
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Téléphone</span>
              <input type="tel" value={tel} onChange={e => setTel(e.target.value)} pattern="[0-9]{10,12}" placeholder="06XXXXXXXX"
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>E-mail *</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Code postal *</span>
              <input value={cp} onChange={e => setCp(e.target.value)} required pattern="[0-9]{4,5}" maxLength={5}
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Ville *</span>
              <input value={ville} onChange={e => setVille(e.target.value)} required
                style={{ padding: 10, border: `1px solid ${GREY}`, borderRadius: 10 }} />
            </label>
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={optinEmail} onChange={e => setOptinEmail(e.target.checked)} />
              J’accepte de recevoir par email les offres et services Selfassurance.
            </label>
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={optinSms} onChange={e => setOptinSms(e.target.checked)} />
              J’accepte de recevoir par SMS les offres et services Selfassurance.
            </label>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button type="submit"
              style={{ background: PINK, color: "#fff", padding: "10px 14px", border: `1px solid ${PINK}`, borderRadius: 10 }}>
              Je souhaite un devis gratuit
            </button>
            <Link to="/prevoyance" style={{ padding: "10px 14px", border: `1px solid ${GREY}`, borderRadius: 10, textDecoration: "none", color: "#111827" }}>
              Retour
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
