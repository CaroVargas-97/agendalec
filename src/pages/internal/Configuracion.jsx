import { useState } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { display: "flex", minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sidebar: { width: "200px", padding: "1.5rem 1rem", background: "#fff", borderRight: "0.5px solid #E0D0F0", display: "flex", flexDirection: "column", gap: "4px" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460", marginBottom: "1.5rem" },
  navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#B89FD0", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#3B2460", fontWeight: "500", cursor: "pointer", border: "none", background: "#EDE8FA", width: "100%", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  tabs: { display: "flex", gap: "6px" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem" },
  cardTitle: { fontSize: "14px", fontWeight: "500", color: "#2A1845", marginBottom: "1rem" },
  diaRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #F0E8F8" },
  diaNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845", minWidth: "90px" },
  diaNombreOff: { fontSize: "13px", fontWeight: "500", color: "#C4A8D8", minWidth: "90px" },
  select: { fontSize: "12px", padding: "5px 8px", border: "0.5px solid #E0D0F0", borderRadius: "7px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPill: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillP: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #E88BB0", background: "#FDE8F0", color: "#A0407A", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillV: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modPillPV: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#F3EEFA", color: "#5C3F99", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  servicioRow: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid #F0E8F8" },
  input: { fontSize: "12px", padding: "5px 8px", border: "0.5px solid #E0D0F0", borderRadius: "7px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  trashBtn: { width: "26px", height: "26px", borderRadius: "6px", border: "0.5px solid #F0D0D8", background: "#FEF0F3", cursor: "pointer", color: "#C06080", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" },
  addBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "#fff", color: "#9B72C0", border: "0.5px solid #C4A8D8", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "10px" },
  saveBtn: { padding: "9px 24px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  bloqueoRow: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid #F0E8F8", fontSize: "13px" },
  tagDia: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagHora: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  pausaRow: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 0", borderBottom: "0.5px solid #F0E8F8" },
  pausaLabel: { fontSize: "13px", color: "#2A1845", flex: 1 },
  pausaSub: { fontSize: "12px", color: "#9B72C0" },
  inputSm: { fontSize: "13px", padding: "6px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "70px" },
  logoutBtn: { marginTop: "auto", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#C06080", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const initialDias = [
  { activo: true, inicio: "09:00", fin: "18:00", modalidad: "ambas" },
  { activo: true, inicio: "09:00", fin: "18:00", modalidad: "presencial" },
  { activo: true, inicio: "10:00", fin: "14:00", modalidad: "virtual" },
  { activo: true, inicio: "09:00", fin: "18:00", modalidad: "ambas" },
  { activo: true, inicio: "09:00", fin: "16:00", modalidad: "ambas" },
  { activo: false, inicio: "09:00", fin: "13:00", modalidad: "presencial" },
  { activo: false, inicio: "09:00", fin: "13:00", modalidad: "presencial" },
];

const initialServicios = [
  { nombre: "Reiki", duracion: 60, precio: 24000, modalidad: "ambas" },
  { nombre: "Biodescodificación", duracion: 90, precio: 36000, modalidad: "virtual" },
  { nombre: "Constelaciones", duracion: 60, precio: 28000, modalidad: "presencial" },
];

const bloqueos = [
  { tipo: "dia", descripcion: "Lunes 23 de junio", motivo: "Feriado" },
  { tipo: "dia", descripcion: "Vie 4 al Lun 7 jul", motivo: "Vacaciones" },
  { tipo: "hora", descripcion: "Miércoles · 12:00 a 14:00", motivo: "Reunión de equipo" },
  { tipo: "hora", descripcion: "Viernes · 13:00 a 15:00", motivo: "Uso personal" },
];

export default function Configuracion({ setPage }) {
  const [tab, setTab] = useState("disponibilidad");
  const [dias, setDias] = useState(initialDias);
  const [servicios, setServicios] = useState(initialServicios);
  const [pausas, setPausas] = useState({ pausa: 15, anticipacion: 24, cancelacion: 24 });

  const toggleDia = (i) => {
    const d = [...dias];
    d[i].activo = !d[i].activo;
    setDias(d);
  };

  const updateDia = (i, key, val) => {
    const d = [...dias];
    d[i][key] = val;
    setDias(d);
  };

  const updateServicio = (i, key, val) => {
    const sv = [...servicios];
    sv[i][key] = val;
    setServicios(sv);
  };

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
    const d = [...dias];
    const cur = order.indexOf(d[i].modalidad);
    d[i].modalidad = order[(cur + 1) % order.length];
    setDias(d);
  };

  const cycleServicioMod = (i) => {
    const order = ["presencial", "virtual", "ambas"];
    const sv = [...servicios];
    const cur = order.indexOf(sv[i].modalidad);
    sv[i].modalidad = order[(cur + 1) % order.length];
    setServicios(sv);
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
        <div style={s.title}>Configuración — Maru</div>

        <div style={s.tabs}>
          {["disponibilidad", "servicios", "bloqueos", "pausas"].map(t => (
            <button key={t} style={tab === t ? s.tabActive : s.tab} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "disponibilidad" && (
          <>
            <div style={s.card}>
              <div style={s.cardTitle}>Días y horarios de atención</div>
              {diasSemana.map((dia, i) => (
                <div key={dia} style={{ ...s.diaRow, borderBottom: i === 6 ? "none" : "0.5px solid #F0E8F8" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <div onClick={() => toggleDia(i)} style={{ width: "36px", height: "20px", borderRadius: "20px", background: dias[i].activo ? "#9B72C0" : "#E0D0F0", position: "relative", cursor: "pointer", transition: "0.2s" }}>
                      <div style={{ position: "absolute", width: "14px", height: "14px", borderRadius: "50%", background: "#fff", top: "3px", left: dias[i].activo ? "19px" : "3px", transition: "0.2s" }}></div>
                    </div>
                  </label>
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
                      <button style={getModStyle(dias[i].modalidad)} onClick={() => cycleModalidad(i)}>
                        {getModLabel(dias[i].modalidad)}
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#C4A8D8" }}>No atiende</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={s.saveBtn}>Guardar cambios</button>
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
                  <button style={getModStyle(sv.modalidad)} onClick={() => cycleServicioMod(i)}>
                    {getModLabel(sv.modalidad)}
                  </button>
                  <button style={s.trashBtn} onClick={() => removeServicio(i)}>🗑</button>
                </div>
              ))}
              <button style={s.addBtn} onClick={addServicio}>+ Agregar servicio</button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={s.saveBtn}>Guardar cambios</button>
            </div>
          </>
        )}

        {tab === "bloqueos" && (
          <>
            <div style={s.card}>
              <div style={s.cardTitle}>Días y horarios bloqueados</div>
              {bloqueos.map((b, i) => (
                <div key={i} style={{ ...s.bloqueoRow, borderBottom: i === bloqueos.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <span style={b.tipo === "dia" ? s.tagDia : s.tagHora}>{b.tipo === "dia" ? "Día completo" : "Horario"}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", flex: 1 }}>{b.descripcion}</span>
                  <span style={{ fontSize: "12px", color: "#9B72C0" }}>{b.motivo}</span>
                  <button style={s.trashBtn}>🗑</button>
                </div>
              ))}
              <button style={s.addBtn}>+ Agregar bloqueo</button>
            </div>
          </>
        )}

        {tab === "pausas" && (
          <>
            <div style={s.card}>
              <div style={s.cardTitle}>Pausa entre turnos</div>
              <div style={s.pausaRow}>
                <div>
                  <div style={s.pausaLabel}>Tiempo de pausa entre sesiones</div>
                  <div style={s.pausaSub}>El sistema bloqueará este tiempo automáticamente entre turno y turno</div>
                </div>
                <input type="number" value={pausas.pausa} onChange={e => setPausas({ ...pausas, pausa: e.target.value })} style={s.inputSm} />
                <span style={{ fontSize: "13px", color: "#9B72C0" }}>min</span>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Anticipación mínima para reservar</div>
              <div style={{ ...s.pausaRow, borderBottom: "none" }}>
                <div>
                  <div style={s.pausaLabel}>¿Con cuántas horas de anticipación puede reservar un cliente?</div>
                  <div style={s.pausaSub}>Turnos más cercanos no estarán disponibles online</div>
                </div>
                <input type="number" value={pausas.anticipacion} onChange={e => setPausas({ ...pausas, anticipacion: e.target.value })} style={s.inputSm} />
                <span style={{ fontSize: "13px", color: "#9B72C0" }}>hs</span>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Plazo de cancelación con reembolso</div>
              <div style={{ ...s.pausaRow, borderBottom: "none" }}>
                <div>
                  <div style={s.pausaLabel}>Horas antes del turno para cancelar con devolución de seña</div>
                  <div style={s.pausaSub}>Cancelaciones después de este plazo retienen la seña</div>
                </div>
                <input type="number" value={pausas.cancelacion} onChange={e => setPausas({ ...pausas, cancelacion: e.target.value })} style={s.inputSm} />
                <span style={{ fontSize: "13px", color: "#9B72C0" }}>hs</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={s.saveBtn}>Guardar cambios</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}