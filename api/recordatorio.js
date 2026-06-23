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
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split("T")[0];

    const { data: turnos, error } = await supabase
      .from("appointments")
      .select(`
        *,
        clients(full_name, phone),
        services(name, price),
        profiles(full_name),
        payments(id, type, amount, status)
      `)
      .eq("date", fechaManana)
      .eq("status", "confirmed");

    if (error) throw error;

    const resultados = [];

    for (const turno of turnos) {
      const pagoSaldo = turno.payments?.find(p => p.type === "saldo" && p.status === "pending");
      if (!pagoSaldo) continue;

      const cliente = turno.clients;
      const servicio = turno.services;
      const profesional = turno.profiles;
      const celular = cliente?.phone?.replace(/\D/g, "");
      
      if (!celular) continue;

      const { data: settings } = await supabase
        .from("settings")
        .select("alias, payment_method")
        .eq("professional_id", turno.professional_id)
        .maybeSingle();

      const monto = pagoSaldo.amount;
      const alias = settings?.alias || "consultar con el profesional";

      const mensaje = `Hola ${cliente.full_name}! 👋 Te recordamos que mañana tenés tu turno de ${servicio.name} con ${profesional.full_name} a las ${turno.start_time.slice(0,5)}. El saldo pendiente es $${parseInt(monto).toLocaleString("es-AR")}. Por favor transferí al alias: *${alias}* antes del turno. ¡Gracias! 🗓`;

      await enviarWhatsApp(celular, mensaje);
      resultados.push({ cliente: cliente.full_name, estado: "enviado" });
    }

    return res.status(200).json({ ok: true, enviados: resultados.length, detalle: resultados });
  } catch (error) {
    console.error("Error en recordatorio:", error);
    return res.status(500).json({ error: error.message });
  }
}