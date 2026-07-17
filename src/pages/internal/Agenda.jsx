import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const HORAS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const DIAS_SEMANA = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
  toggleWrap: { display: "flex", background: "#fff", border: "0.5px solid #E0D0F0", borderRadius: "8px", overflow: "hidden" },
  toggleBtn: { padding: "6px 18px", fontSize: "13px", cursor: "pointer", color: "#B89FD0", border: "none", background: "transparent", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  toggleBtnActive: { padding: "6px 18px", fontSize: "13px", cursor: "pointer", color: "#3B2460", fontWeight: "500", border: "none", background: "#EDE8FA", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  select: { fontSize: "12px", padding: "6px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#5C3F99", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnNuevo: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  arrowBtn: { width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9B72C0", fontSize: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  dateLabel: { fontSize: "14px", fontWeight: "500", color: "#2A1845", minWidth: "120px", textAlign: "center" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", flex: 1, overflow: "auto", minWidth: 0 },
  panel: { width: "100%", maxWidth: "320px", background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" },
  saveBtn: { width: "100%", padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cancelBtn: { width: "100%", padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
  clienteTag: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11", marginTop: "4px", display: "inline-block" },
  clienteTagNew: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99", marginTop: "4px", display: "inline-block" },
  pagoBtn: { flex: 1, padding: "8px 4px", borderRadius: "8px", border: "0.5px solid #E0D0F0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  pagoBtnActive: { flex: 1, padding: "8px 4px", borderRadius: "8px", border: "0.5px solid #9B72C0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#EDE8FA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

const toISO = (date) => date.toISOString().split("T")[0];
const formatFecha = (date) => date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

const getTop = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return ((h - 8) * 64) + (m / 60 * 64);
};

const getHeight = (inicio, fin) => {
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return Math.max((mins / 60) * 64 - 4, 30);
};

export default function Agenda() {
  const [fecha, setFecha] = useState(new Date());
  const [vista, setVista] = useState("semana");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [turnosSemana, setTurnosSemana] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filtroProf, setFiltroProf] = useState("todos");
  const [filtroMod, setFiltroMod] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [nuevoClienteData, setNuevoClienteData] = useState({ phone: "", email: "" });
  const [estadoPago, setEstadoPago] = useState("sena"); // sena | completo | pendiente
  const [form, setForm] = useState({ profesional: "", servicioId: "", modalidad: "presencial", fecha: toISO(new Date()), hora: "09:00", notas: "" });
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [pagosDelTurno, setPagosDelTurno] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [savingPago, setSavingPago] = useState(false);

  const getSemana = (date) => {
    const lunes = new Date(date);
    const dia = date.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    lunes.setDate(date.getDate() + diff);
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  };

  const cargarDatos = async () => {
    setLoading(true);
    if (vista === "dia") {
      let query = supabase.from("appointments")
        .select("*, clients(full_name), services(name, duration_minutes, price), profiles(full_name)")
        .eq("date", toISO(fecha)).order("start_time");
      if (filtroProf !== "todos") query = query.eq("professional_id", filtroProf);
      if (filtroMod !== "todas") query = query.eq("modality", filtroMod);
      const { data } = await query;
      setTurnos(data || []);
    } else {
      const semana = getSemana(fecha);
      const desde = toISO(semana[0]);
      const hasta = toISO(semana[6]);
      let query = supabase.from("appointments")
        .select("*, clients(full_name), services(name, duration_minutes), profiles(full_name)")
        .gte("date", desde).lte("date", hasta).order("start_time");
      if (filtroProf !== "todos") query = query.eq("professional_id", filtroProf);
      if (filtroMod !== "todas") query = query.eq("modality", filtroMod);
      const { data } = await query;
      setTurnosSemana(data || []);
    }
    const { data: profs } = await supabase.from("profiles").select("id, full_name").eq("role", "professional");
    setProfesionales(profs || []);
    const { data: svs } = await supabase.from("services").select("id, name, duration_minutes, price, professional_id, currency");
    setServicios(svs || []);
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, [fecha, vista, filtroProf, filtroMod]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const irDia = (delta) => {
    const nueva = new Date(fecha);
    if (vista === "semana") nueva.setDate(nueva.getDate() + delta * 7);
    else nueva.setDate(nueva.getDate() + delta);
    setFecha(nueva);
  };

  const abrirTurno = async (t) => {
    setPanelAbierto(false);
    setLoadingPagos(true);
    const [{ data: pagos }, { data: turnoCompleto }] = await Promise.all([
      supabase.from("payments").select("*").eq("appointment_id", t.id).order("created_at"),
      supabase.from("appointments").select("*, clients(full_name, phone), services(name, duration_minutes, price), profiles(full_name)").eq("id", t.id).single(),
    ]);
    setTurnoSeleccionado(turnoCompleto || t);
    setPagosDelTurno(pagos || []);
    setLoadingPagos(false);
  };

  const cerrarTurno = () => { setTurnoSeleccionado(null); setPagosDelTurno([]); };

  const accionPago = async (tipo) => {
    setSavingPago(true);
    const t = turnoSeleccionado;
    if (tipo === "confirmar_sena") {
      const pago = pagosDelTurno.find(p => p.type === "seña");
      if (pago) await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", pago.id);
      const saldo = Math.round(parseFloat(t.total_price) / 2);
      await supabase.from("payments").insert({ appointment_id: t.id, type: "saldo", amount: saldo, status: "pending" });
      await supabase.from("appointments").update({ status: "partial" }).eq("id", t.id);
    } else if (tipo === "confirmar_saldo") {
      const pago = pagosDelTurno.find(p => p.type === "saldo");
      if (pago) await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", pago.id);
      await supabase.from("appointments").update({ status: "confirmed" }).eq("id", t.id);
    } else if (tipo === "pago_completo") {
      await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("appointment_id", t.id).eq("type", "seña");
      await supabase.from("appointments").update({ status: "confirmed" }).eq("id", t.id);
    } else if (tipo === "cancelar_sin_devolucion") {
      if (!window.confirm("¿Cancelar el turno sin devolver la seña?")) { setSavingPago(false); return; }
      await supabase.from("appointments").update({ status: "cancelled" }).eq("id", t.id);
      await supabase.from("payments").update({ status: "cancelled" }).eq("appointment_id", t.id);
      cerrarTurno();
      await cargarDatos();
      setSavingPago(false);
      return;
    } else if (tipo === "cancelar_con_devolucion") {
      if (!window.confirm("¿Cancelar el turno y marcar la seña como devuelta?")) { setSavingPago(false); return; }
      await supabase.from("appointments").update({ status: "cancelled" }).eq("id", t.id);
      await supabase.from("payments").update({ status: "refunded" }).eq("appointment_id", t.id);
      cerrarTurno();
      await cargarDatos();
      setSavingPago(false);
      return;
    }
    const { data: pagosActualizados } = await supabase.from("payments").select("*").eq("appointment_id", t.id).order("created_at");
    const { data: turnoActualizado } = await supabase.from("appointments").select("*, clients(full_name, phone), services(name, duration_minutes, price), profiles(full_name)").eq("id", t.id).single();
    setPagosDelTurno(pagosActualizados || []);
    setTurnoSeleccionado(turnoActualizado);
    await cargarDatos();
    setSavingPago(false);
  };

  const buscarCliente = async (nombre) => {
    setBusquedaCliente(nombre);
    setClienteEncontrado(null);
    setClienteNuevo(false);
    if (nombre.length < 3) return;
    const { data } = await supabase.from("clients").select("id, full_name, phone").ilike("full_name", `%${nombre}%`).limit(5);
    if (data && data.length > 0) setClienteEncontrado(data[0]);
    else setClienteNuevo(true);
  };

  const guardarTurno = async () => {
    setSaving(true);
    setSavingError("");
    const srv = servicios.find(s => s.id === form.servicioId);
    if (!srv || !form.profesional || !busquedaCliente) {
      setSavingError("Completá todos los campos obligatorios.");
      setSaving(false); return;
    }

    let clienteId = clienteEncontrado?.id;
    if (!clienteId) {
      const { data: nc, error: errCliente } = await supabase.from("clients").insert({
        full_name: busquedaCliente,
        phone: nuevoClienteData.phone || null,
        email: nuevoClienteData.email || null
      }).select("id").single();
      if (errCliente) {
        setSavingError("Error al crear el cliente: " + errCliente.message);
        setSaving(false); return;
      }
      clienteId = nc?.id;
    }
    if (!clienteId) { setSavingError("No se pudo crear el cliente."); setSaving(false); return; }

    const [h, m] = form.hora.split(":").map(Number);
    const endMin = h * 60 + m + srv.duration_minutes;
    const endTime = `${String(Math.floor(endMin/60)).padStart(2,"0")}:${String(endMin%60).padStart(2,"0")}`;

    const status = estadoPago === "completo" ? "confirmed" : "pending";
    const { data: turno } = await supabase.from("appointments").insert({
      professional_id: form.profesional, client_id: clienteId, service_id: form.servicioId,
      date: form.fecha, start_time: form.hora, end_time: endTime,
      modality: form.modalidad, status, total_price: srv.price, notes: form.notas
    }).select("id").single();

    // Registrar pagos según el estado
    if (estadoPago === "sena") {
      const sena = Math.round(srv.price / 2);
      await supabase.from("payments").insert({ appointment_id: turno.id, type: "seña", amount: sena, status: "pending" });
    } else if (estadoPago === "completo") {
      await supabase.from("payments").insert({ appointment_id: turno.id, type: "seña", amount: srv.price, status: "paid", paid_at: new Date().toISOString() });
    } else {
      await supabase.from("payments").insert({ appointment_id: turno.id, type: "seña", amount: Math.round(srv.price / 2), status: "pending" });
    }

    await cargarDatos();
    setPanelAbierto(false);
    setSaving(false);
    setBusquedaCliente("");
    setClienteEncontrado(null);
    setClienteNuevo(false);
    setEstadoPago("sena");
    setNuevoClienteData({ phone: "", email: "" });
  };

  const serviciosFiltrados = servicios.filter(sv => !form.profesional || sv.professional_id === form.profesional);
  const semana = getSemana(fecha);

  const getPrecioInfo = () => {
    const srv = servicios.find(s => s.id === form.servicioId);
    if (!srv) return null;
    const sena = Math.round(srv.price / 2);
    const sym = srv.currency === "USD" ? "U$S " : srv.currency === "EUR" ? "€" : "$";
    if (estadoPago === "sena") return `Seña ${sym}${sena.toLocaleString("es-AR")} · Saldo ${sym}${sena.toLocaleString("es-AR")} pendiente`;
    if (estadoPago === "completo") return `Pago completo ${sym}${srv.price.toLocaleString("es-AR")}`;
    return `Pendiente · Seña ${sym}${sena.toLocaleString("es-AR")} a confirmar`;
  };

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button style={s.arrowBtn} onClick={() => irDia(-1)}>‹</button>
            <div style={s.dateLabel}>
              {vista === "dia" ? formatFecha(fecha) : `${semana[0].toLocaleDateString("es-AR",{day:"numeric",month:"short"})} - ${semana[6].toLocaleDateString("es-AR",{day:"numeric",month:"short"})}`}
            </div>
            <button style={s.arrowBtn} onClick={() => irDia(1)}>›</button>
            <div style={s.toggleWrap}>
              <button style={vista === "dia" ? s.toggleBtnActive : s.toggleBtn} onClick={() => setVista("dia")}>Día</button>
              <button style={vista === "semana" ? s.toggleBtnActive : s.toggleBtn} onClick={() => setVista("semana")}>Semana</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select style={s.select} value={filtroProf} onChange={e => setFiltroProf(e.target.value)}>
              <option value="todos">Todos los profesionales</option>
              {profesionales.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
            <select style={s.select} value={filtroMod} onChange={e => setFiltroMod(e.target.value)}>
              <option value="todas">Todas las modalidades</option>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
            <button style={s.btnNuevo} onClick={() => { setPanelAbierto(true); cerrarTurno(); }}>+ Nuevo turno</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
          <div style={s.card}>
            {loading ? <div style={s.emptyText}>Cargando...</div> : (
              <>
                {vista === "dia" && (
                  <div style={{ display: "grid", gridTemplateColumns: "52px 1fr" }}>
                    <div>{HORAS.map(h => <div key={h} style={{ height: "64px", fontSize: "11px", color: "#C4A8D8", paddingTop: "4px" }}>{h}</div>)}</div>
                    <div style={{ position: "relative", borderLeft: "0.5px solid #F0E8F8", height: `${HORAS.length * 64}px` }}>
                      {HORAS.map(h => <div key={h} style={{ height: "64px", borderBottom: "0.5px solid #F8F0FC" }}></div>)}
                      {turnos.length === 0 && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "13px", color: "#C4A8D8" }}>No hay turnos para este día</div>}
                      {turnos.map((t, i) => {
                        const isPending = t.status === "pending" || t.status === "partial";
                        const isVirtual = t.modality === "virtual";
                        const isCancelled = t.status === "cancelled";
                        const accent = isCancelled ? "#9CA3AF" : isPending ? "#D97706" : isVirtual ? "#7C3AED" : "#BE185D";
                        const bg = isCancelled ? "#F3F4F6" : isPending ? "#FFFBEB" : isVirtual ? "#F3E8FF" : "#FDF2F8";
                        const textColor = isCancelled ? "#6B7280" : isPending ? "#78350F" : isVirtual ? "#4C1D95" : "#831843";
                        const label = isCancelled ? "Cancelado" : isPending ? "Pendiente" : isVirtual ? "Virtual" : "Presencial";
                        const emoji = isCancelled ? "✗" : isPending ? "⏳" : isVirtual ? "📹" : "📍";
                        const h = getHeight(t.start_time, t.end_time);
                        return (
                          <div key={i} onClick={() => abrirTurno(t)} style={{ position: "absolute", left: "4px", right: "4px", top: `${getTop(t.start_time)}px`, height: `${h}px`, borderRadius: "8px", padding: "6px 10px", background: bg, borderLeft: `4px solid ${accent}`, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                            <div style={{ fontSize: "11px", color: accent, fontWeight: "600" }}>{t.start_time?.slice(0,5)} hs · {emoji} {label}</div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: textColor, lineHeight: "1.2" }}>{t.clients?.full_name}</div>
                            {h > 45 && <div style={{ fontSize: "11px", color: textColor, opacity: 0.75 }}>{t.services?.name}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {vista === "semana" && (
                  <div style={{ overflowX: "auto" }}><div style={{ display: "grid", gridTemplateColumns: `52px repeat(7, 1fr)`, minWidth: "600px" }}>
                    <div></div>
                    {semana.map((d, i) => (
                      <div key={i} style={{ textAlign: "center", padding: "4px", borderBottom: "0.5px solid #F0E8F8", fontSize: "12px", color: toISO(d) === toISO(new Date()) ? "#9B72C0" : "#B89FD0", fontWeight: toISO(d) === toISO(new Date()) ? "500" : "400" }}>
                        {DIAS_SEMANA[i]}<br/>{d.getDate()}
                      </div>
                    ))}
                    {HORAS.map(h => (
                      <>
                        <div style={{ height: "64px", fontSize: "11px", color: "#C4A8D8", paddingTop: "4px" }}>{h}</div>
                        {semana.map((d, di) => {
                          const turnosDia = turnosSemana.filter(t => t.date === toISO(d) && t.start_time?.slice(0,2) === h.slice(0,2));
                          return (
                            <div key={`${h}-${di}`} style={{ height: "64px", borderLeft: "0.5px solid #F0E8F8", borderBottom: "0.5px solid #F8F0FC", position: "relative" }}>
                              {turnosDia.map((t, ti) => {
                                const isPending = t.status === "pending" || t.status === "partial";
                                const isVirtual = t.modality === "virtual";
                                const isCancelled = t.status === "cancelled";
                                const accent = isCancelled ? "#9CA3AF" : isPending ? "#D97706" : isVirtual ? "#7C3AED" : "#BE185D";
                                const bg = isCancelled ? "#F3F4F6" : isPending ? "#FFFBEB" : isVirtual ? "#F3E8FF" : "#FDF2F8";
                                const textColor = isCancelled ? "#6B7280" : isPending ? "#78350F" : isVirtual ? "#4C1D95" : "#831843";
                                const emoji = isCancelled ? "✗" : isPending ? "⏳" : isVirtual ? "📹" : "📍";
                                return (
                                  <div key={ti} onClick={() => abrirTurno(t)} style={{ position: "absolute", inset: "2px", borderRadius: "6px", padding: "4px 6px", background: bg, borderLeft: `3px solid ${accent}`, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "1px" }}>
                                    <div style={{ fontSize: "9px", fontWeight: "600", color: accent }}>{t.start_time?.slice(0,5)} {emoji}</div>
                                    <div style={{ fontSize: "10px", fontWeight: "700", lineHeight: "1.2", color: textColor }}>{t.clients?.full_name?.split(" ")[0]}</div>
                                    <div style={{ fontSize: "9px", color: textColor, opacity: 0.75, lineHeight: "1.1" }}>{t.services?.name}</div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div></div>
                )}
              </>
            )}
          </div>

          {turnoSeleccionado && (() => {
            const t = turnoSeleccionado;
            const sena = pagosDelTurno.find(p => p.type === "seña");
            const saldo = pagosDelTurno.find(p => p.type === "saldo");
            const isPending = t.status === "pending";
            const isPartial = t.status === "partial";
            const isConfirmed = t.status === "confirmed";
            const isCancelled = t.status === "cancelled";
            const isVirtual = t.modality === "virtual";
            return (
              <div style={s.panel}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>
                    {isVirtual ? "📹" : "📍"} {t.clients?.full_name}
                  </div>
                  <button onClick={cerrarTurno} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
                </div>
                {t.clients?.phone && (
                  <a href={`https://wa.me/54${t.clients.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" }}>
                      💬 WhatsApp · {t.clients.phone}
                    </button>
                  </a>
                )}

                <div style={{ background: "#F8F4FC", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#9B72C0", marginBottom: "6px" }}>{t.services?.name} · {t.services?.duration_minutes} min</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>{t.date} · {t.start_time?.slice(0,5)} hs</div>
                  <div style={{ fontSize: "12px", color: "#B89FD0", marginTop: "4px" }}>{t.profiles?.full_name}</div>
                </div>

                <div style={{ borderRadius: "10px", border: "0.5px solid #E0D0F0", overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: "#fff", borderBottom: "0.5px solid #F0E8F8", fontSize: "12px", fontWeight: "500", color: "#2A1845" }}>Estado del pago</div>
                  {loadingPagos ? (
                    <div style={{ padding: "12px 14px", fontSize: "12px", color: "#B89FD0" }}>Cargando...</div>
                  ) : (
                    <>
                      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid #F0E8F8" }}>
                        <span style={{ fontSize: "12px", color: "#9B72C0" }}>Seña ${(parseFloat(t.total_price || 0) / 2).toLocaleString("es-AR")}</span>
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: sena?.status === "paid" ? "#EAF3DE" : "#FAEEDA", color: sena?.status === "paid" ? "#3B6D11" : "#854F0B" }}>
                          {sena?.status === "paid" ? "✓ Pagado" : "⏳ Pendiente"}
                        </span>
                      </div>
                      {saldo && (
                        <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid #F0E8F8" }}>
                          <span style={{ fontSize: "12px", color: "#9B72C0" }}>Saldo ${parseFloat(saldo.amount || 0).toLocaleString("es-AR")}</span>
                          <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: saldo.status === "paid" ? "#EAF3DE" : "#EDE8FA", color: saldo.status === "paid" ? "#3B6D11" : "#5C3F99" }}>
                            {saldo.status === "paid" ? "✓ Pagado" : "Pendiente"}
                          </span>
                        </div>
                      )}
                      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#9B72C0" }}>Total</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#2A1845" }}>${parseFloat(t.total_price || 0).toLocaleString("es-AR")}</span>
                      </div>
                    </>
                  )}
                </div>

                {!isCancelled && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {isPending && (
                      <>
                        <button disabled={savingPago} onClick={() => accionPago("confirmar_sena")} style={{ padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {savingPago ? "..." : "✓ Confirmar seña"}
                        </button>
                        <button disabled={savingPago} onClick={() => accionPago("pago_completo")} style={{ padding: "10px", background: "#3B6D11", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {savingPago ? "..." : "💰 Pagó todo"}
                        </button>
                      </>
                    )}
                    {isPartial && (
                      <button disabled={savingPago} onClick={() => accionPago("confirmar_saldo")} style={{ padding: "10px", background: "#5C3F99", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {savingPago ? "..." : "✓ Cobrar saldo"}
                      </button>
                    )}
                    <button disabled={savingPago} onClick={() => accionPago("cancelar_con_devolucion")} style={{ padding: "10px", background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #F4C4C4", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      ↩ Cancelar con devolución
                    </button>
                    <button disabled={savingPago} onClick={() => accionPago("cancelar_sin_devolucion")} style={{ padding: "10px", background: "#fff", color: "#A32D2D", border: "0.5px solid #F4C4C4", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      ✗ Cancelar sin devolución
                    </button>
                  </div>
                )}

                {isConfirmed && (
                  <div style={{ background: "#EAF3DE", borderRadius: "10px", padding: "12px", textAlign: "center", fontSize: "13px", color: "#3B6D11", fontWeight: "500" }}>
                    ✓ Pago completo
                  </div>
                )}
                {isCancelled && (
                  <div style={{ background: "#FCEBEB", borderRadius: "10px", padding: "12px", textAlign: "center", fontSize: "13px", color: "#A32D2D" }}>
                    Turno cancelado
                  </div>
                )}
              </div>
            );
          })()}

          {panelAbierto && (
            <div style={s.panel}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>📅 Nuevo turno</div>
                <button onClick={() => setPanelAbierto(false)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
              </div>

              <div style={s.field}>
                <label style={s.label}>Cliente</label>
                <input type="text" value={busquedaCliente} onChange={e => buscarCliente(e.target.value)} placeholder="Escribí el nombre..." style={s.input} />
                {clienteEncontrado && <span style={s.clienteTag}>✓ {clienteEncontrado.full_name} (existente)</span>}
                {clienteNuevo && busquedaCliente.length >= 3 && <span style={s.clienteTagNew}>+ Se creará nuevo cliente</span>}
              </div>

              {clienteNuevo && busquedaCliente.length >= 3 && (
                <>
                  <div style={s.field}>
                    <label style={s.label}>Celular (opcional)</label>
                    <input type="tel" value={nuevoClienteData.phone} onChange={e => setNuevoClienteData({...nuevoClienteData, phone: e.target.value})} placeholder="+54 9 11..." style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Mail (opcional)</label>
                    <input type="email" value={nuevoClienteData.email} onChange={e => setNuevoClienteData({...nuevoClienteData, email: e.target.value})} placeholder="mail@ejemplo.com" style={s.input} />
                  </div>
                </>
              )}

              <div style={s.field}><label style={s.label}>Profesional</label>
                <select style={s.input} value={form.profesional} onChange={e => setForm({...form, profesional: e.target.value, servicioId: ""})}>
                  <option value="">Seleccioná un profesional</option>
                  {profesionales.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>

              <div style={s.field}><label style={s.label}>Servicio</label>
                <select style={s.input} value={form.servicioId} onChange={e => setForm({...form, servicioId: e.target.value})}>
                  <option value="">Seleccioná un servicio</option>
                  {serviciosFiltrados.map(sv => { const sym = sv.currency === "USD" ? "U$S " : sv.currency === "EUR" ? "€" : "$"; return <option key={sv.id} value={sv.id}>{sv.name} · {sv.duration_minutes}min · {sym}{sv.price?.toLocaleString("es-AR")}</option>; })}
                </select>
              </div>

              <div style={s.field}><label style={s.label}>Modalidad</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["presencial","virtual"].map(m => (
                    <button key={m} onClick={() => setForm({...form, modalidad: m})} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${form.modalidad===m?(m==="presencial"?"#E88BB0":"#9B72C0"):"#E0D0F0"}`, background: form.modalidad===m?(m==="presencial"?"#FDE8F0":"#EDE8FA"):"#fff", color: form.modalidad===m?(m==="presencial"?"#A0407A":"#5C3F99"):"#B89FD0", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {m === "presencial" ? "📍 Presencial" : "📹 Virtual"}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={s.field}><label style={s.label}>Fecha</label><input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} style={s.input} /></div>
                <div style={s.field}><label style={s.label}>Hora</label><input type="time" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} style={s.input} /></div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Estado del pago</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button style={estadoPago === "sena" ? s.pagoBtnActive : s.pagoBtn} onClick={() => setEstadoPago("sena")}>💰 Seña pagada</button>
                  <button style={estadoPago === "completo" ? s.pagoBtnActive : s.pagoBtn} onClick={() => setEstadoPago("completo")}>✅ Pago completo</button>
                  <button style={estadoPago === "pendiente" ? s.pagoBtnActive : s.pagoBtn} onClick={() => setEstadoPago("pendiente")}>⏳ Pendiente</button>
                </div>
                {form.servicioId && <div style={{ fontSize: "11px", color: "#9B72C0", marginTop: "4px" }}>{getPrecioInfo()}</div>}
              </div>

              <div style={s.field}><label style={s.label}>Notas</label>
                <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Aclaraciones..." style={{...s.input, height: "64px", resize: "none"}} />
              </div>

              {savingError && <div style={{ fontSize: "12px", color: "#A32D2D", background: "#FCEBEB", padding: "8px 12px", borderRadius: "8px" }}>{savingError}</div>}
              <button style={s.saveBtn} onClick={guardarTurno} disabled={saving}>{saving ? "Guardando..." : "✓ Guardar turno"}</button>
              <button style={s.cancelBtn} onClick={() => setPanelAbierto(false)}>Cancelar</button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {[["#EDE8FA","#9B72C0","Virtual"],["#FDE8F0","#E88BB0","Presencial"],["#FFF8E8","#F0A800","Pendiente"]].map(([bg,border,label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#B89FD0" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: bg, borderLeft: `2px solid ${border}` }}></div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}