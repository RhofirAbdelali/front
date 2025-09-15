import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { setToken } from "../lib/auth";

const COLORS = {
  primaryGreen: "#2a6b1c",
  secondaryGreen: "#4c843f",
  ctaPink: "#fa3899",
  border: "#e5e7eb",
  text: "#111827",
  textMuted: "#6b7280",
  inputBg: "#f9fafb",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const API = import.meta.env.VITE_API_URL as string;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tok = data?.token ?? data?.access_token ?? data?.jwt;
      if (!tok) throw new Error("Token manquant");
      setToken(tok);
      nav("/admin", { replace: true });
    } catch (e: any) {
      setErr(e.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: 'Inter, "Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial',
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Link to="/" aria-label="Retour à l’accueil" style={{ display: "inline-block" }}>
            <img
              src="https://assurance-animaux.selfassurance.fr/devis/application/views/assets/media/selfassurancelogo.svg"
              alt="Selfassurance"
              style={{ height: 48, cursor: "pointer" }}
              title="Retour à l’accueil"
            />
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ margin: "0 0 16px", textAlign: "center", fontSize: 28, fontWeight: 800, color: COLORS.text }}>
            Panneau d’administration
          </h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Adresse e-mail
              </label>
              <div style={{ position: "relative", marginTop: 6 }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    insetBlock: 0,
                    insetInlineStart: 10,
                    display: "flex",
                    alignItems: "center",
                    color: "#9ca3af",
                  }}
                >
                  <UserIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemple@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle({ paddingLeft: 40 })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Mot de passe
              </label>
              <div style={{ position: "relative", marginTop: 6 }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    insetBlock: 0,
                    insetInlineStart: 10,
                    display: "flex",
                    alignItems: "center",
                    color: "#9ca3af",
                  }}
                >
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle({ paddingLeft: 40 })}
                />
              </div>
            </div>

            {/* Forgot */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span />
              <a
                href="#"
                style={{
                  fontSize: 14,
                  color: COLORS.secondaryGreen,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Error */}
            {err && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fee2e2",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                }}
              >
                {err}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid transparent",
                background: COLORS.ctaPink,
                color: "#fff",
                fontWeight: 800,
                letterSpacing: 0.2,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Connexion…" : "Connexion"}
            </button>
          </form>

          <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: COLORS.textMuted }}>
            Besoin d’un accès ?{" "}
            <a
              href="#"
              style={{ color: COLORS.secondaryGreen, textDecoration: "none", fontWeight: 600 }}
            >
              Contacter le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    background: COLORS.inputBg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    transition: "border-color 120ms ease, box-shadow 120ms ease",
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
    ...extra,
  };
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
