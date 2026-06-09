import { useState } from "react";
import { supabase } from "../../supabase";

const HORAS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

const turnos = [
  { hora: "09:00", nombre: "Laura Gómez", servicio: "Reiki", duracion: 60, modalidad: "presencial", estado: "confirmado", profesional: "Maru" },
  { hora: "10:00", nombre: "Sofía Méndez", servicio: "Biodescodificación", duracion: 90, modalidad: "virtual", estado: "confirmado", profesional: "Maru" },
  { hora: "12:00", nombre: "Almuerzo", servicio: "", duracion: 60, modalidad: "bloqueado", estado: "bloqueado", profesional: "Maru" },
  { hora: "15:00", nombre: "Valeria Torres", servicio: "Reiki", duracion: 60, modalidad: "virtual", estado: "pendiente", profesional: "Maru" },
  { hora: "16:30", nombre: "Martina López", servicio: "Biodescodificación", duracion: 90, modalidad: "presencial", estado: "confirmado", profesional: "Maru" },
];

const turnosSemana = {
  0: [{ hora: "09:00", nombre: "Laura G.", servicio: "Reiki", modalidad: "presencial" }, { hora: "10:00", nombre: "Sofía M.", servicio: "Biodes.", modalidad: "virtual" }, { hora: "15:00", nombre: "Valeria T.", servicio: "Reiki", modalidad: "virtual" }],
  1: [{ hora: "09:00", nombre: "Ana M.", servicio: "Reiki", modalidad: "virtual" }, { hora: "11:00", nombre: "Camila S.", servicio: "Reiki", modalidad: "presencial" }],
  2: [{ hora: "10:00", nombre: "Paula T.", servicio: "Reiki", modalidad: "virtual" }, { hora: "15:00", nombre: "Rosa M.", servicio: "Reiki", modalidad: "presencial" }],
  3: [{ hora: "09:00", nombre: "Julia R.", servicio: "Constel.", modalidad: "presencial" }, { hora: "11:00", nombre: "Nadia P.", servicio: "Biodes.", modalidad: "virtual" }],
  4: [{ hora: "10:00", nombre: "Lucía F.", servicio: "Biodes.", modalidad: "presencial" }],
  5: [],
  6: [],
};

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  toggleWrap: { display: "flex", background: "#fff", border: "0.5px solid #E0D0F0", borderRadius: "8px", overflow: "hidden" },
  toggleBtn: { padding: "6px 18px", fontSize: "13px", cursor: "pointer", color: "#B89FD0", border: "none", background: "transparent", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  toggleBtnActive: { padding: "6px 18px", fontSize: "13px", cursor: "pointer", color: "#3B2460", fontWeight: "500", border: "none", background: "#EDE8FA", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  select: { fontSize: "12px", padding: "6px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#5C3F99", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnNuevo: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  arrowBtn: { width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9B72C0", fontSize: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  dateLabel: { fontSize: "14px", fontWeight: "500", color: "#2A1845", minWidth: "180px", textAlign: "center" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", flex: 1 },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

const getTop = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return ((h - 8) * 64) + (m / 60 * 64);
};

const getHeight = (duracion) => (duracion / 60) * 64 - 4;

export default function Agenda({ setPage }) {
  const [vista, setVista] = useState("dia");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [form, setForm] = useState({ cliente: "", profesional: "Maru", servicio: "Reiki · 60 min · $24.000", modalidad: "presencial", fecha: "2026-06-09", hora: "09:00", precioTipo: "normal", precioCustom: "", notas: "" });

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.logo}>🗓 AgendaLec</div>
        <button style={s.navItem} onClick={() => setPage("dashboard")}>🏠 Inicio</button>
        <button style={s.navItemActive}>📅 Mi agenda</button>
        <button style={s.navItem} onClick={() => setPage("clientes")}>👥 Clientes</button>
        <button style={s.navItem} onClick={() => setPage("cobros")}>💰 Cobros</button>
        <button style={s.navItem} onClick={() => setPage("config")}>⚙️ Configuración</button>
        <button style={s.logoutBtn} onClick={handleLogout}>← Cerrar sesión</button>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button style={s.arrowBtn}>‹</button>
            <div style={s.dateLabel}>{vista === "dia" ? "Lunes 9 de junio" : "Semana del 9 al 15 de junio"}</div>
            <button style={s.arrowBtn}>›</button>
            <div style={s.toggleWrap}>
              <button style={vista === "dia" ? s.toggleBtnActive : s.toggleBtn} onClick={() => setVista("dia")}>Día</button>
              <button style={vista === "semana" ? s.toggleBtnActive : s.toggleBtn} onClick={() => setVista("semana")}>Semana</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select style={s.select}>
              <option>Todos los profesionales</option>
              <option>Maru</option>
              <option>Clara L.</option>
              <option>Romina V.</option>
            </select>
            <select style={s.select}>
              <option>Todas las modalidades</option>
              <option>Virtual</option>
              <option>Presencial</option>
            </select>
            <button style={s.btnNuevo} onClick={() => setPanelAbierto(true)}>+ Nuevo turno</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
          {vista === "dia" ? (
            <div style={s.card}>
              <div style={{ display: "grid", gridTemplateColumns: "52px 1fr" }}>
                <div>
                  {HORAS.map(h => <div key={h} style={{ height: "64px", fontSize: "11px", color: "#C4A8D8", paddingTop: "4px" }}>{h}</div>)}
                </div>
                <div style={{ position: "relative", borderLeft: "0.5px solid #F0E8F8", height: `${HORAS.length * 64}px` }}>
                  {HORAS.map(h => <div key={h} style={{ height: "64px", borderBottom: "0.5px solid #F8F0FC" }}></div>)}
                  {turnos.map((t, i) => (
                    <div key={i} style={{
                      position: "absolute", left: "6px", right: "6px",
                      top: `${getTop(t.hora)}px`,
                      height: `${getHeight(t.duracion)}px`,
                      borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
                      background: t.modalidad === "virtual" ? "#EDE8FA" : t.modalidad === "bloqueado" ? "#F1EFE8" : "#FDE8F0",
                      borderLeft: `3px solid ${t.modalidad === "virtual" ? "#9B72C0" : t.modalidad === "bloqueado" ? "#C4BFB0" : "#E88BB0"}`,
                    }}>
                      <div style={{ fontSize: "12px", fontWeight: "500", color: t.modalidad === "bloqueado" ? "#6B6860" : "#2A1845" }}>{t.nombre}</div>
                      {t.servicio && <div style={{ fontSize: "11px", color: "#9B72C0" }}>{t.servicio} · {t.duracion} min</div>}
                      <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", background: t.modalidad === "virtual" ? "#D8CEFC" : t.modalidad === "bloqueado" ? "#E0DDD5" : "#F9C8DE", color: t.modalidad === "virtual" ? "#5C3F99" : t.modalidad === "bloqueado" ? "#6B6860" : "#A0407A" }}>
                        {t.modalidad === "bloqueado" ? "Bloqueado" : t.modalidad === "virtual" ? "Virtual" : "Presencial"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...s.card, overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", minWidth: "600px" }}>
                <div style={{ borderBottom: "0.5px solid #F0E8F8", borderRight: "0.5px solid #F0E8F8", height: "36px" }}></div>
                {DIAS.map((d, i) => (
                  <div key={d} style={{ fontSize: "12px", fontWeight: "500", color: i === 0 ? "#7B5EA7" : "#2A1845", textAlign: "center", padding: "8px 4px", borderBottom: "0.5px solid #F0E8F8", borderRight: "0.5px solid #F0E8F8", background: i === 0 ? "#F3EEFA" : "transparent" }}>
                    {d} {9 + i}
                  </div>
                ))}
                {HORAS.slice(0, 8).map((h, hi) => (
                  <>
                    <div key={h} style={{ fontSize: "11px", color: "#C4A8D8", padding: "4px 6px 0 0", textAlign: "right", borderRight: "0.5px solid #F0E8F8", height: "48px" }}>{h}</div>
                    {DIAS.map((_, di) => {
                      const t = turnosSemana[di]?.find(t => t.hora === h);
                      return (
                        <div key={di} style={{ height: "48px", borderRight: "0.5px solid #F0E8F8", borderBottom: "0.5px solid #F8F0FC" }}>
                          {t && <div style={{ margin: "2px 3px", borderRadius: "4px", padding: "2px 5px", fontSize: "10px", fontWeight: "500", cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", background: t.modalidad === "virtual" ? "#EDE8FA" : "#FDE8F0", color: t.modalidad === "virtual" ? "#5C3F99" : "#A0407A", borderLeft: `2px solid ${t.modalidad === "virtual" ? "#9B72C0" : "#E88BB0"}` }}>
                            {t.nombre}
                          </div>}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}

          {panelAbierto && (
            <div style={{ width: "320px", background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>📅 Nuevo turno</div>
                <button onClick={() => setPanelAbierto(false)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
              </div>
              {[
                { label: "Cliente", key: "cliente", type: "text", placeholder: "Buscar cliente..." },
                { label: "Profesional", key: "profesional", type: "select", options: ["Maru", "Clara L.", "Romina V.", "Sofía B."] },
                { label: "Servicio", key: "servicio", type: "select", options: ["Reiki · 60 min · $24.000", "Biodescodificación · 90 min · $36.000", "Constelaciones · 60 min · $28.000"] },
              ].map(f => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", color: "#9B72C0" }}>{f.label}</label>
                  {f.type === "select" ? (
                    <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                  )}
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", color: "#9B72C0" }}>Modalidad</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["presencial", "virtual"].map(m => (
                    <button key={m} onClick={() => setForm({ ...form, modalidad: m })} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${form.modalidad === m ? (m === "presencial" ? "#E88BB0" : "#9B72C0") : "#E0D0F0"}`, background: form.modalidad === m ? (m === "presencial" ? "#FDE8F0" : "#EDE8FA") : "#fff", color: form.modalidad === m ? (m === "presencial" ? "#A0407A" : "#5C3F99") : "#B89FD0", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {m === "presencial" ? "📍 Presencial" : "📹 Virtual"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", color: "#9B72C0" }}>Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={{ fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", color: "#9B72C0" }}>Hora</label>
                  <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} style={{ fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                </div>
              </div>
              <div style={{ background: "#F8F4FC", borderRadius: "8px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "12px", fontWeight: "500", color: "#2A1845", marginBottom: "2px" }}>Resumen de pago</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span style={{ color: "#9B72C0" }}>Precio total</span><span style={{ fontWeight: "500", color: "#2A1845" }}>$24.000</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span style={{ color: "#9B72C0" }}>Seña (50%)</span><span style={{ fontWeight: "500", color: "#5C3F99" }}>$12.000</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span style={{ color: "#9B72C0" }}>Saldo 24hs antes</span><span style={{ fontWeight: "500", color: "#2A1845" }}>$12.000</span></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", color: "#9B72C0" }}>Notas internas</label>
                <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Aclaraciones..." style={{ fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", fontFamily: "'Plus Jakarta Sans', sans-serif", height: "64px", resize: "none" }} />
              </div>
              <button style={{ width: "100%", padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✓ Guardar turno</button>
              <button onClick={() => setPanelAbierto(false)} style={{ width: "100%", padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancelar</button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {[["#EDE8FA","#9B72C0","Virtual"],["#FDE8F0","#E88BB0","Presencial"],["#F1EFE8","#C4BFB0","Bloqueado"]].map(([bg,border,label]) => (
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