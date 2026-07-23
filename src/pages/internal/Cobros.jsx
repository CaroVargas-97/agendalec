import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

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
  { key: "estesMes",        label: "Este mes",           color: "#9B72C0", prefix: "$", sub: null },
  { key: "cancelaciones",   label: "Cancelaciones",      color: "#E24B4A", prefix: "",  sub: "en historial" },
];

export default function Cobros() {
  const [tab, setTab] = useState("pendientes");
  const [pendientes, setPendientes] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [stats, setStats] = useState({ cobradoHoy: 0, saldosPendientes: 0, estesMes: 0, cancelaciones: 0 });
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,"0")}-${String(ahora.getDate()).padStart(2,"0")}`;
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split("T")[0];

    const { data: turnos } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, modality, clients(full_name), services(name), profiles(full_name), payments(receipt_url, type, status)")
      .in("status", ["pending", "partial"])
      .order("date", { ascending: true });
    const conSenaPendiente = (turnos || []).filter(t => t.payments?.some(p => p.type === "seña" && p.status === "pending"));
    setPendientes(conSenaPendiente);

    const { data: pagosSaldo } = await supabase
      .from("payments")
      .select("id, amount, receipt_url, appointment_id, appointments(id, date, start_time, total_price, clients(full_name), services(name), profiles(full_name))")
      .eq("type", "saldo")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setSaldos(pagosSaldo || []);

    const { data: confirmados } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, clients(full_name), services(name)")
      .in("status", ["confirmed", "cancelled"])
      .order("date", { ascending: false })
      .limit(50);
    setHistorial(confirmados || []);

    const cobradoHoy = (confirmados || []).filter(t => t.date === hoy && t.status === "confirmed").reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);
    const saldosPendientes = (pagosSaldo || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const estesMes = (confirmados || []).filter(t => t.date >= inicioMes && t.status === "confirmed").reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);
    const cancelaciones = (confirmados || []).filter(t => t.status === "cancelled").length;

    setStats({ cobradoHoy, saldosPendientes, estesMes, cancelaciones });
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const confirmarTurno = async (id, totalPrice) => {
    await supabase.from("appointments").update({ status: "partial" }).eq("id", id);
    await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("appointment_id", id).eq("type", "seña");
    const saldo = Math.round(parseFloat(totalPrice) / 2);
    await supabase.from("payments").insert({ appointment_id: id, type: "saldo", amount: saldo, status: "pending" });
    fetch("/api/confirmar-turno", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId: id }) });
    cargar();
  };

  const pagarTodo = async (id, totalPrice) => {
    const { data: senaPago } = await supabase.from("payments").select("id, amount").eq("appointment_id", id).eq("type", "seña").maybeSingle();
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", id);
    if (senaPago) await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", senaPago.id);
    const saldo = Math.round(parseFloat(totalPrice || 0) - parseFloat(senaPago?.amount || 0));
    if (saldo > 0) await supabase.from("payments").insert({ appointment_id: id, type: "saldo", amount: saldo, status: "paid", paid_at: new Date().toISOString() });
    fetch("/api/confirmar-turno", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId: id }) });
    cargar();
  };

  const confirmarSaldo = async (pagoId, appointmentId) => {
    await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", pagoId);
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", appointmentId);
    cargar();
  };

  const cancelarTurno = async (id) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
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
            <div style={s.metricSub}>{m.key === "saldosPendientes" ? `${saldos.length} saldos a cobrar` : m.sub || " "}</div>
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
                    <div style={s.cobroDetalle}>{t.services?.name} · {t.date} {t.start_time?.slice(0,5)}</div>
                    <div style={{ ...s.cobroDetalle, color: "#D97706", marginTop: "2px", fontWeight: "500" }}>Seña: ${(parseFloat(t.total_price || 0) / 2).toLocaleString("es-AR")}</div>
                    {t.payments?.find(p => p.type === "seña")?.receipt_url && (
                      <a href={t.payments.find(p => p.type === "seña").receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <button style={s.btnConfirmar} onClick={() => confirmarTurno(t.id, t.total_price)}>✓ Confirmar seña</button>
                    <button style={s.btnPagoTotal} onClick={() => pagarTodo(t.id, t.total_price)}>💰 Pagó todo</button>
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
                    <div style={s.cobroDetalle}>{p.appointments?.services?.name} · {p.appointments?.date} {p.appointments?.start_time?.slice(0,5)}</div>
                    {p.receipt_url && (
                      <a href={p.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={s.cobroMonto}>${parseFloat(p.amount || 0).toLocaleString("es-AR")}</div>
                    <button style={s.btnSaldo} onClick={() => confirmarSaldo(p.id, p.appointment_id)}>✓ Cobrado</button>
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
                    <div style={s.cobroDetalle}>{t.services?.name} · {t.date} {t.start_time?.slice(0,5)}</div>
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
