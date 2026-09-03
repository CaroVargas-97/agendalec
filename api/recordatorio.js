import { createClient } from "@supabase/supabase-js";
import { enviarWhatsApp } from "./_lib/whatsapp.js";
import { requireCron } from "./_lib/auth.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Vercel Cron llama a esta ruta con GET, no POST — por eso el chequeo de
  // método de acá abajo bloqueaba SIEMPRE la corrida automática diaria con
  // un 405, aunque probar el endpoint a mano con POST funcionara bien.
  if (!requireCron(req)) return res.status(401).json({ error: "No autorizado" });

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
      // El saldo queda "pending" mientras el turno está en estado "partial"
      // (seña confirmada, falta el saldo). Para cuando el turno pasa a
      // "confirmed" ya está todo pagado — filtrar por "confirmed" acá
      // significaba que esta consulta nunca encontraba a nadie.
      .eq("type", "saldo")
      .eq("status", "pending")
      .eq("appointments.date", fechaManana)
      .eq("appointments.status", "partial");

    if (error) throw error;

    const resultados = [];

    // Cada envío en su propio try/catch: si uno falla (número inválido,
    // límite de la API de Meta) no tiene que tumbar el recordatorio de
    // todos los clientes que venían después en la lista.
    for (const pago of pagos || []) {
      const turno = pago.appointments;
      const celular = turno?.clients?.phone;
      if (!celular) { resultados.push({ cliente: turno?.clients?.full_name, estado: "sin celular" }); continue; }

      try {
        const { data: settings } = await supabase
          .from("settings")
          .select("alias, alias_usd, paypal_link")
          .eq("professional_id", turno.professional_id)
          .maybeSingle();

        const currency = turno.services?.currency;
        const esUSD = currency === "USD";
        const esEUR = currency === "EUR";
        const sym = esUSD ? "U$S " : esEUR ? "€" : "$";
        const monto = `${sym}${parseInt(pago.amount).toLocaleString("es-AR")}`;
        const formaPago = esEUR
          ? `por PayPal: ${settings?.paypal_link || "consultar con el profesional"}`
          : `al alias: *${(esUSD ? settings?.alias_usd : settings?.alias) || "consultar con el profesional"}*`;

        const linkSaldo = `https://agendalec.vercel.app/saldo?id=${pago.id}`;
        const mensaje = `Hola ${turno.clients.full_name}! Tu turno es mañana ✨\n\n🕐 Horario: ${turno.start_time.slice(0,5)} hs\n🌿 Servicio: ${turno.services.name}\n💜 Profesional: ${turno.profiles.full_name}\n\nPara confirmar tu lugar, te recordamos abonar el saldo pendiente de ${monto} ${formaPago}.\n\nCuando transfieras, subí el comprobante acá: ${linkSaldo}\n\nCon amor, Espacio LEC 🤍\n¡Te esperamos!\n\n⚠️ Este número es únicamente para confirmación de turnos. No recibe mensajes ni consultas.`;

        await enviarWhatsApp(celular, mensaje);
        resultados.push({ cliente: turno.clients.full_name, estado: "enviado" });
      } catch (err) {
        console.error("Error enviando recordatorio a", turno.clients?.full_name, ":", err.message);
        resultados.push({ cliente: turno.clients?.full_name, estado: "error: " + err.message });
      }
    }

    return res.status(200).json({ ok: true, enviados: resultados.filter(r => r.estado === "enviado").length, detalle: resultados });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}