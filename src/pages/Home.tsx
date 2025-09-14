import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../lib/auth";
import heroSimu from "../assets/hero-simu.png";
import heroPrev from "../assets/hero-prev.png";

export default function Home() {
  const PINK = "#db2777";
  const PINK_DARK = "#be185d";
  const GREY_BORDER = "#e5e7eb";

  const slides = useMemo(
    () => [
        {
                title: "Prévoyance sur-mesure",
                subtitle: "Capital décès, IJ, franchises… adaptez vos garanties.",
                cta: { label: "Voir nos services", to: "/prevoyance" },
                bg: `linear-gradient(135deg, ${PINK_DARK} 0%, ${PINK} 100%)`,
                image: heroPrev,
                imageFit: "cover",
                imageAlt: "Prévoyance",
              },
          {
                          title: "Assurance 100% en ligne",
                          subtitle: "Simulez et obtenez votre devis en 2 minutes.",
                          cta: { label: "Démarrer une estimation", to: "/prevoyance" },
                          bg: `linear-gradient(135deg, ${PINK_DARK} 0%, ${PINK} 100%)`,
                          image: heroSimu,
                          imageFit: "cover",
                          imageAlt: "Prévoyance",
                        },
    ],
    []
  );

  const [authed, setAuthed] = useState<boolean>(!!getToken());
  useEffect(() => {
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const it = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 7000);
    return () => clearInterval(it);
  }, [slides.length]);

  const services = [
    {
      title: "Mutuelle santé",
      img: "https://www.selfassurance.fr/public/front/images/Icon_Health.png",
      to: "#",
    },
    {
      title: "Assurance habitation",
      img: "https://www.selfassurance.fr/public/front/images/Icon_Habitation.png",
      to: "#",
    },
    {
      title: "Assurance animaux",
      img: "https://www.selfassurance.fr/public/front/images/Icon_Pets.png",
      to: "#",
    },
    {
      title: "Assurance auto",
      img: "https://www.selfassurance.fr/public/front/images/Icon_Car.png",
      to: "#",
    },
    {
      title: "Protection juridique",
      img: "https://www.selfassurance.fr/public/front/images/Icon_Gavel.png",
      to: "#",
    },
    {
      title: "Prévoyance",
      img: "https://www.selfassurance.fr/public/front/images/Icon_Prevoyance.png",
      to: "/prevoyance",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: `1px solid ${GREY_BORDER}`,
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
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
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

      {/* HERO / SLIDER */}
      <section style={{ width: "100%", overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "relative", height: 420 }}>
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                background: s.bg,
                color: "white",
                padding: "32px 16px",
                opacity: idx === i ? 1 : 0,
                transform: `scale(${idx === i ? 1 : 1.02})`,
                transition: "opacity 600ms ease, transform 600ms ease",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 40,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      marginBottom: 10,
                    }}
                  >
                    {s.title}
                  </h2>
                  <p style={{ fontSize: 18, opacity: 0.95, marginBottom: 18 }}>
                    {s.subtitle}
                  </p>
                  <Link
                    to={s.cta.to}
                    style={{
                      background: "#fff",
                      color: PINK,
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 700,
                      display: "inline-block",
                    }}
                  >
                    {s.cta.label}
                  </Link>
                </div>

                {/* Carte visuelle avec image */}
                <div
                  style={{
                    alignSelf: "center",
                    justifySelf: "center",
                    width: "100%",
                    maxWidth: 460,
                    aspectRatio: "4/3",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 20,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    backdropFilter: "blur(2px)",
                    overflow: "hidden",
                  }}
                >
                  {s.image && (
                    <img
                      src={s.image}
                      alt={s.imageAlt || s.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: (s as any).imageFit || "cover",
                        display: "block",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 16,
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: "none",
                  background: idx === i ? "#fff" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
                aria-label={`Aller au slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* A PROPOS */}
      <section
        id="about"
        style={{ maxWidth: 1120, margin: "32px auto 8px", padding: "0 16px" }}
      >
        <div
          style={{
            border: `1px solid ${GREY_BORDER}`,
            borderRadius: 16,
            padding: 20,
            background: "#fff",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
            <div>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "#111827",
                }}
              >
                Selfassurance, votre partenaire confiance
              </h3>
              <p style={{ color: "#374151", lineHeight: 1.6 }}>
                Nous concevons des garanties claires et performantes pour protéger ce qui
                compte : votre santé, votre famille et vos projets. Notre simulateur vous
                propose en quelques clics une estimation transparente.
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { k: "98%", v: "clients satisfaits" },
                  { k: "< 2 min", v: "pour obtenir un devis" },
                  { k: "24/7", v: "espace sécurisé" },
                ].map((x, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${GREY_BORDER}`,
                      borderRadius: 12,
                      padding: "10px 12px",
                      minWidth: 160,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: PINK }}>{x.k}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                border: `1px dashed ${GREY_BORDER}`,
                borderRadius: 12,
                padding: 16,
                background: "linear-gradient(180deg, #fff 0%, #fff0f6 100%)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6, color: "#111827" }}>
                Pourquoi nous choisir ?
              </div>
              <ul style={{ color: "#374151", paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
                <li>Des offres lisibles et adaptées</li>
                <li>Une tarification transparente</li>
                <li>Un support réactif et proche de vous</li>
              </ul>
              <Link
                to="/estimation"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  background: PINK,
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1px solid ${PINK}`,
                }}
              >
                Lancer une estimation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ background: "#f6f8fb", padding: "36px 0 56px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 30,
              fontWeight: 900,
              color: "#111827",
              margin: "0 0 24px",
            }}
          >
            Selfassurance vous accompagne
            <br />
            pour faire le bon choix
          </h2>

          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            }}
          >
            {services.map((s, i) => (
              <Link
                key={i}
                to={s.to}
                style={{
                  textDecoration: "none",
                  border: "1px solid #e5e7eb",
                  borderRadius: 24,
                  background: "#fff",
                  padding: "28px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "center",
                  transition: "box-shadow 160ms ease, transform 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <img
                  src={s.img}
                  alt={s.title}
                  style={{ width: 40, height: 40, objectFit: "contain", filter: "saturate(1.1)" }}
                />
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{s.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{ borderTop: `1px solid ${GREY_BORDER}`, padding: "16px 0", background: "#fff" }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            © {new Date().getFullYear()} Selfassurance
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
            <a href="#" style={{ color: "#6b7280", textDecoration: "none" }}>
              Mentions légales
            </a>
            <a href="#" style={{ color: "#6b7280", textDecoration: "none" }}>
              Confidentialité
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
