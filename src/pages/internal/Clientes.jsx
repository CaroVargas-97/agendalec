import { useState } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
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
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
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
};

const clientesData = [
  { nombre: "Laura Gómez", celular: "+54 9 11 5544-3322", mail: "laura@gmail.com", sesiones: 8, precio: "especial", montoEspecial: 15000, notas: "Prefiere sesiones por la mañana.", desde: "mar 2026" },
  { nombre: "Sofía Méndez", celular: "+54 9 11 6677-8899", mail: "sofia@gmail.com", sesiones: 3, precio: "normal", montoEspecial: null, notas: "", desde: "may 2026" },
  { nombre: "Carla Ríos", celular: "+54 9 11 1122-3344", mail: "carla@mail.com", sesiones: 5, precio: "normal", montoEspecial: null, notas: "", desde: "abr 2026" },
  { nombre: "Valeria Torres", celular: "+54 9 11 9988-7766", mail: "valeria@gmail.com", sesiones: 1, precio: "cortesia", montoEspecial: 0, notas: "Derivada por colega.", desde: "jun 2026" },
  { nombre: "Martina López", celular: "+54 9 11 4455-6677", mail: "martina@gmail.com", sesiones: 12, precio: "especial", montoEspecial: 18000, notas: "Cliente frecuente.", desde: "ene 2026" },
];

const getPrecioTag = (precio) => {
  if (precio === "especial") return <span style={s.tagEspecial}>Precio especial</span>;
  if (precio === "cortesia") return <span style={s.tagRegalo}>Cortesía</span>;
  return <span style={s.tagNormal}>Normal</span>;
};

export default function Clientes({ setPage }) {
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [precioTipo, setPrecioTipo] = useState("normal");

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const clientesFiltrados = clientesData.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.mail.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCliente = (c) => {
    setClienteSeleccionado(c);
    setPrecioTipo(c.precio);
  };

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.logo}>🗓 AgendaLec</div>
        <button style={s.navItem} onClick={() => setPage("dashboard")}>🏠 Inicio</button>
        <button style={s.navItem} onClick={() => setPage("agenda")}>📅 Mi agenda</button>
        <button style={s.navItemActive}>👥 Clientes</button>
        <button style={s.navItem}>💰 Cobros</button>
        <button style={s.navItem} onClick={() => setPage("config")}>⚙️ Configuración</button>
        <button style={s.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.title}>Clientes</div>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o mail..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={s.searchInput}
          />
        </div>

        <div style={s.card}>
          <table style={s.tabla}>
            <thead>
              <tr>
                <th style={s.th}>Cliente</th>
                <th style={s.th}>Contacto</th>
                <th style={s.th}>Sesiones</th>
                <th style={s.th}>Precio</th>
                <th style={s.th}>Desde</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c, i) => (
                <tr key={i}>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...s.avatar, background: i % 2 === 0 ? "#C4A8D8" : "#F4B8D1" }}>
                        {c.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>{c.nombre}</div>
                        <div style={{ fontSize: "12px", color: "#B89FD0" }}>{c.mail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontSize: "13px", color: "#2A1845" }}>{c.celular}</div>
                    <a href={`https://wa.me/${c.celular.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      <button style={{ ...s.btnWA, marginTop: "4px" }}>💬 WhatsApp</button>
                    </a>
                  </td>
                  <td style={s.td}>{c.sesiones} sesiones</td>
                  <td style={s.td}>{getPrecioTag(c.precio)}</td>
                  <td style={{ ...s.td, color: "#B89FD0", fontSize: "12px" }}>{c.desde}</td>
                  <td style={s.td}>
                    <button style={s.btnVer} onClick={() => abrirCliente(c)}>Ver perfil →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {clienteSeleccionado && (
        <>
          <div style={s.overlay} onClick={() => setClienteSeleccionado(null)} />
          <div style={s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ ...s.avatar, width: "44px", height: "44px", fontSize: "15px", background: "#C4A8D8" }}>
                  {clienteSeleccionado.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>{clienteSeleccionado.nombre}</div>
                  <div style={{ fontSize: "12px", color: "#B89FD0" }}>Cliente desde {clienteSeleccionado.desde}</div>
                </div>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <a href={`https://wa.me/${clienteSeleccionado.celular.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                <button style={{ ...s.btnWA, width: "100%", justifyContent: "center" }}>💬 WhatsApp</button>
              </a>
              <a href={`mailto:${clienteSeleccionado.mail}`} style={{ flex: 1 }}>
                <button style={{ ...s.cancelBtn, padding: "7px" }}>✉️ Mail</button>
              </a>
            </div>

            <div style={s.card}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "10px" }}>Datos personales</div>
              {[
                { label: "Nombre", valor: clienteSeleccionado.nombre },
                { label: "Celular", valor: clienteSeleccionado.celular },
                { label: "Mail", valor: clienteSeleccionado.mail },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #F0E8F8", fontSize: "13px" }}>
                  <span style={{ color: "#9B72C0" }}>{f.label}</span>
                  <span style={{ color: "#2A1845", fontWeight: "500" }}>{f.valor}</span>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "10px" }}>Precio especial</div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                {[
                  { key: "normal", label: "Normal" },
                  { key: "especial", label: "Monto fijo" },
                  { key: "descuento", label: "% Descuento" },
                  { key: "cortesia", label: "Cortesía" },
                ].map(p => (
                  <button key={p.key} onClick={() => setPrecioTipo(p.key)}
                    style={precioTipo === p.key ? (p.key === "cortesia" ? s.precioBtnRegalo : s.precioBtnActive) : s.precioBtn}>
                    {p.label}
                  </button>
                ))}
              </div>
              {precioTipo === "especial" && (
                <input type="number" defaultValue={clienteSeleccionado.montoEspecial || ""} placeholder="Monto ej: 15000" style={{ ...s.input, width: "100%" }} />
              )}
              {precioTipo === "descuento" && (
                <input type="number" placeholder="% descuento ej: 30" style={{ ...s.input, width: "100%" }} />
              )}
              {precioTipo === "cortesia" && (
                <div style={{ background: "#FDE8F0", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#A0407A" }}>
                  Todas las sesiones serán $0. No se cobra seña.
                </div>
              )}
            </div>

            {clienteSeleccionado.notas && (
              <div style={s.card}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>Notas internas</div>
                <div style={{ background: "#F8F4FC", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#5C3F99", borderLeft: "3px solid #C4A8D8" }}>
                  {clienteSeleccionado.notas}
                </div>
              </div>
            )}

            <button style={s.saveBtn}>Guardar cambios</button>
            <button style={s.cancelBtn} onClick={() => setClienteSeleccionado(null)}>Cerrar</button>
          </div>
        </>
      )}
    </div>
  );
}