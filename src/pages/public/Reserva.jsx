import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { minHeight: "100vh", background: "#F3EEFF", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 1rem" },
  header: { width: "100%", maxWidth: "480px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460" },
  logoSub: { fontSize: "10px", color: "#9B72C0", marginTop: "1px" },
  stepIndicator: { display: "flex", alignItems: "center", gap: "5px" },
  stepDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#D8C8EE" },
  stepDotActive: { width: "22px", height: "7px", borderRadius: "4px", background: "#9B72C0" },
  stepDotDone: { width: "7px", height: "7px", borderRadius: "50%", background: "#C4A8D8" },
  card: { background: "#fff", borderRadius: "20px", border: "0.5px solid #E0D0F0", padding: "1.5rem", width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 8px 32px rgba(42,24,69,0.10)" },
  title: { fontSize: "17px", fontWeight: "500", color: "#2A1845" },
  sub: { fontSize: "13px", color: "#9B72C0", marginTop: "2px" },
  profCard: { background: "#FDFAFF", borderRadius: "12px", border: "0.5px solid #E8D8F8", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "all 0.15s" },
  profCardSelected: { background: "#EDE8FA", borderRadius: "12px", border: "1.5px solid #9B72C0", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", boxShadow: "0 2px 10px rgba(155,114,192,0.15)" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#C4A8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500", color: "#3B2460", flexShrink: 0 },
  servicioCard: { background: "#FDFAFF", borderRadius: "10px", border: "0.5px solid #E8D8F8", padding: "11px 14px", cursor: "pointer", marginBottom: "6px", transition: "all 0.15s" },
  servicioCardSelected: { background: "#EDE8FA", borderRadius: "10px", border: "1.5px solid #9B72C0", padding: "11px 14px", cursor: "pointer", marginBottom: "6px", boxShadow: "0 2px 10px rgba(155,114,192,0.15)" },
  srvTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  srvNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845" },
  srvPrecio: { fontSize: "14px", fontWeight: "500", color: "#7B5EA7" },
  srvDet: { fontSize: "11px", color: "#9B72C0", marginTop: "4px", display: "flex", gap: "8px" },
  tagV: { fontSize: "10px", padding: "2px 7px", borderRadius: "10px", background: "#EDE8FA", color: "#5C3F99" },
  tagP: { fontSize: "10px", padding: "2px 7px", borderRadius: "10px", background: "#FDE8F0", color: "#A0407A" },
  calHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "10px" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" },
  calDayName: { fontSize: "10px", color: "#C4A8D8", textAlign: "center", padding: "3px 0", textTransform: "uppercase", letterSpacing: "0.3px" },
  calDay: { height: "38px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#2A1845", cursor: "pointer", background: "#FDFAFF", border: "0.5px solid #F0E8F8" },
  calDayOff: { height: "38px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#E0D0F0", background: "transparent", border: "none" },
  calDaySelected: { height: "38px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", background: "#9B72C0", border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" },
  calDayToday: { height: "38px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#7B5EA7", fontWeight: "600", background: "#fff", border: "1.5px solid #9B72C0", cursor: "pointer" },
  horaGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
  horaBtn: { padding: "10px 4px", borderRadius: "8px", border: "0.5px solid #E8D8F8", fontSize: "13px", textAlign: "center", cursor: "pointer", background: "#FDFAFF", color: "#2A1845", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  horaBtnSelected: { padding: "10px 4px", borderRadius: "8px", border: "none", fontSize: "13px", textAlign: "center", cursor: "pointer", background: "#9B72C0", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(155,114,192,0.3)" },
  horaBtnOff: { padding: "10px 4px", borderRadius: "8px", border: "0.5px solid #F0E8F8", fontSize: "13px", textAlign: "center", cursor: "not-allowed", background: "#F8F4FC", color: "#D0C0E0", fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: "line-through" },
  modBtn: { flex: 1, padding: "11px", borderRadius: "8px", border: "0.5px solid #E0D0F0", fontSize: "13px", cursor: "pointer", background: "#FDFAFF", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modBtnP: { flex: 1, padding: "11px", borderRadius: "8px", border: "1.5px solid #E88BB0", fontSize: "13px", cursor: "pointer", background: "#FDE8F0", color: "#A0407A", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  modBtnV: { flex: 1, padding: "11px", borderRadius: "8px", border: "1.5px solid #9B72C0", fontSize: "13px", cursor: "pointer", background: "#EDE8FA", color: "#5C3F99", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "11px", color: "#B89FD0", textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { fontSize: "14px", padding: "11px 12px", border: "0.5px solid #E0D0F0", borderRadius: "10px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" },
  resumenBox: { background: "#F8F4FC", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", border: "0.5px solid #EDE8FA" },
  resRow: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  resLabel: { color: "#9B72C0" },
  resValor: { color: "#2A1845", fontWeight: "500" },
  resSeña: { color: "#7B5EA7", fontWeight: "500" },
  btnNext: { width: "100%", padding: "13px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 14px rgba(155,114,192,0.35)" },
  btnConfirmar: { width: "100%", padding: "13px", background: "#3B2460", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 14px rgba(59,36,96,0.3)" },
  aliasBox: { background: "linear-gradient(135deg, #EDE8FA 0%, #F3EEFF 100%)", borderRadius: "14px", padding: "18px 16px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", textAlign: "center", border: "0.5px solid #D8C8EE" },
  aliasTitulo: { fontSize: "12px", color: "#5C3F99", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" },
  aliasValor: { fontSize: "24px", fontWeight: "500", color: "#3B2460", letterSpacing: "0.5px" },
  aliasCopy: { fontSize: "12px", color: "#9B72C0", cursor: "pointer", textDecoration: "underline" },
  avisoBox: { background: "#FDE8F0", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#A0407A" },
  pendienteCircle: { width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #EDE8FA, #F8E8D0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: "30px", boxShadow: "0 4px 16px rgba(155,114,192,0.2)" },
  loadingText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
};

const StepDots = ({ step }) => (
  <div style={s.stepIndicator}>
    {[1,2,3,4].map(i => (
      <div key={i} style={i === step ? s.stepDotActive : i < step ? s.stepDotDone : s.stepDot} />
    ))}
  </div>
);

const inicioMes = () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; };

export default function Reserva() {
  const [step, setStep] = useState(1);
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [prof, setProf] = useState(null);
  const [profData, setProfData] = useState(null);
  const [profSettings, setProfSettings] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [profPausa, setProfPausa] = useState(0);
  const [servicio, setServicio] = useState(null);
  const [moneda, setMoneda] = useState(null);
  const [mesActual, setMesActual] = useState(inicioMes);
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [form, setForm] = useState({ nombre: "", celular: "", mail: "" });
  const [clienteReconocido, setClienteReconocido] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [aceptaTyC, setAceptaTyC] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  const [reservasCerradas, setReservasCerradas] = useState(false);
  const [blockedDatesProf, setBlockedDatesProf] = useState([]);

  useEffect(() => {
    supabase.from("profiles").select("id, full_name, email, address, phone, reservas_desde, reservas_hasta").eq("role", "professional")
      .then(({ data }) => {
        const profs = data || [];
        setProfesionales(profs);
        const hoy = new Date().toISOString().slice(0, 10);
        const abierta = profs.some(p => p.reservas_desde && p.reservas_hasta && hoy >= p.reservas_desde && hoy <= p.reservas_hasta);
        setReservasCerradas(!abierta);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!prof) return;
    setLoadingServicios(true);
    setServicios([]);
    const cargar = async () => {
      const pd = profesionales.find(p => p.full_name === prof);
      if (!pd) { setLoadingServicios(false); return; }
      setProfData(pd);
      const [{ data: svs }, { data: cfg }, { data: avail }, { data: settings }, { data: blocked }] = await Promise.all([
        supabase.from("services").select("*").eq("professional_id", pd.id).eq("active", true),
        supabase.from("settings").select("payment_method, alias, cbu, alias_usd, cbu_usd, alias_eur, cbu_eur").eq("professional_id", pd.id).maybeSingle(),
        supabase.from("availability").select("*").eq("professional_id", pd.id).eq("active", true),
        supabase.from("settings").select("break_minutes").eq("professional_id", pd.id).maybeSingle(),
        supabase.from("blocked_dates").select("date, start_time, end_time").eq("professional_id", pd.id),
      ]);
      setBlockedDatesProf(blocked || []);
      setServicios(svs || []);
      setProfSettings(cfg);
      setDisponibilidad(avail || []);
      setProfPausa(settings?.break_minutes || 0);
      setLoadingServicios(false);
    };
    cargar();
  }, [prof]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!dia || !profData) return;
    const anio = mesActual.getFullYear();
    const mes = mesActual.getMonth() + 1;
    const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    supabase.from("turnos_ocupados").select("start_time")
      .eq("professional_id", profData.id).eq("date", fecha)
      .in("status", ["pending", "confirmed", "partial"])
      .then(({ data }) => setHorariosOcupados((data || []).map(t => t.start_time.slice(0, 5))));
  }, [dia, profData, mesActual]);

  const srv = servicios.find(s => s.id === servicio);
  const esACoorinar = srv?.requires_slot === false;
  const total = srv?.price || 0;
  const sena = Math.round(total / 2);
  const sym = srv?.currency === "USD" ? "U$S " : srv?.currency === "EUR" ? "€" : "$";
  const esMonedaExtranjera = srv?.currency === "USD" || srv?.currency === "EUR";
  const aliasActivo = srv?.currency === "EUR" ? (profSettings?.alias_eur || profSettings?.alias) : srv?.currency === "USD" ? (profSettings?.alias_usd || profSettings?.alias) : profSettings?.alias;
  const cbuActivo = srv?.currency === "EUR" ? (profSettings?.cbu_eur || profSettings?.cbu) : srv?.currency === "USD" ? (profSettings?.cbu_usd || profSettings?.cbu) : profSettings?.cbu;

  // Calendar helpers
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const anioMes = mesActual.getFullYear();
  const mesMes = mesActual.getMonth();
  const diasEnMes = new Date(anioMes, mesMes + 1, 0).getDate();
  const primerDow = new Date(anioMes, mesMes, 1).getDay();
  const offsetLunes = primerDow === 0 ? 6 : primerDow - 1;
  const nombreMes = mesActual.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const mesAnteriorPermitido = new Date(anioMes, mesMes, 1) > new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const esDiaSeleccionable = (d) => {
    const fechaObj = new Date(anioMes, mesMes, d);
    if (fechaObj < hoy) return false;
    const fechaStr = `${anioMes}-${String(mesMes + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (blockedDatesProf.some(b => b.date === fechaStr && !b.start_time)) return false;
    const dow = fechaObj.getDay();
    if (disponibilidad.length === 0) return dow !== 0 && dow !== 6;
    return disponibilidad.some(a => {
      if (a.day_of_week !== dow) return false;
      if (!modalidad || srv?.modality !== "ambas") return true;
      return a.modality === "ambas" || a.modality === modalidad;
    });
  };

  const generarHorarios = (d) => {
    if (!d || !srv) return [];
    const fechaStr = `${anioMes}-${String(mesMes + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const fechaObj = new Date(anioMes, mesMes, d);
    const dow = fechaObj.getDay();
    const avail = disponibilidad.find(a => a.day_of_week === dow);
    if (!avail) return [];
    const [sH, sM] = avail.start_time.slice(0, 5).split(":").map(Number);
    const [eH, eM] = avail.end_time.slice(0, 5).split(":").map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;
    const slotStep = srv.duration_minutes + profPausa;
    const bloquesParciales = blockedDatesProf.filter(b => b.date === fechaStr && b.start_time);
    const slots = [];
    for (let t = startMins; t + srv.duration_minutes <= endMins; t += slotStep) {
      const slotFin = t + srv.duration_minutes;
      const bloqueado = bloquesParciales.some(b => {
        const [bH, bM] = b.start_time.slice(0,5).split(":").map(Number);
        const [eH2, eM2] = b.end_time.slice(0,5).split(":").map(Number);
        const bStart = bH * 60 + bM, bEnd = eH2 * 60 + eM2;
        return t < bEnd && slotFin > bStart;
      });
      if (!bloqueado) slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
    }
    return slots;
  };

  const cambiarMes = (delta) => {
    const nuevo = new Date(anioMes, mesMes + delta, 1);
    if (delta < 0 && nuevo < new Date(hoy.getFullYear(), hoy.getMonth(), 1)) return;
    setMesActual(nuevo);
    setDia(null);
    setHora(null);
  };

  const fechaStr = dia
    ? `${anioMes}-${String(mesMes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    : "";

  const fechaLabel = dia
    ? new Date(anioMes, mesMes, dia).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    : "";

  const copiarAlias = () => {
    navigator.clipboard.writeText(aliasActivo || "");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const buscarClientePorMail = async (mail) => {
    if (!mail || !mail.includes("@")) return;
    const { data: rows } = await supabase.rpc("buscar_cliente_por_email", { p_email: mail });
    const data = rows?.[0];
    if (data) {
      setForm(f => ({ ...f, nombre: data.full_name || f.nombre, celular: data.phone || f.celular }));
      setClienteReconocido(true);
    } else {
      setClienteReconocido(false);
    }
  };

  const confirmarReserva = async () => {
    setGuardando(true);
    setError("");
    try {
      const { data: clienteId, error: errCliente } = await supabase.rpc("obtener_o_crear_cliente", {
        p_nombre: form.nombre, p_telefono: form.celular, p_email: form.mail
      });
      if (errCliente) throw errCliente;

      let endTime = null;
      if (!esACoorinar && hora) {
        const [h, m] = hora.split(":").map(Number);
        const endH = h + Math.floor((m + srv.duration_minutes) / 60);
        const endM = (m + srv.duration_minutes) % 60;
        endTime = `${String(endH).padStart(2,"0")}:${String(endM).padStart(2,"0")}`;
      }

      const turnoId = crypto.randomUUID();
      const { error: errTurno } = await supabase.from("appointments").insert({
        id: turnoId,
        professional_id: profData.id, client_id: clienteId, service_id: srv.id,
        date: esACoorinar ? null : fechaStr,
        start_time: esACoorinar ? null : hora,
        end_time: endTime,
        modality: modalidad || srv.modality, status: "pending", total_price: total
      });
      if (errTurno) throw errTurno;

      const pagoId = crypto.randomUUID();
      const { error: errPago } = await supabase.from("payments").insert({
        id: pagoId, appointment_id: turnoId, type: "seña", amount: sena, status: "pending"
      });
      if (errPago) throw errPago;

      if (comprobante) {
        const ext = comprobante.name.split(".").pop();
        const { data: uploadData } = await supabase.storage
          .from("comprobantes")
          .upload(`${turnoId}-sena.${ext}`, comprobante, { contentType: comprobante.type, upsert: true });
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("comprobantes").getPublicUrl(uploadData.path);
          await supabase.from("payments").update({ receipt_url: publicUrl }).eq("id", pagoId);
        }
      }

      setStep(4);
    } catch {
      setError("Hubo un error al confirmar el turno. Intentá de nuevo.");
    }
    setGuardando(false);
  };

  const horariosDia = generarHorarios(dia);

  if (loading) return (
    <div style={s.wrap}><div style={s.loadingText}>Cargando...</div></div>
  );

  if (reservasCerradas) return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", ...s.logo }}>
            <img src="/logo-flower.png" alt="" style={{ width: "18px", height: "18px" }} />
            AgendaLec
          </div>
          <div style={s.logoSub}>Gestión de turnos</div>
        </div>
      </div>
      <div style={{ ...s.card, alignItems: "center", textAlign: "center", gap: "14px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #EDE8FA, #F3EEFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", boxShadow: "0 4px 16px rgba(155,114,192,0.2)" }}>🗓</div>
        <div>
          <div style={{ fontSize: "17px", fontWeight: "500", color: "#2A1845" }}>Las reservas están cerradas</div>
          <div style={{ fontSize: "13px", color: "#B89FD0", lineHeight: "1.7", marginTop: "6px" }}>Por el momento no hay turnos disponibles para reservar.<br/>El equipo se comunicará a la brevedad para coordinar tu turno.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", ...s.logo }}>
            <img src="/logo-flower.png" alt="" style={{ width: "18px", height: "18px" }} />
            AgendaLec
          </div>
          <div style={s.logoSub}>Gestión de turnos</div>
        </div>
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
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>¿En qué moneda querés pagar?</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                {[...new Set(servicios.map(sv => sv.currency))].map(cur => {
                  const label = cur === "USD" ? "🇺🇸 Dólares" : cur === "EUR" ? "🇪🇺 Euros" : "🇦🇷 Pesos";
                  const activo = moneda === cur;
                  return (
                    <button key={cur} onClick={() => { setMoneda(cur); setServicio(null); }}
                      style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: activo ? "500" : "400", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", border: activo ? "2px solid #9B72C0" : "0.5px solid #E0D0F0", background: activo ? "#EDE8FA" : "#fff", color: activo ? "#5C3F99" : "#B89FD0" }}>
                      {label}
                    </button>
                  );
                })}
              </div>
              {moneda && (
                <>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>Elegí un servicio</div>
                  {servicios.filter(sv => sv.currency === moneda).map((sv, i) => (
                    <div key={sv.id} style={servicio === sv.id ? s.servicioCardSelected : s.servicioCard} onClick={() => setServicio(sv.id)}>
                      <div style={s.srvTop}>
                        <span style={s.srvNombre}>{sv.name}</span>
                        <span style={s.srvPrecio}>{moneda === "USD" ? "U$S " : moneda === "EUR" ? "€" : "$"}{sv.price.toLocaleString("es-AR")}</span>
                      </div>
                      <div style={s.srvDet}>
                        <span>{sv.duration_minutes} min</span>
                        {sv.modality === "virtual" && <span style={s.tagV}>📹 Solo virtual</span>}
                        {sv.modality === "presencial" && <span style={s.tagP}>📍 Solo presencial</span>}
                        {sv.modality === "ambas" && <span style={{ fontSize: "10px", color: "#9B72C0" }}>Virtual o presencial</span>}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          {prof && loadingServicios && <div style={s.loadingText}>Cargando servicios...</div>}
          {prof && !loadingServicios && servicios.length === 0 && <div style={s.loadingText}>Este profesional no tiene servicios disponibles.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button style={{ ...s.btnNext, background: prof && servicio ? "#9B72C0" : "#E0D0F0" }} disabled={!prof || !servicio} onClick={() => esACoorinar ? setStep(3) : setStep(2)}>
              Continuar
            </button>
            <a href="/" style={{ ...s.btnNext, background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", textDecoration: "none", display: "block", textAlign: "center", boxSizing: "border-box" }}>← Volver al inicio</a>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={s.card}>
          <div>
            <div style={s.title}>¿Cuándo querés tu turno?</div>
            <div style={s.sub}>{srv?.name} con {prof} · {srv?.duration_minutes} min</div>
          </div>

          {srv?.modality === "ambas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845" }}>¿Cómo preferís la sesión?</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={modalidad === "presencial" ? s.modBtnP : s.modBtn} onClick={() => { setModalidad("presencial"); setDia(null); setHora(null); }}>📍 Presencial</button>
                <button style={modalidad === "virtual" ? s.modBtnV : s.modBtn} onClick={() => { setModalidad("virtual"); setDia(null); setHora(null); }}>📹 Virtual</button>
              </div>
              {modalidad === "presencial" && profData?.address && (
                <div style={{ background: "#FDE8F0", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#A0407A" }}>
                  📍 <strong>Dirección:</strong> {profData.address}
                </div>
              )}
            </div>
          )}
          {srv?.modality === "presencial" && profData?.address && (
            <div style={{ background: "#FDE8F0", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#A0407A" }}>
              📍 <strong>Dirección:</strong> {profData.address}
            </div>
          )}

          {(srv?.modality !== "ambas" || modalidad) && (
            <>
              <div>
                <div style={s.calHeader}>
                  <span style={{ cursor: mesAnteriorPermitido ? "pointer" : "default", color: mesAnteriorPermitido ? "#9B72C0" : "#E0D0F0" }} onClick={() => cambiarMes(-1)}>‹</span>
                  <span>{nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</span>
                  <span style={{ cursor: "pointer", color: "#9B72C0" }} onClick={() => cambiarMes(1)}>›</span>
                </div>
                <div style={s.calGrid}>
                  {["L","M","X","J","V","S","D"].map(d => <div key={d} style={s.calDayName}>{d}</div>)}
                  {Array(offsetLunes).fill(null).map((_, i) => <div key={`e${i}`} style={s.calDayOff}></div>)}
                  {Array.from({length: diasEnMes}, (_, i) => i + 1).map(d => {
                    const seleccionable = esDiaSeleccionable(d);
                    const esHoy = anioMes === hoy.getFullYear() && mesMes === hoy.getMonth() && d === hoy.getDate();
                    return (
                      <div key={d} onClick={() => seleccionable && setDia(d)}
                        style={!seleccionable ? s.calDayOff : dia === d ? s.calDaySelected : esHoy ? s.calDayToday : s.calDay}>
                        {d}
                      </div>
                    );
                  })}
                </div>
              </div>
              {dia && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "#2A1845", marginBottom: "8px" }}>Horarios disponibles</div>
                  {horariosDia.length === 0 ? (
                    <div style={s.loadingText}>No hay horarios disponibles este día.</div>
                  ) : (
                    <div style={s.horaGrid}>
                      {horariosDia.map(h => {
                        const ocupado = horariosOcupados.includes(h);
                        return (
                          <button key={h}
                            style={ocupado ? s.horaBtnOff : hora === h ? s.horaBtnSelected : s.horaBtn}
                            disabled={ocupado}
                            onClick={() => !ocupado && setHora(h)}>{h}</button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...s.btnNext, background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0" }} onClick={() => setStep(1)}>← Volver</button>
            <button style={{ ...s.btnNext, background: dia && hora ? "#9B72C0" : "#E0D0F0" }}
              disabled={!dia || !hora}
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
            <div style={s.sub}>{clienteReconocido ? "¡Ya te conocemos! Verificá que todo esté bien." : "Ingresá tu mail para empezar"}</div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Mail</label>
            <input type="email" value={form.mail} onChange={e => { setForm({...form, mail: e.target.value}); setClienteReconocido(false); }} onBlur={e => buscarClientePorMail(e.target.value)} placeholder="tu@mail.com" style={s.input} />
          </div>
          {clienteReconocido && (
            <div style={{ background: "#EAF3DE", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#3B6D11" }}>
              ✓ Encontramos tus datos. Podés editarlos si cambiaron.
            </div>
          )}
          <div style={s.field}><label style={s.label}>Nombre y apellido</label><input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Laura Gómez" style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Celular (WhatsApp)</label><input type="tel" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} placeholder="+54 9 11 ..." style={s.input} /></div>

          <div style={s.resumenBox}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2A1845", marginBottom: "2px" }}>Resumen</div>
            <div style={s.resRow}><span style={s.resLabel}>Servicio</span><span style={s.resValor}>{srv?.name} · {srv?.duration_minutes} min</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Profesional</span><span style={s.resValor}>{prof}</span></div>
            {profData?.phone && <div style={s.resRow}><span style={s.resLabel}>Teléfono</span><span style={s.resValor}>{profData.phone}</span></div>}
            {esACoorinar ? (
              <div style={{ background: "#EDE8FA", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#5C3F99" }}>
                📅 El equipo de {prof} se comunicará a la brevedad para coordinar el horario.
              </div>
            ) : (
              <>
                <div style={s.resRow}><span style={s.resLabel}>Fecha</span><span style={s.resValor}>{fechaLabel} · {hora}</span></div>
                <div style={s.resRow}><span style={s.resLabel}>Modalidad</span><span style={s.resValor}>{modalidad === "virtual" ? "📹 Virtual" : "📍 Presencial"}</span></div>
                {modalidad === "presencial" && profData?.address && <div style={s.resRow}><span style={s.resLabel}>Dirección</span><span style={s.resValor}>{profData.address}</span></div>}
              </>
            )}
            <div style={{ borderTop: "0.5px solid #E8DEFA", paddingTop: "8px", marginTop: "2px" }}>
              <div style={s.resRow}><span style={s.resLabel}>Precio total</span><span style={s.resValor}>{sym}{total.toLocaleString("es-AR")}</span></div>
              <div style={{ ...s.resRow, marginTop: "4px" }}><span style={s.resLabel}>Seña ahora (50%)</span><span style={s.resSeña}>{sym}{sena.toLocaleString("es-AR")}</span></div>
              <div style={{ ...s.resRow, marginTop: "4px" }}><span style={s.resLabel}>Saldo 12hs antes</span><span style={s.resValor}>{sym}{sena.toLocaleString("es-AR")}</span></div>
            </div>
          </div>

          {aliasActivo && (
            <div style={s.aliasBox}>
              <div style={s.aliasTitulo}>Transferí la seña para confirmar tu turno{esMonedaExtranjera ? " (en dólares)" : ""}</div>
              <div style={s.aliasValor}>{aliasActivo}</div>
              {cbuActivo && <div style={{ fontSize: "11px", color: "#9B72C0" }}>CBU: {cbuActivo}</div>}
              <div style={s.aliasCopy} onClick={copiarAlias}>{copiado ? "✓ Copiado!" : "Copiar alias"}</div>
              <div style={{ fontSize: "11px", color: "#B89FD0", marginTop: "4px" }}>Monto a transferir: <strong style={{ color: "#5C3F99" }}>{sym}{sena.toLocaleString("es-AR")}</strong></div>
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Comprobante de transferencia <span style={{ color: "#A32D2D" }}>*</span></label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: `0.5px solid ${comprobante ? "#9B72C0" : "#E0D0F0"}`, borderRadius: "10px", background: comprobante ? "#F3EEFA" : "#fff", cursor: "pointer" }}>
              <span style={{ fontSize: "18px" }}>{comprobante ? "✅" : "📎"}</span>
              <span style={{ fontSize: "13px", color: comprobante ? "#5C3F99" : "#B89FD0", flex: 1 }}>
                {comprobante ? comprobante.name : "Adjuntar captura o PDF"}
              </span>
              {comprobante && <span style={{ fontSize: "11px", color: "#9B72C0", cursor: "pointer" }} onClick={e => { e.preventDefault(); setComprobante(null); }}>✕ quitar</span>}
              <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => setComprobante(e.target.files[0] || null)} />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <input type="checkbox" id="tyc" checked={aceptaTyC} onChange={e => setAceptaTyC(e.target.checked)} style={{ accentColor: "#9B72C0", width: "16px", height: "16px", cursor: "pointer" }} />
            <label htmlFor="tyc" style={{ fontSize: "12px", color: "#9B72C0", cursor: "pointer" }}>Acepto los <a href="/terminos" target="_blank" style={{ color: "#7B5EA7", fontWeight: "500" }}>Términos y Condiciones</a></label>
          </div>
          {error && <div style={{ fontSize: "12px", color: "#A32D2D" }}>{error}</div>}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...s.btnNext, background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0" }} onClick={() => setStep(2)}>← Volver</button>
            <button style={{ ...s.btnConfirmar, opacity: form.nombre && form.celular && form.mail && aceptaTyC && comprobante ? 1 : 0.5 }}
              disabled={!form.nombre || !form.celular || !form.mail || guardando || !aceptaTyC || !comprobante}
              onClick={confirmarReserva}>
              {guardando ? "Confirmando..." : "✓ Confirmar turno"}
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "#B89FD0", textAlign: "center" }}>
            Tu turno quedará pendiente hasta que se confirme la transferencia
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ ...s.card, alignItems: "center", textAlign: "center" }}>
          <div style={s.pendienteCircle}>✓</div>
          <div>
            <div style={s.title}>¡Reserva recibida!</div>
            <div style={s.sub}>Tu turno quedará confirmado una vez que se verifique la transferencia</div>
          </div>

          {aliasActivo && (
            <div style={s.aliasBox}>
              <div style={s.aliasTitulo}>Si aún no transferiste, hacelo ahora{esMonedaExtranjera ? " (en dólares)" : ""}</div>
              <div style={s.aliasValor}>{aliasActivo}</div>
              {cbuActivo && <div style={{ fontSize: "11px", color: "#9B72C0" }}>CBU: {cbuActivo}</div>}
              <div style={s.aliasCopy} onClick={copiarAlias}>{copiado ? "✓ Copiado!" : "Copiar alias"}</div>
              <div style={{ fontSize: "11px", color: "#B89FD0", marginTop: "4px" }}>Seña: <strong style={{ color: "#5C3F99" }}>{sym}{sena.toLocaleString("es-AR")}</strong></div>
            </div>
          )}

          <div style={{ ...s.resumenBox, width: "100%", textAlign: "left" }}>
            <div style={s.resRow}><span style={s.resLabel}>Profesional</span><span style={s.resValor}>{prof}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Servicio</span><span style={s.resValor}>{srv?.name} · {modalidad}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Fecha</span><span style={s.resValor}>{fechaLabel} · {hora}</span></div>
            <div style={s.resRow}><span style={s.resLabel}>Saldo 12hs antes</span><span style={s.resValor}>${sena.toLocaleString("es-AR")}</span></div>
          </div>
          <div style={s.avisoBox}>🔔 Recibirás una confirmación por WhatsApp cuando se verifique el pago.</div>
          <button style={s.btnNext} onClick={() => {
            setStep(1); setProf(null); setServicio(null); setMoneda(null); setDia(null); setHora(null);
            setModalidad(null); setForm({ nombre: "", celular: "", mail: "" }); setClienteReconocido(false);
            setMesActual(inicioMes()); setComprobante(null);
          }}>
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}
