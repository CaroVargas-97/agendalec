import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { cuando } from "../../utils/fecha";

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  metricSub: { fontSize: "11px", color: "#B89FD0", marginTop: "4px" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  tabs: { display: "flex", gap: "6px", marginBottom: "1.25rem" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cobroRow: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", borderRadius: "10px", marginBottom: "6px", flexWrap: "wrap" },
  cobroNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845" },
  cobroDetalle: { fontSize: "12px", color: "#9B72C0", marginTop: "2px" },
  cobroMonto: { fontSize: "14px", fontWeight: "500", color: "#5C3F99" },
  tagPending: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagSaldo: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagConfirmed: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  tagCancelled: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FCEBEB", color: "#A32D2D" },
  btnConfirmar: { padding: "6px 12px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnPagoTotal: { padding: "6px 12px", background: "#3B6D11", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnSaldo: { padding: "6px 12px", background: "#5C3F99", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
};

const metrics = [
  { key: "cobradoHoy",      label: "Cobrado hoy",       color: "#63B522", prefix: "$", sub: null },
  { key: "saldosPendientes",label: "Saldos pendientes",  color: "#F59E0B", prefix: "$", subKey: "saldosCount" },
  { key: "estesMes",        label: "Este mes",           color: "#9B72C0", prefix: "$", sub: "cobrado por completo" },
  { key: "cancelaciones",   label: "Cancelaciones",      color: "#E24B4A", prefix: "",  sub: "en historial" },
];

export default function Cobros() {
  const [tab, setTab] = useState("pendientes");
  const [pendientes, setPendientes] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [stats, setStats] = useState({ cobradoHoy: 0, saldosPendientes: 0, estesMes: 0, cancelaciones: 0 });
  const [loading, setLoading] = useState(true);
  const [subiendoSaldo, setSubiendoSaldo] = useState(null);
  const [procesando, setProcesando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,"0")}-${String(ahora.getDate()).padStart(2,"0")}`;
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split("T")[0];

    // Las limpiezas se gestionan en su propia sección, así que no se
    // duplican como filas acá. Su plata igual suma en las métricas.
    const { data: svsLimpieza } = await supabase
      .from("services")
      .select("id")
      .ilike("name", "%limpieza%");
    const idsLimpieza = new Set((svsLimpieza || []).map(sv => sv.id));
    const noEsLimpieza = (serviceId) => !idsLimpieza.has(serviceId);

    const { data: turnos } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, modality, service_id, clients(full_name), services(name), profiles(full_name), payments(id, receipt_url, type, status)")
      .in("status", ["pending", "partial"])
      .order("date", { ascending: true });
    const conSenaPendiente = (turnos || [])
      .filter(t => noEsLimpieza(t.service_id))
      .filter(t => t.payments?.some(p => p.type === "seña" && p.status === "pending"));
    setPendientes(conSenaPendiente);

    const { data: pagosSaldo } = await supabase
      .from("payments")
      .select("id, amount, receipt_url, appointment_id, appointments(id, date, start_time, total_price, service_id, clients(full_name), services(name), profiles(full_name))")
      .eq("type", "saldo")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setSaldos((pagosSaldo || []).filter(p => noEsLimpieza(p.appointments?.service_id)));

    const { data: confirmados } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, service_id, clients(full_name), services(name), payments(receipt_url, type)")
      .in("status", ["confirmed", "cancelled"])
      .order("date", { ascending: false })
      .limit(50);
    setHistorial((confirmados || []).filter(t => noEsLimpieza(t.service_id)));

    // Los cursos y eventos grupales también son ingresos: se suman a las
    // métricas para que la facturación no quede partida entre pantallas.
    const { data: eventos } = await supabase
      .from("group_events")
      .select("id, name, date, price, currency, group_attendees(status, custom_price)");
    const asistentesGrupales = (eventos || []).flatMap(ev =>
      (ev.group_attendees || []).map(a => ({ status: a.status, date: ev.date, monto: parseFloat(a.custom_price ?? ev.price ?? 0) }))
    );
    const grupalCobradoHoy = asistentesGrupales.filter(a => a.status === "paid" && a.date === hoy).reduce((s, a) => s + a.monto, 0);
    const grupalEsteMes = asistentesGrupales.filter(a => a.status === "paid" && a.date >= inicioMes).reduce((s, a) => s + a.monto, 0);
    const grupalPendiente = asistentesGrupales.filter(a => a.status === "pending").reduce((s, a) => s + a.monto, 0);

    const cobradoHoy = (confirmados || []).filter(t => t.date === hoy && t.status === "confirmed").reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0) + grupalCobradoHoy;
    const saldosPendientes = (pagosSaldo || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) + grupalPendiente;
    const estesMes = (confirmados || []).filter(t => t.date >= inicioMes && t.status === "confirmed").reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0) + grupalEsteMes;
    const cancelaciones = (confirmados || []).filter(t => t.status === "cancelled").length;

    const grupalPendientesCount = asistentesGrupales.filter(a => a.status === "pending").length;
    // El contador acompaña al monto: cuenta todos los saldos pendientes
    // (incluidas limpiezas, que no se listan acá) más los de grupales.
    const saldosCount = (pagosSaldo || []).length + grupalPendientesCount;
    setStats({ cobradoHoy, saldosPendientes, estesMes, cancelaciones, saldosCount });
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const confirmarTurno = async (id, totalPrice) => {
    if (procesando) return;
    setProcesando(id);
    const ahora = new Date().toISOString();
    const { data: pagos, error: errLeer } = await supabase
      .from("payments").select("id, type, amount").eq("appointment_id", id);
    if (errLeer) { alert("No se pudo leer el pago: " + errLeer.message); setProcesando(null); return; }

    const sena = pagos?.find(p => p.type === "seña");
    if (sena) {
      const { error } = await supabase.from("payments").update({ status: "paid", paid_at: ahora }).eq("id", sena.id);
      if (error) { alert("No se pudo confirmar la seña: " + error.message); setProcesando(null); return; }
    }

    // El saldo es lo que queda del total menos la seña real (no la mitad
    // exacta, que se desviaba con precios especiales). Si ya existe uno no
    // se crea otro: al tocar dos veces se duplicaba y "Saldos pendientes"
    // mostraba plata que no existía.
    if (!pagos?.some(p => p.type === "saldo")) {
      const saldo = Math.round(parseFloat(totalPrice || 0) - parseFloat(sena?.amount || 0));
      if (saldo > 0) {
        const { error } = await supabase.from("payments").insert({ appointment_id: id, type: "saldo", amount: saldo, status: "pending" });
        if (error) { alert("No se pudo registrar el saldo: " + error.message); setProcesando(null); return; }
      }
    }

    const { error: errEstado } = await supabase.from("appointments").update({ status: "partial" }).eq("id", id);
    if (errEstado) { alert("No se pudo actualizar el turno: " + errEstado.message); setProcesando(null); return; }

    fetch("/api/confirmar-turno", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId: id }) });
    setProcesando(null);
    cargar();
  };

  const pagarTodo = async (id, totalPrice) => {
    if (procesando) return;
    setProcesando(id);
    const ahora = new Date().toISOString();
    const { data: pagos, error: errLeer } = await supabase
      .from("payments").select("id, type, amount").eq("appointment_id", id);
    if (errLeer) { alert("No se pudo leer el pago: " + errLeer.message); setProcesando(null); return; }

    const sena = pagos?.find(p => p.type === "seña");
    if (sena) {
      const { error } = await supabase.from("payments").update({ status: "paid", paid_at: ahora }).eq("id", sena.id);
      if (error) { alert("No se pudo confirmar la seña: " + error.message); setProcesando(null); return; }
    }

    // Si el saldo ya existe (porque antes se confirmó solo la seña) se marca
    // pagado; crear otro dejaba uno pendiente fantasma sumando de más.
    const saldoExistente = pagos?.find(p => p.type === "saldo");
    if (saldoExistente) {
      const { error } = await supabase.from("payments").update({ status: "paid", paid_at: ahora }).eq("id", saldoExistente.id);
      if (error) { alert("No se pudo confirmar el saldo: " + error.message); setProcesando(null); return; }
    } else {
      const saldo = Math.round(parseFloat(totalPrice || 0) - parseFloat(sena?.amount || 0));
      if (saldo > 0) {
        const { error } = await supabase.from("payments").insert({ appointment_id: id, type: "saldo", amount: saldo, status: "paid", paid_at: ahora });
        if (error) { alert("No se pudo registrar el saldo: " + error.message); setProcesando(null); return; }
      }
    }

    const { error: errEstado } = await supabase.from("appointments").update({ status: "confirmed" }).eq("id", id);
    if (errEstado) { alert("No se pudo actualizar el turno: " + errEstado.message); setProcesando(null); return; }

    fetch("/api/confirmar-turno", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId: id }) });
    setProcesando(null);
    cargar();
  };

  const subirComprobante = async (pagoId, appointmentId, tipo, file) => {
    if (!file) return;
    setSubiendoSaldo(pagoId);
    const ext = file.name.split(".").pop();
    const { data: uploadData, error: errUpload } = await supabase.storage
      .from("comprobantes")
      .upload(`${appointmentId}-${tipo}.${ext}`, file, { contentType: file.type, upsert: true });
    if (errUpload) {
      alert("No se pudo subir el comprobante: " + errUpload.message);
    } else if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from("comprobantes").getPublicUrl(uploadData.path);
      const { error: errUpdate } = await supabase.from("payments").update({ receipt_url: publicUrl }).eq("id", pagoId);
      if (errUpdate) alert("No se pudo guardar el comprobante: " + errUpdate.message);
    }
    setSubiendoSaldo(null);
    cargar();
  };

  const confirmarSaldo = async (pagoId, appointmentId) => {
    setSubiendoSaldo(pagoId);
    const { error: e1 } = await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", pagoId);
    if (e1) { alert("No se pudo confirmar el saldo: " + e1.message); setSubiendoSaldo(null); return; }
    const { error: e2 } = await supabase.from("appointments").update({ status: "confirmed" }).eq("id", appointmentId);
    if (e2) alert("El saldo se cobró pero no se pudo cerrar el turno: " + e2.message);
    setSubiendoSaldo(null);
    cargar();
  };

  const cancelarTurno = async (id) => {
    if (!window.confirm("¿Cancelar este turno? Se marcarán sus pagos como cancelados.")) return;
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    if (error) { alert("No se pudo cancelar: " + error.message); return; }
    await supabase.from("payments").update({ status: "cancelled" }).eq("appointment_id", id);
    cargar();
  };

  const metricValues = {
    cobradoHoy: `$${stats.cobradoHoy.toLocaleString("es-AR")}`,
    saldosPendientes: `$${stats.saldosPendientes.toLocaleString("es-AR")}`,
    estesMes: `$${stats.estesMes.toLocaleString("es-AR")}`,
    cancelaciones: stats.cancelaciones,
  };

  return (
    <div style={s.main}>
      <div style={s.topbar}>
        <div>
          <div style={s.title}>Cobros</div>
          <div style={s.titleSub}>{new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</div>
        </div>
      </div>

      <div style={s.metrics}>
        {metrics.map(m => (
          <div key={m.key} style={s.metricCard}>
            <div style={{ fontSize: "11px", color: m.color, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</div>
            <div style={{ fontSize: "32px", fontWeight: "500", color: "#2A1845", lineHeight: 1 }}>{metricValues[m.key]}</div>
            <div style={s.metricSub}>{m.key === "saldosPendientes" ? `${stats.saldosCount || 0} pagos a cobrar` : m.sub || " "}</div>
            <div style={{ width: "28px", height: "3px", background: m.color, borderRadius: "2px", marginTop: "10px" }}></div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.tabs}>
          <button style={tab === "pendientes" ? s.tabActive : s.tab} onClick={() => setTab("pendientes")}>
            Señas a confirmar {pendientes.length > 0 && <span style={{ marginLeft: "4px", background: "#9B72C0", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "11px" }}>{pendientes.length}</span>}
          </button>
          <button style={tab === "saldos" ? s.tabActive : s.tab} onClick={() => setTab("saldos")}>
            Saldos pendientes {saldos.length > 0 && <span style={{ marginLeft: "4px", background: "#F59E0B", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "11px" }}>{saldos.length}</span>}
          </button>
          <button style={tab === "historial" ? s.tabActive : s.tab} onClick={() => setTab("historial")}>Historial</button>
        </div>

        {loading ? <div style={s.emptyText}>Cargando...</div> : (
          <>
            {tab === "pendientes" && (
              pendientes.length === 0 ? (
                <div style={s.emptyText}>No hay señas pendientes de confirmación</div>
              ) : pendientes.map((t, i) => (
                <div key={i} style={{ ...s.cobroRow, background: "#FFFBEB" }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={s.cobroNombre}>{t.clients?.full_name}</div>
                    <div style={s.cobroDetalle}>{t.services?.name} · {cuando(t.date, t.start_time)}</div>
                    <div style={{ ...s.cobroDetalle, color: "#D97706", marginTop: "2px", fontWeight: "500" }}>Seña: ${(parseFloat(t.total_price || 0) / 2).toLocaleString("es-AR")}</div>
                    {t.payments?.find(p => p.type === "seña")?.receipt_url && (
                      <a href={t.payments.find(p => p.type === "seña").receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", background: t.payments?.find(p => p.type === "seña")?.receipt_url ? "#EAF3DE" : "#fff", border: "0.5px solid #E0D0F0", borderRadius: "6px", fontSize: "11px", cursor: "pointer", color: t.payments?.find(p => p.type === "seña")?.receipt_url ? "#3B6D11" : "#9B72C0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {subiendoSaldo === t.payments?.find(p => p.type === "seña")?.id ? "Subiendo..." : t.payments?.find(p => p.type === "seña")?.receipt_url ? "✅ Adjunto" : "📎 Adjuntar"}
                      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} disabled={!t.payments?.find(p => p.type === "seña")?.id} onChange={e => {
                        const pagoId = t.payments?.find(p => p.type === "seña")?.id;
                        if (!pagoId) { alert("Este turno no tiene un pago de seña asociado. Avisale a Caro para revisarlo."); return; }
                        subirComprobante(pagoId, t.id, "sena", e.target.files[0]);
                      }} />
                    </label>
                    <button style={{ ...s.btnConfirmar, opacity: procesando === t.id ? 0.5 : 1 }} disabled={procesando === t.id} onClick={() => confirmarTurno(t.id, t.total_price)}>
                      {procesando === t.id ? "..." : "✓ Confirmar seña"}
                    </button>
                    <button style={{ ...s.btnPagoTotal, opacity: procesando === t.id ? 0.5 : 1 }} disabled={procesando === t.id} onClick={() => pagarTodo(t.id, t.total_price)}>
                      {procesando === t.id ? "..." : "💰 Pagó todo"}
                    </button>
                    <button style={{ padding: "6px 10px", background: "#FCEBEB", color: "#A32D2D", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => cancelarTurno(t.id)}>✗</button>
                  </div>
                </div>
              ))
            )}

            {tab === "saldos" && (
              saldos.length === 0 ? (
                <div style={s.emptyText}>No hay saldos pendientes</div>
              ) : saldos.map((p, i) => (
                <div key={i} style={{ ...s.cobroRow, background: "#F3E8FF" }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={s.cobroNombre}>{p.appointments?.clients?.full_name}</div>
                    <div style={s.cobroDetalle}>{p.appointments?.services?.name} · {cuando(p.appointments?.date, p.appointments?.start_time)}</div>
                    {p.receipt_url && (
                      <a href={p.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={s.cobroMonto}>${parseFloat(p.amount || 0).toLocaleString("es-AR")}</div>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", background: p.receipt_url ? "#EAF3DE" : "#fff", border: "0.5px solid #E0D0F0", borderRadius: "6px", fontSize: "11px", cursor: "pointer", color: p.receipt_url ? "#3B6D11" : "#9B72C0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {subiendoSaldo === p.id ? "Subiendo..." : p.receipt_url ? "✅ Adjunto" : "📎 Adjuntar"}
                      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => subirComprobante(p.id, p.appointment_id, "saldo", e.target.files[0])} />
                    </label>
                    <button style={s.btnSaldo} disabled={subiendoSaldo === p.id} onClick={() => confirmarSaldo(p.id, p.appointment_id)}>{subiendoSaldo === p.id ? "..." : "✓ Cobrado"}</button>
                    <button style={{ padding: "6px 10px", background: "#FCEBEB", color: "#A32D2D", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => cancelarTurno(p.appointment_id)}>✗</button>
                  </div>
                </div>
              ))
            )}

            {tab === "historial" && (
              historial.length === 0 ? (
                <div style={s.emptyText}>No hay historial</div>
              ) : historial.map((t, i) => (
                <div key={i} style={{ ...s.cobroRow, background: t.status === "confirmed" ? "#F8F4FC" : "#FFF5F5" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cobroNombre}>{t.clients?.full_name}</div>
                    <div style={s.cobroDetalle}>{t.services?.name} · {cuando(t.date, t.start_time)}</div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                      {t.payments?.filter(p => p.receipt_url).map((p, pi) => (
                        <a key={pi} href={p.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          📎 {p.type === "seña" ? "Seña" : "Saldo"}
                        </a>
                      ))}
                    </div>
                  </div>
                  <span style={t.status === "confirmed" ? s.tagConfirmed : s.tagCancelled}>
                    {t.status === "confirmed" ? "✓ Confirmado" : "Cancelado"}
                  </span>
                  <div style={{ ...s.cobroMonto, color: t.status === "confirmed" ? "#3B6D11" : "#A32D2D" }}>
                    ${parseFloat(t.total_price || 0).toLocaleString("es-AR")}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
