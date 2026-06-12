import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  
  // Desktop sidebar
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  
  // Main content
  main: { flex: 1, overflow: "auto" },

  // Mobile bottom nav
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
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const cargar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("profiles").select("full_name").eq("id", session.user.id).single();
      setProfile(data);
    };
    cargar();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={s.wrap}>
      {!isMobile && (
        <div style={s.sidebar}>
          <div style={s.logo}>🗓 AgendaLec</div>
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