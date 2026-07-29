import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden" },

  sidebar: { width: "200px", padding: "1.25rem 0.75rem", background: "#2A1845", display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 },
  logoWrap: { padding: "0 0.5rem", marginBottom: "1.5rem" },
  logo: { fontSize: "16px", fontWeight: "500", color: "#fff", letterSpacing: "-0.3px" },
  logoSub: { fontSize: "10px", color: "#9B72C0", marginTop: "2px" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", color: "#fff", fontWeight: "500", cursor: "pointer", border: "none", background: "rgba(155,114,192,0.25)", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  logoutBtn: { marginTop: "auto", padding: "8px 10px", borderRadius: "8px", fontSize: "12px", color: "rgba(255,255,255,0.3)", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px" },

  main: { flex: 1, overflow: "auto" },

  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "0.5px solid #E0D0F0", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 16px", zIndex: 100 },
  bottomNavItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "4px 12px", borderRadius: "8px", cursor: "pointer", border: "none", background: "transparent", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  bottomNavLabel: { fontSize: "10px", color: "#B89FD0" },
  bottomNavLabelActive: { fontSize: "10px", color: "#7B5EA7", fontWeight: "500" },
  bottomNavIcon: { fontSize: "20px" },
};

const navItems = [
  { key: "dashboard", icon: "🏠", label: "Inicio" },
  { key: "agenda", icon: "📅", label: "Agenda" },
  { key: "grupales", icon: "🧑‍🤝‍🧑", label: "Grupales" },
  { key: "limpiezas", icon: "🌿", label: "Limpiezas" },
  { key: "clientes", icon: "👥", label: "Clientes" },
  { key: "cobros", icon: "💰", label: "Cobros" },
  { key: "estadisticas", icon: "📊", label: "Stats" },
  { key: "config", icon: "⚙️", label: "Config" },
];

// En el celular no entran las 8 secciones en la barra de abajo: se
// muestran las de uso diario y el resto va a un menú "Más".
const navPrincipales = ["dashboard", "agenda", "cobros", "clientes"];

export default function Layout({ children, page, setPage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [masAbierto, setMasAbierto] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const itemsBarra = navItems.filter(i => navPrincipales.includes(i.key));
  const itemsMas = navItems.filter(i => !navPrincipales.includes(i.key));
  const enMas = itemsMas.some(i => i.key === page);

  const irA = (key) => { setPage(key); setMasAbierto(false); };

  return (
    <div style={s.wrap}>
      {!isMobile && (
        <div style={s.sidebar}>
          <div style={s.logoWrap}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src="/logo-flower.png" alt="" style={{ width: "22px", height: "22px", filter: "brightness(0) invert(1)" }} />
              <div style={s.logo}>AgendaLec</div>
            </div>
            <div style={s.logoSub}>Gestión de turnos</div>
          </div>
          {navItems.map(item => (
            <button key={item.key} style={page === item.key ? s.navItemActive : s.navItem} onClick={() => setPage(item.key)}>
              {item.icon} {item.label}
            </button>
          ))}
          <button style={s.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
        </div>
      )}

      <div style={{ ...s.main, paddingBottom: isMobile ? "80px" : "0" }}>
        {children}
      </div>

      {isMobile && masAbierto && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(42,24,69,0.25)", zIndex: 99 }} onClick={() => setMasAbierto(false)} />
          <div style={{ position: "fixed", bottom: "72px", left: "12px", right: "12px", background: "#fff", borderRadius: "16px", border: "0.5px solid #E0D0F0", padding: "8px", zIndex: 101, boxShadow: "0 -8px 32px rgba(42,24,69,0.18)", display: "flex", flexDirection: "column", gap: "2px" }}>
            {itemsMas.map(item => (
              <button key={item.key} onClick={() => irA(item.key)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderRadius: "10px", border: "none", background: page === item.key ? "#EDE8FA" : "transparent", color: page === item.key ? "#3B2460" : "#2A1845", fontWeight: page === item.key ? "500" : "400", fontSize: "14px", cursor: "pointer", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" }}>
                <span style={{ fontSize: "20px" }}>{item.icon}</span>{item.label}
              </button>
            ))}
            <div style={{ height: "0.5px", background: "#F0E8F8", margin: "4px 0" }} />
            <button onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderRadius: "10px", border: "none", background: "transparent", color: "#A32D2D", fontSize: "14px", cursor: "pointer", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" }}>
              <span style={{ fontSize: "20px" }}>←</span>Cerrar sesión
            </button>
          </div>
        </>
      )}

      {isMobile && (
        <div style={s.bottomNav}>
          {itemsBarra.map(item => (
            <button key={item.key} style={s.bottomNavItem} onClick={() => irA(item.key)}>
              <span style={s.bottomNavIcon}>{item.icon}</span>
              <span style={page === item.key ? s.bottomNavLabelActive : s.bottomNavLabel}>{item.label}</span>
            </button>
          ))}
          <button style={s.bottomNavItem} onClick={() => setMasAbierto(v => !v)}>
            <span style={s.bottomNavIcon}>{masAbierto ? "✕" : "☰"}</span>
            <span style={enMas || masAbierto ? s.bottomNavLabelActive : s.bottomNavLabel}>Más</span>
          </button>
        </div>
      )}
    </div>
  );
}
