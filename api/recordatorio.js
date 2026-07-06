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
    const ahora = new Date();
    const argentinaTime = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
    argentinaTime.setDate(argentinaTime.getDate() + 1);
    const fechaManana = argentinaTime.toISOString().split("T")[0];

    console.log("Fecha mañana:", fechaManana);

    // Query directa con join de payments
    const { data: pagos, error } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        type,
        status,
        appointments!inner(
          id,
          professional_id,
          start_time,
          date,
          status,
          clients(full_name, phone),
          services(name, currency),
          profiles(full_name)
        )
      `)
      .eq("type", "saldo")
      .eq("status", "pending")
      .eq("appointments.date", fechaManana)
      .eq("appointments.status", "confirmed");

    if (error) { console.log("Error:", JSON.stringify(error)); throw error; }
    console.log("Pagos pendientes encontrados:", pagos?.length, JSON.stringify(pagos?.map(p => p.id)));

    const resultados = [];

    for (const pago of pagos || []) {
      const turno = pago.appointments;
      const celular = turno?.clients?.phone?.replace(/\D/g, "");
      
      console.log("Procesando pago:", pago.id, "celular:", celular);
      if (!celular) continue;

      const { data: settings } = await supabase
        .from("settings")
        .select("alias, alias_usd")
        .eq("professional_id", turno.professional_id)
        .maybeSingle();

      const esUSD = turno.services?.currency === "USD" || turno.services?.currency === "EUR";
      const alias = (esUSD ? settings?.alias_usd : null) || settings?.alias || "consultar con el profesional";
      const sym = esUSD ? "U$S " : "$";

      const mensaje = `Hola ${turno.clients.full_name}! 👋 Te recordamos que mañana tenés tu turno de ${turno.services.name} con ${turno.profiles.full_name} a las ${turno.start_time.slice(0,5)}. El saldo pendiente es ${sym}${parseInt(pago.amount).toLocaleString("es-AR")}. Por favor transferí al alias: *${alias}* antes del turno. ¡Gracias! 🗓`;

      console.log("Enviando a:", celular);
      await enviarWhatsApp(celular, mensaje);
      resultados.push({ cliente: turno.clients.full_name, estado: "enviado" });
    }

    return res.status(200).json({ ok: true, enviados: resultados.length, detalle: resultados });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}