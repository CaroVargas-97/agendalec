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
  { key: "ingresos",      label: "Ingresos",  color: "#63B522", sub: "agendado, cobrado o no" },
  { key: "clientesUnicos",label: "Clientes únicos", color: "#F59E0B", sub: "distintos" },
  { key: "promedioSesion",label: "Precio promedio", color: "#EC4899", sub: "por sesión" },
  { key: "aFuturo",       label: "A futuro", color: "#7C3AED", sub: null },
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
    futuroByCurrency: {}, futuroCount: 0,
  });
  const [resumenMensual, setResumenMensual] = useState([]);
  const [loadingMensual, setLoadingMensual] = useState(true);

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
    // Tope hasta hoy: son estadísticas de lo que YA pasó. Sin esto entraban
    // los turnos agendados a futuro y se contaban como "sesiones realizadas".
    const hastaISO = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;

    const [{ data: appts }, { data: eventos }, { data: futuros }, { data: eventosFuturos }, { data: svsLimpieza }] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, clients(full_name), services(name, price, currency)")
        .eq("professional_id", uid)
        .gte("date", desdeISO)
        .lte("date", hastaISO)
        .neq("status", "cancelled"),
      supabase
        .from("group_events")
        .select("id, name, date, price, currency, group_attendees(full_name, status, custom_price)")
        .eq("professional_id", uid)
        .gte("date", desdeISO)
        .lte("date", hastaISO),
      // Lo agendado de mañana en adelante: no depende del período elegido,
      // es todo lo que ya está reservado y todavía no ocurrió.
      supabase
        .from("appointments")
        .select("total_price, services(currency)")
        .eq("professional_id", uid)
        .gt("date", hastaISO)
        .neq("status", "cancelled"),
      supabase
        .from("group_events")
        .select("price, currency, group_attendees(status, custom_price)")
        .eq("professional_id", uid)
        .gt("date", hastaISO),
      supabase.from("services").select("id").ilike("name", "%limpieza%"),
    ]);

    // Una limpieza con fecha pasada pero que todavía no se marcó "hecha" no
    // es una sesión realizada: sin este filtro sumaba igual que un turno de
    // Agenda ya dado, inflando el total y la plata aunque el trabajo esté
    // pendiente.
    const idsLimpieza = new Set((svsLimpieza || []).map(sv => sv.id));
    const sesiones = (appts || []).filter(a => !idsLimpieza.has(a.service_id) || a.completed_at);
    // Cada persona anotada a un curso/evento grupal cuenta como una sesión
    // más. La cortesía se cuenta como sesión pero no suma ingreso.
    const asistentesGrupales = (eventos || []).flatMap(ev =>
      (ev.group_attendees || []).map(a => ({
        nombre: a.full_name,
        status: a.status,
        evento: ev.name,
        date: ev.date,
        currency: ev.currency || "ARS",
        monto: a.status === "cortesia" ? 0 : parseFloat(a.custom_price ?? ev.price ?? 0),
      }))
    );

    const totalSesiones = sesiones.length + asistentesGrupales.length;
    const clientesSet = new Set([
      ...sesiones.map(a => a.client_id),
      ...asistentesGrupales.map(a => `grupal:${a.nombre?.trim().toLowerCase()}`),
    ]);
    const clientesUnicos = clientesSet.size;

    const ingresoByCurrency = {};
    sesiones.forEach(a => {
      const cur = a.services?.currency || "ARS";
      ingresoByCurrency[cur] = (ingresoByCurrency[cur] || 0) + parseFloat(a.total_price || 0);
    });
    asistentesGrupales.forEach(a => {
      ingresoByCurrency[a.currency] = (ingresoByCurrency[a.currency] || 0) + a.monto;
    });
    const ingresoARS = ingresoByCurrency["ARS"] || 0;
    const arsCount = sesiones.filter(a => !a.services?.currency || a.services?.currency === "ARS").length
      + asistentesGrupales.filter(a => a.currency === "ARS").length;
    const promedioSesion = arsCount > 0 ? Math.round(ingresoARS / arsCount) : 0;

    // El total de cada servicio/cliente se guarta por moneda: un servicio
    // como "Registros Akashicos" se vende en ARS, USD y EUR según el
    // cliente, así que sumar todo junto daba un número sin sentido
    // (pesos y dólares mezclados bajo el mismo total).
    const sumarEn = (obj, cur, monto) => { obj[cur || "ARS"] = (obj[cur || "ARS"] || 0) + monto; };

    const servMap = {};
    sesiones.forEach(a => {
      const n = a.services?.name || "Sin servicio";
      if (!servMap[n]) servMap[n] = { count: 0, totalByCurrency: {} };
      servMap[n].count++;
      sumarEn(servMap[n].totalByCurrency, a.services?.currency, parseFloat(a.total_price || 0));
    });
    asistentesGrupales.forEach(a => {
      const n = a.evento || "Evento grupal";
      if (!servMap[n]) servMap[n] = { count: 0, totalByCurrency: {} };
      servMap[n].count++;
      sumarEn(servMap[n].totalByCurrency, a.currency, a.monto);
    });
    const servicios = Object.entries(servMap).map(([nombre, v]) => ({ nombre, ...v })).sort((a, b) => b.count - a.count);

    const virtual = sesiones.filter(a => a.modality === "virtual").length;
    const presencial = sesiones.filter(a => a.modality === "presencial").length;

    const cliMap = {};
    sesiones.forEach(a => {
      const id = a.client_id;
      const n = a.clients?.full_name || "Cliente";
      if (!cliMap[id]) cliMap[id] = { nombre: n, count: 0, totalByCurrency: {} };
      cliMap[id].count++;
      sumarEn(cliMap[id].totalByCurrency, a.services?.currency, parseFloat(a.total_price || 0));
    });
    asistentesGrupales.forEach(a => {
      const id = `grupal:${a.nombre?.trim().toLowerCase()}`;
      if (!cliMap[id]) cliMap[id] = { nombre: a.nombre || "Sin nombre", count: 0, totalByCurrency: {} };
      cliMap[id].count++;
      sumarEn(cliMap[id].totalByCurrency, a.currency, a.monto);
    });
    const topClientes = Object.values(cliMap).sort((a, b) => b.count - a.count).slice(0, 5);

    const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const diaMap = {};
    sesiones.forEach(a => {
      const n = dias[new Date(a.date + "T12:00:00").getDay()];
      diaMap[n] = (diaMap[n] || 0) + 1;
    });
    asistentesGrupales.forEach(a => {
      if (!a.date) return;
      const n = dias[new Date(a.date + "T12:00:00").getDay()];
      diaMap[n] = (diaMap[n] || 0) + 1;
    });
    const diasPopulares = Object.entries(diaMap).map(([dia, count]) => ({ dia, count })).sort((a, b) => b.count - a.count);

    // Lo que ya está agendado y todavía no ocurrió, por moneda.
    const futuroByCurrency = {};
    (futuros || []).forEach(a => {
      const cur = a.services?.currency || "ARS";
      futuroByCurrency[cur] = (futuroByCurrency[cur] || 0) + parseFloat(a.total_price || 0);
    });
    const asistentesFuturos = (eventosFuturos || []).flatMap(ev =>
      (ev.group_attendees || []).map(a => ({
        currency: ev.currency || "ARS",
        monto: a.status === "cortesia" ? 0 : parseFloat(a.custom_price ?? ev.price ?? 0),
      }))
    );
    asistentesFuturos.forEach(a => {
      futuroByCurrency[a.currency] = (futuroByCurrency[a.currency] || 0) + a.monto;
    });
    const futuroCount = (futuros || []).length + asistentesFuturos.length;

    setStats({ totalSesiones, ingresoTotal: ingresoARS, clientesUnicos, promedioSesion, ingresoByCurrency, servicios, modalidad: { virtual, presencial }, topClientes, diasPopulares, futuroByCurrency, futuroCount });
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [periodo]);

  // Resumen mes a mes: independiente del selector de período de arriba,
  // siempre muestra los últimos 12 meses completos.
  const cargarResumenMensual = async () => {
    setLoadingMensual(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoadingMensual(false); return; }
    const uid = session.user.id;

    const hoy = new Date();
    const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
    const desdeISO = `${desde.getFullYear()}-${String(desde.getMonth()+1).padStart(2,"0")}-01`;
    const hastaISO = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;

    const [{ data: appts }, { data: eventos }, { data: svsLimpieza }] = await Promise.all([
      supabase.from("appointments").select("date, total_price, service_id, completed_at, services(name, currency)")
        .eq("professional_id", uid).gte("date", desdeISO).lte("date", hastaISO).neq("status", "cancelled"),
      supabase.from("group_events").select("name, date, price, currency, group_attendees(status, custom_price)")
        .eq("professional_id", uid).gte("date", desdeISO).lte("date", hastaISO),
      supabase.from("services").select("id").ilike("name", "%limpieza%"),
    ]);

    const idsLimpieza = new Set((svsLimpieza || []).map(sv => sv.id));
    const sesiones = (appts || []).filter(a => !idsLimpieza.has(a.service_id) || a.completed_at);

    const meses = {};
    const sumar = (mesKey, servicio, currency, monto) => {
      if (!meses[mesKey]) meses[mesKey] = { sesiones: 0, ingresos: {}, servicios: {} };
      meses[mesKey].sesiones++;
      meses[mesKey].ingresos[currency] = (meses[mesKey].ingresos[currency] || 0) + monto;
      meses[mesKey].servicios[servicio] = (meses[mesKey].servicios[servicio] || 0) + 1;
    };

    sesiones.forEach(a => {
      sumar(a.date.slice(0, 7), a.services?.name?.trim() || "Sin servicio", a.services?.currency || "ARS", parseFloat(a.total_price || 0));
    });
    (eventos || []).forEach(ev => {
      if (!ev.date) return;
      (ev.group_attendees || []).forEach(at => {
        const monto = at.status === "cortesia" ? 0 : parseFloat(at.custom_price ?? ev.price ?? 0);
        sumar(ev.date.slice(0, 7), ev.name, ev.currency || "ARS", monto);
      });
    });

    const filas = Object.entries(meses).map(([mesKey, v]) => {
      const servicioTop = Object.entries(v.servicios).sort((a, b) => b[1] - a[1])[0];
      return { mesKey, sesiones: v.sesiones, ingresos: v.ingresos, servicioTop: servicioTop?.[0] || "—" };
    }).sort((a, b) => b.mesKey.localeCompare(a.mesKey));

    setResumenMensual(filas);
    setLoadingMensual(false);
  };

  useEffect(() => { cargarResumenMensual(); }, []);

  const nombreMes = (mesKey) => {
    const [y, m] = mesKey.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  };

  const exportarCSV = () => {
    const filas = [["Mes", "Sesiones", "Ingresos", "Servicio más solicitado"]];
    resumenMensual.forEach(m => {
      const ingresosTxt = Object.entries(m.ingresos).map(([cur, val]) => `${cur} ${val.toLocaleString("es-AR")}`).join(" / ") || "0";
      filas.push([nombreMes(m.mesKey), m.sesiones, ingresosTxt, m.servicioTop]);
    });
    const csv = filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estadisticas-mensuales-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    aFuturo: Object.entries(stats.futuroByCurrency || {}).length === 0
      ? "$0"
      : Object.entries(stats.futuroByCurrency).map(([cur, val]) => {
          const sym = cur === "USD" ? "U$S " : cur === "EUR" ? "€" : "$";
          return `${sym}${val.toLocaleString("es-AR")}`;
        }).join(" · "),
  };

  const barColors = ["#9B72C0", "#C4A8D8", "#D8B8E8", "#EDE8FA"];

  const fmtMonedas = (byCurrency) => {
    const entradas = Object.entries(byCurrency || {}).filter(([, v]) => v > 0);
    if (entradas.length === 0) return "$0";
    return entradas.map(([cur, val]) => {
      const sym = cur === "USD" ? "U$S " : cur === "EUR" ? "€" : "$";
      return `${sym}${val.toLocaleString("es-AR")}`;
    }).join(" · ");
  };

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
                <div style={s.metricSub}>{m.key === "aFuturo" ? `${stats.futuroCount} turno${stats.futuroCount === 1 ? "" : "s"} por venir` : m.sub}</div>
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
                    <div style={s.rowSub}>{fmtMonedas(sv.totalByCurrency)}</div>
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
                    <div style={s.rowSub}>{fmtMonedas(c.totalByCurrency)}</div>
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

          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={s.cardTitle}>Resumen mes a mes (últimos 12 meses)</div>
              <button onClick={exportarCSV} disabled={loadingMensual || resumenMensual.length === 0}
                style={{ padding: "6px 14px", background: "#EDE8FA", color: "#5C3F99", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                ⬇ Exportar CSV
              </button>
            </div>
            {loadingMensual ? (
              <div style={s.emptyText}>Cargando...</div>
            ) : resumenMensual.length === 0 ? (
              <div style={s.emptyText}>Sin datos</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Mes", "Sesiones", "Ingresos", "Servicio más solicitado"].map(h => (
                        <th key={h} style={{ fontSize: "11px", color: "#B89FD0", fontWeight: "500", padding: "8px 10px", textAlign: h === "Mes" ? "left" : h === "Servicio más solicitado" ? "left" : "right", borderBottom: "0.5px solid #F0E8F8", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resumenMensual.map(m => (
                      <tr key={m.mesKey}>
                        <td style={{ fontSize: "13px", color: "#2A1845", padding: "10px", borderBottom: "0.5px solid #F0E8F8", textTransform: "capitalize", whiteSpace: "nowrap" }}>{nombreMes(m.mesKey)}</td>
                        <td style={{ fontSize: "13px", color: "#5C3F99", padding: "10px", borderBottom: "0.5px solid #F0E8F8", textAlign: "right" }}>{m.sesiones}</td>
                        <td style={{ fontSize: "13px", color: "#5C3F99", fontWeight: "500", padding: "10px", borderBottom: "0.5px solid #F0E8F8", textAlign: "right", whiteSpace: "nowrap" }}>{fmtMonedas(m.ingresos)}</td>
                        <td style={{ fontSize: "13px", color: "#2A1845", padding: "10px", borderBottom: "0.5px solid #F0E8F8" }}>{m.servicioTop}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
