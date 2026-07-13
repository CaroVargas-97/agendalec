import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  title: { fontSize: "15px", fontWeight: "500", color: "#2A1845" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  metricCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem" },
  metricLabel: { fontSize: "12px", color: "#B89FD0", marginBottom: "6px" },
  metricValue: { fontSize: "22px", fontWeight: "500", color: "#2A1845" },
  metricSub: { fontSize: "12px", color: "#C4A8D8", marginTop: "4px" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem" },
  tabs: { display: "flex", gap: "6px", marginBottom: "1rem" },
  tab: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cobroRow: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 0", borderBottom: "0.5px solid #F0E8F8", flexWrap: "wrap" },
  cobroNombre: { fontSize: "13px", fontWeight: "500", color: "#2A1845", flex: 1 },
  cobroDetalle: { fontSize: "12px", color: "#9B72C0" },
  cobroMonto: { fontSize: "13px", fontWeight: "500", color: "#5C3F99" },
  tagPending: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagSaldo: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagConfirmed: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  tagCancelled: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FCEBEB", color: "#A32D2D" },
  btnConfirmar: { padding: "5px 12px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnPagoTotal: { padding: "5px 12px", background: "#3B6D11", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnSaldo: { padding: "5px 12px", background: "#5C3F99", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
};

export default function Cobros() {
  const [tab, setTab] = useState("pendientes");
  const [pendientes, setPendientes] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [stats, setStats] = useState({ cobradoHoy: 0, saldosPendientes: 0, estesMes: 0, cancelaciones: 0 });
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const hoy = new Date().toISOString().split("T")[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    // Turnos con seña pendiente de confirmar (filtramos por pago, no por status de appointment)
    const { data: turnos } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, modality, clients(full_name), services(name), profiles(full_name), payments(receipt_url, type, status)")
      .in("status", ["pending", "partial"])
      .order("date", { ascending: true });
    const conSenaPendiente = (turnos || []).filter(t =>
      t.payments?.some(p => p.type === "seña" && p.status === "pending")
    );
    setPendientes(conSenaPendiente);

    // Pagos de saldo pendientes de turnos confirmados
    const { data: pagosSaldo } = await supabase
      .from("payments")
      .select("id, amount, receipt_url, appointment_id, appointments(id, date, start_time, total_price, clients(full_name), services(name), profiles(full_name))")
      .eq("type", "saldo")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setSaldos(pagosSaldo || []);

    // Historial
    const { data: confirmados } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, clients(full_name), services(name)")
      .in("status", ["confirmed", "cancelled"])
      .order("date", { ascending: false })
      .limit(50);
    setHistorial(confirmados || []);

    // Stats
    const cobradoHoy = (confirmados || [])
      .filter(t => t.date === hoy && t.status === "confirmed")
      .reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);
    const saldosPendientes = (pagosSaldo || [])
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const estesMes = (confirmados || [])
      .filter(t => t.date >= inicioMes && t.status === "confirmed")
      .reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);
    const cancelaciones = (confirmados || []).filter(t => t.status === "cancelled").length;

    setStats({ cobradoHoy, saldosPendientes, estesMes, cancelaciones });
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const confirmarTurno = async (id, totalPrice) => {
    await supabase.from("appointments").update({ status: "partial" }).eq("id", id);
    await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("appointment_id", id).eq("type", "seña");
    const saldo = Math.round(parseFloat(totalPrice) / 2);
    await supabase.from("payments").insert({ appointment_id: id, type: "saldo", amount: saldo, status: "pending" });
    cargar();
  };

  const pagarTodo = async (id) => {
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", id);
    await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("appointment_id", id).eq("type", "seña");
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

  return (
    <div style={s.main}>
      <div style={s.title}>Cobros</div>

      <div style={s.metrics}>
        <div style={s.metricCard}>
          <div style={s.metricLabel}>Cobrado hoy</div>
          <div style={s.metricValue}>${stats.cobradoHoy.toLocaleString("es-AR")}</div>
        </div>
        <div style={s.metricCard}>
          <div style={s.metricLabel}>Saldos pendientes</div>
          <div style={s.metricValue}>${stats.saldosPendientes.toLocaleString("es-AR")}</div>
          <div style={s.metricSub}>{saldos.length} saldos a cobrar</div>
        </div>
        <div style={s.metricCard}>
          <div style={s.metricLabel}>Este mes</div>
          <div style={s.metricValue}>${stats.estesMes.toLocaleString("es-AR")}</div>
        </div>
        <div style={s.metricCard}>
          <div style={s.metricLabel}>Cancelaciones</div>
          <div style={s.metricValue}>{stats.cancelaciones}</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.tabs}>
          <button style={tab === "pendientes" ? s.tabActive : s.tab} onClick={() => setTab("pendientes")}>
            Señas a confirmar {pendientes.length > 0 && `(${pendientes.length})`}
          </button>
          <button style={tab === "saldos" ? s.tabActive : s.tab} onClick={() => setTab("saldos")}>
            Saldos pendientes {saldos.length > 0 && `(${saldos.length})`}
          </button>
          <button style={tab === "historial" ? s.tabActive : s.tab} onClick={() => setTab("historial")}>Historial</button>
        </div>

        {loading ? <div style={s.emptyText}>Cargando...</div> : (
          <>
            {tab === "pendientes" && (
              pendientes.length === 0 ? (
                <div style={s.emptyText}>No hay señas pendientes de confirmación</div>
              ) : pendientes.map((t, i) => (
                <div key={i} style={{ ...s.cobroRow, borderBottom: i === pendientes.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cobroNombre}>{t.clients?.full_name}</div>
                    <div style={s.cobroDetalle}>{t.services?.name} · {t.date} {t.start_time?.slice(0,5)} · {t.profiles?.full_name}</div>
                    <div style={{ ...s.cobroDetalle, marginTop: "2px" }}>Seña: ${(parseFloat(t.total_price || 0) / 2).toLocaleString("es-AR")}</div>
                    {t.payments?.find(p => p.type === "seña")?.receipt_url && (
                      <a href={t.payments.find(p => p.type === "seña").receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                  <span style={s.tagPending}>Sin confirmar</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button style={s.btnConfirmar} onClick={() => confirmarTurno(t.id, t.total_price)}>✓ Confirmar seña</button>
                    <button style={s.btnPagoTotal} onClick={() => pagarTodo(t.id)}>💰 Pagó todo</button>
                    <button style={{ ...s.btnConfirmar, background: "#FCEBEB", color: "#A32D2D" }} onClick={() => cancelarTurno(t.id)}>✗</button>
                  </div>
                </div>
              ))
            )}

            {tab === "saldos" && (
              saldos.length === 0 ? (
                <div style={s.emptyText}>No hay saldos pendientes</div>
              ) : saldos.map((p, i) => (
                <div key={i} style={{ ...s.cobroRow, borderBottom: i === saldos.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cobroNombre}>{p.appointments?.clients?.full_name}</div>
                    <div style={s.cobroDetalle}>{p.appointments?.services?.name} · {p.appointments?.date} {p.appointments?.start_time?.slice(0,5)}</div>
                    {p.receipt_url && (
                      <a href={p.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        📎 Ver comprobante
                      </a>
                    )}
                  </div>
                  <span style={s.tagSaldo}>Saldo pendiente</span>
                  <div style={s.cobroMonto}>${parseFloat(p.amount || 0).toLocaleString("es-AR")}</div>
                  <button style={s.btnSaldo} onClick={() => confirmarSaldo(p.id, p.appointment_id)}>✓ Cobrado</button>
                  <button style={{ ...s.btnConfirmar, background: "#FCEBEB", color: "#A32D2D" }} onClick={() => cancelarTurno(p.appointment_id)}>✗</button>
                </div>
              ))
            )}

            {tab === "historial" && (
              historial.length === 0 ? (
                <div style={s.emptyText}>No hay historial</div>
              ) : historial.map((t, i) => (
                <div key={i} style={{ ...s.cobroRow, borderBottom: i === historial.length - 1 ? "none" : "0.5px solid #F0E8F8" }}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cobroNombre}>{t.clients?.full_name}</div>
                    <div style={s.cobroDetalle}>{t.services?.name} · {t.date} {t.start_time?.slice(0,5)}</div>
                  </div>
                  <span style={t.status === "confirmed" ? s.tagConfirmed : s.tagCancelled}>
                    {t.status === "confirmed" ? "Confirmado ✓" : "Cancelado"}
                  </span>
                  <div style={s.cobroMonto}>${parseFloat(t.total_price || 0).toLocaleString("es-AR")}</div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}