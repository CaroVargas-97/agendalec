import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

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
  servicioCard: { background: "#fff", borderRadius: "10px", border: "0.5px solid #E0D0F0", padding: "10px 12px", cursor: "pointer", marginBottom: "6px" },
  servicioCardSelected: { background: "#F3EEFA", borderRadius: "10px", border: "0.5px solid #9B72C0", padding: "10px 12px", cursor: "pointer", marginBottom: "6px" },
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
  loadingText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
};

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
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [prof, setProf] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [form, setForm] = useState({ nombre: "", celular: "", mail: "" });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").eq("role", "professional");
      setProfesionales(profs || []);
      setLoading(false);
    };
    cargar();
  }, []);

  useEffect(() => {
    if (!prof) return;
    const cargarServicios = async () => {
      const profData = profesionales.find(p => p.full_name === prof);
      if (!profData) return;
      const { data: svs } = await supabase.from("services").select("*").eq("professional_id", profData.id).eq("active", true);
      setServicios(svs || []);
    };
    cargarServicios();
  }, [prof]);

  const srv = servicios.find(s => s.name === servicio);
  const total = srv?.price || 0;
  const sena = Math.round(total / 2);

  const confirmarReserva = async () => {
    setGuardando(true);
    setError("");
    try {
      // 1. Guardar o buscar cliente
      let clienteId;
      const { data: clienteExistente } = await supabase.from("clients").select("id").eq("email", form.mail).single();
      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        const { data: nuevoCliente } = await supabase.from("clients").insert({ full_name: form.nombre, phone: form.celular, email: form.mail }).select("id").single();
        clienteId = nuevoCliente.id;
      }

      // 2. Crear turno
      const profData = profesionales.find(p => p.full_name === prof);
      const fecha = `2026-06-${String(dia).padStart(2, "0")}`;
      const [h, m] = hora.split(":").map(Number);
      const endH = h + Math.floor((m + srv.duration_minutes) / 60);
      const endM = (m + srv.duration_minutes) % 60;
      const endTime = `${String(endH).padStart(2,"0")}:${String(endM).padStart(2,"0")}`;

      const { data: turno } = await supabase.from("appointments").insert({
        professional_id: profData.id, client_id: clienteId, service_id: srv.id,
        date: fecha, start_time: hora, end_time: endTime,
        modality: modalidad || srv.modality, status: "confirmed", total_price: total
      }).select("id").single();

      // 3. Crear pago seña
      await supabase.from("payments").insert({
        appointment_id: turno.id, type: "seña", amount: sena, status: "pending"
      });

      setStep(4);
    } catch (e) {
      setError("Hubo un error al confirmar el turno. Intentá de nuevo.");
    }
    setGuardando(false);
  };

  if (loading) return (
    <div style={s.wrap}>
      <div style={s.loadingText}>Cargando...</div>
    </div>
  );

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
          {profesionales.length === 0 ? (
            <div style={s.loadingText}>No hay profesionales disponibles aún.</div>
          ) : profesionales.map((p, i) => (
            <div key={i} style={prof === p.full_name ? s.profCardSelected : s.profCard} onClick={() => { setProf(p.full_name); setServicio(null); }}>
              <div style={{ ...s.avatar, background: i % 2 === 0 ? "#C4A8D8" : "#F4B8D1" }}>
                {p.full_name?.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>{p.full_name}</div>
              </div>
              {prof === p.full_name && <span style={{ color: "#9B72C0", fontSize: "18px" }}>✓</span>}
            </div>
          ))}
          {prof && servicios.length > 0 && (
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>Elegí un servicio</div>
              {servicios.map((sv, i) => (
                <div key={i} style={servicio === sv.name ? s.servicioCardSelected : s.servicioCard} onClick={() => setServicio(sv.name)}>
                  <div style={s.srvTop}>
                    <span style={s.srvNombre}>{sv.name}</span>
                    <span style={s.srvPrecio}>${sv.price.toLocaleString("es-AR")}</span>
                  </div>
                  <div style={s.srvDet}>
                    <span>{sv.duration_minutes} min</span>
                    {(sv.modality === "ambas" || sv.modality === "virtual") && <span style={s.tagV}>Virtual</span>}
                    {(sv.modality === "ambas" || sv.modality === "presencial") && <span style={s.tagP}>Presencial</span>}
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
            <div style={s.sub}>{servicio} con {prof} · {srv?.duration_minutes} min</div>
          </div>
          <div>
            <div style={s.calHeader}>
              <span style={{ cursor: "pointer", color: "#9B72C0" }}>‹</span>
              <span>Junio 2026</span>
              <span style={{ cursor: "pointer", color: "#9B72C0" }}>›</span>
            </div>
            <div style={s.calGrid}>
              {["L","M","X","J","V","S","D"].map(d => <div key={d} style={s.calDayName}>{d}</div>)}
              {Array(0).fill(null).map((_, i) => <div key={`e${i}`} style={s.calDayOff}></div>)}
              {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                <div key={d} onClick={() => setDia(d)}
                  style={dia === d ? s.calDaySelected : d === 9 ? s.calDayToday : [1,7,8,14,15,21,22,28,29,30].includes(d) ? s.calDayOff : s.calDay}>
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
          {dia && hora && srv?.modality === "ambas" && (
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
            <button style={{ ...s.btnNext, background: dia && hora && (modalidad || srv?.modality !== "ambas") ? "#9B72C0" : "#E0D0F0" }}
              disabled={!dia || !hora || (!modalidad && srv?.modality === "ambas")}
              onClick={() => { if (srv?.modality !== "ambas") setModalidad(srv?.modality); setStep(3); }}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={s.card}>
          <div>
            <div style={s.title}>Tus datos</div>
            <div style={s.sub}>Solo la primera vez</div>
          </div>
          <div style={s.field}><label style={s.label}>Nombre y apellido</label><input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Laura Gómez" style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Celular (WhatsApp)</label><input type="tel" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} placeholder="+54 9 11 ..." style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Mail</label><input type="email" value={form.mail} onChange={e => setForm({...form, mail: e.target.value})} placeholder="tu@mail.com" style={s.input} /></div>
          <div style={s.resumenBox}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "2px" }}>Resumen</div>
            <div style={s.resRow}><span style={s.resLabel}>Servicio</span><span style={s.resValor}>{servicio} · {srv?.duration_minutes} min</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Profesional</span><span style={s.resValor}>{prof}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Fecha</span><span style={s.resValor}>{dia} jun · {hora}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Modalidad</span><span style={s.resValor}>{modalidad === "virtual" ? "📹 Virtual" : "📍 Presencial"}</span></div>
            <div style={{ borderTop: "0.5px solid #E8DEFA", paddingTop: "8px", marginTop: "2px" }}>
              <div style={s.resRow}><span style={s.resLabel}>Precio total</span><span style={s.resValor}>${total.toLocaleString("es-AR")}</span></div>
              <div style={{ ...s.resRow, marginTop: "4px" }}><span style={s.resLabel}>Seña a pagar ahora (50%)</span><span style={s.resSeña}>${sena.toLocaleString("es-AR")}</span></div>
              <div style={{ ...s.resRow, marginTop: "4px" }}><span style={s.resLabel}>Saldo 24hs antes del turno</span><span style={s.resValor}>${sena.toLocaleString("es-AR")}</span></div>
            </div>
          </div>
          {error && <div style={{ fontSize: "12px", color: "#A32D2D" }}>{error}</div>}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...s.btnNext, background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0" }} onClick={() => setStep(2)}>← Volver</button>
            <button style={{ ...s.btnMP, opacity: form.nombre && form.celular && form.mail ? 1 : 0.5 }}
              disabled={!form.nombre || !form.celular || !form.mail || guardando}
              onClick={confirmarReserva}>
              {guardando ? "Confirmando..." : `💳 Pagar seña $${sena.toLocaleString("es-AR")}`}
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
            <div style={s.resRow}><span style={s.resLabel}>Seña pendiente</span><span style={s.resSeña}>${sena.toLocaleString("es-AR")}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Saldo 24hs antes</span><span style={s.resValor}>${sena.toLocaleString("es-AR")}</span></div>
          </div>
          <div style={s.avisoBox}>🔔 Te avisaremos 24hs antes para abonar el saldo restante.</div>
          <button style={s.btnNext} onClick={() => { setStep(1); setProf(null); setServicio(null); setDia(null); setHora(null); setModalidad(null); setForm({ nombre: "", celular: "", mail: "" }); }}>
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}