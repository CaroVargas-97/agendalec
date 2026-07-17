import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  searchInput: { fontSize: "13px", padding: "8px 12px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "280px" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem" },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "12px", color: "#B89FD0", fontWeight: "500", padding: "8px 12px", textAlign: "left", borderBottom: "0.5px solid #F0E8F8" },
  td: { fontSize: "13px", color: "#2A1845", padding: "12px", borderBottom: "0.5px solid #F0E8F8", verticalAlign: "middle" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "500", color: "#3B2460" },
  tagNormal: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#F1EFE8", color: "#6B6860" },
  tagEspecial: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagRegalo: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FDE8F0", color: "#A0407A" },
  btnWA: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnVer: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#EDE8FA", color: "#5C3F99", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  panel: { position: "fixed", top: 0, right: 0, width: "380px", height: "100vh", background: "#fff", borderLeft: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", zIndex: 100 },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(42,24,69,0.2)", zIndex: 99 },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  precioBtn: { flex: 1, padding: "7px 4px", borderRadius: "8px", border: "0.5px solid #E0D0F0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  precioBtnActive: { flex: 1, padding: "7px 4px", borderRadius: "8px", border: "0.5px solid #9B72C0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#EDE8FA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  precioBtnRegalo: { flex: 1, padding: "7px 4px", borderRadius: "8px", border: "0.5px solid #E88BB0", fontSize: "11px", fontWeight: "500", cursor: "pointer", textAlign: "center", background: "#FDE8F0", color: "#A0407A", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  saveBtn: { width: "100%", padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cancelBtn: { width: "100%", padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
};

const getPrecioTag = (precio) => {
  if (precio === "especial") return <span style={s.tagEspecial}>Precio especial</span>;
  if (precio === "cortesia") return <span style={s.tagRegalo}>Cortesía</span>;
  return <span style={s.tagNormal}>Normal</span>;
};

export default function Clientes() {
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [precioTipo, setPrecioTipo] = useState("normal");
  const [customPrice, setCustomPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*, appointments(count)")
      .order("full_name");
    setClientes(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const abrirCliente = (c) => {
    setClienteSeleccionado(c);
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

  const guardarCliente = async () => {
    setSaving(true);
    const updates = { price_type: precioTipo, custom_price: (precioTipo === "especial" || precioTipo === "cortesia") && customPrice ? parseFloat(customPrice) : null };
    await supabase.from("clients").update(updates).eq("id", clienteSeleccionado.id);
    await cargar();
    setSaving(false);
    setClienteSeleccionado(null);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.full_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={s.main}>
      <div style={s.topbar}>
        <div style={s.title}>Clientes</div>
        <input type="text" placeholder="🔍 Buscar por nombre o mail..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={s.searchInput} />
      </div>

      <div style={s.card}>
        {loading ? <div style={s.emptyText}>Cargando...</div> : (
          <table style={s.tabla}>
            <thead>
              <tr>
                <th style={s.th}>Cliente</th>
                <th style={s.th}>Contacto</th>
                <th style={s.th}>Sesiones</th>
                <th style={s.th}>Precio</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#B89FD0" }}>No hay clientes aún</td></tr>
              ) : clientesFiltrados.map((c, i) => (
                <tr key={i}>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...s.avatar, background: i % 2 === 0 ? "#C4A8D8" : "#F4B8D1" }}>
                        {c.full_name?.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>{c.full_name}</div>
                        <div style={{ fontSize: "12px", color: "#B89FD0" }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div>{c.phone}</div>
                    {c.phone && (
                      <a href={`https://wa.me/54${c.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer">
                        <button style={{ ...s.btnWA, marginTop: "4px" }}>💬 WhatsApp</button>
                      </a>
                    )}
                  </td>
                  <td style={s.td}>{c.appointments?.[0]?.count || 0} sesiones</td>
                  <td style={s.td}>{getPrecioTag(c.price_type || "normal")}</td>
                  <td style={s.td}>
                    <button style={s.btnVer} onClick={() => abrirCliente(c)}>Ver perfil →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {clienteSeleccionado && (
        <>
          <div style={s.overlay} onClick={() => setClienteSeleccionado(null)} />
          <div style={s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ ...s.avatar, width: "44px", height: "44px", fontSize: "15px", background: "#C4A8D8" }}>
                  {clienteSeleccionado.full_name?.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>{clienteSeleccionado.full_name}</div>
                  <div style={{ fontSize: "12px", color: "#B89FD0" }}>{clienteSeleccionado.email}</div>
                </div>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {clienteSeleccionado.phone && (
                <a href={`https://wa.me/54${clienteSeleccionado.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                  <button style={{ ...s.btnWA, width: "100%", justifyContent: "center" }}>💬 WhatsApp</button>
                </a>
              )}
            </div>

            <div style={s.card}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "10px" }}>Datos personales</div>
              {[
                { label: "Nombre", valor: clienteSeleccionado.full_name },
                { label: "Celular", valor: clienteSeleccionado.phone },
                { label: "Mail", valor: clienteSeleccionado.email },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #F0E8F8", fontSize: "13px" }}>
                  <span style={{ color: "#9B72C0" }}>{f.label}</span>
                  <span style={{ color: "#2A1845", fontWeight: "500" }}>{f.valor || "—"}</span>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "10px" }}>Precio especial</div>
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
                  <label style={s.label}>{precioTipo === "cortesia" ? "Precio de cortesía (dejá en 0 si es gratis)" : "Precio especial"}</label>
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
    </div>
  );
}