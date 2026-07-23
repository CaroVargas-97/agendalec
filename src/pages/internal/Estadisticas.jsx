import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const avatarColors = ["#C4A8D8", "#F4B8D1", "#A8D4C4", "#F4D4A8", "#A8C4D4"];

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  tabs: { display: "flex", gap: "6px" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  metricSub: { fontSize: "11px", color: "#B89FD0", marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: "11px", fontWeight: "500", color: "#B89FD0", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.5px" },
  rowItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 8px", borderRadius: "8px", marginBottom: "2px", transition: "background 0.15s" },
  rowName: { fontSize: "13px", fontWeight: "500", color: "#2A1845", flex: 1 },
  rowValue: { fontSize: "13px", color: "#5C3F99", fontWeight: "500" },
  rowSub: { fontSize: "11px", color: "#B89FD0" },
  bar: { height: "5px", borderRadius: "3px", background: "#F0E8F8", overflow: "hidden", marginTop: "5px" },
  modBar: { height: "22px", borderRadius: "11px", display: "flex", overflow: "hidden", marginTop: "8px" },
  modV: { background: "#9B72C0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "500" },
  modP: { background: "#E88BB0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "500" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "1rem 0" },
};

const metricsDef = [
  { key: "totalSesiones", label: "Sesiones", color: "#9B72C0", sub: "realizadas" },
  { key: "ingresos",      label: "Ingresos",  color: "#63B522", sub: "total facturado" },
  { key: "clientesUnicos",label: "Clientes únicos", color: "#F59E0B", sub: "distintos" },
  { key: "promedioSesion",label: "Precio promedio", color: "#EC4899", sub: "por sesión" },
];

const periodos = [
  { key: "semana", label: "Semana" },
  { key: "mes",    label: "Mes" },
  { key: "trimestre", label: "3 meses" },
  { key: "año",    label: "Año" },
];

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState("mes");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSesiones: 0, ingresoTotal: 0, ingresoByCurrency: {},
    clientesUnicos: 0, promedioSesion: 0, servicios: [],
    modalidad: { virtual: 0, presencial: 0 }, topClientes: [], diasPopulares: [],
  });

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
    const desdeISO = `${desde.getFullYear()}-${String(desde.getMonth()+1).padStart(2,"0")}-${String(desde.getDate()).padStart(2,"0")}`;

    const { data: appts } = await supabase
      .from("appointments")
      .select("*, clients(full_name), services(name, price, currency)")
      .eq("professional_id", uid)
      .gte("date", desdeISO)
      .neq("status", "cancelled");

    const sesiones = appts || [];
    const totalSesiones = sesiones.length;
    const clientesSet = new Set(sesiones.map(a => a.client_id));
    const clientesUnicos = clientesSet.size;

    const ingresoByCurrency = {};
    sesiones.forEach(a => {
      const cur = a.services?.currency || "ARS";
      ingresoByCurrency[cur] = (ingresoByCurrency[cur] || 0) + parseFloat(a.total_price || 0);
    });
    const ingresoARS = ingresoByCurrency["ARS"] || 0;
    const arsCount = sesiones.filter(a => !a.services?.currency || a.services?.currency === "ARS").length;
    const promedioSesion = arsCount > 0 ? Math.round(ingresoARS / arsCount) : 0;

    const servMap = {};
    sesiones.forEach(a => {
      const n = a.services?.name || "Sin servicio";
      if (!servMap[n]) servMap[n] = { count: 0, total: 0 };
      servMap[n].count++;
      servMap[n].total += parseFloat(a.total_price || 0);
    });
    const servicios = Object.entries(servMap).map(([nombre, v]) => ({ nombre, ...v })).sort((a, b) => b.count - a.count);

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
      const n = dias[new Date(a.date + "T12:00:00").getDay()];
      diaMap[n] = (diaMap[n] || 0) + 1;
    });
    const diasPopulares = Object.entries(diaMap).map(([dia, count]) => ({ dia, count })).sort((a, b) => b.count - a.count);

    setStats({ totalSesiones, ingresoTotal: ingresoARS, clientesUnicos, promedioSesion, ingresoByCurrency, servicios, modalidad: { virtual, presencial }, topClientes, diasPopulares });
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [periodo]);

  const totalMod = stats.modalidad.virtual + stats.modalidad.presencial;
  const pctV = totalMod > 0 ? Math.round((stats.modalidad.virtual / totalMod) * 100) : 0;
  const pctP = totalMod > 0 ? Math.round((stats.modalidad.presencial / totalMod) * 100) : 0;
  const maxServ = Math.max(...stats.servicios.map(s => s.count), 1);
  const maxDia = Math.max(...stats.diasPopulares.map(d => d.count), 1);

  const periodoLabel = { semana: "última semana", mes: "último mes", trimestre: "últimos 3 meses", año: "último año" }[periodo];

  const metricValues = {
    totalSesiones: stats.totalSesiones,
    ingresos: Object.entries(stats.ingresoByCurrency || {}).length === 0
      ? "$0"
      : Object.entries(stats.ingresoByCurrency).map(([cur, val]) => {
          const sym = cur === "USD" ? "U$S " : cur === "EUR" ? "€" : "$";
          return `${sym}${val.toLocaleString("es-AR")}`;
        }).join(" · "),
    clientesUnicos: stats.clientesUnicos,
    promedioSesion: `$${stats.promedioSesion.toLocaleString("es-AR")}`,
  };

  const barColors = ["#9B72C0", "#C4A8D8", "#D8B8E8", "#EDE8FA"];

  return (
    <div style={s.main}>
      <div style={s.topbar}>
        <div>
          <div style={s.title}>Estadísticas</div>
          <div style={s.titleSub}>{periodoLabel} · {stats.totalSesiones} sesiones</div>
        </div>
      </div>

      <div style={s.tabs}>
        {periodos.map(p => (
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
            {metricsDef.map(m => (
              <div key={m.key} style={s.metricCard}>
                <div style={{ fontSize: "11px", color: m.color, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</div>
                <div style={{ fontSize: "32px", fontWeight: "500", color: "#2A1845", lineHeight: 1 }}>{metricValues[m.key]}</div>
                <div style={s.metricSub}>{m.sub}</div>
                <div style={{ width: "28px", height: "3px", background: m.color, borderRadius: "2px", marginTop: "10px" }}></div>
              </div>
            ))}
          </div>

          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Servicios más solicitados</div>
              {stats.servicios.length === 0 ? <div style={s.emptyText}>Sin datos</div> : stats.servicios.map((sv, i) => (
                <div key={i} style={s.rowItem} onMouseEnter={e => e.currentTarget.style.background = "#FDFAFF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ flex: 1 }}>
                    <div style={s.rowName}>{sv.nombre}</div>
                    <div style={s.bar}>
                      <div style={{ height: "100%", width: `${(sv.count / maxServ) * 100}%`, background: barColors[i % barColors.length], borderRadius: "3px" }}></div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    <div style={s.rowValue}>{sv.count} ses.</div>
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
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                    <div style={{ background: "#F3EEFF", borderRadius: "10px", padding: "10px 14px", flex: 1, marginRight: "6px" }}>
                      <div style={{ fontSize: "22px", fontWeight: "500", color: "#5C3F99" }}>{stats.modalidad.virtual}</div>
                      <div style={{ fontSize: "11px", color: "#9B72C0", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Virtual</div>
                    </div>
                    <div style={{ background: "#FDE8F0", borderRadius: "10px", padding: "10px 14px", flex: 1, marginLeft: "6px" }}>
                      <div style={{ fontSize: "22px", fontWeight: "500", color: "#A0407A" }}>{stats.modalidad.presencial}</div>
                      <div style={{ fontSize: "11px", color: "#E88BB0", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Presencial</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Top clientes</div>
              {stats.topClientes.length === 0 ? <div style={s.emptyText}>Sin datos</div> : stats.topClientes.map((c, i) => (
                <div key={i} style={s.rowItem} onMouseEnter={e => e.currentTarget.style.background = "#FDFAFF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: avatarColors[i % avatarColors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#3B2460", fontWeight: "500", flexShrink: 0 }}>
                    {c.nombre.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={s.rowName}>{c.nombre}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={s.rowValue}>{c.count} ses.</div>
                    <div style={s.rowSub}>${c.total.toLocaleString("es-AR")}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Días más activos</div>
              {stats.diasPopulares.length === 0 ? <div style={s.emptyText}>Sin datos</div> : stats.diasPopulares.map((d, i) => (
                <div key={i} style={s.rowItem} onMouseEnter={e => e.currentTarget.style.background = "#FDFAFF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ flex: 1 }}>
                    <div style={s.rowName}>{d.dia}</div>
                    <div style={s.bar}>
                      <div style={{ height: "100%", width: `${(d.count / maxDia) * 100}%`, background: barColors[i % barColors.length], borderRadius: "3px" }}></div>
                    </div>
                  </div>
                  <div style={{ ...s.rowValue, minWidth: "36px", textAlign: "right" }}>{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
