import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { linkWhatsApp } from "../../utils/whatsapp";

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  saveBtn: { width: "100%", padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" },
  cancelBtn: { width: "100%", padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
  panel: { position: "fixed", top: 0, right: 0, width: "420px", height: "100vh", background: "#fff", borderLeft: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", zIndex: 100, boxShadow: "-4px 0 24px rgba(42,24,69,0.08)" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(42,24,69,0.2)", zIndex: 99 },
  eventoCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer" },
  modPill: { fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagPagado: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  tagPendiente: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagCortesia: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FDE8F0", color: "#A0407A" },
  btnWA: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 8px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

const getUid = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

export default function Grupales() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [eventos, setEventos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProf, setFiltroProf] = useState("todos");
  const [tab, setTab] = useState("proximos");
  const [loading, setLoading] = useState(true);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [loadingAsistentes, setLoadingAsistentes] = useState(false);
  const [subiendo, setSubiendo] = useState(null);

  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({ nombre: "", fecha: "", hora: "", precio: "", currency: "ARS", cupo: "", modalidad: "ambas" });
  const [savingNuevo, setSavingNuevo] = useState(false);
  const [nuevoError, setNuevoError] = useState("");

  const [asistenteForm, setAsistenteForm] = useState({ nombre: "", telefono: "", mail: "", precioDescuento: "" });
  const [comprobanteAsistente, setComprobanteAsistente] = useState(null);
  const [asistenteEditandoId, setAsistenteEditandoId] = useState(null);
  const [editAsistenteForm, setEditAsistenteForm] = useState({ nombre: "", telefono: "", mail: "", precioDescuento: "" });
  const [asistenteDetalleId, setAsistenteDetalleId] = useState(null);
  const [savingEditAsistente, setSavingEditAsistente] = useState(false);
  const [savingAsistente, setSavingAsistente] = useState(false);

  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", fecha: "", hora: "", precio: "", currency: "ARS", cupo: "", modalidad: "ambas" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const cargar = async () => {
    setLoading(true);
    let query = supabase.from("group_events").select("*, group_attendees(id, status)").order("date", { ascending: true });
    if (filtroProf !== "todos") query = query.eq("professional_id", filtroProf);
    const { data } = await query;
    setEventos(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [filtroProf]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.from("profiles").select("id, full_name").eq("role", "professional").then(({ data }) => setProfesionales(data || []));
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const crearEvento = async () => {
    setNuevoError("");
    if (!nuevoForm.nombre.trim()) { setNuevoError("Falta el nombre."); return; }
    setSavingNuevo(true);
    const uid = await getUid();
    if (!uid) { setSavingNuevo(false); return; }
    const { error } = await supabase.from("group_events").insert({
      professional_id: uid,
      name: nuevoForm.nombre.trim(),
      date: nuevoForm.fecha || null,
      event_time: nuevoForm.hora || null,
      price: nuevoForm.precio ? parseFloat(nuevoForm.precio) : null,
      currency: nuevoForm.currency,
      capacity: nuevoForm.cupo ? parseInt(nuevoForm.cupo) : null,
      modality: nuevoForm.modalidad,
    });
    if (error) { setNuevoError("Error al crear: " + error.message); setSavingNuevo(false); return; }
    await cargar();
    setSavingNuevo(false);
    setNuevoAbierto(false);
    setNuevoForm({ nombre: "", fecha: "", hora: "", precio: "", currency: "ARS", cupo: "", modalidad: "ambas" });
  };

  const eliminarEvento = async (ev) => {
    if (!window.confirm(`¿Eliminar "${ev.name}"? Se borrarán también los asistentes anotados.`)) return;
    await supabase.from("group_attendees").delete().eq("event_id", ev.id);
    await supabase.from("group_events").delete().eq("id", ev.id);
    setEventoSeleccionado(null);
    await cargar();
  };

  const abrirEvento = async (ev) => {
    setEventoSeleccionado(ev);
    setEditando(false);
    setAsistenteDetalleId(null);
    setAsistenteEditandoId(null);
    setLoadingAsistentes(true);
    const { data } = await supabase.from("group_attendees").select("*").eq("event_id", ev.id).order("created_at");
    setAsistentes(data || []);
    setLoadingAsistentes(false);
  };

  const iniciarEdicion = () => {
    setEditForm({
      nombre: eventoSeleccionado.name,
      fecha: eventoSeleccionado.date || "",
      hora: eventoSeleccionado.event_time || "",
      precio: eventoSeleccionado.price != null ? String(eventoSeleccionado.price) : "",
      currency: eventoSeleccionado.currency || "ARS",
      cupo: eventoSeleccionado.capacity != null ? String(eventoSeleccionado.capacity) : "",
      modalidad: eventoSeleccionado.modality || "ambas",
    });
    setEditError("");
    setEditando(true);
  };

  const guardarEdicion = async () => {
    setEditError("");
    if (!editForm.nombre.trim()) { setEditError("Falta el nombre."); return; }
    setSavingEdit(true);
    const { error } = await supabase.from("group_events").update({
      name: editForm.nombre.trim(),
      date: editForm.fecha || null,
      event_time: editForm.hora || null,
      price: editForm.precio ? parseFloat(editForm.precio) : null,
      currency: editForm.currency,
      capacity: editForm.cupo ? parseInt(editForm.cupo) : null,
      modality: editForm.modalidad,
    }).eq("id", eventoSeleccionado.id);
    if (error) { setEditError("Error al guardar: " + error.message); setSavingEdit(false); return; }
    const { data } = await supabase.from("group_events").select("*, group_attendees(id, status)").eq("id", eventoSeleccionado.id).single();
    setEventoSeleccionado(data);
    setSavingEdit(false);
    setEditando(false);
    await cargar();
  };

  const refrescarAsistentes = async () => {
    if (!eventoSeleccionado) return;
    const { data } = await supabase.from("group_attendees").select("*").eq("event_id", eventoSeleccionado.id).order("created_at");
    setAsistentes(data || []);
    await cargar();
  };

  const agregarAsistente = async () => {
    if (!asistenteForm.nombre.trim()) return;
    setSavingAsistente(true);
    const { data: nuevo, error } = await supabase.from("group_attendees").insert({
      event_id: eventoSeleccionado.id,
      full_name: asistenteForm.nombre.trim(),
      phone: asistenteForm.telefono || null,
      email: asistenteForm.mail || null,
      custom_price: asistenteForm.precioDescuento !== "" ? parseFloat(asistenteForm.precioDescuento) : null,
      status: "pending",
    }).select("id").single();
    if (error) { alert("Error al agregar: " + error.message); setSavingAsistente(false); return; }

    if (comprobanteAsistente) {
      const ext = comprobanteAsistente.name.split(".").pop();
      const { data: uploadData, error: errUpload } = await supabase.storage
        .from("comprobantes")
        .upload(`grupal-${nuevo.id}.${ext}`, comprobanteAsistente, { contentType: comprobanteAsistente.type, upsert: true });
      if (errUpload) {
        alert("La persona se anotó, pero no se pudo subir el comprobante: " + errUpload.message);
      } else {
        const { data: { publicUrl: rawUrl } } = supabase.storage.from("comprobantes").getPublicUrl(uploadData.path);
      // Sin esto, resubir con el mismo nombre de archivo deja el link
      // idéntico al anterior y el navegador sigue mostrando la imagen vieja
      // en caché aunque el archivo ya haya cambiado del lado del servidor.
      const publicUrl = `${rawUrl}?t=${Date.now()}`;
        const { error: errUpdate } = await supabase.from("group_attendees").update({ receipt_url: publicUrl }).eq("id", nuevo.id);
        if (errUpdate) alert("La persona se anotó, pero no se pudo guardar el comprobante: " + errUpdate.message);
      }
    }

    setAsistenteForm({ nombre: "", telefono: "", mail: "", precioDescuento: "" });
    setComprobanteAsistente(null);
    setSavingAsistente(false);
    await refrescarAsistentes();
  };

  const eliminarAsistente = async (id) => {
    await supabase.from("group_attendees").delete().eq("id", id);
    await refrescarAsistentes();
  };

  const iniciarEdicionAsistente = (a) => {
    setEditAsistenteForm({ nombre: a.full_name, telefono: a.phone || "", mail: a.email || "", precioDescuento: a.custom_price != null ? String(a.custom_price) : "" });
    setAsistenteEditandoId(a.id);
  };

  const guardarEdicionAsistente = async () => {
    if (!editAsistenteForm.nombre.trim()) return;
    setSavingEditAsistente(true);
    const { error } = await supabase.from("group_attendees").update({
      full_name: editAsistenteForm.nombre.trim(),
      phone: editAsistenteForm.telefono || null,
      email: editAsistenteForm.mail || null,
      custom_price: editAsistenteForm.precioDescuento !== "" ? parseFloat(editAsistenteForm.precioDescuento) : null,
    }).eq("id", asistenteEditandoId);
    if (error) { alert("No se pudo guardar: " + error.message); setSavingEditAsistente(false); return; }
    setSavingEditAsistente(false);
    setAsistenteEditandoId(null);
    await refrescarAsistentes();
  };

  const cambiarEstadoAsistente = async (asistente, nuevoEstado) => {
    await supabase.from("group_attendees").update({ status: nuevoEstado }).eq("id", asistente.id);
    await refrescarAsistentes();
  };

  const subirComprobante = async (asistenteId, file) => {
    if (!file) return;
    setSubiendo(asistenteId);
    const ext = file.name.split(".").pop();
    const { data: uploadData, error: errUpload } = await supabase.storage
      .from("comprobantes")
      .upload(`grupal-${asistenteId}.${ext}`, file, { contentType: file.type, upsert: true });
    if (errUpload) {
      alert("No se pudo subir el comprobante: " + errUpload.message);
    } else if (uploadData) {
      const { data: { publicUrl: rawUrl } } = supabase.storage.from("comprobantes").getPublicUrl(uploadData.path);
      // Sin esto, resubir con el mismo nombre de archivo deja el link
      // idéntico al anterior y el navegador sigue mostrando la imagen vieja
      // en caché aunque el archivo ya haya cambiado del lado del servidor.
      const publicUrl = `${rawUrl}?t=${Date.now()}`;
      const { error: errUpdate } = await supabase.from("group_attendees").update({ receipt_url: publicUrl }).eq("id", asistenteId);
      if (errUpdate) alert("No se pudo guardar el comprobante: " + errUpdate.message);
    }
    setSubiendo(null);
    await refrescarAsistentes();
  };

  const symFor = (cur) => cur === "USD" ? "U$S " : cur === "EUR" ? "€" : "$";
  const modLabel = (m) => m === "virtual" ? "📹 Virtual" : m === "presencial" ? "📍 Presencial" : "🔀 Virtual y presencial";

  const hoyISO = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  // Un evento pasa solo a Historial cuando ya tuvo lugar: sin fecha
  // asignada, o con fecha de hoy en adelante, sigue en Próximos.
  const proximos = eventos.filter(ev => !ev.date || ev.date >= hoyISO);
  const historial = eventos.filter(ev => ev.date && ev.date < hoyISO).sort((a, b) => b.date.localeCompare(a.date));
  const eventosVisibles = tab === "proximos" ? proximos : historial;

  return (
    <div style={{ ...s.main, padding: isMobile ? "1rem" : "1.5rem" }}>
      <div style={{ ...s.topbar, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? "10px" : 0 }}>
        <div>
          <div style={s.title}>Cursos y grupales</div>
          <div style={s.titleSub}>{eventos.length} eventos cargados</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {profesionales.length > 1 && (
            <select value={filtroProf} onChange={e => setFiltroProf(e.target.value)}
              style={{ fontSize: "12px", padding: "6px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#5C3F99", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <option value="todos">Todos los profesionales</option>
              {profesionales.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          )}
          <button onClick={() => setNuevoAbierto(true)} style={{ padding: "8px 16px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" }}>+ Nuevo evento</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        <button style={tab === "proximos" ? s.tabActive : s.tab} onClick={() => setTab("proximos")}>
          Próximos {proximos.length > 0 && <span style={{ marginLeft: "4px", background: "#9B72C0", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "11px" }}>{proximos.length}</span>}
        </button>
        <button style={tab === "historial" ? s.tabActive : s.tab} onClick={() => setTab("historial")}>
          Historial {historial.length > 0 && <span style={{ marginLeft: "4px", background: "#B89FD0", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "11px" }}>{historial.length}</span>}
        </button>
      </div>

      {loading ? (
        <div style={{ ...s.card, ...s.emptyText }}>Cargando...</div>
      ) : eventosVisibles.length === 0 ? (
        <div style={{ ...s.card, ...s.emptyText }}>
          {tab === "proximos" ? "No hay cursos ni eventos grupales por venir" : "Todavía no hay eventos en el historial"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {eventosVisibles.map((ev, i) => {
            const total = ev.group_attendees?.length || 0;
            const pagados = ev.group_attendees?.filter(a => a.status === "paid").length || 0;
            const cortesias = ev.group_attendees?.filter(a => a.status === "cortesia").length || 0;
            return (
              <div key={i} style={s.eventoCard} onClick={() => abrirEvento(ev)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#2A1845" }}>{ev.name}</div>
                    <div style={{ fontSize: "12px", color: "#B89FD0", marginTop: "2px" }}>
                      {ev.date ? new Date(ev.date + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }) : "Sin fecha"}
                      {ev.event_time && ` · ${ev.event_time.slice(0,5)} hs`}
                      {ev.price != null && ` · ${symFor(ev.currency)}${ev.price.toLocaleString("es-AR")} por persona`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={s.modPill}>{modLabel(ev.modality)}</span>
                    <span style={{ fontSize: "12px", color: "#5C3F99", fontWeight: "500" }}>{total}{ev.capacity ? `/${ev.capacity}` : ""} anotados</span>
                    <span style={s.tagPagado}>{pagados} pagó</span>
                    {cortesias > 0 && <span style={s.tagCortesia}>🎁 {cortesias}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {eventoSeleccionado && (
        <>
          <div style={s.overlay} onClick={() => setEventoSeleccionado(null)} />
          <div style={isMobile ? { ...s.panel, width: "100%" } : s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>{eventoSeleccionado.name}</div>
                <div style={{ fontSize: "12px", color: "#B89FD0", marginTop: "2px" }}>
                  {eventoSeleccionado.date ? new Date(eventoSeleccionado.date + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "Sin fecha"}
                  {eventoSeleccionado.event_time && ` · ${eventoSeleccionado.event_time.slice(0,5)} hs`}
                  {eventoSeleccionado.price != null && ` · ${symFor(eventoSeleccionado.currency)}${eventoSeleccionado.price.toLocaleString("es-AR")} p/persona`}
                  {eventoSeleccionado.capacity && ` · cupo ${eventoSeleccionado.capacity}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {!editando && (
                  <button onClick={iniciarEdicion} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "13px", color: "#9B72C0" }}>✎</button>
                )}
                <button onClick={() => setEventoSeleccionado(null)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
              </div>
            </div>

            {editando && (
              <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Editar evento</div>
                <div style={s.field}><label style={s.label}>Nombre del curso/evento</label><input type="text" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} style={s.input} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={s.field}><label style={s.label}>Fecha</label><input type="date" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})} style={s.input} /></div>
                  <div style={s.field}><label style={s.label}>Hora</label><input type="time" value={editForm.hora} onChange={e => setEditForm({...editForm, hora: e.target.value})} style={s.input} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={s.field}><label style={s.label}>Precio por persona</label><input type="number" min="0" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} style={s.input} /></div>
                  <div style={s.field}>
                    <label style={s.label}>Moneda</label>
                    <select value={editForm.currency} onChange={e => setEditForm({...editForm, currency: e.target.value})} style={s.input}>
                      <option value="ARS">Pesos</option>
                      <option value="USD">Dólares</option>
                      <option value="EUR">Euros</option>
                    </select>
                  </div>
                </div>
                <div style={s.field}><label style={s.label}>Cupo máximo</label><input type="number" min="1" value={editForm.cupo} onChange={e => setEditForm({...editForm, cupo: e.target.value})} placeholder="Sin límite" style={s.input} /></div>
                <div style={s.field}>
                  <label style={s.label}>Modalidad</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[["presencial","📍 Presencial"],["virtual","📹 Virtual"],["ambas","🔀 Ambas"]].map(([key,label]) => (
                      <button key={key} onClick={() => setEditForm({...editForm, modalidad: key})} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${editForm.modalidad===key?"#9B72C0":"#E0D0F0"}`, background: editForm.modalidad===key?"#EDE8FA":"#fff", color: editForm.modalidad===key?"#5C3F99":"#B89FD0", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</button>
                    ))}
                  </div>
                </div>
                {editError && <div style={{ fontSize: "12px", color: "#A32D2D" }}>{editError}</div>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setEditando(false)} style={{ ...s.cancelBtn, flex: 1 }}>Cancelar</button>
                  <button onClick={guardarEdicion} disabled={savingEdit} style={{ ...s.saveBtn, flex: 1 }}>{savingEdit ? "Guardando..." : "Guardar"}</button>
                </div>
              </div>
            )}

            {asistenteDetalleId ? (() => {
              const a = asistentes.find(x => x.id === asistenteDetalleId);
              if (!a) return null;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button onClick={() => { setAsistenteDetalleId(null); setAsistenteEditandoId(null); }}
                    style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#9B72C0", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                    ← Volver a la lista
                  </button>

                  {asistenteEditandoId === a.id ? (
                    <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Editar datos</div>
                      <div style={s.field}><label style={s.label}>Nombre y apellido</label><input type="text" value={editAsistenteForm.nombre} onChange={e => setEditAsistenteForm({...editAsistenteForm, nombre: e.target.value})} style={s.input} /></div>
                      <div style={s.field}><label style={s.label}>Celular</label><input type="tel" value={editAsistenteForm.telefono} onChange={e => setEditAsistenteForm({...editAsistenteForm, telefono: e.target.value})} style={s.input} /></div>
                      <div style={s.field}><label style={s.label}>Mail</label><input type="email" value={editAsistenteForm.mail} onChange={e => setEditAsistenteForm({...editAsistenteForm, mail: e.target.value})} style={s.input} /></div>
                      <div style={s.field}>
                        <label style={s.label}>Precio con descuento (opcional)</label>
                        <input type="number" min="0" value={editAsistenteForm.precioDescuento} onChange={e => setEditAsistenteForm({...editAsistenteForm, precioDescuento: e.target.value})} placeholder={`Sin descuento: ${symFor(eventoSeleccionado.currency)}${eventoSeleccionado.price?.toLocaleString("es-AR") || 0}`} style={s.input} />
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setAsistenteEditandoId(null)} style={{ ...s.cancelBtn, flex: 1 }}>Cancelar</button>
                        <button onClick={guardarEdicionAsistente} disabled={savingEditAsistente || !editAsistenteForm.nombre.trim()} style={{ ...s.saveBtn, flex: 1 }}>{savingEditAsistente ? "Guardando..." : "Guardar"}</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1.1rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "16px", fontWeight: "500", color: "#2A1845" }}>{a.full_name}</div>
                        <span style={a.status === "paid" ? s.tagPagado : a.status === "cortesia" ? s.tagCortesia : s.tagPendiente}>
                          {a.status === "paid" ? "✓ Pagó" : a.status === "cortesia" ? "🎁 Cortesía" : "⏳ Pendiente"}
                        </span>
                      </div>
                      {a.phone && <div style={{ fontSize: "13px", color: "#9B72C0" }}>{a.phone}</div>}
                      {a.email && <div style={{ fontSize: "13px", color: "#9B72C0" }}>{a.email}</div>}
                      <div style={{ fontSize: "13px", color: "#2A1845", fontWeight: "500" }}>
                        {symFor(eventoSeleccionado.currency)}{(a.custom_price ?? eventoSeleccionado.price ?? 0).toLocaleString("es-AR")}
                        {a.custom_price != null && <span style={{ fontSize: "11px", color: "#5C3F99", fontWeight: "400" }}> · con descuento</span>}
                      </div>
                      {a.receipt_url && (
                        <a href={a.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#9B72C0", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>📎 Ver comprobante</a>
                      )}

                      <div style={{ borderTop: "0.5px solid #F0E8F8", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "500", color: "#B89FD0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Estado</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {[["pending","⏳ Pendiente"],["paid","✓ Pagó"],["cortesia","🎁 Cortesía"]].map(([key,label]) => (
                            <button key={key} onClick={() => cambiarEstadoAsistente(a, key)} style={{ flex: 1, padding: "8px 4px", borderRadius: "8px", border: `0.5px solid ${a.status===key?"#9B72C0":"#E0D0F0"}`, background: a.status===key?"#EDE8FA":"#fff", color: a.status===key?"#5C3F99":"#B89FD0", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <label style={{ flex: 1, minWidth: "120px", textAlign: "center", padding: "9px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {subiendo === a.id ? "Subiendo..." : "📎 Adjuntar comprobante"}
                          <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => subirComprobante(a.id, e.target.files[0])} />
                        </label>
                        {a.phone && (
                          <a href={linkWhatsApp(a.phone)} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: "100px" }}><button style={{ ...s.btnWA, width: "100%", justifyContent: "center", padding: "9px" }}>💬 WhatsApp</button></a>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => iniciarEdicionAsistente(a)} style={{ ...s.cancelBtn, flex: 1 }}>✎ Editar datos</button>
                        <button onClick={() => { eliminarAsistente(a.id); setAsistenteDetalleId(null); }} style={{ ...s.cancelBtn, flex: 1, color: "#A32D2D", borderColor: "#F4C4C4" }}>✕ Eliminar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : (
              <>
                <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem" }}>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Anotar persona</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={s.field}>
                      <label style={s.label}>Nombre y apellido</label>
                      <input type="text" placeholder="Ej: Ana García" value={asistenteForm.nombre} onChange={e => setAsistenteForm({...asistenteForm, nombre: e.target.value})} style={s.input} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                      <div style={s.field}>
                        <label style={s.label}>Celular</label>
                        <input type="tel" placeholder="11 1234-5678" value={asistenteForm.telefono} onChange={e => setAsistenteForm({...asistenteForm, telefono: e.target.value})} style={s.input} />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Mail (opcional)</label>
                        <input type="email" placeholder="mail@ejemplo.com" value={asistenteForm.mail} onChange={e => setAsistenteForm({...asistenteForm, mail: e.target.value})} style={s.input} />
                      </div>
                    </div>

                    <div style={s.field}>
                      <label style={s.label}>Precio con descuento (opcional)</label>
                      <input type="number" min="0" value={asistenteForm.precioDescuento} onChange={e => setAsistenteForm({...asistenteForm, precioDescuento: e.target.value})} placeholder={`Sin descuento: ${symFor(eventoSeleccionado.currency)}${eventoSeleccionado.price?.toLocaleString("es-AR") || 0}`} style={s.input} />
                    </div>

                    <div style={s.field}>
                      <label style={s.label}>Comprobante (opcional)</label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: `0.5px solid ${comprobanteAsistente ? "#9B72C0" : "#E0D0F0"}`, borderRadius: "10px", background: comprobanteAsistente ? "#F3EEFA" : "#fff", cursor: "pointer" }}>
                        <span style={{ fontSize: "16px" }}>{comprobanteAsistente ? "✅" : "📎"}</span>
                        <span style={{ fontSize: "12px", color: comprobanteAsistente ? "#5C3F99" : "#B89FD0", flex: 1 }}>
                          {comprobanteAsistente ? comprobanteAsistente.name : "Adjuntar captura o PDF"}
                        </span>
                        {comprobanteAsistente && <span style={{ fontSize: "11px", color: "#9B72C0", cursor: "pointer" }} onClick={e => { e.preventDefault(); setComprobanteAsistente(null); }}>✕ quitar</span>}
                        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => setComprobanteAsistente(e.target.files[0] || null)} />
                      </label>
                    </div>

                    <button onClick={agregarAsistente} disabled={savingAsistente || !asistenteForm.nombre.trim()} style={{ ...s.saveBtn, padding: "10px", marginTop: "2px" }}>{savingAsistente ? "Agregando..." : "+ Anotar"}</button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {loadingAsistentes ? (
                    <div style={s.emptyText}>Cargando...</div>
                  ) : asistentes.length === 0 ? (
                    <div style={{ ...s.emptyText, padding: "1rem 0" }}>Nadie anotado todavía</div>
                  ) : (
                    [
                      ["pending", "⏳ Pendientes"],
                      ["paid", "✓ Pagaron"],
                      ["cortesia", "🎁 Cortesía"],
                    ].map(([estado, titulo]) => {
                      const grupo = asistentes.filter(a => a.status === estado);
                      if (grupo.length === 0) return null;
                      return (
                        <div key={estado}>
                          <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{titulo} ({grupo.length})</div>
                          <div style={{ borderRadius: "10px", border: "0.5px solid #F0E8F8", overflow: "hidden" }}>
                            {grupo.map((a, i) => (
                              <div key={a.id} onClick={() => setAsistenteDetalleId(a.id)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "10px 12px", cursor: "pointer", borderBottom: i < grupo.length - 1 ? "0.5px solid #F0E8F8" : "none", background: "#fff" }}>
                                <div>
                                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>{a.full_name}{a.custom_price != null && <span style={{ fontSize: "11px", color: "#5C3F99" }}> · ✨ desc.</span>}</div>
                                  {a.phone && <div style={{ fontSize: "11px", color: "#B89FD0", marginTop: "1px" }}>{a.phone}</div>}
                                </div>
                                <span style={{ fontSize: "13px", color: "#D0B8E8" }}>›</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {!asistenteDetalleId && (
              <button style={{ ...s.cancelBtn, color: "#A32D2D", borderColor: "#F4C4C4" }} onClick={() => eliminarEvento(eventoSeleccionado)}>🗑 Eliminar evento</button>
            )}
          </div>
        </>
      )}

      {nuevoAbierto && (
        <>
          <div style={s.overlay} onClick={() => setNuevoAbierto(false)} />
          <div style={isMobile ? { ...s.panel, width: "100%" } : s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>+ Nuevo evento grupal</div>
              <button onClick={() => setNuevoAbierto(false)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
            </div>

            <div style={s.field}><label style={s.label}>Nombre del curso/evento</label><input type="text" value={nuevoForm.nombre} onChange={e => setNuevoForm({...nuevoForm, nombre: e.target.value})} placeholder="Constelaciones familiares grupales" style={s.input} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={s.field}><label style={s.label}>Fecha (opcional)</label><input type="date" value={nuevoForm.fecha} onChange={e => setNuevoForm({...nuevoForm, fecha: e.target.value})} style={s.input} /></div>
              <div style={s.field}><label style={s.label}>Hora (opcional)</label><input type="time" value={nuevoForm.hora} onChange={e => setNuevoForm({...nuevoForm, hora: e.target.value})} style={s.input} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={s.field}>
                <label style={s.label}>Precio por persona</label>
                <input type="number" min="0" value={nuevoForm.precio} onChange={e => setNuevoForm({...nuevoForm, precio: e.target.value})} placeholder="0" style={s.input} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Moneda</label>
                <select value={nuevoForm.currency} onChange={e => setNuevoForm({...nuevoForm, currency: e.target.value})} style={s.input}>
                  <option value="ARS">Pesos</option>
                  <option value="USD">Dólares</option>
                  <option value="EUR">Euros</option>
                </select>
              </div>
            </div>

            <div style={s.field}><label style={s.label}>Cupo máximo (opcional)</label><input type="number" min="1" value={nuevoForm.cupo} onChange={e => setNuevoForm({...nuevoForm, cupo: e.target.value})} placeholder="Sin límite" style={s.input} /></div>

            <div style={s.field}>
              <label style={s.label}>Modalidad</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[["presencial","📍 Presencial"],["virtual","📹 Virtual"],["ambas","🔀 Ambas"]].map(([key,label]) => (
                  <button key={key} onClick={() => setNuevoForm({...nuevoForm, modalidad: key})} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${nuevoForm.modalidad===key?"#9B72C0":"#E0D0F0"}`, background: nuevoForm.modalidad===key?"#EDE8FA":"#fff", color: nuevoForm.modalidad===key?"#5C3F99":"#B89FD0", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</button>
                ))}
              </div>
            </div>

            {nuevoError && <div style={{ fontSize: "12px", color: "#A32D2D" }}>{nuevoError}</div>}
            <button style={s.saveBtn} onClick={crearEvento} disabled={savingNuevo}>{savingNuevo ? "Creando..." : "Crear evento"}</button>
            <button style={s.cancelBtn} onClick={() => setNuevoAbierto(false)}>Cancelar</button>
          </div>
        </>
      )}
    </div>
  );
}
