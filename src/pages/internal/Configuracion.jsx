import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  tabs: { display: "flex", gap: "6px", flexWrap: "wrap" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem" },
  cardTitle: { fontSize: "14px", fontWeight: "500", color: "#2A1845", marginBottom: "1rem" },
  diaRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #F0E8F8" },
  diaNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845", minWidth: "90px" },
  diaNombreOff: { fontSize: "13px", fontWeight: "500", color: "#C4A8D8", minWidth: "90px" },
  select: { fontSize: "12px", padding: "5px 8px", border: "0.5px solid #E0D0F0", borderRadius: "7px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillP: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #E88BB0", background: "#FDE8F0", color: "#A0407A", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillV: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillPV: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#F3EEFA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPill: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  servicioRow: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid #F0E8F8" },
  input: { fontSize: "12px", padding: "5px 8px", border: "0.5px solid #E0D0F0", borderRadius: "7px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  inputFull: { fontSize: "13px", padding: "10px 12px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" },
  trashBtn: { width: "26px", height: "26px", borderRadius: "6px", border: "0.5px solid #F0D0D8", background: "#FEF0F3", cursor: "pointer", color: "#C06080", fontSize: "13px" },
  addBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "#fff", color: "#9B72C0", border: "0.5px solid #C4A8D8", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "10px" },
  saveBtn: { padding: "9px 24px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  saveBtnOk: { padding: "9px 24px", background: "#3B6D11", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  pausaRow: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 0", borderBottom: "0.5px solid #F0E8F8" },
  pausaSub: { fontSize: "12px", color: "#9B72C0" },
  inputSm: { fontSize: "13px", padding: "6px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "70px" },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  loadingText: { fontSize: "13px", color: "#B89FD0", padding: "1rem 0" },
  field: { display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  metodoBtn: { flex: 1, padding: "12px", borderRadius: "10px", border: "0.5px solid #E0D0F0", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center" },
  metodoBtnActive: { flex: 1, padding: "12px", borderRadius: "10px", border: "2px solid #9B72C0", fontSize: "13px", cursor: "pointer", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center" },
  infoBox: { background: "#F8F4FC", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#5C3F99", borderLeft: "3px solid #C4A8D8" },
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

export default function Configuracion({ setPage }) {
  const [tab, setTab] = useState("disponibilidad");
  const [dias, setDias] = useState(defaultDias);
  const [servicios, setServicios] = useState([{ nombre: "", duracion: 60, precio: 0, modalidad: "ambas" }]);
  const [pausas, setPausas] = useState({ pausa: 15, anticipacion: 24, cancelacion: 24 });
  const [pagos, setPagos] = useState({ metodo: "transferencia", alias: "", cbu: "", mp_enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const uid = await getUid();
      if (!uid) { setLoading(false); return; }

      const { data: svs } = await supabase.from("services").select("*").eq("professional_id", uid);
      if (svs && svs.length > 0) {
        setServicios(svs.map(sv => ({ id: sv.id, nombre: sv.name, duracion: sv.duration_minutes, precio: sv.price, modalidad: sv.modality })));
      }

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
        setPagos({ metodo: cfg.payment_method || "transferencia", alias: cfg.alias || "", cbu: cfg.cbu || "", mp_enabled: cfg.mp_enabled || false });
      }

      setLoading(false);
    };
    cargar();
  }, []);

  const guardarServicios = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("services").delete().eq("professional_id", uid);
    const rows = servicios.filter(sv => sv.nombre).map(sv => ({
      professional_id: uid, name: sv.nombre, duration_minutes: parseInt(sv.duracion), price: parseFloat(sv.precio), modality: sv.modalidad, active: true
    }));
    if (rows.length > 0) await supabase.from("services").insert(rows);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const guardarDisponibilidad = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("availability").delete().eq("professional_id", uid);
    const rows = dias.map((d, i) => ({
      professional_id: uid, day_of_week: i === 6 ? 0 : i + 1, start_time: d.inicio, end_time: d.fin, modality: d.modalidad, active: d.activo
    }));
    await supabase.from("availability").insert(rows);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const guardarPausas = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("settings").upsert({
      professional_id: uid, break_minutes: parseInt(pausas.pausa), min_advance_hours: parseInt(pausas.anticipacion), cancellation_hours: parseInt(pausas.cancelacion)
    }, { onConflict: "professional_id" });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const guardarPagos = async () => {
    setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return; }
    await supabase.from("settings").upsert({
      professional_id: uid,
      payment_method: pagos.metodo,
      alias: pagos.alias,
      cbu: pagos.cbu,
      mp_enabled: pagos.mp_enabled
    }, { onConflict: "professional_id" });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleDia = (i) => { const d = [...dias]; d[i].activo = !d[i].activo; setDias(d); };
  const updateDia = (i, key, val) => { const d = [...dias]; d[i][key] = val; setDias(d); };
  const updateServicio = (i, key, val) => { const sv = [...servicios]; sv[i][key] = val; setServicios(sv); };
  const removeServicio = (i) => setServicios(servicios.filter((_, idx) => idx !== i));
  const addServicio = () => setServicios([...servicios, { nombre: "", duracion: 60, precio: 0, modalidad: "ambas" }]);

  const getModStyle = (mod) => {
    if (mod === "presencial") return s.modPillP;
    if (mod === "virtual") return s.modPillV;
    if (mod === "ambas") return s.modPillPV;
    return s.modPill;
  };

  const cycleModalidad = (i) => {
    const order = ["presencial", "virtual", "ambas"];
    const d = [...dias]; d[i].modalidad = order[(order.indexOf(d[i].modalidad) + 1) % order.length]; setDias(d);
  };

  const cycleServicioMod = (i) => {
    const order = ["presencial", "virtual", "ambas"];
    const sv = [...servicios]; sv[i].modalidad = order[(order.indexOf(sv[i].modalidad) + 1) % order.length]; setServicios(sv);
  };

  const getModLabel = (mod) => {
    if (mod === "presencial") return "Solo presencial";
    if (mod === "virtual") return "Solo virtual";
    return "Virtual y presencial";
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.logo}>🗓 AgendaLec</div>
        <button style={s.navItem} onClick={() => setPage("dashboard")}>🏠 Inicio</button>
        <button style={s.navItem} onClick={() => setPage("agenda")}>📅 Mi agenda</button>
        <button style={s.navItem} onClick={() => setPage("clientes")}>👥 Clientes</button>
        <button style={s.navItem} onClick={() => setPage("cobros")}>💰 Cobros</button>
        <button style={s.navItemActive}>⚙️ Configuración</button>
        <button style={s.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={s.main}>
        <div style={s.title}>Configuración</div>
        <div style={s.tabs}>
          {["disponibilidad", "servicios", "pausas", "pagos"].map(t => (
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
                    <div key={dia} style={{ ...s.diaRow, borderBottom: i === 6 ? "none" : "0.5px solid #F0E8F8" }}>
                      <div onClick={() => toggleDia(i)} style={{ width: "36px", height: "20px", borderRadius: "20px", background: dias[i].activo ? "#9B72C0" : "#E0D0F0", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                        <div style={{ position: "absolute", width: "14px", height: "14px", borderRadius: "50%", background: "#fff", top: "3px", left: dias[i].activo ? "19px" : "3px", transition: "0.2s" }}></div>
                      </div>
                      <div style={dias[i].activo ? s.diaNombre : s.diaNombreOff}>{dia}</div>
                      {dias[i].activo ? (
                        <>
                          <select value={dias[i].inicio} onChange={e => updateDia(i, "inicio", e.target.value)} style={s.select}>
                            {["08:00","09:00","10:00","11:00","12:00"].map(h => <option key={h}>{h}</option>)}
                          </select>
                          <span style={{ fontSize: "12px", color: "#C4A8D8" }}>a</span>
                          <select value={dias[i].fin} onChange={e => updateDia(i, "fin", e.target.value)} style={s.select}>
                            {["13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(h => <option key={h}>{h}</option>)}
                          </select>
                          <button style={getModStyle(dias[i].modalidad)} onClick={() => cycleModalidad(i)}>{getModLabel(dias[i].modalidad)}</button>
                        </>
                      ) : <span style={{ fontSize: "12px", color: "#C4A8D8" }}>No atiende</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarDisponibilidad} disabled={saving}>
                    {saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}

            {tab === "servicios" && (
              <>
                <div style={s.card}>
                  <div style={s.cardTitle}>Mis servicios</div>
                  {servicios.map((sv, i) => (
                    <div key={i} style={{ ...s.servicioRow, borderBottom: i === servicios.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                      <input value={sv.nombre} onChange={e => updateServicio(i, "nombre", e.target.value)} placeholder="Nombre del servicio" style={{ ...s.input, flex: 1 }} />
                      <span style={{ fontSize: "12px", color: "#9B72C0" }}>Duración</span>
                      <input type="number" value={sv.duracion} onChange={e => updateServicio(i, "duracion", e.target.value)} style={{ ...s.input, width: "60px" }} />
                      <span style={{ fontSize: "12px", color: "#C4A8D8" }}>min</span>
                      <span style={{ fontSize: "12px", color: "#9B72C0" }}>Precio</span>
                      <input type="number" value={sv.precio} onChange={e => updateServicio(i, "precio", e.target.value)} style={{ ...s.input, width: "90px" }} />
                      <button style={getModStyle(sv.modalidad)} onClick={() => cycleServicioMod(i)}>{getModLabel(sv.modalidad)}</button>
                      <button style={s.trashBtn} onClick={() => removeServicio(i)}>🗑</button>
                    </div>
                  ))}
                  <button style={s.addBtn} onClick={addServicio}>+ Agregar servicio</button>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarServicios} disabled={saving}>
                    {saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}

            {tab === "pausas" && (
              <>
                {[
                  { key: "pausa", label: "Pausa entre sesiones", sub: "Tiempo bloqueado automáticamente entre turno y turno", unit: "min" },
                  { key: "anticipacion", label: "Anticipación mínima para reservar", sub: "Horas antes en que puede reservar un cliente online", unit: "hs" },
                  { key: "cancelacion", label: "Plazo de cancelación con reembolso", sub: "Horas antes del turno para cancelar con devolución de seña", unit: "hs" },
                ].map(f => (
                  <div key={f.key} style={s.card}>
                    <div style={s.cardTitle}>{f.label}</div>
                    <div style={{ ...s.pausaRow, borderBottom: "none" }}>
                      <div style={{ flex: 1 }}><div style={s.pausaSub}>{f.sub}</div></div>
                      <input type="number" value={pausas[f.key]} onChange={e => setPausas({ ...pausas, [f.key]: e.target.value })} style={s.inputSm} />
                      <span style={{ fontSize: "13px", color: "#9B72C0" }}>{f.unit}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarPausas} disabled={saving}>
                    {saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}

            {tab === "pagos" && (
              <>
                <div style={s.card}>
                  <div style={s.cardTitle}>¿Cómo querés cobrar?</div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem" }}>
                    <button style={pagos.metodo === "transferencia" ? s.metodoBtnActive : s.metodoBtn} onClick={() => setPagos({ ...pagos, metodo: "transferencia" })}>
                      🏦 Transferencia bancaria
                    </button>
                    <button style={pagos.metodo === "mercadopago" ? s.metodoBtnActive : s.metodoBtn} onClick={() => setPagos({ ...pagos, metodo: "mercadopago" })}>
                      💳 Mercado Pago
                    </button>
                    <button style={pagos.metodo === "ambos" ? s.metodoBtnActive : s.metodoBtn} onClick={() => setPagos({ ...pagos, metodo: "ambos" })}>
                      ✨ Ambos
                    </button>
                  </div>

                  {(pagos.metodo === "transferencia" || pagos.metodo === "ambos") && (
                    <>
                      <div style={s.field}>
                        <label style={s.label}>Alias</label>
                        <input type="text" value={pagos.alias} onChange={e => setPagos({ ...pagos, alias: e.target.value })} placeholder="tu.alias.mp" style={s.inputFull} />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>CBU (opcional)</label>
                        <input type="text" value={pagos.cbu} onChange={e => setPagos({ ...pagos, cbu: e.target.value })} placeholder="0000000000000000000000" style={s.inputFull} />
                      </div>
                      <div style={s.infoBox}>
                        💡 El cliente verá tu alias al reservar y al recibir el recordatorio de pago 12hs antes del turno.
                      </div>
                    </>
                  )}

                  {(pagos.metodo === "mercadopago" || pagos.metodo === "ambos") && (
                    <div style={{ ...s.infoBox, marginTop: "12px", background: "#EDE8FA", borderLeft: "3px solid #9B72C0" }}>
                      💳 La integración con Mercado Pago estará disponible próximamente. Por ahora podés usar transferencia bancaria.
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button style={saved ? s.saveBtnOk : s.saveBtn} onClick={guardarPagos} disabled={saving}>
                    {saving ? "Guardando..." : saved ? "✓ Guardado!" : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}