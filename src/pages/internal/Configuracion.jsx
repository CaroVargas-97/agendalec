import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  tabs: { display: "flex", gap: "6px", flexWrap: "wrap" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: "11px", fontWeight: "500", color: "#B89FD0", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.5px" },
  diaRow: { display: "flex", alignItems: "center", gap: "8px", padding: "9px 8px", borderRadius: "8px", flexWrap: "wrap", transition: "background 0.15s" },
  diaNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845", minWidth: "90px" },
  diaNombreOff: { fontSize: "13px", fontWeight: "500", color: "#C4A8D8", minWidth: "90px" },
  select: { fontSize: "12px", padding: "5px 8px", border: "0.5px solid #E0D0F0", borderRadius: "7px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillP: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #E88BB0", background: "#FDE8F0", color: "#A0407A", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillV: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillPV: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#F3EEFA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPill: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  servicioRow: { display: "flex", alignItems: "center", gap: "8px", padding: "9px 0", borderBottom: "0.5px solid #F0E8F8", flexWrap: "wrap" },
  input: { fontSize: "12px", padding: "5px 8px", border: "0.5px solid #E0D0F0", borderRadius: "7px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  inputFull: { fontSize: "13px", padding: "10px 12px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" },
  trashBtn: { width: "26px", height: "26px", borderRadius: "6px", border: "0.5px solid #F0D0D8", background: "#FEF0F3", cursor: "pointer", color: "#C06080", fontSize: "13px" },
  addBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "#fff", color: "#9B72C0", border: "0.5px solid #C4A8D8", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "10px" },
  saveBtn: { padding: "9px 24px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" },
  saveBtnOk: { padding: "9px 24px", background: "#3B6D11", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(59,109,17,0.3)" },
  label: { fontSize: "11px", color: "#B89FD0", textTransform: "uppercase", letterSpacing: "0.4px" },
  pausaSub: { fontSize: "12px", color: "#9B72C0" },
  inputSm: { fontSize: "13px", padding: "6px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "70px" },
  loadingText: { fontSize: "13px", color: "#B89FD0", padding: "1rem 0" },
  metodoBtn: { flex: 1, padding: "12px", borderRadius: "10px", border: "0.5px solid #E0D0F0", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center" },
  metodoBtnActive: { flex: 1, padding: "12px", borderRadius: "10px", border: "2px solid #9B72C0", fontSize: "13px", cursor: "pointer", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center" },
  infoBox: { background: "#F8F4FC", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#5C3F99", borderLeft: "3px solid #C4A8D8" },
  pausaCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "12px" },
};

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const defaultDias = [
  { activo: true, inicio: "09:00", fin: "18:00", modalidad: "ambas" },
  { activo: true, inicio: "09:00", fin: "18:00", modalidad: "presencial" },
  { activo: true, inicio: "10:00", fin: "14:00", modalidad: "virtual" },
  { activo: true, inicio: "09:00", fin: "18:00", modalidad: "ambas" },
  { activo: true, inicio: "09:00", fin: "16:00", modalidad: "ambas" },
  { activo: false, inicio: "09:00", fin: "13:00", modalidad: "presencial" },
  { activo: false, inicio: "09:00", fin: "13:00", modalidad: "presencial" },
];

const getUid = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

export default function Configuracion() {
  const [tab, setTab] = useState("disponibilidad");
  const [dias, setDias] = useState(defaultDias);
  const [servicios, setServicios] = useState([{ nombre: "", duracion: 60, precio: 0, modalidad: "ambas", currency: "ARS", requiresSlot: true }]);
  const [pausas, setPausas] = useState({ pausa: 15, anticipacion: 24, cancelacion: 24 });
  const [pagos, setPagos] = useState({ metodo: "transferencia", alias: "", cbu: "", alias_usd: "", cbu_usd: "", alias_eur: "", cbu_eur: "", mp_enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profesionales, setProfesionales] = useState([]);
  const [nuevoProf, setNuevoProf] = useState({ nombre: "", email: "", password: "" });
  const [savingProf, setSavingProf] = useState(false);
  const [profMsg, setProfMsg] = useState("");
  const [passForm, setPassForm] = useState({ nueva: "", confirmar: "" });
  const [passMsg, setPassMsg] = useState("");
  const [nombreForm, setNombreForm] = useState("");
  const [nombreMsg, setNombreMsg] = useState("");
  const [contactoForm, setContactoForm] = useState({ phone: "", address: "" });
  const [contactoMsg, setContactoMsg] = useState("");
  const [reservasForm, setReservasForm] = useState({ desde: "", hasta: "" });
  const [reservasMsg, setReservasMsg] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [bloqueosDB, setBloqueosDB] = useState([]);
  const [diasSeleccionados, setDiasSeleccionados] = useState(new Set());
  const [mesBloqueos, setMesBloqueos] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [bloqueoTodoDia, setBloqueoTodoDia] = useState(true);
  const [bloqueoHoraInicio, setBloqueoHoraInicio] = useState("09:00");
  const [bloqueoHoraFin, setBloqueoHoraFin] = useState("13:00");
  const [savingBloqueos, setSavingBloqueos] = useState(false);
  const [bloqueosMsg, setBloqueosMsg] = useState("");

  const cargarProfesionales = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, email").eq("role", "professional");
    setProfesionales(data || []);
  };

  const agregarProfesional = async () => {
    if (!nuevoProf.nombre || !nuevoProf.email || !nuevoProf.password) return;
    setSavingProf(true); setProfMsg("");
    const res = await fetch("/api/professionals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevoProf) });
    const json = await res.json();
    if (json.ok) { setProfMsg("✓ Profesional creado"); setNuevoProf({ nombre: "", email: "", password: "" }); cargarProfesionales(); }
    else setProfMsg("Error: " + json.error);
    setSavingProf(false);
  };

  const eliminarProfesional = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre}? Se borrarán todos sus datos y turnos.`)) return;
    await fetch("/api/professionals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    cargarProfesionales();
  };

  useEffect(() => {
    const cargar = async () => {
      const uid = await getUid();
      if (!uid) { setLoading(false); return; }
      cargarProfesionales();

      const { data: prof } = await supabase.from("profiles").select("full_name, phone, address, reservas_desde, reservas_hasta").eq("id", uid).maybeSingle();
      if (prof?.full_name) setNombreForm(prof.full_name);
      if (prof) setContactoForm({ phone: prof.phone || "", address: prof.address || "" });
      if (prof) setReservasForm({ desde: prof.reservas_desde || "", hasta: prof.reservas_hasta || "" });
      try {
        const { data: cfg } = await supabase.from("app_config").select("value").eq("key", "invite_code").maybeSingle();
        if (cfg) setInviteCode(cfg.value || "");
      } catch (_) {}

      const { data: svs } = await supabase.from("services").select("*").eq("professional_id", uid).eq("active", true);
      if (svs && svs.length > 0) setServicios(svs.map(sv => ({ id: sv.id, nombre: sv.name, duracion: sv.duration_minutes, precio: sv.price, modalidad: sv.modality, currency: sv.currency || "ARS", requiresSlot: sv.requires_slot !== false })));

      const { data: avail } = await supabase.from("availability").select("*").eq("professional_id", uid).order("day_of_week");
      if (avail && avail.length > 0) {
        const nd = [...defaultDias];
        avail.forEach(a => {
          const idx = a.day_of_week === 0 ? 6 : a.day_of_week - 1;
          nd[idx] = { activo: a.active, inicio: a.start_time.slice(0,5), fin: a.end_time.slice(0,5), modalidad: a.modality };
        });
        setDias(nd);
      }

      const { data: cfg } = await supabase.from("settings").select("*").eq("professional_id", uid).maybeSingle();
      if (cfg) {
        setPausas({ pausa: cfg.break_minutes || 15, anticipacion: cfg.min_advance_hours || 24, cancelacion: cfg.cancellation_hours || 24 });
        setPagos({ metodo: cfg.payment_method || "transferencia", alias: cfg.alias || "", cbu: cfg.cbu || "", alias_usd: cfg.alias_usd || "", cbu_usd: cfg.cbu_usd || "", alias_eur: cfg.alias_eur || "", cbu_eur: cfg.cbu_eur || "", mp_enabled: cfg.mp_enabled || false });
      }

      const { data: blocked } = await supabase.from("blocked_dates").select("id, date, start_time, end_time, reason").eq("professional_id", uid).order("date");
      setBloqueosDB(blocked || []);

      setLoading(false);
    };
    cargar();
  }, []);

  const toggleDiaSeleccion = (fechaStr) => {
    setDiasSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(fechaStr)) next.delete(fechaStr); else next.add(fechaStr);
      return next;
    });
  };

  const guardarBloqueos = async () => {
    if (diasSeleccionados.size === 0) return;
    setSavingBloqueos(true);
    const uid = await getUid();
    if (!uid) { setSavingBloqueos(false); return; }
    const toInsert = [...diasSeleccionados].map(d => ({
      professional_id: uid, date: d,
      start_time: bloqueoTodoDia ? null : bloqueoHoraInicio,
      end_time: bloqueoTodoDia ? null : bloqueoHoraFin,
    }));
    await supabase.from("blocked_dates").insert(toInsert);
    const { data: blocked } = await supabase.from("blocked_dates").select("id, date, start_time, end_time, reason").eq("professional_id", uid).order("date");
    setBloqueosDB(blocked || []);
    setDiasSeleccionados(new Set());
    setSavingBloqueos(false);
    setBloqueosMsg("✓ Bloqueos guardados");
    setTimeout(() => setBloqueosMsg(""), 2500);
  };

  const eliminarBloqueo = async (id) => {
    const uid = await getUid();
    await supabase.from("blocked_dates").delete().eq("id", id);
    const { data: blocked } = await supabase.from("blocked_dates").select("id, date, start_time, end_time, reason").eq("professional_id", uid).order("date");
    setBloqueosDB(blocked || []);
  };

  const guardarServicios = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }

    const validos = servicios.filter(sv => sv.nombre.trim());
    const existentes = validos.filter(sv => sv.id);
    const nuevos = validos.filter(sv => !sv.id);
    const idsEnForm = new Set(existentes.map(sv => sv.id));

    // Fetch current active services before making changes
    const { data: dbSvs } = await supabase.from("services").select("id").eq("professional_id", uid).eq("active", true);

    // Update existing services
    for (const sv of existentes) {
      await supabase.from("services").update({ name: sv.nombre, duration_minutes: parseInt(sv.duracion), price: parseFloat(sv.precio), modality: sv.modalidad, currency: sv.currency || "ARS", requires_slot: sv.requiresSlot !== false }).eq("id", sv.id);
    }

    // Insert new services
    if (nuevos.length > 0) {
      await supabase.from("services").insert(nuevos.map(sv => ({ professional_id: uid, name: sv.nombre, duration_minutes: parseInt(sv.duracion), price: parseFloat(sv.precio), modality: sv.modalidad, currency: sv.currency || "ARS", active: true, requires_slot: sv.requiresSlot !== false })));
    }

    // Soft-delete services removed from the form
    const toDeactivate = (dbSvs || []).filter(s => !idsEnForm.has(s.id)).map(s => s.id);
    if (toDeactivate.length > 0) await supabase.from("services").update({ active: false }).in("id", toDeactivate);

    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const guardarDisponibilidad = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("availability").delete().eq("professional_id", uid);
    const rows = dias.map((d, i) => ({ professional_id: uid, day_of_week: i === 6 ? 0 : i + 1, start_time: d.inicio, end_time: d.fin, modality: d.modalidad, active: d.activo }));
    await supabase.from("availability").insert(rows);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const guardarPausas = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("settings").upsert({ professional_id: uid, break_minutes: parseInt(pausas.pausa), min_advance_hours: parseInt(pausas.anticipacion), cancellation_hours: parseInt(pausas.cancelacion) }, { onConflict: "professional_id" });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const guardarPagos = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("settings").upsert({ professional_id: uid, payment_method: pagos.metodo, alias: pagos.alias, cbu: pagos.cbu, alias_usd: pagos.alias_usd, cbu_usd: pagos.cbu_usd, alias_eur: pagos.alias_eur, cbu_eur: pagos.cbu_eur, mp_enabled: pagos.mp_enabled }, { onConflict: "professional_id" });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleDia = (i) => { const d = [...dias]; d[i].activo = !d[i].activo; setDias(d); };
  const updateDia = (i, key, val) => { const d = [...dias]; d[i][key] = val; setDias(d); };
  const updateServicio = (i, key, val) => { const sv = [...servicios]; sv[i][key] = val; setServicios(sv); };
  const removeServicio = (i) => setServicios(servicios.filter((_, idx) => idx !== i));
  const addServicio = () => setServicios([...servicios, { nombre: "", duracion: 60, precio: 0, modalidad: "ambas", currency: "ARS" }]);

  const getModStyle = (mod) => mod === "presencial" ? s.modPillP : mod === "virtual" ? s.modPillV : mod === "ambas" ? s.modPillPV : s.modPill;
  const getModLabel = (mod) => mod === "presencial" ? "Solo presencial" : mod === "virtual" ? "Solo virtual" : "Virtual y presencial";
  const cycleModalidad = (i) => { const order = ["presencial","virtual","ambas"]; const d = [...dias]; d[i].modalidad = order[(order.indexOf(d[i].modalidad)+1)%order.length]; setDias(d); };
  const cycleServicioMod = (i) => { const order = ["presencial","virtual","ambas"]; const sv = [...servicios]; sv[i].modalidad = order[(order.indexOf(sv[i].modalidad)+1)%order.length]; setServicios(sv); };

  const tabLabels = { disponibilidad: "Disponibilidad", servicios: "Servicios", pausas: "Pausas", pagos: "Pagos", profesionales: "Profesionales", bloqueos: "Días bloqueados", cuenta: "Cuenta" };

  return (
    <div style={s.main}>
      <div style={s.topbar}>
        <div>
          <div style={s.title}>Configuración</div>
          <div style={s.titleSub}>{tabLabels[tab]}</div>
        </div>
      </div>
      <div style={s.tabs}>
        {["disponibilidad","servicios","pausas","pagos","profesionales","bloqueos","cuenta"].map(t => (
          <button key={t} style={tab === t ? s.tabActive : s.tab} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={s.loadingText}>Cargando tu configuración...</div> : (
        <>
          {tab === "disponibilidad" && (
            <>
              <div style={s.card}>
                <div style={s.cardTitle}>Días y horarios de atención</div>
                {diasSemana.map((dia, i) => (
                  <div key={dia} style={s.diaRow} onMouseEnter={e => e.currentTarget.style.background = "#FDFAFF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div onClick={() => toggleDia(i)} style={{ width: "36px", height: "20px", borderRadius: "20px", background: dias[i].activo ? "#9B72C0" : "#E0D0F0", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                      <div style={{ position: "absolute", width: "14px", height: "14px", borderRadius: "50%", background: "#fff", top: "3px", left: dias[i].activo ? "19px" : "3px", transition: "0.2s" }}></div>
                    </div>
                    <div style={dias[i].activo ? s.diaNombre : s.diaNombreOff}>{dia}</div>
                    {dias[i].activo ? (
                      <>
                        <select value={dias[i].inicio} onChange={e => updateDia(i,"inicio",e.target.value)} style={s.select}>
                          {["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"].map(h => <option key={h}>{h}</option>)}
                        </select>
                        <span style={{ fontSize: "12px", color: "#C4A8D8" }}>a</span>
                        <select value={dias[i].fin} onChange={e => updateDia(i,"fin",e.target.value)} style={s.select}>
                          {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"].map(h => <option key={h}>{h}</option>)}
                        </select>
                        <button style={getModStyle(dias[i].modalidad)} onClick={() => cycleModalidad(i)}>{getModLabel(dias[i].modalidad)}</button>
                      </>
                    ) : <span style={{ fontSize: "12px", color: "#C4A8D8" }}>No atiende</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarDisponibilidad} disabled={saving}>{saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}</button>
              </div>
            </>
          )}

          {tab === "servicios" && (
            <>
              <div style={s.card}>
                <div style={s.cardTitle}>Mis servicios</div>
                {servicios.map((sv, i) => (
                  <div key={i} style={{ ...s.servicioRow, borderBottom: i === servicios.length-1 ? "none" : "0.5px solid #F0E8F8" }}>
                    <input value={sv.nombre} onChange={e => updateServicio(i,"nombre",e.target.value)} placeholder="Nombre del servicio" style={{ ...s.input, flex: 1 }} />
                    <span style={{ fontSize: "12px", color: "#9B72C0" }}>Duración</span>
                    <input type="number" value={sv.duracion} onChange={e => updateServicio(i,"duracion",e.target.value)} style={{ ...s.input, width: "60px" }} />
                    <span style={{ fontSize: "12px", color: "#C4A8D8" }}>min</span>
                    <span style={{ fontSize: "12px", color: "#9B72C0" }}>Precio</span>
                    <input type="number" value={sv.precio} onChange={e => updateServicio(i,"precio",e.target.value)} style={{ ...s.input, width: "90px" }} />
                    <div style={{ display: "flex", gap: "3px" }}>
                      {["ARS","USD","EUR"].map(cur => (
                        <button key={cur} onClick={() => updateServicio(i,"currency",cur)} style={{ padding: "4px 7px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", border: `0.5px solid ${sv.currency===cur?"#9B72C0":"#E0D0F0"}`, background: sv.currency===cur?"#EDE8FA":"#fff", color: sv.currency===cur?"#5C3F99":"#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cur}</button>
                      ))}
                    </div>
                    <button style={getModStyle(sv.modalidad)} onClick={() => cycleServicioMod(i)}>{getModLabel(sv.modalidad)}</button>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#9B72C0", cursor: "pointer", whiteSpace: "nowrap" }}>
                      <input type="checkbox" checked={sv.requiresSlot === false} onChange={e => updateServicio(i, "requiresSlot", e.target.checked ? false : true)} style={{ accentColor: "#9B72C0" }} />
                      A coordinar
                    </label>
                    <button style={s.trashBtn} onClick={() => removeServicio(i)}>🗑</button>
                  </div>
                ))}
                <button style={s.addBtn} onClick={addServicio}>+ Agregar servicio</button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarServicios} disabled={saving}>{saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}</button>
              </div>
            </>
          )}

          {tab === "pausas" && (
            <>
              {[
                { key: "pausa", label: "Pausa entre sesiones", sub: "Tiempo bloqueado entre turno y turno", unit: "min", color: "#9B72C0" },
                { key: "anticipacion", label: "Anticipación mínima", sub: "Horas antes en que puede reservar un cliente", unit: "hs", color: "#F59E0B" },
                { key: "cancelacion", label: "Plazo de cancelación", sub: "Horas antes del turno para cancelar con reembolso", unit: "hs", color: "#63B522" },
              ].map(f => (
                <div key={f.key} style={s.pausaCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...s.label, color: f.color }}>{f.label}</div>
                    <div style={{ fontSize: "12px", color: "#B89FD0", marginTop: "3px" }}>{f.sub}</div>
                  </div>
                  <input type="number" value={pausas[f.key]} onChange={e => setPausas({...pausas,[f.key]:e.target.value})} style={s.inputSm} />
                  <span style={{ fontSize: "13px", color: f.color, fontWeight: "500", minWidth: "24px" }}>{f.unit}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarPausas} disabled={saving}>{saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}</button>
              </div>
            </>
          )}

          {tab === "pagos" && (
            <>
              <div style={s.card}>
                <div style={s.cardTitle}>¿Cómo querés cobrar?</div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem" }}>
                  <button style={pagos.metodo === "transferencia" ? s.metodoBtnActive : s.metodoBtn} onClick={() => setPagos({...pagos,metodo:"transferencia"})}>🏦 Transferencia</button>
                  <button style={pagos.metodo === "mercadopago" ? s.metodoBtnActive : s.metodoBtn} onClick={() => setPagos({...pagos,metodo:"mercadopago"})}>💳 Mercado Pago</button>
                  <button style={pagos.metodo === "ambos" ? s.metodoBtnActive : s.metodoBtn} onClick={() => setPagos({...pagos,metodo:"ambos"})}>✨ Ambos</button>
                </div>
                {(pagos.metodo === "transferencia" || pagos.metodo === "ambos") && (
                  <>
                    <div style={s.label}>Pesos (ARS)</div>
                  <div style={{ marginBottom: "6px" }}></div>
                    <div style={{ marginBottom: "10px" }}>
                      <div style={s.pausaSub}>Alias</div>
                      <input type="text" value={pagos.alias} onChange={e => setPagos({...pagos,alias:e.target.value})} placeholder="tu.alias.banco" style={{...s.inputFull, marginTop: "4px"}} />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div style={s.pausaSub}>CBU (opcional)</div>
                      <input type="text" value={pagos.cbu} onChange={e => setPagos({...pagos,cbu:e.target.value})} placeholder="0000000000000000000000" style={{...s.inputFull, marginTop: "4px"}} />
                    </div>
                    <div style={{ borderTop: "0.5px solid #F0E8F8", paddingTop: "16px", marginBottom: "10px" }}>
                      <div style={s.label}>Dólares (USD)</div>
                      <div style={{ marginBottom: "6px" }}></div>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={s.pausaSub}>Alias USD</div>
                        <input type="text" value={pagos.alias_usd} onChange={e => setPagos({...pagos,alias_usd:e.target.value})} placeholder="tu.alias.usd" style={{...s.inputFull, marginTop: "4px"}} />
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={s.pausaSub}>CBU USD (opcional)</div>
                        <input type="text" value={pagos.cbu_usd} onChange={e => setPagos({...pagos,cbu_usd:e.target.value})} placeholder="0000000000000000000000" style={{...s.inputFull, marginTop: "4px"}} />
                      </div>
                    </div>
                    <div style={{ borderTop: "0.5px solid #F0E8F8", paddingTop: "16px", marginBottom: "10px" }}>
                      <div style={s.label}>Euros (EUR)</div>
                      <div style={{ marginBottom: "6px" }}></div>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={s.pausaSub}>Alias EUR</div>
                        <input type="text" value={pagos.alias_eur} onChange={e => setPagos({...pagos,alias_eur:e.target.value})} placeholder="tu.alias.eur" style={{...s.inputFull, marginTop: "4px"}} />
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={s.pausaSub}>CBU EUR (opcional)</div>
                        <input type="text" value={pagos.cbu_eur} onChange={e => setPagos({...pagos,cbu_eur:e.target.value})} placeholder="0000000000000000000000" style={{...s.inputFull, marginTop: "4px"}} />
                      </div>
                    </div>
                    <div style={s.infoBox}>💡 El cliente verá el alias que corresponda según la moneda del servicio.</div>
                  </>
                )}
                {(pagos.metodo === "mercadopago" || pagos.metodo === "ambos") && (
                  <div style={{...s.infoBox, marginTop: "12px", background: "#EDE8FA", borderLeft: "3px solid #9B72C0"}}>
                    💳 Integración con Mercado Pago próximamente.
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarPagos} disabled={saving}>{saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}</button>
              </div>
            </>
          )}
          {tab === "bloqueos" && (() => {
            const hoy = new Date(); hoy.setHours(0,0,0,0);
            const anio = mesBloqueos.getFullYear();
            const mes = mesBloqueos.getMonth();
            const diasEnMes = new Date(anio, mes + 1, 0).getDate();
            const primerDow = new Date(anio, mes, 1).getDay();
            const offset = primerDow === 0 ? 6 : primerDow - 1;
            const nombreMes = mesBloqueos.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
            const cambiarMes = (delta) => { const d = new Date(anio, mes + delta, 1); setMesBloqueos(d); };
            const toStr = (d) => `${anio}-${String(mes+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const fmtHora = (t) => t ? t.slice(0,5) : "";
            const fmtFecha = (str) => new Date(str + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
            return (
              <>
                <div style={s.card}>
                  <div style={s.cardTitle}>Seleccioná los días a bloquear</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <button onClick={() => cambiarMes(-1)} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "0.5px solid #E0D0F0", background: "#fff", cursor: "pointer", color: "#9B72C0", fontSize: "16px" }}>‹</button>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#2A1845" }}>{nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</span>
                    <button onClick={() => cambiarMes(1)} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "0.5px solid #E0D0F0", background: "#fff", cursor: "pointer", color: "#9B72C0", fontSize: "16px" }}>›</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
                    {["L","M","X","J","V","S","D"].map(d => (
                      <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "#B89FD0", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.3px" }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                    {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(d => {
                      const str = toStr(d);
                      const pasado = new Date(anio, mes, d) < hoy;
                      const selec = diasSeleccionados.has(str);
                      const bloqueoDB = bloqueosDB.find(b => b.date === str);
                      const esHoy = str === hoy.toISOString().slice(0,10);
                      let bg = "#FDFAFF", border = "0.5px solid #F0E8F8", color = "#2A1845", label = String(d);
                      if (pasado) { color = "#D0C0E0"; border = "0.5px solid #F0E8F8"; }
                      else if (selec) { bg = "#EDE8FA"; border = "1.5px solid #9B72C0"; color = "#5C3F99"; label = "✓"; }
                      else if (bloqueoDB) {
                        bg = bloqueoDB.start_time ? "#FEF3E8" : "#FCEBEB";
                        border = bloqueoDB.start_time ? "1.5px solid #D97706" : "1.5px solid #C06080";
                        color = bloqueoDB.start_time ? "#92400E" : "#A32D2D";
                        label = bloqueoDB.start_time ? "⏰" : "🔒";
                      }
                      else if (esHoy) { border = "1.5px solid #9B72C0"; color = "#7B5EA7"; }
                      return (
                        <div key={d} onClick={() => !pasado && !bloqueoDB && toggleDiaSeleccion(str)}
                          style={{ height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: selec || bloqueoDB ? "14px" : "13px", cursor: pasado || bloqueoDB ? "default" : "pointer", fontWeight: esHoy ? "600" : "400", background: bg, border, color }}>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px", fontSize: "11px", color: "#B89FD0", flexWrap: "wrap" }}>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: "#FCEBEB", border: "1px solid #C06080", marginRight: "4px", verticalAlign: "middle" }}></span>Todo el día</span>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: "#FEF3E8", border: "1px solid #D97706", marginRight: "4px", verticalAlign: "middle" }}></span>Horario parcial</span>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: "#EDE8FA", border: "1px solid #9B72C0", marginRight: "4px", verticalAlign: "middle" }}></span>Seleccionado</span>
                  </div>
                </div>

                {diasSeleccionados.size > 0 && (
                  <div style={s.card}>
                    <div style={s.cardTitle}>Configurar bloqueo — {diasSeleccionados.size} día{diasSeleccionados.size > 1 ? "s" : ""} seleccionado{diasSeleccionados.size > 1 ? "s" : ""}</div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <button onClick={() => setBloqueoTodoDia(true)} style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", border: bloqueoTodoDia ? "1.5px solid #C06080" : "0.5px solid #E0D0F0", background: bloqueoTodoDia ? "#FCEBEB" : "#fff", color: bloqueoTodoDia ? "#A32D2D" : "#B89FD0" }}>
                        🔒 Todo el día
                      </button>
                      <button onClick={() => setBloqueoTodoDia(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", border: !bloqueoTodoDia ? "1.5px solid #D97706" : "0.5px solid #E0D0F0", background: !bloqueoTodoDia ? "#FEF3E8" : "#fff", color: !bloqueoTodoDia ? "#92400E" : "#B89FD0" }}>
                        ⏰ Rango de horas
                      </button>
                    </div>
                    {!bloqueoTodoDia && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <div style={s.label}>Desde</div>
                          <input type="time" value={bloqueoHoraInicio} onChange={e => setBloqueoHoraInicio(e.target.value)} style={{ ...s.inputFull, marginTop: "4px" }} />
                        </div>
                        <div>
                          <div style={s.label}>Hasta</div>
                          <input type="time" value={bloqueoHoraFin} onChange={e => setBloqueoHoraFin(e.target.value)} style={{ ...s.inputFull, marginTop: "4px" }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button onClick={() => setDiasSeleccionados(new Set())} style={{ flex: 1, padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancelar</button>
                      <button onClick={guardarBloqueos} disabled={savingBloqueos} style={{ flex: 1, padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" }}>
                        {savingBloqueos ? "Guardando..." : `Bloquear ${diasSeleccionados.size} día${diasSeleccionados.size > 1 ? "s" : ""}`}
                      </button>
                    </div>
                  </div>
                )}

                {bloqueosDB.length > 0 && (
                  <div style={s.card}>
                    <div style={s.cardTitle}>Bloqueos guardados</div>
                    {bloqueosDB.map((b, i) => (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 8px", borderRadius: "8px", borderBottom: i < bloqueosDB.length - 1 ? "0.5px solid #F0E8F8" : "none" }}>
                        <div style={{ fontSize: "16px" }}>{b.start_time ? "⏰" : "🔒"}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>{fmtFecha(b.date)}</div>
                          <div style={{ fontSize: "11px", color: "#B89FD0", marginTop: "1px" }}>
                            {b.start_time ? `${fmtHora(b.start_time)} – ${fmtHora(b.end_time)}` : "Todo el día"}
                          </div>
                        </div>
                        <button onClick={() => eliminarBloqueo(b.id)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #F0D0D8", background: "#FEF0F3", cursor: "pointer", color: "#C06080", fontSize: "14px" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {bloqueosMsg && <div style={{ fontSize: "12px", color: "#3B6D11", background: "#EAF3DE", padding: "10px 14px", borderRadius: "8px" }}>{bloqueosMsg}</div>}
              </>
            );
          })()}

          {tab === "profesionales" && (
            <>
              <div style={s.card}>
                <div style={s.cardTitle}>Profesionales activos</div>
                {profesionales.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#B89FD0", padding: "0.5rem 0" }}>No hay profesionales registrados</div>
                ) : profesionales.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 8px", borderRadius: "8px", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FDFAFF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#3B2460", fontWeight: "600", flexShrink: 0 }}>
                      {p.full_name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>{p.full_name}</div>
                      <div style={{ fontSize: "11px", color: "#B89FD0" }}>{p.email}</div>
                    </div>
                    <button style={s.trashBtn} onClick={() => eliminarProfesional(p.id, p.full_name)}>🗑</button>
                  </div>
                ))}
              </div>

              <div style={s.card}>
                <div style={s.cardTitle}>Agregar profesional</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={s.pausaSub}>Nombre completo</div>
                    <input value={nuevoProf.nombre} onChange={e => setNuevoProf({...nuevoProf, nombre: e.target.value})} placeholder="María García" style={{...s.inputFull, marginTop: "4px"}} />
                  </div>
                  <div>
                    <div style={s.pausaSub}>Email</div>
                    <input type="email" value={nuevoProf.email} onChange={e => setNuevoProf({...nuevoProf, email: e.target.value})} placeholder="maru@mail.com" style={{...s.inputFull, marginTop: "4px"}} />
                  </div>
                  <div>
                    <div style={s.pausaSub}>Contraseña temporal</div>
                    <input type="password" value={nuevoProf.password} onChange={e => setNuevoProf({...nuevoProf, password: e.target.value})} placeholder="mínimo 6 caracteres" style={{...s.inputFull, marginTop: "4px"}} />
                  </div>
                  {profMsg && <div style={{ fontSize: "12px", color: profMsg.startsWith("✓") ? "#3B6D11" : "#A32D2D" }}>{profMsg}</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button style={s.saveBtn} onClick={agregarProfesional} disabled={savingProf || !nuevoProf.nombre || !nuevoProf.email || !nuevoProf.password}>
                      {savingProf ? "Creando..." : "Crear profesional"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === "cuenta" && (
            <>
            <div style={s.card}>
              <div style={s.cardTitle}>Datos de contacto</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={s.pausaSub}>Teléfono</div>
                  <input value={contactoForm.phone} onChange={e => setContactoForm({...contactoForm, phone: e.target.value})} placeholder="+54 9 11 1234-5678" style={{...s.inputFull, marginTop: "4px"}} />
                </div>
                <div>
                  <div style={s.pausaSub}>Domicilio (para turnos presenciales)</div>
                  <input value={contactoForm.address} onChange={e => setContactoForm({...contactoForm, address: e.target.value})} placeholder="Av. Corrientes 1234, CABA" style={{...s.inputFull, marginTop: "4px"}} />
                </div>
                {contactoMsg && <div style={{ fontSize: "12px", color: contactoMsg.startsWith("✓") ? "#3B6D11" : "#A32D2D" }}>{contactoMsg}</div>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={s.saveBtn} onClick={async () => {
                    const uid = await getUid();
                    const { error } = await supabase.from("profiles").update({ phone: contactoForm.phone, address: contactoForm.address }).eq("id", uid);
                    if (error) setContactoMsg("Error al guardar");
                    else { setContactoMsg("✓ Guardado"); setTimeout(() => setContactoMsg(""), 2000); }
                  }}>Guardar contacto</button>
                </div>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Mi nombre</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={s.pausaSub}>Nombre que se muestra en la app</div>
                  <input value={nombreForm} onChange={e => setNombreForm(e.target.value)} placeholder="Tu nombre" style={{...s.inputFull, marginTop: "4px"}} />
                </div>
                {nombreMsg && <div style={{ fontSize: "12px", color: nombreMsg.startsWith("✓") ? "#3B6D11" : "#A32D2D" }}>{nombreMsg}</div>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={s.saveBtn} disabled={!nombreForm} onClick={async () => {
                    const uid = await getUid();
                    const { error } = await supabase.from("profiles").update({ full_name: nombreForm }).eq("id", uid);
                    if (error) setNombreMsg("Error al guardar");
                    else { setNombreMsg("✓ Nombre actualizado"); setTimeout(() => setNombreMsg(""), 2000); }
                  }}>Guardar nombre</button>
                </div>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Código de acceso</div>
              <div style={{ fontSize: "12px", color: "#B89FD0", marginBottom: "8px" }}>Solo quien tenga este código puede crear una cuenta de profesional.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={s.pausaSub}>Código</div>
                  <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="ej: CocinasPRO2025" style={{...s.inputFull, marginTop: "4px"}} />
                </div>
                {inviteMsg && <div style={{ fontSize: "12px", color: inviteMsg.startsWith("✓") ? "#3B6D11" : "#A32D2D" }}>{inviteMsg}</div>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={s.saveBtn} onClick={async () => {
                    await supabase.from("app_config").update({ value: inviteCode }).eq("key", "invite_code");
                    setInviteMsg("✓ Código actualizado"); setTimeout(() => setInviteMsg(""), 2000);
                  }}>Guardar código</button>
                </div>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Período de reservas</div>
              <div style={{ fontSize: "12px", color: "#B89FD0", marginBottom: "8px" }}>Los clientes solo pueden reservar entre estas fechas. Si no hay fechas configuradas, las reservas están cerradas.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <div style={s.pausaSub}>Apertura</div>
                    <input type="date" value={reservasForm.desde} onChange={e => setReservasForm({...reservasForm, desde: e.target.value})} style={{...s.inputFull, marginTop: "4px"}} />
                  </div>
                  <div>
                    <div style={s.pausaSub}>Cierre</div>
                    <input type="date" value={reservasForm.hasta} onChange={e => setReservasForm({...reservasForm, hasta: e.target.value})} style={{...s.inputFull, marginTop: "4px"}} />
                  </div>
                </div>
                {reservasMsg && <div style={{ fontSize: "12px", color: reservasMsg.startsWith("✓") ? "#3B6D11" : "#A32D2D" }}>{reservasMsg}</div>}
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button style={{ ...s.saveBtn, background: "#F3F4F6", color: "#6B7280", border: "0.5px solid #E5E7EB" }} onClick={async () => {
                    const uid = await getUid();
                    const { error } = await supabase.from("profiles").update({ reservas_desde: null, reservas_hasta: null }).eq("id", uid);
                    if (error) setReservasMsg("Error al guardar");
                    else { setReservasForm({ desde: "", hasta: "" }); setReservasMsg("✓ Reservas cerradas"); setTimeout(() => setReservasMsg(""), 2000); }
                  }}>Cerrar reservas</button>
                  <button style={s.saveBtn} onClick={async () => {
                    const uid = await getUid();
                    const { error } = await supabase.from("profiles").update({ reservas_desde: reservasForm.desde || null, reservas_hasta: reservasForm.hasta || null }).eq("id", uid);
                    if (error) setReservasMsg("Error al guardar");
                    else { setReservasMsg("✓ Guardado"); setTimeout(() => setReservasMsg(""), 2000); }
                  }}>Guardar período</button>
                </div>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Cambiar contraseña</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={s.pausaSub}>Nueva contraseña</div>
                  <input type="password" value={passForm.nueva} onChange={e => setPassForm({...passForm, nueva: e.target.value})} placeholder="mínimo 6 caracteres" style={{...s.inputFull, marginTop: "4px"}} />
                </div>
                <div>
                  <div style={s.pausaSub}>Confirmar contraseña</div>
                  <input type="password" value={passForm.confirmar} onChange={e => setPassForm({...passForm, confirmar: e.target.value})} placeholder="repetí la nueva contraseña" style={{...s.inputFull, marginTop: "4px"}} />
                </div>
                {passMsg && <div style={{ fontSize: "12px", color: passMsg.startsWith("✓") ? "#3B6D11" : "#A32D2D" }}>{passMsg}</div>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={s.saveBtn} disabled={!passForm.nueva || !passForm.confirmar} onClick={async () => {
                    if (passForm.nueva !== passForm.confirmar) { setPassMsg("Las contraseñas no coinciden"); return; }
                    if (passForm.nueva.length < 6) { setPassMsg("Mínimo 6 caracteres"); return; }
                    const { error } = await supabase.auth.updateUser({ password: passForm.nueva });
                    if (error) setPassMsg("Error: " + error.message);
                    else { setPassMsg("✓ Contraseña actualizada"); setPassForm({ nueva: "", confirmar: "" }); }
                  }}>Guardar contraseña</button>
                </div>
              </div>
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
}