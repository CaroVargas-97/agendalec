import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  main: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  title: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  tabs: { display: "flex", gap: "6px" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem" },
  metricLabel: { fontSize: "12px", color: "#B89FD0", marginBottom: "6px" },
  metricValue: { fontSize: "24px", fontWeight: "500", color: "#2A1845" },
  metricSub: { fontSize: "12px", color: "#C4A8D8", marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem" },
  cardTitle: { fontSize: "14px", fontWeight: "500", color: "#2A1845", marginBottom: "1rem" },
  rowItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "0.5px solid #F0E8F8" },
  rowName: { fontSize: "13px", fontWeight: "500", color: "#2A1845", flex: 1 },
  rowValue: { fontSize: "13px", color: "#5C3F99", fontWeight: "500" },
  rowSub: { fontSize: "11px", color: "#B89FD0" },
  bar: { height: "6px", borderRadius: "3px", background: "#EDE8FA", overflow: "hidden", marginTop: "4px" },
  barFill: { height: "100%", background: "#9B72C0" },
  modBar: { height: "20px", borderRadius: "10px", display: "flex", overflow: "hidden", marginTop: "8px" },
  modV: { background: "#9B72C0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "500" },
  modP: { background: "#E88BB0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "500" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "1rem 0" },
};

export default function Estadisticas({ setPage }) {
  const [periodo, setPeriodo] = useState("mes");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSesiones: 0,
    ingresoTotal: 0,
    clientesUnicos: 0,
    promedioSesion: 0,
    servicios: [],
    modalidad: { virtual: 0, presencial: 0 },
    topClientes: [],
    diasPopulares: [],
  });

  useEffect(() => {
    cargar();
  }, [periodo]);

  const cargar = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;

    const hoy = new Date();
    let desde = new Date();
    if (periodo === "semana") desde.setDate(hoy.getDate() - 7);
    else if (periodo === "mes") desde.setMonth(hoy.getMonth() - 1);
    else if (periodo === "trimestre") desde.setMonth(hoy.getMonth() - 3);
    else if (periodo === "año") desde.setFullYear(hoy.getFullYear() - 1);

    const desdeISO = desde.toISOString().split("T")[0];

    const { data: appts } = await supabase
      .from("appointments")
      .select("*, clients(full_name), services(name, price)")
      .eq("professional_id", uid)
      .gte("date", desdeISO)
      .neq("status", "cancelled");

    const sesiones = appts || [];
    const totalSesiones = sesiones.length;
    const ingresoTotal = sesiones.reduce((sum, a) => sum + parseFloat(a.total_price || 0), 0);
    const clientesSet = new Set(sesiones.map(a => a.client_id));
    const clientesUnicos = clientesSet.size;
    const promedioSesion = totalSesiones > 0 ? Math.round(ingresoTotal / totalSesiones) : 0;

    const servMap = {};
    sesiones.forEach(a => {
      const n = a.services?.name || "Sin servicio";
      if (!servMap[n]) servMap[n] = { count: 0, total: 0 };
      servMap[n].count++;
      servMap[n].total += parseFloat(a.total_price || 0);
    });
    const servicios = Object.entries(servMap).map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.count - a.count);

    const virtual = sesiones.filter(a => a.modality === "virtual").length;
    const presencial = sesiones.filter(a => a.modality === "presencial").length;

    const cliMap = {};
    sesiones.forEach(a => {
      const id = a.client_id;
      const n = a.clients?.full_name || "Cliente";
      if (!cliMap[id]) cliMap[id] = { nombre: n, count: 0, total: 0 };
      cliMap[id].count++;
      cliMap[id].total += parseFloat(a.total_price || 0);
    });
    const topClientes = Object.values(cliMap).sort((a, b) => b.count - a.count).slice(0, 5);

    const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const diaMap = {};
    sesiones.forEach(a => {
      const d = new Date(a.date).getDay();
      const n = dias[d];
      diaMap[n] = (diaMap[n] || 0) + 1;
    });
    const diasPopulares = Object.entries(diaMap).map(([dia, count]) => ({ dia, count }))
      .sort((a, b) => b.count - a.count);

    setStats({ totalSesiones, ingresoTotal, clientesUnicos, promedioSesion, servicios, modalidad: { virtual, presencial }, topClientes, diasPopulares });
    setLoading(false);
  };

  const totalMod = stats.modalidad.virtual + stats.modalidad.presencial;
  const pctV = totalMod > 0 ? Math.round((stats.modalidad.virtual / totalMod) * 100) : 0;
  const pctP = totalMod > 0 ? Math.round((stats.modalidad.presencial / totalMod) * 100) : 0;

  const maxServ = Math.max(...stats.servicios.map(s => s.count), 1);
  const maxDia = Math.max(...stats.diasPopulares.map(d => d.count), 1);

  return (
    <div style={s.main}>
      <div style={s.title}>Estadísticas</div>

      <div style={s.tabs}>
        {[
          { key: "semana", label: "Última semana" },
          { key: "mes", label: "Último mes" },
          { key: "trimestre", label: "3 meses" },
          { key: "año", label: "Año" },
        ].map(p => (
          <button key={p.key} style={periodo === p.key ? s.tabActive : s.tab} onClick={() => setPeriodo(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.emptyText}>Cargando estadísticas...</div>
      ) : (
        <>
          <div style={s.metrics}>
            <div style={s.metricCard}>
              <div style={s.metricLabel}>Sesiones</div>
              <div style={s.metricValue}>{stats.totalSesiones}</div>
              <div style={s.metricSub}>realizadas</div>
            </div>
            <div style={s.metricCard}>
              <div style={s.metricLabel}>Ingresos</div>
              <div style={s.metricValue}>${stats.ingresoTotal.toLocaleString("es-AR")}</div>
              <div style={s.metricSub}>total facturado</div>
            </div>
            <div style={s.metricCard}>
              <div style={s.metricLabel}>Clientes únicos</div>
              <div style={s.metricValue}>{stats.clientesUnicos}</div>
              <div style={s.metricSub}>distintos</div>
            </div>
            <div style={s.metricCard}>
              <div style={s.metricLabel}>Precio promedio</div>
              <div style={s.metricValue}>${stats.promedioSesion.toLocaleString("es-AR")}</div>
              <div style={s.metricSub}>por sesión</div>
            </div>
          </div>

          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Servicios más solicitados</div>
              {stats.servicios.length === 0 ? <div style={s.emptyText}>Sin datos</div> : stats.servicios.map((sv, i) => (
                <div key={i} style={{ ...s.rowItem, borderBottom: i === stats.servicios.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.rowName}>{sv.nombre}</div>
                    <div style={s.bar}><div style={{ ...s.barFill, width: `${(sv.count / maxServ) * 100}%` }}></div></div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    <div style={s.rowValue}>{sv.count} sesiones</div>
                    <div style={s.rowSub}>${sv.total.toLocaleString("es-AR")}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Modalidad preferida</div>
              {totalMod === 0 ? <div style={s.emptyText}>Sin datos</div> : (
                <>
                  <div style={s.modBar}>
                    {pctV > 0 && <div style={{ ...s.modV, width: `${pctV}%` }}>{pctV}%</div>}
                    {pctP > 0 && <div style={{ ...s.modP, width: `${pctP}%` }}>{pctP}%</div>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "12px" }}>
                    <div><span style={{ color: "#5C3F99", fontWeight: "500" }}>Virtual</span><br /><span style={{ color: "#B89FD0" }}>{stats.modalidad.virtual} sesiones</span></div>
                    <div style={{ textAlign: "right" }}><span style={{ color: "#A0407A", fontWeight: "500" }}>Presencial</span><br /><span style={{ color: "#B89FD0" }}>{stats.modalidad.presencial} sesiones</span></div>
                  </div>
                </>
              )}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Top clientes</div>
              {stats.topClientes.length === 0 ? <div style={s.emptyText}>Sin datos</div> : stats.topClientes.map((c, i) => (
                <div key={i} style={{ ...s.rowItem, borderBottom: i === stats.topClientes.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#3B2460", fontWeight: "500" }}>
                    {c.nombre.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={s.rowName}>{c.nombre}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={s.rowValue}>{c.count} sesiones</div>
                    <div style={s.rowSub}>${c.total.toLocaleString("es-AR")}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Días más activos</div>
              {stats.diasPopulares.length === 0 ? <div style={s.emptyText}>Sin datos</div> : stats.diasPopulares.map((d, i) => (
                <div key={i} style={{ ...s.rowItem, borderBottom: i === stats.diasPopulares.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.rowName}>{d.dia}</div>
                    <div style={s.bar}><div style={{ ...s.barFill, width: `${(d.count / maxDia) * 100}%` }}></div></div>
                  </div>
                  <div style={s.rowValue}>{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}