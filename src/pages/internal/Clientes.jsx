import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const avatarColors = ["#C4A8D8", "#F4B8D1", "#A8D4C4", "#F4D4A8", "#A8C4D4"];

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  searchInput: { fontSize: "13px", padding: "8px 14px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "260px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", color: "#B89FD0", fontWeight: "500", padding: "8px 12px", textAlign: "left", borderBottom: "0.5px solid #F0E8F8", textTransform: "uppercase", letterSpacing: "0.4px" },
  td: { fontSize: "13px", color: "#2A1845", padding: "12px", borderBottom: "0.5px solid #F0E8F8", verticalAlign: "middle" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "500", color: "#3B2460", flexShrink: 0 },
  tagNormal: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#F1EFE8", color: "#6B6860" },
  tagEspecial: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagRegalo: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FDE8F0", color: "#A0407A" },
  btnWA: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnVer: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#EDE8FA", color: "#5C3F99", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  panel: { position: "fixed", top: 0, right: 0, width: "380px", height: "100vh", background: "#fff", borderLeft: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", zIndex: 100, boxShadow: "-4px 0 24px rgba(42,24,69,0.08)" },
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

const getPrecioTag = (precio) => {
  if (precio === "especial") return <span style={s.tagEspecial}>Precio especial</span>;
  if (precio === "cortesia") return <span style={s.tagRegalo}>Cortesía</span>;
  return <span style={s.tagNormal}>Normal</span>;
};

export default function Clientes() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [precioTipo, setPrecioTipo] = useState("normal");
  const [customPrice, setCustomPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    <div style={{ ...s.main, padding: isMobile ? "1rem" : "1.5rem" }}>
      <div style={{ ...s.topbar, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? "10px" : 0 }}>
        <div>
          <div style={s.title}>Clientes</div>
          <div style={s.titleSub}>{clientes.length} clientes registrados</div>
        </div>
        <input type="text" placeholder="🔍 Buscar por nombre o mail..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ ...s.searchInput, width: isMobile ? "100%" : "260px", boxSizing: "border-box" }} />
      </div>

      {isMobile ? (
        loading ? <div style={{ ...s.card, ...s.emptyText }}>Cargando...</div> : clientesFiltrados.length === 0 ? (
          <div style={{ ...s.card, ...s.emptyText }}>No hay clientes aún</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {clientesFiltrados.map((c, i) => (
              <div key={i} style={{ ...s.card, padding: "1rem" }} onClick={() => abrirCliente(c)}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ ...s.avatar, background: avatarColors[i % avatarColors.length] }}>
                    {c.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "500", color: "#2A1845" }}>{c.full_name}</div>
                    <div style={{ fontSize: "12px", color: "#B89FD0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</div>
                  </div>
                  {getPrecioTag(c.price_type || "normal")}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "0.5px solid #F0E8F8" }}>
                  <div style={{ fontSize: "12px", color: "#B89FD0" }}>{c.phone || "Sin celular"} · {c.appointments?.[0]?.count || 0} sesiones</div>
                  {c.phone && (
                    <a href={`https://wa.me/54${c.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                      <button style={s.btnWA}>💬</button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
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
                  <tr key={i} style={{ transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FDFAFF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ ...s.avatar, background: avatarColors[i % avatarColors.length] }}>
                          {c.full_name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "500", color: "#2A1845" }}>{c.full_name}</div>
                          <div style={{ fontSize: "12px", color: "#B89FD0" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: "13px", color: "#2A1845" }}>{c.phone || "—"}</div>
                      {c.phone && (
                        <a href={`https://wa.me/54${c.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer">
                          <button style={{ ...s.btnWA, marginTop: "4px" }}>💬 WhatsApp</button>
                        </a>
                      )}
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>{c.appointments?.[0]?.count || 0}</div>
                      <div style={{ fontSize: "11px", color: "#B89FD0" }}>sesiones</div>
                    </td>
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
              <a href={`https://wa.me/54${clienteSeleccionado.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer">
                <button style={{ ...s.btnWA, width: "100%", justifyContent: "center" }}>💬 WhatsApp · {clienteSeleccionado.phone}</button>
              </a>
            )}

            <div style={{ ...s.card, boxShadow: "none", border: "0.5px solid #F0E8F8", padding: "1rem" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#9B72C0", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Datos personales</div>
              {[
                { label: "Nombre", valor: clienteSeleccionado.full_name },
                { label: "Celular", valor: clienteSeleccionado.phone },
                { label: "Mail", valor: clienteSeleccionado.email },
                { label: "Sesiones", valor: `${clienteSeleccionado.appointments?.[0]?.count || 0} sesiones` },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #F0E8F8", fontSize: "13px" }}>
                  <span style={{ color: "#B89FD0" }}>{f.label}</span>
                  <span style={{ color: "#2A1845", fontWeight: "500" }}>{f.valor || "—"}</span>
                </div>
              ))}
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
    </div>
  );
}
