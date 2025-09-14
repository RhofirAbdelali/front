import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

type Product = {
  code: string;
  name: string;
  desc: string;
  bullets: string[];
  icon: ReactElement;
};

export default function Prevoyance() {
  const PINK = "#db2777";
  const GREY = "#e5e7eb";
  const authed = !!localStorage.getItem("token");
  const nav = useNavigate();

  const items = useMemo<Product[]>(() => [
    {
      code: "PREV-DEC",
      name: "Prévoyance Décès",
      desc: "Capital versé aux bénéficiaires en cas de décès, avec options de niveau de protection et franchise IJ.",
      bullets: ["Capital modulable", "Bénéficiaire libre", "Frais & taxes transparents"],
      icon: <IconHeart color={PINK} />,
    },
    {
      code: "PREV-OBSEQUES",
      name: "Obsèques",
      desc: "Financer et organiser les obsèques selon vos souhaits, pour soulager vos proches.",
      bullets: ["Prestations encadrées", "Versement rapide", "Accompagnement dédié"],
      icon: <IconUmbrella color={PINK} />,
    },
    {
      code: "PREV-IJ",
      name: "Indemnités Journalières",
      desc: "Maintien de revenus en cas d’arrêt de travail selon la franchise choisie.",
      bullets: ["IJ au choix", "Franchise paramétrable", "Souple et lisible"],
      icon: <IconGavel color={PINK} />,
    },
    {
      code: "PREV-INVAL",
      name: "Invalidité",
      desc: "Capital ou rente en cas d’invalidité permanente selon barème.",
      bullets: ["Barème clair", "Capital/rente", "Compatible IJ"],
      icon: <IconHome color={PINK} />,
    },
    {
      code: "PREV-ACC",
      name: "Accidents de la vie",
      desc: "Protection contre les conséquences d’un accident de la vie courante.",
      bullets: ["Couverture large", "Indemnisation forfaitaire", "Assistance incluse"],
      icon: <IconPaw color={PINK} />,
    },
    {
      code: "PREV-FAMILLE",
      name: "Protection famille",
      desc: "Pack de garanties pour protéger toute la famille.",
      bullets: ["Pack économique", "Garanties essentielles", "Option enfant"],
      icon: <IconCar color={PINK} />,
    },
  ], []);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Product | null>(null);

  function openModal(p: Product) { setCurrent(p); setOpen(true); }
  function closeModal() { setOpen(false); setTimeout(()=>setCurrent(null), 200); }
  function goDevis(p: Product) { nav(`/estimation?product=${encodeURIComponent(p.code)}`); }

  return (
    <div style={{minHeight:"100vh", background:"#f6f8fb"}}>
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

      <main style={{maxWidth:1120, margin:"24px auto 56px", padding:"0 16px"}}>
        <h1 style={{textAlign:"center", fontSize:34, fontWeight:900, color:"#111827", margin:"8px 0 6px"}}>Assurance Prévoyance</h1>
        <p style={{textAlign:"center", color:"#374151", margin:"0 0 24px"}}>Choisissez le produit et obtenez un devis en quelques clics.</p>

        <div style={{display:"grid", gap:24, gridTemplateColumns:"repeat(3, minmax(0, 1fr))"}}>
          {items.map((p, i) => (
            <div key={i}
              style={{
                background:"#fff", border:`1px solid ${GREY}`, borderRadius:24, padding:"24px 18px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:12,
                transition:"transform 160ms ease, box-shadow 160ms ease"
              }}
              onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 20px rgba(0,0,0,0.06)";}}
              onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none";}}
            >
              <div>{p.icon}</div>
              <div style={{fontSize:18, fontWeight:900, color:"#111827"}}>{p.name}</div>
              <div style={{display:"flex", gap:8, marginTop:6}}>
                <button onClick={()=>openModal(p)}
                  style={{border:`1px solid ${GREY}`, background:"#fff", color:"#111827", padding:"8px 12px", borderRadius:10}}>
                  Voir détails
                </button>
                <button onClick={()=>goDevis(p)}
                  style={{border:`1px solid ${PINK}`, background:PINK, color:"#fff", padding:"8px 12px", borderRadius:10}}>
                  J’obtiens mon devis
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Modal open={open} onClose={closeModal} title={current?.name}>
        <p style={{color:"#374151", marginTop:0}}>{current?.desc}</p>
        <ul style={{paddingLeft:18, marginTop:8, color:"#374151"}}>
          {current?.bullets.map((b, idx)=>(<li key={idx}>{b}</li>))}
        </ul>
        <div style={{display:"flex", gap:8, justifyContent:"flex-end", marginTop:12}}>
          <button onClick={closeModal} style={{border:"1px solid #e5e7eb", padding:"8px 12px", borderRadius:10, background:"#fff"}}>Fermer</button>
          {current && (
            <button onClick={()=>goDevis(current)} style={{border:`1px solid ${PINK}`, background:PINK, color:"#fff", padding:"8px 12px", borderRadius:10}}>
              J’obtiens mon devis
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

/* Icônes simples rose */
function IconHeart({color}:{color:string}) { return (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>
);}
function IconUmbrella({color}:{color:string}) { return (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12a9 9 0 0 1 18 0H3Z"/><path d="M12 12v7a2 2 0 1 0 4 0"/>
  </svg>
);}
function IconGavel({color}:{color:string}) { return (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m14 4 6 6M8 8l6 6M2 22l7-7"/>
  </svg>
);}
function IconHome({color}:{color:string}) { return (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m3 10 9-7 9 7"/><path d="M9 22V12h6v10"/>
  </svg>
);}
function IconPaw({color}:{color:string}) { return (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="5.5" cy="10.5" r="1.5"/><circle cx="9" cy="5.5" r="1.5"/><circle cx="15" cy="5.5" r="1.5"/><circle cx="18.5" cy="10.5" r="1.5"/><path d="M6 19c2-4 10-4 12 0"/>
  </svg>
);}
function IconCar({color}:{color:string}) { return (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 13l2-5h14l2 5v5H3v-5Z"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>
  </svg>
);}
