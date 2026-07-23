export async function enviarWhatsApp(telefono, mensaje) {
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
