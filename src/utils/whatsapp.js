// Normaliza un celular argentino al formato que necesita WhatsApp:
// 54 9 + código de área + número, sin el 0 ni el 15.
//
// La gente los anota de mil formas ("011 15-6938-1444", "+54 9 11...",
// "15 6938 1444"), así que hay que limpiarlos antes de armar el link. Y si
// después de limpiar no da un celular válido, conviene avisar en vez de
// generar un link roto que WhatsApp rechaza con "el número no existe".
export function normalizarCelular(phone) {
  let d = String(phone || "").replace(/\D/g, "");
  if (!d) return { ok: false, motivo: "sin número" };

  if (d.startsWith("00")) d = d.slice(2);   // prefijo internacional
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
      motivo: d.length < 10 ? "faltan dígitos" : "sobran dígitos",
    };
  }

  return { ok: true, digits: d };
}

export function linkWhatsApp(phone) {
  const { digits } = normalizarCelular(phone);
  // Si el número no es válido igual se arma el link con lo que haya: es
  // preferible que abra WhatsApp a que el botón no haga nada. El aviso de
  // que el número está mal se muestra aparte, al lado del teléfono.
  return `https://wa.me/549${digits || String(phone || "").replace(/\D/g, "")}`;
}

export const celularValido = (phone) => normalizarCelular(phone).ok;
