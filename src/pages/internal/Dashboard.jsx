import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const styles = {
  main: { flex: 1, padding: "1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  greeting: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  greetingSub: { fontSize: "13px", color: "#B89FD0", marginTop: "2px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500", color: "#3B2460" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "1.5rem" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem" },
  metricLabel: { fontSize: "12px", color: "#B89FD0", marginBottom: "6px" },
  metricValue: { fontSize: "24px", fontWeight: "500", color: "#2A1845" },
  metricSub: { fontSize: "12px", color: "#C4A8D8", marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" },
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
  estadoPendiente: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  profItem: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid #F0E8F8" },
  profAvatar: { width: "30px", height: "30px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "500", color: "#3B2460" },
  dotOn: { width: "7px", height: "7px", borderRadius: "50%", background: "#63B522" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "1rem 0" },
};

const todayISO = new Date().toISOString().split("T")[0];

export default function Dashboard({ setPage }) {
  const [profile, setProfile] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [stats, setStats] = useState({ total: 0, virtual: 0, presencial: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(prof);

      const { data: appts } = await supabase
        .from("appointments")
        .select("*, clients(full_name), services(name, duration_minutes)")
        .eq("date", todayISO)
        .order("start_time");
      setTurnos(appts || []);

      const { data: profs } = await supabase.from("profiles").select("*").eq("role", "professional");
      setProfesionales(profs || []);

      const virtual = (appts || []).filter(a => a.modality === "virtual").length;
      const presencial = (appts || []).filter(a => a.modality === "presencial").length;
      const pendientes = (appts || []).filter(a => a.status === "pending").length;

      setStats({ total: (appts || []).length, virtual, presencial, pendientes });
      setLoading(false);
    };
    cargar();
  }, []);

  const nombreCorto = profile?.full_name?.split(" ")[0] || "";
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?";

  return (
    <div style={styles.main}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.greeting}>Hola, {nombreCorto} 👋</div>
          <div style={styles.greetingSub}>{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} — {stats.total} turnos hoy</div>
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
          <div style={styles.metricLabel}>Pendientes</div>
          <div style={styles.metricValue}>{stats.pendientes}</div>
          <div style={styles.metricSub}>sin confirmar</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Profesionales</div>
          <div style={styles.metricValue}>{profesionales.length}</div>
          <div style={styles.metricSub}>registrados</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Confirmados</div>
          <div style={styles.metricValue}>{stats.total - stats.pendientes}</div>
          <div style={styles.metricSub}>hoy</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Turnos de hoy
            <span style={styles.cardLink} onClick={() => setPage("agenda")}>Ver agenda →</span>
          </div>
          {loading ? <div style={styles.emptyText}>Cargando...</div> :
           turnos.length === 0 ? <div style={styles.emptyText}>No hay turnos para hoy</div> :
           turnos.map((t, i) => (
            <div key={i} style={{ ...styles.turnoRow, borderBottom: i === turnos.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
              <div style={styles.turnoHora}>{t.start_time?.slice(0,5)}</div>
              <span style={t.modality === "virtual" ? styles.badgeV : styles.badgeP}>
                {t.modality === "virtual" ? "Virtual" : "Presencial"}
              </span>
              <div style={styles.turnoNombre}>{t.clients?.full_name}</div>
              <div style={styles.turnoServicio}>{t.services?.name}</div>
              <span style={t.status === "confirmed" ? styles.estadoOk : styles.estadoPendiente}>
                {t.status === "confirmed" ? "Confirmado" : "Pendiente"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Profesionales</div>
            {profesionales.length === 0 ? <div style={styles.emptyText}>No hay profesionales</div> :
             profesionales.map((p, i) => (
              <div key={i} style={{ ...styles.profItem, borderBottom: i === profesionales.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                <div style={{ ...styles.profAvatar, background: i % 2 === 0 ? "#C4A8D8" : "#F4B8D1" }}>
                  {p.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#2A1845", fontWeight: "500" }}>{p.full_name || p.email}</div>
                </div>
                <div style={styles.dotOn}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}