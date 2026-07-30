import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VAPID_PUBLIC_KEY = "BK5G_mUoa0Nn9m7sk1MGssLDxpAYnEPVMRok3wCQWjSrax6EUY7SIoFmDOGwDvF0meG5nG7bbxldFreWyuNX9J8";

// Fecha de hoy en horario de Argentina (el servidor corre en UTC).
const hoyArgentina = () => {
  const ahora = new Date();
  const arg = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
  return arg.toISOString().split("T")[0];
};

const listarNombres = (nombres) => {
  if (nombres.length === 1) return nombres[0];
  if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
  return `${nombres.slice(0, 2).join(", ")} y ${nombres.length - 2} más`;
};

export default async function handler(req, res) {
  try {
    if (!process.env.VAPID_PRIVATE_KEY) {
      return res.status(500).json({ error: "Falta configurar VAPID_PRIVATE_KEY" });
    }
    webpush.setVapidDetails("mailto:info.espaciolec@gmail.com", VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

    const hoy = hoyArgentina();

    const { data: svsLimpieza } = await supabase.from("services").select("id").ilike("name", "%limpieza%");
    const idsLimpieza = (svsLimpieza || []).map(sv => sv.id);
    if (idsLimpieza.length === 0) return res.status(200).json({ ok: true, motivo: "sin servicios de limpieza" });

    // Limpiezas pendientes: las asignadas para hoy y las que todavía no
    // tienen día, para que no se pierdan de vista.
    const { data: limpiezas, error } = await supabase
      .from("appointments")
      .select("id, date, professional_id, completed_at, clients(full_name)")
      .in("service_id", idsLimpieza)
      .is("completed_at", null)
      .neq("status", "cancelled")
      .or(`date.eq.${hoy},date.is.null`);
    if (error) throw error;

    if (!limpiezas || limpiezas.length === 0) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: "no hay limpiezas pendientes" });
    }

    // Agrupadas por profesional, porque cada una recibe lo suyo.
    const porProfesional = {};
    for (const l of limpiezas) {
      if (!porProfesional[l.professional_id]) porProfesional[l.professional_id] = { hoy: [], sinFecha: [] };
      const nombre = l.clients?.full_name || "Cliente";
      if (l.date === hoy) porProfesional[l.professional_id].hoy.push(nombre);
      else porProfesional[l.professional_id].sinFecha.push(nombre);
    }

    let enviados = 0;
    for (const [profId, grupo] of Object.entries(porProfesional)) {
      const partes = [];
      if (grupo.hoy.length > 0) {
        partes.push(`${grupo.hoy.length} para hoy: ${listarNombres(grupo.hoy)}`);
      }
      if (grupo.sinFecha.length > 0) {
        partes.push(`${grupo.sinFecha.length} sin día asignado`);
      }
      if (partes.length === 0) continue;

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("professional_id", profId);
      if (!subs || subs.length === 0) continue;

      const payload = JSON.stringify({
        title: "🌿 Limpiezas energéticas",
        body: `Tenés ${partes.join(" · ")}`,
        url: "/",
        tag: "limpiezas-recordatorio",
      });

      for (const s of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
          enviados++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", s.id);
          } else {
            console.error("Error push limpiezas:", err.statusCode, err.body);
          }
        }
      }
    }

    return res.status(200).json({ ok: true, enviados });
  } catch (error) {
    console.error("Error recordatorio-limpiezas:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
