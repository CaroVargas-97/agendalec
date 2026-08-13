import { createClient } from "@supabase/supabase-js";
import { enviarWhatsApp } from "./_lib/whatsapp.js";
import { requireProfesional } from "./_lib/auth.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  // Solo lo llaman las pantallas internas (Agenda, Cobros, Limpiezas) tras
  // loguearse; nunca la reserva pública. Antes cualquiera podía mandar un
  // mensaje real de WhatsApp (con costo) a cualquier appointmentId adivinado.
  if (!(await requireProfesional(req, supabase))) return res.status(401).json({ error: "No autorizado" });

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

    const celular = turno?.clients?.phone;
    if (!celular) return res.status(200).json({ ok: false, motivo: "Cliente sin celular cargado" });

    const fecha = turno.date
      ? new Date(turno.date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
      : "a coordinar";
    const hora = turno.start_time ? turno.start_time.slice(0, 5) + " hs" : "a coordinar";
    const esVirtual = turno.modality === "virtual";
    const modalidad = esVirtual ? "🌿 Modalidad: Virtual" : "🌿 Modalidad: Presencial";
    const lineaDireccion = !esVirtual && turno.profiles.address ? `📍 Dirección: ${turno.profiles.address}\n` : "";

    const mensaje = `Hola ${turno.clients.full_name}! Tu turno quedó confirmado ✨\n\n📅 Día: ${fecha}\n🕐 Horario: ${hora}\n${lineaDireccion}${modalidad}\n💜 Profesional: ${turno.profiles.full_name}\n\n${turno.profiles.full_name} te espera para compartir un momento de conexión y armonía ✨\n\nCon amor, Espacio LEC 🤍\n¡Te esperamos!\n\n⚠️ Este número es únicamente para confirmación de turnos. No recibe mensajes ni consultas.`;

    await enviarWhatsApp(celular, mensaje);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error confirmar-turno:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
