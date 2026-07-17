import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const s = {
  main: { flex: 1, padding: "1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" },
  greeting: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  greetingSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500", color: "#3B2460" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "1.5rem" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  metricSub: { fontSize: "11px", color: "#B89FD0", marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardLink: { fontSize: "11px", color: "#9B72C0", cursor: "pointer", fontWeight: "400" },
  badgeV: { fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  badgeP: { fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "#FDF2F8", color: "#831843" },
  estadoOk: { fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  estadoPendiente: { fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  profAvatar: { width: "30px", height: "30px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "500", color: "#3B2460" },
  dotOn: { width: "7px", height: "7px", borderRadius: "50%", background: "#63B522" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "1rem 0" },
};

const metrics = [
  { key: "total",      label: "Turnos hoy",   color: "#9B72C0", subKey: "virtualPresencial" },
  { key: "pendientes", label: "Pendientes",    color: "#F59E0B", sub: "sin confirmar" },
  { key: "confirmados",label: "Confirmados",   color: "#63B522", sub: "hoy" },
  { key: "profCount",  label: "Profesionales", color: "#EC4899", sub: "registrados" },
];

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
      const { data: appts } = await supabase.from("appointments").select("*, clients(full_name), services(name, duration_minutes)").eq("date", todayISO).order("start_time");
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

  const metricValues = {
    total: stats.total,
    pendientes: stats.pendientes,
    confirmados: stats.total - stats.pendientes,
    profCount: profesionales.length,
  };

  const turnoRowBg = (t) => {
    if (t.status === "confirmed") return "#F8F4FC";
    if (t.status === "pending" || t.status === "partial") return "#FFFBEB";
    return "#F8F4FC";
  };

  return (
    <div style={s.main}>
      <div style={s.topbar}>
        <div>
          <div style={s.greeting}>Hola, {nombreCorto} 👋</div>
          <div style={s.greetingSub}>{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} — {stats.total} turnos hoy</div>
        </div>
        <div style={s.avatar}>{initials}</div>
      </div>

      <div style={s.metrics}>
        {metrics.map(m => (
          <div key={m.key} style={s.metricCard}>
            <div style={{ fontSize: "11px", color: m.color, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</div>
            <div style={{ fontSize: "32px", fontWeight: "500", color: "#2A1845", lineHeight: 1 }}>{metricValues[m.key]}</div>
            <div style={s.metricSub}>{m.key === "total" ? `${stats.virtual} virtual · ${stats.presencial} presencial` : m.sub}</div>
            <div style={{ width: "28px", height: "3px", background: m.color, borderRadius: "2px", marginTop: "10px" }}></div>
          </div>
        ))}
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>
            Turnos de hoy
            <span style={s.cardLink} onClick={() => setPage("agenda")}>Ver agenda →</span>
          </div>
          {loading ? <div style={s.emptyText}>Cargando...</div> :
           turnos.length === 0 ? <div style={s.emptyText}>No hay turnos para hoy</div> :
           turnos.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: turnoRowBg(t), marginBottom: i < turnos.length - 1 ? "6px" : 0 }}>
              <div style={{ fontSize: "11px", color: "#9B72C0", minWidth: "38px" }}>{t.start_time?.slice(0,5)}</div>
              <span style={t.modality === "virtual" ? s.badgeV : s.badgeP}>
                {t.modality === "virtual" ? "📹 Virtual" : "📍 Presencial"}
              </span>
              <div style={{ fontSize: "12px", color: "#2A1845", fontWeight: "500", flex: 1 }}>{t.clients?.full_name}</div>
              <div style={{ fontSize: "11px", color: "#B89FD0" }}>{t.services?.name}</div>
              <span style={t.status === "confirmed" ? s.estadoOk : s.estadoPendiente}>
                {t.status === "confirmed" ? "✓" : "⏳"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={s.card}>
            <div style={s.cardTitle}>Profesionales</div>
            {profesionales.length === 0 ? <div style={s.emptyText}>No hay profesionales</div> :
             profesionales.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "#F8F4FC", marginBottom: i < profesionales.length - 1 ? "6px" : 0 }}>
                <div style={{ ...s.profAvatar, background: i % 2 === 0 ? "#C4A8D8" : "#F4B8D1" }}>
                  {p.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1, fontSize: "13px", color: "#2A1845", fontWeight: "500" }}>{p.full_name || p.email}</div>
                <div style={s.dotOn}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
