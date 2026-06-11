import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const styles = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  main: { flex: 1, padding: "1.5rem" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  greeting: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  greetingSub: { fontSize: "13px", color: "#B89FD0", marginTop: "2px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500", color: "#3B2460" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.5rem" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem" },
  metricLabel: { fontSize: "12px", color: "#B89FD0", marginBottom: "6px" },
  metricValue: { fontSize: "24px", fontWeight: "500", color: "#2A1845" },
  metricSub: { fontSize: "12px", color: "#C4A8D8", marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem" },
  cardTitle: { fontSize: "14px", fontWeight: "500", color: "#2A1845", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardLink: { fontSize: "12px", color: "#B89FD0", cursor: "pointer" },
  turnoRow: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid #F0E8F8" },
  turnoHora: { fontSize: "12px", color: "#B89FD0", minWidth: "42px" },
  turnoNombre: { fontSize: "13px", color: "#2A1845", fontWeight: "500", flex: 1 },
  turnoServicio: { fontSize: "12px", color: "#B89FD0" },
  badgeV: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  badgeP: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FDE8F0", color: "#A0407A" },
  estadoOk: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  estadoSena: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  estadoPendiente: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FCEBEB", color: "#A32D2D" },
  sidebar2: { display: "flex", flexDirection: "column", gap: "1rem" },
  profItem: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid #F0E8F8" },
  profAvatar: { width: "30px", height: "30px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "500", color: "#3B2460" },
  dotOn: { width: "7px", height: "7px", borderRadius: "50%", background: "#63B522" },
  dotOff: { width: "7px", height: "7px", borderRadius: "50%", background: "#C4A8D8" },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "1rem 0" },
};

const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
const todayISO = new Date().toISOString().split("T")[0];

export default function Dashboard({ setPage }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [stats, setStats] = useState({ total: 0, virtual: 0, presencial: 0, saldos: 0, cancelaciones: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const u = session.user;
      setUser(u);

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      setProfile(prof);

      const { data: appts } = await supabase
        .from("appointments")
        .select("*, clients(full_name), services(name, duration_minutes)")
        .eq("date", todayISO)
        .order("start_time");
      setTurnos(appts || []);

      const { data: profs } = await supabase.from("profiles").select("*, appointments(count)").eq("role", "professional");
      setProfesionales(profs || []);

      const virtual = (appts || []).filter(a => a.modality === "virtual").length;
      const presencial = (appts || []).filter(a => a.modality === "presencial").length;
      const cancelaciones = (appts || []).filter(a => a.status === "cancelled").length;

      const { data: pagos } = await supabase.from("payments").select("amount").eq("status", "pending");
      const saldos = (pagos || []).reduce((sum, p) => sum + parseFloat(p.amount), 0);

      setStats({ total: (appts || []).length, virtual, presencial, saldos, cancelaciones });
      setLoading(false);
    };
    cargar();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const getEstadoBadge = (appt) => {
    if (appt.status === "confirmed") return <span style={styles.estadoOk}>Confirmado</span>;
    if (appt.status === "cancelled") return <span style={styles.estadoPendiente}>Cancelado</span>;
    return <span style={styles.estadoSena}>Pendiente</span>;
  };

  const nombreCorto = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?";

  return (
    <div style={styles.wrap}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>🗓 AgendaLec</div>
        <button style={styles.navItemActive}>🏠 Inicio</button>
        <button style={styles.navItem} onClick={() => setPage("agenda")}>📅 Mi agenda</button>
        <button style={styles.navItem} onClick={() => setPage("clientes")}>👥 Clientes</button>
        <button style={styles.navItem} onClick={() => setPage("cobros")}>💰 Cobros</button>
        <button style={styles.navItem} onClick={() => setPage("config")}>⚙️ Configuración</button>
        <button style={styles.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.greeting}>Hola, {nombreCorto} 👋</div>
            <div style={styles.greetingSub}>{today} — {stats.total} turnos hoy</div>
          </div>
          <div style={styles.avatar}>{initials}</div>
        </div>

        <div style={styles.metrics}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Turnos hoy</div>
            <div style={styles.metricValue}>{stats.total}</div>
            <div style={styles.metricSub}>{stats.virtual} virtual · {stats.presencial} presencial</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Saldos a cobrar</div>
            <div style={styles.metricValue}>${stats.saldos.toLocaleString("es-AR")}</div>
            <div style={styles.metricSub}>Pagos pendientes</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Profesionales</div>
            <div style={styles.metricValue}>{profesionales.length}</div>
            <div style={styles.metricSub}>Registrados</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Cancelaciones</div>
            <div style={styles.metricValue}>{stats.cancelaciones}</div>
            <div style={styles.metricSub}>Hoy</div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Turnos de hoy
              <span style={styles.cardLink} onClick={() => setPage("agenda")}>Ver agenda completa →</span>
            </div>
            {loading ? (
              <div style={styles.emptyText}>Cargando...</div>
            ) : turnos.length === 0 ? (
              <div style={styles.emptyText}>No hay turnos para hoy</div>
            ) : turnos.map((t, i) => (
              <div key={i} style={{ ...styles.turnoRow, borderBottom: i === turnos.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                <div style={styles.turnoHora}>{t.start_time?.slice(0,5)}</div>
                <span style={t.modality === "virtual" ? styles.badgeV : styles.badgeP}>
                  {t.modality === "virtual" ? "Virtual" : "Presencial"}
                </span>
                <div style={styles.turnoNombre}>{t.clients?.full_name || "Cliente"}</div>
                <div style={styles.turnoServicio}>{t.services?.name} · {t.services?.duration_minutes} min</div>
                {getEstadoBadge(t)}
              </div>
            ))}
          </div>

          <div style={styles.sidebar2}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                Profesionales
                <span style={styles.cardLink}>Ver equipo →</span>
              </div>
              {profesionales.length === 0 ? (
                <div style={styles.emptyText}>No hay profesionales</div>
              ) : profesionales.map((p, i) => (
                <div key={i} style={{ ...styles.profItem, borderBottom: i === profesionales.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ ...styles.profAvatar, background: i % 2 === 0 ? "#C4A8D8" : "#F4B8D1" }}>
                    {p.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "#2A1845", fontWeight: "500" }}>{p.full_name || p.email}</div>
                    <div style={{ fontSize: "11px", color: "#B89FD0" }}>Profesional</div>
                  </div>
                  <div style={styles.dotOn}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}