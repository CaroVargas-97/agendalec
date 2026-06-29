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
  dateLabel: { fontSize: "14px", fontWeight: "500", color: "#2A1845", minWidth: "200px", textAlign: "center" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", flex: 1, overflow: "auto" },
  panel: { width: "320px", background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" },
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
  const [vista, setVista] = useState("dia");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [turnosSemana, setTurnosSemana] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filtroProf, setFiltroProf] = useState("todos");
  const [filtroMod, setFiltroMod] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [nuevoClienteData, setNuevoClienteData] = useState({ phone: "", email: "" });
  const [estadoPago, setEstadoPago] = useState("sena"); // sena | completo | pendiente
  const [form, setForm] = useState({ profesional: "", servicioId: "", modalidad: "presencial", fecha: toISO(new Date()), hora: "09:00", notas: "" });

  useEffect(() => { cargarDatos(); }, [fecha, vista, filtroProf, filtroMod]);

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
    const { data: svs } = await supabase.from("services").select("id, name, duration_minutes, price, professional_id");
    setServicios(svs || []);
    setLoading(false);
  };

  const irDia = (delta) => {
    const nueva = new Date(fecha);
    if (vista === "semana") nueva.setDate(nueva.getDate() + delta * 7);
    else nueva.setDate(nueva.getDate() + delta);
    setFecha(nueva);
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
    const srv = servicios.find(s => s.id === form.servicioId);
    if (!srv || !form.profesional || !busquedaCliente) { setSaving(false); return; }

    let clienteId = clienteEncontrado?.id;
    if (!clienteId) {
      const { data: nc } = await supabase.from("clients").insert({
        full_name: busquedaCliente,
        phone: nuevoClienteData.phone || null,
        email: nuevoClienteData.email || null
      }).select("id").single();
      clienteId = nc?.id;
    }
    if (!clienteId) { setSaving(false); return; }

    const [h, m] = form.hora.split(":").map(Number);
    const endMin = h * 60 + m + srv.duration_minutes;
    const endTime = `${String(Math.floor(endMin/60)).padStart(2,"0")}:${String(endMin%60).padStart(2,"0")}`;

    const status = estadoPago === "pendiente" ? "pending" : "confirmed";
    const { data: turno } = await supabase.from("appointments").insert({
      professional_id: form.profesional, client_id: clienteId, service_id: form.servicioId,
      date: form.fecha, start_time: form.hora, end_time: endTime,
      modality: form.modalidad, status, total_price: srv.price, notes: form.notas
    }).select("id").single();

    // Registrar pagos según el estado
    if (estadoPago === "sena") {
      const sena = Math.round(srv.price / 2);
      await supabase.from("payments").insert([
        { appointment_id: turno.id, type: "seña", amount: sena, status: "paid", paid_at: new Date().toISOString() },
        { appointment_id: turno.id, type: "saldo", amount: sena, status: "pending" }
      ]);
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
    if (estadoPago === "sena") return `Seña $${sena.toLocaleString("es-AR")} · Saldo $${sena.toLocaleString("es-AR")} pendiente`;
    if (estadoPago === "completo") return `Pago completo $${srv.price.toLocaleString("es-AR")}`;
    return `Pendiente · Seña $${sena.toLocaleString("es-AR")} a confirmar`;
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
            <button style={s.btnNuevo} onClick={() => setPanelAbierto(true)}>+ Nuevo turno</button>
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
                      {turnos.map((t, i) => (
                        <div key={i} style={{ position: "absolute", left: "6px", right: "6px", top: `${getTop(t.start_time)}px`, height: `${getHeight(t.start_time, t.end_time)}px`, borderRadius: "8px", padding: "6px 10px", background: t.status === "pending" ? "#FFF8E8" : t.modality === "virtual" ? "#EDE8FA" : "#FDE8F0", borderLeft: `3px solid ${t.status === "pending" ? "#F0A800" : t.modality === "virtual" ? "#9B72C0" : "#E88BB0"}` }}>
                          <div style={{ fontSize: "12px", fontWeight: "500", color: "#2A1845" }}>{t.clients?.full_name}</div>
                          <div style={{ fontSize: "11px", color: "#9B72C0" }}>{t.services?.name} · {t.services?.duration_minutes} min</div>
                          {t.status === "pending" && <span style={{ fontSize: "10px", color: "#854F0B" }}>⏳ Pendiente</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {vista === "semana" && (
                  <div style={{ display: "grid", gridTemplateColumns: `52px repeat(7, 1fr)`, minWidth: "600px" }}>
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
                              {turnosDia.map((t, ti) => (
                                <div key={ti} style={{ position: "absolute", left: "2px", right: "2px", top: "2px", borderRadius: "6px", padding: "3px 6px", background: t.modality === "virtual" ? "#EDE8FA" : "#FDE8F0", borderLeft: `2px solid ${t.modality === "virtual" ? "#9B72C0" : "#E88BB0"}`, fontSize: "10px", color: "#2A1845", overflow: "hidden" }}>
                                  {t.clients?.full_name}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

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
                  {serviciosFiltrados.map(sv => <option key={sv.id} value={sv.id}>{sv.name} · {sv.duration_minutes}min · ${sv.price?.toLocaleString("es-AR")}</option>)}
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