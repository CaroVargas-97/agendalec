import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function enviarWhatsApp(telefono, mensaje) {
  const url = `https://graph.facebook.com/v20.0/${process.env.META_PHONE_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.META_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: `54${telefono}`,
      type: "text",
      text: { body: mensaje }
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Fecha de mañana en Argentina (UTC-3)
    const ahora = new Date();
    const argentinaTime = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
    argentinaTime.setDate(argentinaTime.getDate() + 1);
    const fechaManana = argentinaTime.toISOString().split("T")[0];

    console.log("Buscando turnos para fecha:", fechaManana);

    const { data: turnos, error } = await supabase
      .from("appointments")
      .select(`id, professional_id, start_time, status, clients(full_name, phone), services(name), profiles(full_name)`)
      .eq("date", fechaManana)
      .eq("status", "confirmed");

    if (error) throw error;
    console.log("Turnos encontrados:", turnos?.length);

    const resultados = [];

    for (const turno of turnos || []) {
      const { data: pagos } = await supabase
        .from("payments")
        .select("type, amount, status")
        .eq("appointment_id", turno.id);

      const pagoSaldo = pagos?.find(p => p.type === "saldo" && p.status === "pending");
      if (!pagoSaldo) continue;

      const celular = turno.clients?.phone?.replace(/\D/g, "");
      if (!celular) continue;

      const { data: settings } = await supabase
        .from("settings")
        .select("alias")
        .eq("professional_id", turno.professional_id)
        .maybeSingle();

      const alias = settings?.alias || "consultar con el profesional";
      const monto = pagoSaldo.amount;

      const mensaje = `Hola ${turno.clients.full_name}! 👋 Te recordamos que mañana tenés tu turno de ${turno.services.name} con ${turno.profiles.full_name} a las ${turno.start_time.slice(0,5)}. El saldo pendiente es $${parseInt(monto).toLocaleString("es-AR")}. Por favor transferí al alias: *${alias}* antes del turno. ¡Gracias! 🗓`;

      await enviarWhatsApp(celular, mensaje);
      resultados.push({ cliente: turno.clients.full_name, estado: "enviado" });
    }

    return res.status(200).json({ ok: true, enviados: resultados.length, detalle: resultados });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}