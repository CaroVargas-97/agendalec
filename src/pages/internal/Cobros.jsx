import { useState, useEffect } from "react";
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
  tabs: { display: "flex", gap: "6px", marginBottom: "1rem" },
  tab: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cobroRow: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "0.5px solid #F0E8F8" },
  cobroNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845", flex: 1 },
  cobroDetalle: { fontSize: "12px", color: "#9B72C0" },
  cobroMonto: { fontSize: "13px", fontWeight: "500", color: "#5C3F99" },
  tagPending: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagConfirmed: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  tagCancelled: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FCEBEB", color: "#A32D2D" },
  btnConfirmar: { padding: "5px 12px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

export default function Cobros({ setPage }) {
  const [tab, setTab] = useState("pendientes");
  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [stats, setStats] = useState({ cobradoHoy: 0, pendienteTotal: 0, estesMes: 0, cancelaciones: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    const hoy = new Date().toISOString().split("T")[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    // Turnos pendientes de confirmación
    const { data: turnos } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, modality, clients(full_name), services(name), profiles(full_name)")
      .eq("status", "pending")
      .order("date", { ascending: true });
    setPendientes(turnos || []);

    // Historial de turnos confirmados
    const { data: confirmados } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, modality, clients(full_name), services(name), profiles(full_name)")
      .in("status", ["confirmed", "cancelled"])
      .order("date", { ascending: false })
      .limit(50);
    setHistorial(confirmados || []);

    // Stats
    const cobradoHoy = (confirmados || [])
      .filter(t => t.date === hoy && t.status === "confirmed")
      .reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);

    const pendienteTotal = (turnos || [])
      .reduce((sum, t) => sum + parseFloat(t.total_price || 0) / 2, 0);

    const estesMes = (confirmados || [])
      .filter(t => t.date >= inicioMes && t.status === "confirmed")
      .reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);

    const cancelaciones = (confirmados || []).filter(t => t.status === "cancelled").length;

    setStats({ cobradoHoy, pendienteTotal, estesMes, cancelaciones });
    setLoading(false);
  };

  const confirmarTurno = async (id) => {
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", id);
    await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("appointment_id", id).eq("type", "seña");
    cargar();
  };

  const cancelarTurno = async (id) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    cargar();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.logo}>🗓 AgendaLec</div>
        <button style={s.navItem} onClick={() => setPage("dashboard")}>🏠 Inicio</button>
        <button style={s.navItem} onClick={() => setPage("agenda")}>📅 Mi agenda</button>
        <button style={s.navItem} onClick={() => setPage("clientes")}>👥 Clientes</button>
        <button style={s.navItemActive}>💰 Cobros</button>
        <button style={s.navItem} onClick={() => setPage("estadisticas")}>📊 Stats</button>
        <button style={s.navItem} onClick={() => setPage("config")}>⚙️ Configuración</button>
        <button style={s.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={s.main}>
        <div style={s.title}>Cobros</div>

        <div style={s.metrics}>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Cobrado hoy</div>
            <div style={s.metricValue}>${stats.cobradoHoy.toLocaleString("es-AR")}</div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Señas pendientes</div>
            <div style={s.metricValue}>${stats.pendienteTotal.toLocaleString("es-AR")}</div>
            <div style={s.metricSub}>{pendientes.length} turnos sin confirmar</div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Este mes</div>
            <div style={s.metricValue}>${stats.estesMes.toLocaleString("es-AR")}</div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricLabel}>Cancelaciones</div>
            <div style={s.metricValue}>{stats.cancelaciones}</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.tabs}>
            <button style={tab === "pendientes" ? s.tabActive : s.tab} onClick={() => setTab("pendientes")}>
              Pendientes de confirmar {pendientes.length > 0 && `(${pendientes.length})`}
            </button>
            <button style={tab === "historial" ? s.tabActive : s.tab} onClick={() => setTab("historial")}>Historial</button>
          </div>

          {loading ? <div style={s.emptyText}>Cargando...</div> : (
            <>
              {tab === "pendientes" && (
                pendientes.length === 0 ? (
                  <div style={s.emptyText}>No hay turnos pendientes de confirmación</div>
                ) : pendientes.map((t, i) => (
                  <div key={i} style={{ ...s.cobroRow, borderBottom: i === pendientes.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                    <div style={{ flex: 1 }}>
                      <div style={s.cobroNombre}>{t.clients?.full_name}</div>
                      <div style={s.cobroDetalle}>{t.services?.name} · {t.date} {t.start_time?.slice(0,5)} · {t.profiles?.full_name}</div>
                      <div style={{ ...s.cobroDetalle, marginTop: "2px" }}>Seña a confirmar: ${(parseFloat(t.total_price || 0) / 2).toLocaleString("es-AR")}</div>
                    </div>
                    <span style={s.tagPending}>Pendiente</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button style={s.btnConfirmar} onClick={() => confirmarTurno(t.id)}>✓ Confirmar</button>
                      <button style={{ ...s.btnConfirmar, background: "#FCEBEB", color: "#A32D2D" }} onClick={() => cancelarTurno(t.id)}>✗</button>
                    </div>
                  </div>
                ))
              )}

              {tab === "historial" && (
                historial.length === 0 ? (
                  <div style={s.emptyText}>No hay historial</div>
                ) : historial.map((t, i) => (
                  <div key={i} style={{ ...s.cobroRow, borderBottom: i === historial.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                    <div style={{ flex: 1 }}>
                      <div style={s.cobroNombre}>{t.clients?.full_name}</div>
                      <div style={s.cobroDetalle}>{t.services?.name} · {t.date} {t.start_time?.slice(0,5)}</div>
                    </div>
                    <span style={t.status === "confirmed" ? s.tagConfirmed : s.tagCancelled}>
                      {t.status === "confirmed" ? "Confirmado ✓" : "Cancelado"}
                    </span>
                    <div style={s.cobroMonto}>${parseFloat(t.total_price || 0).toLocaleString("es-AR")}</div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}