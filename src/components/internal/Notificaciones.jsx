import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";

const LS_KEY = "agendalec_notif_visto";

const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const haceCuanto = (iso) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
};

const s = {
  badge: { position: "absolute", top: "-4px", right: "-4px", minWidth: "17px", height: "17px", borderRadius: "9px", background: "#E24B4A", color: "#fff", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "1.5px solid #fff" },
  panelTitulo: { fontSize: "11px", fontWeight: "500", color: "#B89FD0", textTransform: "uppercase", letterSpacing: "0.4px", padding: "10px 14px 6px" },
  item: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", background: "transparent", border: "none", borderBottom: "0.5px solid #F0E8F8", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  itemTexto: { fontSize: "13px", color: "#2A1845", lineHeight: 1.35, display: "block" },
  itemSub: { fontSize: "11px", color: "#B89FD0", marginTop: "2px", display: "block" },
  vacio: { fontSize: "13px", color: "#B89FD0", textAlign: "center", padding: "1.5rem 1rem" },
};

export default function Notificaciones({ setPage, isMobile }) {
  const [abierto, setAbierto] = useState(false);
  const [nuevos, setNuevos] = useState([]);
  const [limpiezasHoy, setLimpiezasHoy] = useState([]);
  const [visto, setVisto] = useState(() => localStorage.getItem(LS_KEY) || new Date(Date.now() - 7 * 86400000).toISOString());

  const cargar = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;

    const { data: svsLimpieza } = await supabase.from("services").select("id").ilike("name", "%limpieza%");
    const idsLimpieza = new Set((svsLimpieza || []).map(sv => sv.id));

    // Turnos nuevos desde la última vez que miró
    const { data: turnos } = await supabase
      .from("appointments")
      .select("id, created_at, date, start_time, service_id, total_price, clients(full_name), services(name), payments(receipt_url)")
      .eq("professional_id", uid)
      .gt("created_at", visto)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(30);

    setNuevos((turnos || []).map(t => ({
      id: t.id,
      esLimpieza: idsLimpieza.has(t.service_id),
      conComprobante: t.payments?.some(p => p.receipt_url),
      nombre: t.clients?.full_name || "Cliente",
      servicio: t.services?.name?.trim() || "",
      ts: t.created_at,
    })));

    // Limpiezas asignadas para hoy que todavía no están hechas
    if (idsLimpieza.size > 0) {
      const { data: limps } = await supabase
        .from("appointments")
        .select("id, date, completed_at, clients(full_name), services(name)")
        .eq("professional_id", uid)
        .in("service_id", [...idsLimpieza])
        .lte("date", hoyISO())
        .is("completed_at", null)
        .neq("status", "cancelled");
      setLimpiezasHoy(limps || []);
    }
  }, [visto]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
  }, [cargar]);

  const total = nuevos.length + limpiezasHoy.length;

  const abrir = () => {
    setAbierto(v => !v);
  };

  const marcarVisto = () => {
    const ahora = new Date().toISOString();
    localStorage.setItem(LS_KEY, ahora);
    setVisto(ahora);
    setNuevos([]);
  };

  const irA = (pagina) => {
    setPage(pagina);
    setAbierto(false);
  };

  return (
    <>
      <button onClick={abrir} title="Notificaciones"
        style={{ position: "relative", width: "34px", height: "34px", borderRadius: "10px", border: "0.5px solid #E0D0F0", background: "#fff", color: "#9B72C0", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        🔔
        {total > 0 && <span style={s.badge}>{total > 9 ? "9+" : total}</span>}
      </button>

      {abierto && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(42,24,69,0.2)", zIndex: 199 }} onClick={() => setAbierto(false)} />
          <div style={{
            position: "fixed", zIndex: 200, background: "#fff", borderRadius: "14px", border: "0.5px solid #E0D0F0",
            boxShadow: "0 8px 32px rgba(42,24,69,0.18)", overflow: "hidden", display: "flex", flexDirection: "column",
            maxHeight: "70vh",
            ...(isMobile
              ? { left: "12px", right: "12px", bottom: "128px" }
              : { left: "212px", top: "16px", width: "340px" }),
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "0.5px solid #F0E8F8" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#2A1845" }}>Notificaciones</span>
              {nuevos.length > 0 && (
                <button onClick={marcarVisto} style={{ fontSize: "11px", color: "#9B72C0", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Marcar como visto</button>
              )}
            </div>

            <div style={{ overflowY: "auto" }}>
              {total === 0 && <div style={s.vacio}>No hay novedades 🌿</div>}

              {limpiezasHoy.length > 0 && (
                <>
                  <div style={s.panelTitulo}>Limpiezas pendientes</div>
                  {limpiezasHoy.map(l => (
                    <button key={l.id} style={s.item} onClick={() => irA("limpiezas")}>
                      <span style={{ fontSize: "16px" }}>🌿</span>
                      <span>
                        <span style={s.itemTexto}>{l.clients?.full_name}</span>
                        <span style={s.itemSub}>
                          {l.services?.name?.trim()} · {l.date === hoyISO() ? "pendiente de hacer" : `⚠️ atrasada (${l.date})`}
                        </span>
                      </span>
                    </button>
                  ))}
                </>
              )}

              {nuevos.length > 0 && (
                <>
                  <div style={s.panelTitulo}>Nuevos</div>
                  {nuevos.map(n => (
                    <button key={n.id} style={s.item} onClick={() => irA(n.esLimpieza ? "limpiezas" : "cobros")}>
                      <span style={{ fontSize: "16px" }}>{n.esLimpieza ? "🌿" : n.conComprobante ? "💰" : "📅"}</span>
                      <span>
                        <span style={s.itemTexto}>
                          {n.esLimpieza ? "Nueva limpieza" : "Nuevo turno"} de {n.nombre}
                          {n.conComprobante ? " · pagó la seña" : ""}
                        </span>
                        <span style={s.itemSub}>{n.servicio} · {haceCuanto(n.ts)}</span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
