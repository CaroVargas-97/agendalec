import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VAPID_PUBLIC_KEY = "BK5G_mUoa0Nn9m7sk1MGssLDxpAYnEPVMRok3wCQWjSrax6EUY7SIoFmDOGwDvF0meG5nG7bbxldFreWyuNX9J8";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!process.env.VAPID_PRIVATE_KEY) {
      return res.status(500).json({ error: "Falta configurar VAPID_PRIVATE_KEY" });
    }
    webpush.setVapidDetails("mailto:info.espaciolec@gmail.com", VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

    const { professionalId, title, body, url } = req.body || {};
    if (!professionalId || !body) return res.status(400).json({ error: "Faltan datos" });
    // Este endpoint lo llama la reserva pública sin login (así el
    // profesional se entera al toque de una reserva nueva), así que no se
    // le puede pedir sesión. Al menos se limita el largo del texto: sin
    // esto, cualquiera podía mandar contenido arbitrario y del tamaño que
    // quisiera a las notificaciones de un profesional.
    if (String(title || "").length > 100 || String(body).length > 300) {
      return res.status(400).json({ error: "Texto demasiado largo" });
    }

    // Si el professionalId no corresponde a un profesional real, no hay
    // nada que notificar — corta acá en vez de seguir con datos inventados.
    const { data: prof } = await supabase.from("profiles").select("id").eq("id", professionalId).eq("role", "professional").maybeSingle();
    if (!prof) return res.status(200).json({ ok: true, enviados: 0 });

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("professional_id", professionalId);
    if (error) throw error;

    if (!subs || subs.length === 0) return res.status(200).json({ ok: true, enviados: 0 });

    const payload = JSON.stringify({ title: title || "AgendaLec", body, url: url || "/" });

    let enviados = 0;
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        enviados++;
      } catch (err) {
        // Si el dispositivo ya no acepta avisos (desinstaló, revocó permiso),
        // se limpia la suscripción para no seguir intentando.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        } else {
          console.error("Error enviando push:", err.statusCode, err.body);
        }
      }
    }

    return res.status(200).json({ ok: true, enviados });
  } catch (error) {
    console.error("Error notificar:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
