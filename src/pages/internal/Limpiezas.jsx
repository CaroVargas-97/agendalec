import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { authHeaders } from "../../utils/apiAuth";
import { linkWhatsApp, celularValido } from "../../utils/whatsapp";
import { calcularSaldoPendiente } from "../../utils/pagos";

const s = {
  main: { flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  titleSub: { fontSize: "13px", color: "#9B72C0", marginTop: "3px" },
  card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "13px", padding: "8px 10px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  saveBtn: { width: "100%", padding: "10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" },
  cancelBtn: { width: "100%", padding: "10px", background: "#fff", color: "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  emptyText: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "2rem 0" },
  panel: { position: "fixed", top: 0, right: 0, width: "420px", height: "100vh", background: "#fff", borderLeft: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", zIndex: 100, boxShadow: "-4px 0 24px rgba(42,24,69,0.08)" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(42,24,69,0.2)", zIndex: 99 },
  fila: { background: "#fff", borderRadius: "12px", border: "0.5px solid #E0D0F0", padding: "1rem 1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  tagPagado: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" },
  tagPendiente: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FAEEDA", color: "#854F0B" },
  tagParcial: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99" },
  tagSinFecha: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#F1EFE8", color: "#6B6860" },
  btnWA: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 8px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabs: { display: "flex", gap: "6px", flexWrap: "wrap" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #E0D0F0", background: "#fff", color: "#B89FD0", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tabActive: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "0.5px solid #9B72C0", background: "#EDE8FA", color: "#3B2460", fontWeight: "500", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};

const symFor = (cur) => cur === "USD" ? "U$S " : cur === "EUR" ? "€" : "$";
const fmtFecha = (d) => new Date(d + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });

export default function Limpiezas() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [limpiezas, setLimpiezas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pendientes");
  const [subiendo, setSubiendo] = useState(null);

  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientesCoincidentes, setClientesCoincidentes] = useState([]);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [nuevoClienteData, setNuevoClienteData] = useState({ phone: "", email: "" });
  const [nuevoForm, setNuevoForm] = useState({ servicioId: "", fecha: "", estadoPago: "pendiente" });
  const [savingNuevo, setSavingNuevo] = useState(false);
  const [nuevoError, setNuevoError] = useState("");

  const cargar = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const uid = session.user.id;

    const { data: svs } = await supabase
      .from("services")
      .select("id, name, price, currency, modality, duration_minutes, requires_slot")
      .eq("professional_id", uid)
      .eq("active", true)
      .ilike("name", "%limpieza%");
    setServicios(svs || []);

    const idsLimpieza = (svs || []).map(sv => sv.id);
    if (idsLimpieza.length === 0) { setLimpiezas([]); setLoading(false); return; }

    const { data } = await supabase
      .from("appointments")
      .select("id, date, start_time, status, total_price, modality, notes, completed_at, clients(full_name, phone), services(name, currency), payments(id, type, status, amount, receipt_url)")
      .eq("professional_id", uid)
      .in("service_id", idsLimpieza)
      .order("date", { ascending: true, nullsFirst: false });
    setLimpiezas(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const buscarCliente = async (nombre) => {
    setBusquedaCliente(nombre);
    setClienteEncontrado(null);
    setClientesCoincidentes([]);
    setClienteNuevo(false);
    if (nombre.length < 3) return;
    const { data } = await supabase.from("clients").select("id, full_name, phone, price_type, custom_price").ilike("full_name", `%${nombre}%`).limit(5);
    if (data && data.length > 0) setClientesCoincidentes(data);
    else setClienteNuevo(true);
  };

  const seleccionarCliente = (c) => {
    setClienteEncontrado(c);
    setClientesCoincidentes([]);
    setBusquedaCliente(c.full_name);
  };

  const precioEfectivo = (srv) => {
    if (!srv) return 0;
    if (clienteEncontrado?.price_type === "cortesia") return clienteEncontrado.custom_price != null ? clienteEncontrado.custom_price : 0;
    if (clienteEncontrado?.price_type === "especial" && clienteEncontrado.custom_price != null) return clienteEncontrado.custom_price;
    return srv.price;
  };

  const crearLimpieza = async () => {
    setNuevoError("");
    const srv = servicios.find(sv => sv.id === nuevoForm.servicioId);
    if (!srv) { setNuevoError("Elegí el tipo de limpieza."); return; }
    if (!busquedaCliente.trim()) { setNuevoError("Falta el cliente."); return; }
    setSavingNuevo(true);

    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) { setSavingNuevo(false); return; }

    let clienteId = clienteEncontrado?.id;
    if (!clienteId) {
      const { data: nc, error: errCliente } = await supabase.from("clients").insert({
        full_name: busquedaCliente.trim(),
        phone: nuevoClienteData.phone || null,
        email: nuevoClienteData.email.trim().toLowerCase() || null,
      }).select("id").single();
      if (errCliente) { setNuevoError("Error al crear el cliente: " + errCliente.message); setSavingNuevo(false); return; }
      clienteId = nc?.id;
    }

    const precio = precioEfectivo(srv);
    const status = nuevoForm.estadoPago === "completo" ? "confirmed" : "pending";
    const { data: turno, error: errTurno } = await supabase.from("appointments").insert({
      professional_id: uid, client_id: clienteId, service_id: srv.id,
      date: nuevoForm.fecha || null,
      start_time: null, end_time: null,
      modality: srv.modality === "ambas" ? "virtual" : srv.modality,
      status, total_price: precio,
    }).select("id").single();
    if (errTurno) { setNuevoError("Error al guardar: " + errTurno.message); setSavingNuevo(false); return; }

    if (nuevoForm.estadoPago === "completo") {
      await supabase.from("payments").insert({ appointment_id: turno.id, type: "seña", amount: precio, status: "paid", paid_at: new Date().toISOString() });
    } else {
      await supabase.from("payments").insert({ appointment_id: turno.id, type: "seña", amount: Math.round(precio / 2), status: "pending" });
    }

    setSavingNuevo(false);
    setNuevoAbierto(false);
    setBusquedaCliente("");
    setClienteEncontrado(null);
    setClientesCoincidentes([]);
    setClienteNuevo(false);
    setNuevoClienteData({ phone: "", email: "" });
    setNuevoForm({ servicioId: "", fecha: "", estadoPago: "pendiente" });
    await cargar();
  };

  // Flujo real: hablan, acuerdan el día, se pide la seña. Cuando la seña
  // entra se confirma acá y queda el saldo pendiente para el día de la
  // limpieza.
  const confirmarSena = async (l) => {
    const { sena: senaPago, saldoExistente, monto: saldo } = calcularSaldoPendiente(l.payments, l.total_price);
    if (senaPago) await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", senaPago.id);
    if (!saldoExistente && saldo > 0) {
      await supabase.from("payments").insert({ appointment_id: l.id, type: "saldo", amount: saldo, status: "pending" });
    }
    await supabase.from("appointments").update({ status: "partial" }).eq("id", l.id);
    authHeaders().then(headers => fetch("/api/confirmar-turno", { method: "POST", headers, body: JSON.stringify({ appointmentId: l.id }) }));
    await cargar();
  };

  const confirmarPagoTotal = async (l) => {
    const ahora = new Date().toISOString();
    const { sena: senaPago, saldoExistente, monto: restante } = calcularSaldoPendiente(l.payments, l.total_price);
    if (senaPago) await supabase.from("payments").update({ status: "paid", paid_at: ahora }).eq("id", senaPago.id);
    if (saldoExistente) {
      // Si ya se confirmó la seña antes, el saldo ya existe: se marca pagado
      // en vez de crear un segundo registro duplicado.
      await supabase.from("payments").update({ status: "paid", paid_at: ahora }).eq("id", saldoExistente.id);
    } else if (restante > 0) {
      await supabase.from("payments").insert({ appointment_id: l.id, type: "saldo", amount: restante, status: "paid", paid_at: ahora });
    }
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", l.id);
    authHeaders().then(headers => fetch("/api/confirmar-turno", { method: "POST", headers, body: JSON.stringify({ appointmentId: l.id }) }));
    await cargar();
  };

  const marcarHecha = async (l) => {
    await supabase.from("appointments").update({ completed_at: new Date().toISOString() }).eq("id", l.id);
    await cargar();
  };

  const desmarcarHecha = async (l) => {
    await supabase.from("appointments").update({ completed_at: null }).eq("id", l.id);
    await cargar();
  };

  const asignarFecha = async (l, fecha) => {
    await supabase.from("appointments").update({ date: fecha || null }).eq("id", l.id);
    await cargar();
  };

  const cancelar = async (l) => {
    if (!window.confirm(`¿Cancelar la limpieza de ${l.clients?.full_name}?`)) return;
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", l.id);
    await supabase.from("payments").update({ status: "cancelled" }).eq("appointment_id", l.id);
    await cargar();
  };

  const eliminar = async (l) => {
    if (!window.confirm("¿Eliminar esta limpieza definitivamente? Esta acción no se puede deshacer.")) return;
    await supabase.from("payments").delete().eq("appointment_id", l.id);
    const { error } = await supabase.from("appointments").delete().eq("id", l.id);
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    await cargar();
  };

  const subirComprobante = async (l, file, tipo) => {
    if (!file) return;
    const pago = l.payments?.find(p => p.type === tipo);
    if (!pago) { alert(`Esta limpieza no tiene un pago de ${tipo} asociado.`); return; }
    setSubiendo(`${l.id}-${tipo}`);
    const ext = file.name.split(".").pop();
    const { data: uploadData, error: errUpload } = await supabase.storage
      .from("comprobantes")
      .upload(`${l.id}-${tipo === "seña" ? "sena" : "saldo"}.${ext}`, file, { contentType: file.type, upsert: true });
    if (errUpload) {
      alert("No se pudo subir el comprobante: " + errUpload.message);
    } else if (uploadData) {
      const { data: { publicUrl: rawUrl } } = supabase.storage.from("comprobantes").getPublicUrl(uploadData.path);
      // Sin esto, resubir con el mismo nombre de archivo deja el link
      // idéntico al anterior y el navegador sigue mostrando la imagen vieja
      // en caché aunque el archivo ya haya cambiado del lado del servidor.
      const publicUrl = `${rawUrl}?t=${Date.now()}`;
      const { error: errUpdate } = await supabase.from("payments").update({ receipt_url: publicUrl }).eq("id", pago.id);
      if (errUpdate) alert("No se pudo guardar el comprobante: " + errUpdate.message);
    }
    setSubiendo(null);
    await cargar();
  };

  // El pago y el trabajo son dos cosas distintas: que haya pagado no
  // significa que la limpieza ya esté hecha. Las pestañas van por trabajo.
  const pendientes = limpiezas.filter(l => l.status !== "cancelled" && !l.completed_at);
  const hechas = limpiezas.filter(l => l.status !== "cancelled" && l.completed_at);
  const canceladas = limpiezas.filter(l => l.status === "cancelled");
  const visibles = tab === "pendientes" ? pendientes : tab === "hechas" ? hechas : canceladas;

  const srvElegido = servicios.find(sv => sv.id === nuevoForm.servicioId);

  return (
    <div style={{ ...s.main, padding: isMobile ? "1rem" : "1.5rem" }}>
      <div style={{ ...s.topbar, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? "10px" : 0 }}>
        <div>
          <div style={s.title}>Limpiezas energéticas</div>
          <div style={s.titleSub}>{pendientes.length} por hacer · {hechas.length} hechas</div>
        </div>
        <button onClick={() => setNuevoAbierto(true)} style={{ padding: "8px 16px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(155,114,192,0.35)" }}>+ Nueva limpieza</button>
      </div>

      <div style={s.tabs}>
        <button style={tab === "pendientes" ? s.tabActive : s.tab} onClick={() => setTab("pendientes")}>
          Por hacer {pendientes.length > 0 && <span style={{ marginLeft: "4px", background: "#9B72C0", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "11px" }}>{pendientes.length}</span>}
        </button>
        <button style={tab === "hechas" ? s.tabActive : s.tab} onClick={() => setTab("hechas")}>Hechas</button>
        <button style={tab === "canceladas" ? s.tabActive : s.tab} onClick={() => setTab("canceladas")}>Canceladas</button>
      </div>

      {loading ? (
        <div style={{ ...s.card, ...s.emptyText }}>Cargando...</div>
      ) : servicios.length === 0 ? (
        <div style={{ ...s.card, ...s.emptyText }}>No hay servicios de limpieza cargados en Configuración → Servicios.</div>
      ) : visibles.length === 0 ? (
        <div style={{ ...s.card, ...s.emptyText }}>
          {tab === "pendientes" ? "No hay limpiezas por hacer" : tab === "hechas" ? "Todavía no hay limpiezas hechas" : "No hay limpiezas canceladas"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {visibles.map(l => {
            const sena = l.payments?.find(p => p.type === "seña");
            const saldo = l.payments?.find(p => p.type === "saldo");
            const sym = symFor(l.services?.currency);
            return (
              <div key={l.id} style={s.fila}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#2A1845" }}>{l.clients?.full_name}</div>
                    <div style={{ fontSize: "12px", color: "#B89FD0", marginTop: "2px" }}>
                      {l.services?.name} · {sym}{parseFloat(l.total_price || 0).toLocaleString("es-AR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    {l.date ? <span style={s.tagParcial}>{fmtFecha(l.date)}</span> : <span style={s.tagSinFecha}>Sin fecha</span>}
                    {l.status === "cancelled" ? <span style={{ ...s.tagPendiente, background: "#FCEBEB", color: "#A32D2D" }}>Cancelada</span> : (
                      <>
                        {l.status === "confirmed" ? <span style={s.tagPagado}>💰 Pagado</span>
                          : sena?.status === "paid" ? <span style={s.tagParcial}>💰 Seña pagada</span>
                          : <span style={s.tagPendiente}>💰 Sin pagar</span>}
                        {l.completed_at ? <span style={s.tagPagado}>✓ Hecha</span> : <span style={s.tagSinFecha}>Por hacer</span>}
                      </>
                    )}
                  </div>
                </div>

                {(sena?.receipt_url || saldo?.receipt_url) && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    {sena?.receipt_url && <a href={sena.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none" }}>📎 Seña</a>}
                    {saldo?.receipt_url && <a href={saldo.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#9B72C0", textDecoration: "none" }}>📎 Saldo</a>}
                  </div>
                )}

                {l.status !== "cancelled" && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <input type="date" value={l.date || ""} onChange={e => asignarFecha(l, e.target.value)}
                      style={{ ...s.input, fontSize: "11px", padding: "5px 8px" }} title="Día en que la vas a hacer" />
                    {sena?.status !== "paid" && (
                      <button onClick={() => confirmarSena(l)} style={{ padding: "5px 10px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✓ Cobré la seña</button>
                    )}
                    {l.status !== "confirmed" && (
                      <button onClick={() => confirmarPagoTotal(l)} style={{ padding: "5px 10px", background: "#3B6D11", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>💰 Pagó todo</button>
                    )}
                    {l.completed_at ? (
                      <button onClick={() => desmarcarHecha(l)} style={{ padding: "5px 10px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>↩ Volver a por hacer</button>
                    ) : (
                      <button onClick={() => marcarHecha(l)} style={{ padding: "5px 10px", background: "#5C3F99", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✓ Ya la hice</button>
                    )}
                    {sena && (
                      <label style={{ padding: "5px 10px", background: sena.receipt_url ? "#EAF3DE" : "#fff", color: sena.receipt_url ? "#3B6D11" : "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {subiendo === `${l.id}-seña` ? "Subiendo..." : sena.receipt_url ? "✅ Comp. seña" : "📎 Comp. seña"}
                        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => subirComprobante(l, e.target.files[0], "seña")} />
                      </label>
                    )}
                    {saldo && (
                      <label style={{ padding: "5px 10px", background: saldo.receipt_url ? "#EAF3DE" : "#fff", color: saldo.receipt_url ? "#3B6D11" : "#9B72C0", border: "0.5px solid #E0D0F0", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {subiendo === `${l.id}-saldo` ? "Subiendo..." : saldo.receipt_url ? "✅ Comp. saldo" : "📎 Comp. saldo"}
                        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => subirComprobante(l, e.target.files[0], "saldo")} />
                      </label>
                    )}
                    {l.clients?.phone && (
                      <a href={linkWhatsApp(l.clients.phone)} target="_blank" rel="noreferrer"><button style={s.btnWA}>💬</button></a>
                    )}
                    <button onClick={() => cancelar(l)} style={{ padding: "5px 10px", background: "#FCEBEB", color: "#A32D2D", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✕</button>
                  </div>
                )}
                {l.status === "cancelled" && (
                  <div style={{ display: "flex", marginTop: "10px" }}>
                    <button onClick={() => eliminar(l)} style={{ padding: "5px 10px", background: "#fff", color: "#9CA3AF", border: "0.5px solid #E5E7EB", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🗑 Eliminar</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {nuevoAbierto && (
        <>
          <div style={s.overlay} onClick={() => setNuevoAbierto(false)} />
          <div style={isMobile ? { ...s.panel, width: "100%" } : s.panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "15px", fontWeight: "500", color: "#2A1845" }}>+ Nueva limpieza</div>
              <button onClick={() => setNuevoAbierto(false)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "0.5px solid #E0D0F0", background: "#F8F4FC", cursor: "pointer", fontSize: "16px", color: "#9B72C0" }}>×</button>
            </div>
            <div style={{ fontSize: "12px", color: "#B89FD0" }}>Se hacen a distancia, sin horario fijo. Podés dejar la fecha vacía y asignarla después desde la lista.</div>

            <div style={s.field}>
              <label style={s.label}>Cliente</label>
              <input type="text" value={busquedaCliente} onChange={e => buscarCliente(e.target.value)} placeholder="Escribí el nombre..." style={s.input} />
              {clientesCoincidentes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", border: "0.5px solid #E0D0F0", borderRadius: "8px", overflow: "hidden", marginTop: "2px" }}>
                  {clientesCoincidentes.map(c => (
                    <button key={c.id} onClick={() => seleccionarCliente(c)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#fff", border: "none", borderBottom: "0.5px solid #F0E8F8", cursor: "pointer", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <span style={{ fontSize: "13px", color: "#2A1845" }}>{c.full_name}</span>
                      <span style={{ fontSize: "11px", color: "#B89FD0" }}>{c.phone || ""}</span>
                    </button>
                  ))}
                </div>
              )}
              {clienteEncontrado && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11", marginTop: "4px", display: "inline-block" }}>✓ {clienteEncontrado.full_name}</span>}
              {clienteEncontrado?.price_type === "especial" && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99", marginTop: "4px", display: "inline-block" }}>✨ Precio especial</span>}
              {clienteEncontrado?.price_type === "cortesia" && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FDE8F0", color: "#A0407A", marginTop: "4px", display: "inline-block" }}>🎁 Cortesía</span>}
              {clienteNuevo && busquedaCliente.length >= 3 && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#EDE8FA", color: "#5C3F99", marginTop: "4px", display: "inline-block" }}>+ Se creará nuevo cliente</span>}
            </div>

            {clienteNuevo && busquedaCliente.length >= 3 && (
              <>
                <div style={s.field}><label style={s.label}>Celular (opcional)</label><input type="tel" value={nuevoClienteData.phone} onChange={e => setNuevoClienteData({...nuevoClienteData, phone: e.target.value})} placeholder="+54 9 11..." style={s.input} />
                    {nuevoClienteData.phone && !celularValido(nuevoClienteData.phone) && (
                      <span style={{ fontSize: "11px", color: "#A32D2D" }}>⚠️ No parece un celular argentino válido (área + número, sin el 15)</span>
                    )}</div>
                <div style={s.field}><label style={s.label}>Mail (opcional)</label><input type="email" value={nuevoClienteData.email} onChange={e => setNuevoClienteData({...nuevoClienteData, email: e.target.value})} placeholder="mail@ejemplo.com" style={s.input} /></div>
              </>
            )}

            <div style={s.field}>
              <label style={s.label}>Tipo de limpieza</label>
              <select value={nuevoForm.servicioId} onChange={e => setNuevoForm({...nuevoForm, servicioId: e.target.value})} style={s.input}>
                <option value="">Elegí una opción</option>
                {servicios.map(sv => (
                  <option key={sv.id} value={sv.id}>{sv.name.trim()} · {symFor(sv.currency)}{sv.price?.toLocaleString("es-AR")}</option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Día que la vas a hacer (opcional)</label>
              <input type="date" value={nuevoForm.fecha} onChange={e => setNuevoForm({...nuevoForm, fecha: e.target.value})} style={s.input} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Estado del pago</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {[["pendiente","⏳ Pendiente"],["completo","✅ Pagó todo"]].map(([key,label]) => (
                  <button key={key} onClick={() => setNuevoForm({...nuevoForm, estadoPago: key})}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${nuevoForm.estadoPago===key?"#9B72C0":"#E0D0F0"}`, background: nuevoForm.estadoPago===key?"#EDE8FA":"#fff", color: nuevoForm.estadoPago===key?"#5C3F99":"#B89FD0", fontSize: "12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</button>
                ))}
              </div>
              {srvElegido && (
                <div style={{ fontSize: "11px", color: "#9B72C0", marginTop: "4px" }}>
                  {symFor(srvElegido.currency)}{precioEfectivo(srvElegido).toLocaleString("es-AR")}
                  {precioEfectivo(srvElegido) !== srvElegido.price && (clienteEncontrado?.price_type === "cortesia" ? " 🎁 Cortesía aplicada" : " ✨ Precio especial aplicado")}
                </div>
              )}
            </div>

            {nuevoError && <div style={{ fontSize: "12px", color: "#A32D2D" }}>{nuevoError}</div>}
            <button style={s.saveBtn} onClick={crearLimpieza} disabled={savingNuevo}>{savingNuevo ? "Guardando..." : "Guardar limpieza"}</button>
            <button style={s.cancelBtn} onClick={() => setNuevoAbierto(false)}>Cancelar</button>
          </div>
        </>
      )}
    </div>
  );
}
