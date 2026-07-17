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
  { key: "clientes", icon: "👥", label: "Clientes" },
  { key: "cobros", icon: "💰", label: "Cobros" },
  { key: "estadisticas", icon: "📊", label: "Stats" },
  { key: "config", icon: "⚙️", label: "Config" },
];

export default function Layout({ children, page, setPage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={s.wrap}>
      {!isMobile && (
        <div style={s.sidebar}>
          <div style={s.logoWrap}>
            <div style={s.logo}>🗓 AgendaLec</div>
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

      {isMobile && (
        <div style={s.bottomNav}>
          {navItems.map(item => (
            <button key={item.key} style={s.bottomNavItem} onClick={() => setPage(item.key)}>
              <span style={s.bottomNavIcon}>{item.icon}</span>
              <span style={page === item.key ? s.bottomNavLabelActive : s.bottomNavLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
