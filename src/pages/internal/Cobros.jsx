import { useState } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem" },
  metricLabel: { fontSize: "12px", color: "#B89FD0", marginBottom: "6px" },
  metricValue: { fontSize: "22px", fontWeight: "500", color: "#2A1845" },
  metricSub: { fontSize: "12px", color: "#C4A8D8", marginTop: "4px" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem" },
  cardTitle: { fontSize: "14px", fontWeight: "500", color: "#2A1845", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  tabs: { display: "flex", gap: "6px", marginBottom: "1rem" },
  tab: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cobroRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #F0E8F8" },
  cobroNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845", flex: 1 },
  cobroDetalle: { fontSize: "12px", color: "#9B72C0" },
  cobroMonto: { fontSize: "13px", fontWeight: "500", color: "#5C3F99" },
  tagSeña: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagSaldo: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagPagado: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  tagRetenido: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FCEBEB", color: "#A32D2D" },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

const cobrosHoy = [
  { nombre: "Carla Ríos", servicio: "Constelaciones · 12:00", tipo: "saldo", monto: 18000, vence: "12:00" },
  { nombre: "Valeria Torres", servicio: "Reiki · 15:00", tipo: "seña", monto: 12000, vence: "15:00" },
];

const historial = [
  { nombre: "Laura Gómez", servicio: "Reiki · 09:00", tipo: "pagado", monto: 15000, fecha: "hoy" },
  { nombre: "Sofía Méndez", servicio: "Biodescodificación · 10:00", tipo: "pagado", monto: 36000, fecha: "hoy" },
  { nombre: "Martina López", servicio: "Biodescodificación · 22 may", tipo: "pagado", monto: 18000, fecha: "22 may" },
  { nombre: "Ana García", servicio: "Reiki · 20 may", tipo: "retenido", monto: 12000, fecha: "20 may" },
  { nombre: "Paula Torres", servicio: "Constelaciones · 18 may", tipo: "pagado", monto: 28000, fecha: "18 may" },
];

const getTag = (tipo) => {
  if (tipo === "seña") return <span style={s.tagSeña}>Seña</span>;
  if (tipo === "saldo") return <span style={s.tagSaldo}>Saldo pendiente</span>;
  if (tipo === "pagado") return <span style={s.tagPagado}>Pagado ✓</span>;
  if (tipo === "retenido") return <span style={s.tagRetenido}>Seña retenida</span>;
};

export default function Cobros({ setPage }) {
  const [tab, setTab] = useState("hoy");
  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.logo}>🗓 AgendaLec</div>
        <button style={s.navItem} onClick={() => setPage("dashboard")}>🏠 Inicio</button>
        <button style={s.navItem} onClick={() => setPage("agenda")}>📅 Mi agenda</button>
        <button style={s.navItem} onClick={() => setPage("clientes")}>👥 Clientes</button>
        <button style={s.navItemActive}>💰 Cobros</button>
        <button style={s.navItem} onClick={() => setPage("config")}>⚙️ Configuración</button>
        <button style={s.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={s.main}>
        <div style={s.title}>Cobros</div>

        <div style={s.metrics}>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Cobrado hoy</div>
            <div style={s.metricValue}>$51.000</div>
            <div style={s.metricSub}>2 pagos completados</div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Pendiente hoy</div>
            <div style={s.metricValue}>$30.000</div>
            <div style={s.metricSub}>2 cobros automáticos</div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Este mes</div>
            <div style={s.metricValue}>$284.000</div>
            <div style={s.metricSub}>18 sesiones cobradas</div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Señas retenidas</div>
            <div style={s.metricValue}>$12.000</div>
            <div style={s.metricSub}>1 cancelación</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.tabs}>
            <button style={tab === "hoy" ? s.tabActive : s.tab} onClick={() => setTab("hoy")}>Cobros de hoy</button>
            <button style={tab === "historial" ? s.tabActive : s.tab} onClick={() => setTab("historial")}>Historial</button>
          </div>

          {tab === "hoy" && (
            <>
              {cobrosHoy.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem" }}>No hay cobros pendientes para hoy</div>
              ) : cobrosHoy.map((c, i) => (
                <div key={i} style={{ ...s.cobroRow, borderBottom: i === cobrosHoy.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cobroNombre}>{c.nombre}</div>
                    <div style={s.cobroDetalle}>{c.servicio} · vence {c.vence}</div>
                  </div>
                  {getTag(c.tipo)}
                  <div style={s.cobroMonto}>${c.monto.toLocaleString("es-AR")}</div>
                </div>
              ))}
            </>
          )}

          {tab === "historial" && (
            <>
              {historial.map((c, i) => (
                <div key={i} style={{ ...s.cobroRow, borderBottom: i === historial.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cobroNombre}>{c.nombre}</div>
                    <div style={s.cobroDetalle}>{c.servicio}</div>
                  </div>
                  {getTag(c.tipo)}
                  <div style={{ ...s.cobroMonto, color: c.tipo === "retenido" ? "#C4A8D8" : "#5C3F99", textDecoration: c.tipo === "retenido" ? "line-through" : "none" }}>
                    ${c.monto.toLocaleString("es-AR")}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
