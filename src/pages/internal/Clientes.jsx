import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { linkWhatsApp, celularValido, celularAviso } from "../../utils/whatsapp";

const avatarColors = ["#C4A8D8", "#F4B8D1", "#A8D4C4", "#F4D4A8", "#A8C4D4"];
// Bloques con color: cada cliente en su propio bloque, en vez de filas de
// tabla con líneas — más fácil de escanear de un vistazo.
const blockColors = [
  { bg: "#F3EEFA", text: "#5C3F99" },
  { bg: "#FDF0F6", text: "#A0407A" },
  { bg: "#EEF7F1", text: "#2F7A52" },
  { bg: "#FDF6EC", text: "#B4790E" },
  { bg: "#EEF5FA", text: "#2B6C99" },
];

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  searchInput: { fontSize: "13px", padding: "9px 14px", border: "0.5px solid #E0D0F0", borderRadius: "9px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "260px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  card: { background: "#fff", borderRadius: "14px", border: "0.5px solid #E0D0F0", padding: "1.4rem", boxShadow: "0 4px 16px rgba(42,24,69,0.05)" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "500", color: "#3B2460", flexShrink: 0 },
  btnWA: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  panel: { position: "fixed", top: 0, right: 0, width: "380px", height: "100vh", background: "#fff", borderLeft: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", overflowY: "auto", zIndex: 100, boxShadow: "-4px 0 24px rgba(42,24,69,0.08)" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(42,24,69,0.2)", zIndex: 99 },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  precioBtn: { flex: 1, padding: "7px 4px", borderRadius: "8px", border: "0.5px solid #E0D0F0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  precioBtnActive: { flex: 1, padding: "7px 4px", borderRadius: "8px", border: "0.5px solid #9B72C0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#EDE8FA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  precioBtnRegalo: { flex: 1, padding: "7px 4px", borderRadius: "8px", border: "0.5px solid #E88BB0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#FDE8F0", color: "#A0407A", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  saveBtn: { width: "100%", padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" },
  cancelBtn: { width: "100%", padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
};

export default function Clientes() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [editDatos, setEditDatos] = useState({ nombre: "", celular: "", mail: "" });
  const [precioTipo, setPrecioTipo] = useState("normal");
  const [customPrice, setCustomPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({ nombre: "", celular: "", mail: "" });
  const [nuevoPrecioTipo, setNuevoPrecioTipo] = useState("normal");
  const [nuevoCustomPrice, setNuevoCustomPrice] = useState("");
  const [savingNuevo, setSavingNuevo] = useState(false);
  const [nuevoError, setNuevoError] = useState("");

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*, appointments(count)").order("full_name");
    setClientes(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const abrirCliente = (c) => {
    setClienteSeleccionado(c);
    setEditDatos({ nombre: c.full_name || "", celular: c.phone || "", mail: c.email || "" });
    setPrecioTipo(c.price_type || "normal");
    setCustomPrice(c.custom_price != null ? String(c.custom_price) : "");
  };

  const eliminarCliente = async () => {
    if (!window.confirm(`¿Eliminar a ${clienteSeleccionado.full_name}? Se borrarán también sus turnos y pagos.`)) return;
    const id = clienteSeleccionado.id;
    const { data: turnos } = await supabase.from("appointments").select("id").eq("client_id", id);
    if (turnos?.length) {
      const ids = turnos.map(t => t.id);
      await supabase.from("payments").delete().in("appointment_id", ids);
      await supabase.from("appointments").delete().in("id", ids);
    }
    await supabase.from("clients").delete().eq("id", id);
    setClienteSeleccionado(null);
    await cargar();
  };

  const crearCliente = async () => {
    setNuevoError("");
    if (!nuevoForm.nombre.trim()) { setNuevoError("Falta el nombre."); return; }
    setSavingNuevo(true);
    const { error } = await supabase.from("clients").insert({
      full_name: nuevoForm.nombre.trim(),
      phone: nuevoForm.celular || null,
      email: nuevoForm.mail.trim().toLowerCase() || null,
      price_type: nuevoPrecioTipo,
      custom_price: (nuevoPrecioTipo === "especial" || nuevoPrecioTipo === "cortesia") && nuevoCustomPrice ? parseFloat(nuevoCustomPrice) : null,
    });
    if (error) { setNuevoError(error.message.includes("duplicate") ? "Ya existe un cliente con ese mail." : "Error al crear: " + error.message); setSavingNuevo(false); return; }
    await cargar();
    setSavingNuevo(false);
    setNuevoAbierto(false);
    setNuevoForm({ nombre: "", celular: "", mail: "" });
    setNuevoPrecioTipo("normal");
    setNuevoCustomPrice("");
  };

  const guardarCliente = async () => {
    if (!editDatos.nombre.trim()) { alert("Falta el nombre."); return; }
    setSaving(true);
    // El mail se normaliza igual que en la reserva pública (minúsculas,
    // sin espacios): así el reconocimiento automático de cliente —y la
    // cortesía/precio especial que depende de matchear el mail— no se
    // rompe por una mayúscula o un espacio de más al cargarlo acá.
    const updates = {
      full_name: editDatos.nombre.trim(),
      phone: editDatos.celular.trim() || null,
      email: editDatos.mail.trim().toLowerCase() || null,
      price_type: precioTipo,
      custom_price: (precioTipo === "especial" || precioTipo === "cortesia") && customPrice ? parseFloat(customPrice) : null,
    };
    const { error } = await supabase.from("clients").update(updates).eq("id", clienteSeleccionado.id);
    if (error) { alert("No se pudo guardar: " + (error.message.includes("duplicate") ? "Ya existe otro cliente con ese mail." : error.message)); setSaving(false); return; }
    await cargar();
    setSaving(false);
    setClienteSeleccionado(null);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.full_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ ...s.main, padding: isMobile ? "1rem" : "1.5rem" }}>
      <div style={{ ...s.topbar, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? "10px" : 0 }}>
        <div>
          <div style={s.title}>Clientes</div>
          <div style={s.titleSub}>{clientes.length} clientes registrados</div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexDirection: isMobile ? "column" : "row" }}>
          <input type="text" placeholder="🔍 Buscar por nombre o mail..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ ...s.searchInput, width: isMobile ? "100%" : "260px", boxSizing: "border-box" }} />
          <button onClick={() => setNuevoAbierto(true)} style={{ padding: "8px 16px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" }}>+ Agregar cliente</button>
        </div>
      </div>

      {loading ? (
        <div style={{ ...s.card, ...s.emptyText }}>Cargando...</div>
      ) : clientesFiltrados.length === 0 ? (
        <div style={{ ...s.card, ...s.emptyText }}>No hay clientes aún</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {clientesFiltrados.map((c, i) => {
            const bc = blockColors[i % blockColors.length];
            return (
              <div key={i} onClick={() => abrirCliente(c)} style={{ background: bc.bg, borderRadius: "14px", padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div style={{ ...s.avatar, width: "38px", height: "38px", background: "#fff", color: bc.text }}>
                  {c.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <div style={{ fontWeight: "600", color: bc.text, fontSize: "14px" }}>{c.full_name}</div>
                  <div style={{ fontSize: "12px", color: bc.text, opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</div>
                </div>
                <div style={{ fontSize: "12px", color: bc.text, opacity: 0.85, minWidth: "120px" }}>
                  {c.phone || "Sin celular"}
                  {c.phone && !celularValido(c.phone) && <span style={{ marginLeft: "4px" }}>⚠️</span>}
                </div>
                {c.phone && (
                  <a href={linkWhatsApp(c.phone)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                    <button style={s.btnWA}>💬</button>
                  </a>
                )}
                <div style={{ fontSize: "12px", color: bc.text, textAlign: "center", minWidth: "70px" }}>
                  <div style={{ fontWeight: "600" }}>{c.appointments?.[0]?.count || 0}</div>
                  <div style={{ opacity: 0.75 }}>sesiones</div>
                </div>
                <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "#fff", color: bc.text, fontWeight: "500" }}>
                  {c.price_type === "especial" ? "Especial" : c.price_type === "cortesia" ? "Cortesía" : "Normal"}
                </span>
                <button onClick={e => { e.stopPropagation(); abrirCliente(c); }} style={{ padding: "7px 14px", background: "#fff", color: bc.text, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                  Ver perfil →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {clienteSeleccionado && (
        <>
          <div style={s.overlay} onClick={() => setClienteSeleccionado(null)} />
          <div style={isMobile ? { ...s.panel, width: "100%" } : s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ ...s.avatar, width: "44px", height: "44px", fontSize: "15px", background: "#C4A8D8" }}>
                  {clienteSeleccionado.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>{clienteSeleccionado.full_name}</div>
                  <div style={{ fontSize: "12px", color: "#B89FD0" }}>{clienteSeleccionado.email}</div>
                </div>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
            </div>

            {clienteSeleccionado.phone && (
              <a href={linkWhatsApp(clienteSeleccionado.phone)} target="_blank" rel="noreferrer">
                <button style={{ ...s.btnWA, width: "100%", justifyContent: "center" }}>💬 WhatsApp · {clienteSeleccionado.phone}</button>
              </a>
            )}

            <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", textTransform: "uppercase", letterSpacing: "0.4px" }}>Datos personales</div>
              <div style={s.field}>
                <label style={s.label}>Nombre y apellido</label>
                <input type="text" value={editDatos.nombre} onChange={e => setEditDatos({...editDatos, nombre: e.target.value})} style={s.input} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Celular</label>
                <input type="tel" value={editDatos.celular} onChange={e => setEditDatos({...editDatos, celular: e.target.value})} style={s.input} />
                {editDatos.celular && !celularValido(editDatos.celular) && (
                  <span style={{ fontSize: "11px", color: "#A32D2D" }}>{celularAviso(editDatos.celular)}</span>
                )}
              </div>
              <div style={s.field}>
                <label style={s.label}>Mail</label>
                <input type="email" value={editDatos.mail} onChange={e => setEditDatos({...editDatos, mail: e.target.value})} style={s.input} />
                <span style={{ fontSize: "11px", color: "#B89FD0" }}>Tiene que ser igual al que use para reservar, así se reconoce solo.</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#B89FD0" }}>Sesiones</span>
                <span style={{ color: "#2A1845", fontWeight: "500" }}>{clienteSeleccionado.appointments?.[0]?.count || 0}</span>
              </div>
            </div>

            <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Precio especial</div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                {[
                  { key: "normal", label: "Normal" },
                  { key: "especial", label: "Especial" },
                  { key: "cortesia", label: "Cortesía" },
                ].map(p => (
                  <button key={p.key} onClick={() => setPrecioTipo(p.key)}
                    style={precioTipo === p.key ? (p.key === "cortesia" ? s.precioBtnRegalo : s.precioBtnActive) : s.precioBtn}>
                    {p.label}
                  </button>
                ))}
              </div>
              {(precioTipo === "especial" || precioTipo === "cortesia") && (
                <div style={{ marginTop: "6px" }}>
                  <label style={s.label}>{precioTipo === "cortesia" ? "Precio de cortesía (0 si es gratis)" : "Precio especial"}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontSize: "13px", color: "#9B72C0" }}>$</span>
                    <input type="number" min="0" value={customPrice} onChange={e => setCustomPrice(e.target.value)} placeholder="0" style={{ ...s.input, width: "100%" }} />
                  </div>
                </div>
              )}
            </div>

            <button style={s.saveBtn} onClick={guardarCliente} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
            <button style={s.cancelBtn} onClick={() => setClienteSeleccionado(null)}>Cerrar</button>
            <button style={{ ...s.cancelBtn, color: "#A32D2D", borderColor: "#F4C4C4", marginTop: "4px" }} onClick={eliminarCliente}>🗑 Eliminar cliente</button>
          </div>
        </>
      )}

      {nuevoAbierto && (
        <>
          <div style={s.overlay} onClick={() => setNuevoAbierto(false)} />
          <div style={isMobile ? { ...s.panel, width: "100%" } : s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>+ Agregar cliente</div>
              <button onClick={() => setNuevoAbierto(false)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
            </div>
            <div style={{ fontSize: "12px", color: "#B89FD0" }}>Cargalo antes de mandarle el link de reserva para que el precio especial o la cortesía se aplique solos cuando reserve con este mismo mail.</div>

            <div style={s.field}><label style={s.label}>Nombre y apellido</label><input type="text" value={nuevoForm.nombre} onChange={e => setNuevoForm({...nuevoForm, nombre: e.target.value})} placeholder="Laura Gómez" style={s.input} /></div>
            <div style={s.field}><label style={s.label}>Celular</label><input type="tel" value={nuevoForm.celular} onChange={e => setNuevoForm({...nuevoForm, celular: e.target.value})} placeholder="+54 9 11... (o +código de país si es del exterior)" style={s.input} /></div>
            <div style={s.field}><label style={s.label}>Mail</label><input type="email" value={nuevoForm.mail} onChange={e => setNuevoForm({...nuevoForm, mail: e.target.value})} placeholder="mail@ejemplo.com" style={s.input} /></div>

            <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Precio especial</div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                {[
                  { key: "normal", label: "Normal" },
                  { key: "especial", label: "Especial" },
                  { key: "cortesia", label: "Cortesía" },
                ].map(p => (
                  <button key={p.key} onClick={() => setNuevoPrecioTipo(p.key)}
                    style={nuevoPrecioTipo === p.key ? (p.key === "cortesia" ? s.precioBtnRegalo : s.precioBtnActive) : s.precioBtn}>
                    {p.label}
                  </button>
                ))}
              </div>
              {(nuevoPrecioTipo === "especial" || nuevoPrecioTipo === "cortesia") && (
                <div style={{ marginTop: "6px" }}>
                  <label style={s.label}>{nuevoPrecioTipo === "cortesia" ? "Precio de cortesía (0 si es gratis)" : "Precio especial"}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontSize: "13px", color: "#9B72C0" }}>$</span>
                    <input type="number" min="0" value={nuevoCustomPrice} onChange={e => setNuevoCustomPrice(e.target.value)} placeholder="0" style={{ ...s.input, width: "100%" }} />
                  </div>
                </div>
              )}
            </div>

            {nuevoError && <div style={{ fontSize: "12px", color: "#A32D2D" }}>{nuevoError}</div>}
            <button style={s.saveBtn} onClick={crearCliente} disabled={savingNuevo}>{savingNuevo ? "Creando..." : "Crear cliente"}</button>
            <button style={s.cancelBtn} onClick={() => setNuevoAbierto(false)}>Cancelar</button>
          </div>
        </>
      )}
    </div>
  );
}
