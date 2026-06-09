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
};

const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

const turnos = [
  { hora: "09:00", nombre: "Laura Gómez", servicio: "Reiki · 60 min", modalidad: "presencial", estado: "confirmado" },
  { hora: "10:00", nombre: "Sofía Méndez", servicio: "Biodescodificación · 90 min", modalidad: "virtual", estado: "confirmado" },
  { hora: "12:00", nombre: "Carla Ríos", servicio: "Constelaciones · 60 min", modalidad: "presencial", estado: "saldo" },
  { hora: "15:00", nombre: "Valeria Torres", servicio: "Reiki · 60 min", modalidad: "virtual", estado: "pendiente" },
  { hora: "16:30", nombre: "Martina López", servicio: "Biodescodificación · 90 min", modalidad: "presencial", estado: "confirmado" },
];

const profesionales = [
  { initials: "MA", nombre: "Maru (vos)", turnos: 3, activo: true, color: "#C4A8D8" },
  { initials: "CL", nombre: "Clara L.", turnos: 2, activo: true, color: "#F4B8D1" },
  { initials: "RV", nombre: "Romina V.", turnos: 0, activo: false, color: "#D8EAD0" },
  { initials: "SB", nombre: "Sofía B.", turnos: 1, activo: true, color: "#FDE8F0" },
];

export default function Dashboard({ setPage }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getEstadoBadge = (estado) => {
    if (estado === "confirmado") return <span style={styles.estadoOk}>Confirmado</span>;
    if (estado === "saldo") return <span style={styles.estadoSena}>Saldo pendiente</span>;
    return <span style={styles.estadoPendiente}>Sin seña</span>;
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>🗓 AgendaLec</div>
        <button style={styles.navItemActive}>🏠 Inicio</button>
        <button style={styles.navItem} onClick={() => setPage("agenda")}>📅 Mi agenda</button>
        <button style={styles.navItem} onClick={() => setPage("clientes")}>👥 Clientes</button>
        <button style={styles.navItem}>💰 Cobros</button>
        <button style={styles.navItem} onClick={() => setPage("config")}>⚙️ Configuración</button>
        <button style={styles.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.greeting}>Hola, {user?.email?.split("@")[0]} 👋</div>
            <div style={styles.greetingSub}>{today} — 5 turnos hoy</div>
          </div>
          <div style={styles.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
        </div>

        <div style={styles.metrics}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Turnos hoy</div>
            <div style={styles.metricValue}>5</div>
            <div style={styles.metricSub}>2 virtual · 3 presencial</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Saldos a cobrar</div>
            <div style={styles.metricValue}>$42.000</div>
            <div style={styles.metricSub}>2 cobros hoy</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Profesionales</div>
            <div style={styles.metricValue}>6</div>
            <div style={styles.metricSub}>4 activos hoy</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Cancelaciones</div>
            <div style={styles.metricValue}>1</div>
            <div style={styles.metricSub}>Seña retenida</div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Turnos de hoy
              <span style={styles.cardLink} onClick={() => setPage("agenda")}>Ver agenda completa →</span>
            </div>
            {turnos.map((t, i) => (
              <div key={i} style={{ ...styles.turnoRow, borderBottom: i === turnos.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                <div style={styles.turnoHora}>{t.hora}</div>
                <span style={t.modalidad === "virtual" ? styles.badgeV : styles.badgeP}>
                  {t.modalidad === "virtual" ? "Virtual" : "Presencial"}
                </span>
                <div style={styles.turnoNombre}>{t.nombre}</div>
                <div style={styles.turnoServicio}>{t.servicio}</div>
                {getEstadoBadge(t.estado)}
              </div>
            ))}
          </div>

          <div style={styles.sidebar2}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                Profesionales activos
                <span style={styles.cardLink}>Ver equipo →</span>
              </div>
              {profesionales.map((p, i) => (
                <div key={i} style={{ ...styles.profItem, borderBottom: i === profesionales.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ ...styles.profAvatar, background: p.color }}>{p.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "#2A1845", fontWeight: "500" }}>{p.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#B89FD0" }}>{p.turnos} turnos hoy</div>
                  </div>
                  <div style={p.activo ? styles.dotOn : styles.dotOff}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}