import { createClient } from "@supabase/supabase-js";
import { enviarWhatsApp } from "./_lib/whatsapp.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ error: "Falta appointmentId" });

    const { data: turno, error } = await supabase
      .from("appointments")
      .select(`
        id, date, start_time, modality,
        clients(full_name, phone),
        services(name),
        profiles(full_name, address)
      `)
      .eq("id", appointmentId)
      .single();

    if (error) throw error;

    const celular = turno?.clients?.phone?.replace(/\D/g, "");
    if (!celular) return res.status(200).json({ ok: false, motivo: "Cliente sin celular cargado" });

    const fecha = turno.date
      ? new Date(turno.date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
      : "a coordinar";
    const hora = turno.start_time ? turno.start_time.slice(0, 5) + " hs" : "a coordinar";
    const esVirtual = turno.modality === "virtual";
    const modalidad = esVirtual ? "Virtual" : "Presencial";
    const lineaUbicacion = !esVirtual && turno.profiles.address
      ? `📍 ${modalidad} — ${turno.profiles.address}`
      : `📍 ${modalidad}`;

    const mensaje = `Hola ${turno.clients.full_name}! 👋 Tu turno quedó *confirmado*.\n\n📌 Servicio: ${turno.services.name}\n🧑‍⚕️ Profesional: ${turno.profiles.full_name}\n📅 Fecha: ${fecha}\n🕐 Hora: ${hora}\n${lineaUbicacion}\n\n¡Te esperamos en Espacio Lec! 🪷`;

    await enviarWhatsApp(celular, mensaje);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error confirmar-turno:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
