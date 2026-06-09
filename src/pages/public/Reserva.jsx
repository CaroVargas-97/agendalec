import { useState } from "react";

const s = {
  wrap: { minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 1rem" },
  header: { width: "100%", maxWidth: "480px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460" },
  stepIndicator: { display: "flex", alignItems: "center", gap: "4px" },
  stepDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#E0D0F0" },
  stepDotActive: { width: "18px", height: "6px", borderRadius: "3px", background: "#9B72C0" },
  stepDotDone: { width: "6px", height: "6px", borderRadius: "50%", background: "#C4A8D8" },
  card: { background: "#fff", borderRadius: "16px", border: "0.5px solid #E0D0F0", padding: "1.5rem", width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "16px", fontWeight: "500", color: "#2A1845" },
  sub: { fontSize: "13px", color: "#9B72C0", marginTop: "2px" },
  profCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "12px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  profCardSelected: { background: "#F3EEFA", borderRadius: "12px", border: "0.5px solid #9B72C0", padding: "12px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500", color: "#3B2460", flexShrink: 0 },
  profNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845" },
  profEsp: { fontSize: "11px", color: "#9B72C0" },
  servicioCard: { background: "#fff", borderRadius: "10px", border: "0.5px solid #E0D0F0", padding: "10px 12px", cursor: "pointer" },
  servicioCardSelected: { background: "#F3EEFA", borderRadius: "10px", border: "0.5px solid #9B72C0", padding: "10px 12px", cursor: "pointer" },
  srvTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  srvNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845" },
  srvPrecio: { fontSize: "13px", fontWeight: "500", color: "#7B5EA7" },
  srvDet: { fontSize: "11px", color: "#9B72C0", marginTop: "3px", display: "flex", gap: "8px" },
  tagV: { fontSize: "10px", padding: "2px 7px", borderRadius: "10px", background: "#EDE8FA", color: "#5C3F99" },
  tagP: { fontSize: "10px", padding: "2px 7px", borderRadius: "10px", background: "#FDE8F0", color: "#A0407A" },
  calHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" },
  calDayName: { fontSize: "10px", color: "#C4A8D8", textAlign: "center", padding: "2px 0" },
  calDay: { height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#2A1845", cursor: "pointer", background: "#fff", border: "0.5px solid #F0E8F8" },
  calDayOff: { height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#E0D0F0", background: "transparent", border: "none" },
  calDaySelected: { height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", background: "#9B72C0", border: "0.5px solid #9B72C0", cursor: "pointer" },
  calDayToday: { height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#7B5EA7", fontWeight: "500", background: "#fff", border: "0.5px solid #9B72C0", cursor: "pointer" },
  horaGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
  horaBtn: { padding: "9px 4px", borderRadius: "8px", border: "0.5px solid #E0D0F0", fontSize: "13px", textAlign: "center", cursor: "pointer", background: "#fff", color: "#2A1845", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  horaBtnSelected: { padding: "9px 4px", borderRadius: "8px", border: "0.5px solid #9B72C0", fontSize: "13px", textAlign: "center", cursor: "pointer", background: "#9B72C0", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modBtn: { flex: 1, padding: "10px", borderRadius: "8px", border: "0.5px solid #E0D0F0", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modBtnP: { flex: 1, padding: "10px", borderRadius: "8px", border: "2px solid #E88BB0", fontSize: "13px", cursor: "pointer", background: "#FDE8F0", color: "#A0407A", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modBtnV: { flex: 1, padding: "10px", borderRadius: "8px", border: "2px solid #9B72C0", fontSize: "13px", cursor: "pointer", background: "#EDE8FA", color: "#5C3F99", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "14px", padding: "10px 12px", border: "0.5px solid #E0D0F0", borderRadius: "10px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" },
  resumenBox: { background: "#F8F4FC", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "7px" },
  resRow: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  resLabel: { color: "#9B72C0" },
  resValor: { color: "#2A1845", fontWeight: "500" },
  resSeña: { color: "#7B5EA7", fontWeight: "500" },
  btnNext: { width: "100%", padding: "13px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnMP: { width: "100%", padding: "13px", background: "#009EE3", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  confirmCircle: { width: "64px", height: "64px", borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: "28px" },
  avisoBox: { background: "#FDE8F0", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#A0407A" },
};

const profesionales = [
  { initials: "MA", nombre: "Maru", esp: "Terapeuta holística", color: "#C4A8D8" },
  { initials: "CL", nombre: "Clara L.", esp: "Reiki · Biodescodificación", color: "#F4B8D1" },
  { initials: "RV", nombre: "Romina V.", esp: "Constelaciones", color: "#D8EAD0" },
];

const servicios = [
  { nombre: "Reiki", duracion: 60, precio: 24000, modalidad: "ambas" },
  { nombre: "Biodescodificación", duracion: 90, precio: 36000, modalidad: "virtual" },
  { nombre: "Constelaciones", duracion: 60, precio: 28000, modalidad: "presencial" },
];

const horariosDisponibles = ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00"];

const StepDots = ({ step }) => (
  <div style={s.stepIndicator}>
    {[1,2,3,4].map(i => (
      <div key={i} style={i === step ? s.stepDotActive : i < step ? s.stepDotDone : s.stepDot} />
    ))}
  </div>
);

export default function Reserva() {
  const [step, setStep] = useState(1);
  const [prof, setProf] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [form, setForm] = useState({ nombre: "", celular: "", mail: "" });

  const srv = servicios.find(s => s.nombre === servicio);
  const total = srv?.precio || 0;
  const sena = Math.round(total / 2);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.logo}>🗓 AgendaLec</div>
        <StepDots step={step} />
      </div>

      {step === 1 && (
        <div style={s.card}>
          <div>
            <div style={s.title}>¿Con quién querés atenderte?</div>
            <div style={s.sub}>Seleccioná un profesional y servicio</div>
          </div>
          {profesionales.map((p, i) => (
            <div key={i} style={prof === p.nombre ? s.profCardSelected : s.profCard} onClick={() => setProf(p.nombre)}>
              <div style={{ ...s.avatar, background: p.color }}>{p.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={s.profNombre}>{p.nombre}</div>
                <div style={s.profEsp}>{p.esp}</div>
              </div>
              {prof === p.nombre && <span style={{ color: "#9B72C0", fontSize: "18px" }}>✓</span>}
            </div>
          ))}
          {prof && (
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>Elegí un servicio</div>
              {servicios.map((sv, i) => (
                <div key={i} style={{ ...(servicio === sv.nombre ? s.servicioCardSelected : s.servicioCard), marginBottom: "6px" }} onClick={() => setServicio(sv.nombre)}>
                  <div style={s.srvTop}>
                    <span style={s.srvNombre}>{sv.nombre}</span>
                    <span style={s.srvPrecio}>${sv.precio.toLocaleString("es-AR")}</span>
                  </div>
                  <div style={s.srvDet}>
                    <span>{sv.duracion} min</span>
                    {(sv.modalidad === "ambas" || sv.modalidad === "virtual") && <span style={s.tagV}>Virtual</span>}
                    {(sv.modalidad === "ambas" || sv.modalidad === "presencial") && <span style={s.tagP}>Presencial</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button style={{ ...s.btnNext, background: prof && servicio ? "#9B72C0" : "#E0D0F0" }} disabled={!prof || !servicio} onClick={() => setStep(2)}>
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={s.card}>
          <div>
            <div style={s.title}>¿Cuándo querés tu turno?</div>
            <div style={s.sub}>{servicio} con {prof} · {srv?.duracion} min</div>
          </div>
          <div>
            <div style={s.calHeader}>
              <span style={{ cursor: "pointer", color: "#9B72C0" }}>‹</span>
              <span>Junio 2026</span>
              <span style={{ cursor: "pointer", color: "#9B72C0" }}>›</span>
            </div>
            <div style={s.calGrid}>
              {["L","M","X","J","V","S","D"].map(d => <div key={d} style={s.calDayName}>{d}</div>)}
              {[null,null,null,null,null,null,null].map((_, i) => <div key={`e${i}`} style={s.calDayOff}></div>)}
              {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                <div key={d} onClick={() => setDia(d)}
                  style={dia === d ? s.calDaySelected : d === 9 ? s.calDayToday : [1,7,8,14,15,21,22,28,29].includes(d) ? s.calDayOff : s.calDay}>
                  {d}
                </div>
              ))}
            </div>
          </div>
          {dia && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>Horarios disponibles</div>
              <div style={s.horaGrid}>
                {horariosDisponibles.map(h => (
                  <button key={h} style={hora === h ? s.horaBtnSelected : s.horaBtn} onClick={() => setHora(h)}>{h}</button>
                ))}
              </div>
            </div>
          )}
          {dia && hora && srv?.modalidad === "ambas" && (
            <div>
              <div style={{ fontSize: "12px", color: "#9B72C0", marginBottom: "8px" }}>Modalidad</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={modalidad === "presencial" ? s.modBtnP : s.modBtn} onClick={() => setModalidad("presencial")}>📍 Presencial</button>
                <button style={modalidad === "virtual" ? s.modBtnV : s.modBtn} onClick={() => setModalidad("virtual")}>📹 Virtual</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...s.btnNext, background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0" }} onClick={() => setStep(1)}>← Volver</button>
            <button style={{ ...s.btnNext, background: dia && hora && (modalidad || srv?.modalidad !== "ambas") ? "#9B72C0" : "#E0D0F0" }}
              disabled={!dia || !hora || (!modalidad && srv?.modalidad === "ambas")}
              onClick={() => { if (srv?.modalidad !== "ambas") setModalidad(srv?.modalidad); setStep(3); }}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={s.card}>
          <div>
            <div style={s.title}>Tus datos</div>
            <div style={s.sub}>Solo la primera vez — guardamos tu información para próximas reservas</div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Nombre y apellido</label>
            <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Laura Gómez" style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Celular (WhatsApp)</label>
            <input type="tel" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} placeholder="+54 9 11 ..." style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Mail</label>
            <input type="email" value={form.mail} onChange={e => setForm({...form, mail: e.target.value})} placeholder="tu@mail.com" style={s.input} />
          </div>
          <div style={s.resumenBox}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "2px" }}>Resumen</div>
            <div style={s.resRow}><span style={s.resLabel}>Servicio</span><span style={s.resValor}>{servicio} · {srv?.duracion} min</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Profesional</span><span style={s.resValor}>{prof}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Fecha</span><span style={s.resValor}>{dia} jun · {hora}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Modalidad</span><span style={s.resValor}>{modalidad === "virtual" ? "📹 Virtual" : "📍 Presencial"}</span></div>
            <div style={{ borderTop: "0.5px solid #E8DEFA", paddingTop: "8px", marginTop: "2px" }}>
              <div style={s.resRow}><span style={s.resLabel}>Precio total</span><span style={s.resValor}>${total.toLocaleString("es-AR")}</span></div>
              <div style={{ ...s.resRow, marginTop: "4px" }}><span style={s.resLabel}>Seña a pagar ahora (50%)</span><span style={s.resSeña}>${sena.toLocaleString("es-AR")}</span></div>
              <div style={{ ...s.resRow, marginTop: "4px" }}><span style={s.resLabel}>Saldo 24hs antes del turno</span><span style={s.resValor}>${sena.toLocaleString("es-AR")}</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...s.btnNext, background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0" }} onClick={() => setStep(2)}>← Volver</button>
            <button style={{ ...s.btnMP, opacity: form.nombre && form.celular && form.mail ? 1 : 0.5 }}
              disabled={!form.nombre || !form.celular || !form.mail}
              onClick={() => setStep(4)}>
              💳 Pagar seña ${sena.toLocaleString("es-AR")}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ ...s.card, alignItems: "center", textAlign: "center" }}>
          <div style={s.confirmCircle}>✅</div>
          <div style={s.title}>¡Turno confirmado!</div>
          <div style={s.sub}>Te enviamos la confirmación por mail y WhatsApp</div>
          <div style={{ ...s.resumenBox, width: "100%", textAlign: "left" }}>
            <div style={s.resRow}><span style={s.resLabel}>Profesional</span><span style={s.resValor}>{prof}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Servicio</span><span style={s.resValor}>{servicio} · {modalidad}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Fecha</span><span style={s.resValor}>{dia} jun · {hora}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Seña abonada</span><span style={s.resSeña}>${sena.toLocaleString("es-AR")} ✓</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Saldo pendiente</span><span style={s.resValor}>${sena.toLocaleString("es-AR")}</span></div>
          </div>
          <div style={s.avisoBox}>
            🔔 Te avisaremos 24hs antes para abonar el saldo restante.
          </div>
          <button style={s.btnNext} onClick={() => { setStep(1); setProf(null); setServicio(null); setDia(null); setHora(null); setModalidad(null); }}>
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}