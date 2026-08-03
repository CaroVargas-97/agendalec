// Arma el link de WhatsApp a partir de un teléfono anotado a mano.
//
// Hay clientes del exterior (por eso hay servicios en dólares y euros), así
// que no se puede asumir que todo número es argentino: si viene con código
// de país se respeta tal cual. Solo se normaliza cuando es local.
const esInternacional = (phone) => {
  const t = String(phone || "").trim();
  return t.startsWith("+") || t.startsWith("00");
};

export function normalizarCelular(phone) {
  const original = String(phone || "").trim();
  let d = original.replace(/\D/g, "");
  if (!d) return { ok: false, motivo: "sin número" };

  // Número del exterior: ya trae el código de país, se usa como está.
  if (esInternacional(original)) {
    if (original.startsWith("00")) d = d.slice(2);
    const ok = d.length >= 8 && d.length <= 15; // rango del estándar E.164
    return { ok, digits: d, internacional: true, motivo: ok ? null : "longitud inusual" };
  }

  // Desde acá se asume argentino.
  if (d.startsWith("54")) d = d.slice(2);   // país
  if (d.startsWith("9")) d = d.slice(1);    // móvil
  if (d.startsWith("0")) d = d.slice(1);    // 0 de larga distancia

  // El "15" va después del código de área y no se usa en formato
  // internacional: 11 15 6938 1444 → 11 6938 1444
  if (d.length === 12) {
    for (const largoArea of [2, 3, 4]) {
      if (d.slice(largoArea, largoArea + 2) === "15") {
        d = d.slice(0, largoArea) + d.slice(largoArea + 2);
        break;
      }
    }
  }

  // Un celular argentino son 10 dígitos: área (2 a 4) + abonado.
  if (d.length !== 10) {
    return {
      ok: false,
      digits: d,
      internacional: false,
      motivo: d.length < 10 ? "faltan dígitos" : "sobran dígitos",
    };
  }

  return { ok: true, digits: `549${d}`, internacional: false };
}

export function linkWhatsApp(phone) {
  const { digits } = normalizarCelular(phone);
  return `https://wa.me/${digits || String(phone || "").replace(/\D/g, "")}`;
}

export const celularValido = (phone) => normalizarCelular(phone).ok;
