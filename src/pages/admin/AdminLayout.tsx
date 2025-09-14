import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../../lib/auth";
import { useMemo } from "react";

const palette = {
  bg: "#fff7fb",
  primary: "#fa3899",
  primaryDark: "#c20f66",
  border: "#f5dcea",
  ink: "#111827",
  mut: "#6b7280"
};

export default function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();

  const title = useMemo(() => {
    if (loc.pathname.includes("/admin/products")) return "Produits";
    if (loc.pathname.includes("/admin/versions")) return "Versions tarif";
    if (loc.pathname.includes("/admin/subscriptions")) return "Souscriptions";
    return "Tableau de bord";
  }, [loc.pathname]);

  function logout() {
    clearToken();
    nav("/login", { replace: true });
  }

  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    color: "#374151",
    textDecoration: "none",
    fontWeight: 500
  };

  return (
    <div style={{display:"flex", minHeight:"100vh", background: palette.bg}}>
      {/* Sidebar */}
      <aside style={{
        width: 256,
        flexShrink: 0,
        background:"#fff",
        borderRight:`1px solid ${palette.border}`,
        padding:16,
        position:"sticky",
        top:0,
        alignSelf:"flex-start",
        height:"100vh"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:70}}>
          <img
                      src="https://assurance-animaux.selfassurance.fr/devis/application/views/assets/media/selfassurancelogo.svg"
                      alt="Selfassurance"
                      style={{ height: 36 }}
                    />
        </div>

        <nav style={{display:"grid", gap:10}}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            ...linkStyle,
            background: isActive ? "#ffe3f0" : "transparent",
            color: isActive ? palette.primaryDark : "#374151",
            fontWeight: isActive ? 700 : 500,
          })}
        >
          <span style={{ fontSize: 18 }}>🏠</span>
          Accueil
        </NavLink>

          <NavLink to="/admin/dashboard"
            style={({isActive})=> ({
              ...linkStyle,
              background: isActive ? "#ffe3f0" : "transparent",
              color: isActive ? palette.primaryDark : "#374151",
              fontWeight: isActive ? 700 : 500
            })}
          >📊 Tableau de bord</NavLink>

          <NavLink to="/admin/products"
            style={({isActive})=> ({
              ...linkStyle,
              background: isActive ? "#ffe3f0" : "transparent",
              color: isActive ? palette.primaryDark : "#374151",
              fontWeight: isActive ? 700 : 500
            })}
          >📦 Produits</NavLink>

          <NavLink to="/admin/versions"
            style={({isActive})=> ({
              ...linkStyle,
              background: isActive ? "#ffe3f0" : "transparent",
              color: isActive ? palette.primaryDark : "#374151",
              fontWeight: isActive ? 700 : 500
            })}
          >🧮 Versions tarif</NavLink>

          <NavLink to="/admin/subscriptions"
            style={({isActive})=> ({
              ...linkStyle,
              background: isActive ? "#ffe3f0" : "transparent",
              color: isActive ? palette.primaryDark : "#374151",
              fontWeight: isActive ? 700 : 500
            })}
          >📝 Souscriptions</NavLink>
        </nav>

        <div style={{marginTop:"auto", paddingTop:200}}>
          <button
            onClick={logout}
            style={{
              width:"100%", padding:"10px 12px", borderRadius:10,
              border:`2px solid ${palette.border}`, background:"#fff", color: palette.ink
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1, padding:"20px 24px"}}>
        <header style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:16
        }}>
          <h2 style={{fontSize:28, fontWeight:800, color: palette.ink, margin:0}}>{title}</h2>
          <div style={{position:"relative"}}>
            <input
              placeholder="Rechercher…"
              style={{
                padding:"10px 12px 10px 36px", borderRadius:10,
                border:`1px solid ${palette.border}`, background:"#fff", width:260
              }}
            />
            <span style={{
              position:"absolute", left:10, top:"50%", transform:"translateY(-50%)"
            }}>🔎</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
