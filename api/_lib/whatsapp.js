// Misma lógica que src/utils/whatsapp.js del lado del cliente, portada acá
// porque este archivo corre en el servidor y no puede importar del bundle
// de React. Mantenerlas en sync a mano es justo el problema: si volvés a
// tocar una, tocá la otra.
function normalizarCelular(phone) {
  const original = String(phone || "").trim();
  let d = original.replace(/\D/g, "");
  if (!d) return null;

  const esInternacional = original.startsWith("+") || original.startsWith("00");
  if (esInternacional) {
    if (original.startsWith("00")) d = d.slice(2);
    return d.length >= 8 && d.length <= 15 ? d : null;
  }

  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("9")) d = d.slice(1);
  if (d.startsWith("0")) d = d.slice(1);

  if (d.length === 12) {
    for (const largoArea of [2, 3, 4]) {
      if (d.slice(largoArea, largoArea + 2) === "15") {
        d = d.slice(0, largoArea) + d.slice(largoArea + 2);
        break;
      }
    }
  }

  if (d.length !== 10) return null;
  return `549${d}`;
}

export async function enviarWhatsApp(telefono, mensaje) {
  const numero = normalizarCelular(telefono);
  if (!numero) throw new Error(`Número de celular inválido: "${telefono}"`);

  const url = `https://graph.facebook.com/v20.0/${process.env.META_PHONE_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.META_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: numero,
      type: "text",
      text: { body: mensaje }
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}
