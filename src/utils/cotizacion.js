// Cotización del dólar blue y del euro, para convertir el precio de
// referencia en pesos de un servicio a la moneda en la que se cobra
// (USD/EUR), siempre con el valor del día en vez de un número fijo que
// queda desactualizado con el tiempo.
const CACHE_PREFIX = "agendalec_cotiz_";
const CACHE_MS = 30 * 60 * 1000;

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("respuesta no ok");
  return r.json();
}

function leerCache(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { valor, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_MS) return null;
    return valor;
  } catch {
    return null;
  }
}

function guardarCache(key, valor) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ valor, ts: Date.now() }));
  } catch {
    // sessionStorage no disponible (modo privado, etc.) — no pasa nada, se vuelve a pedir la próxima vez
  }
}

// Se usa "compra" (lo que le dan a Maru si después cambia esos dólares/euros
// a pesos) en vez de "venta", para no quedar corta del valor real en pesos
// por la diferencia entre puntas.
export async function obtenerCotizacionUSD() {
  const cache = leerCache("usd");
  if (cache) return cache;
  try {
    const d = await fetchJSON("https://dolarapi.com/v1/dolares/blue");
    if (d?.compra) { guardarCache("usd", d.compra); return d.compra; }
  } catch { /* sigue al fallback */ }
  try {
    const d = await fetchJSON("https://api.bluelytics.com.ar/v2/latest");
    const valor = d?.blue?.value_buy;
    if (valor) { guardarCache("usd", valor); return valor; }
  } catch { /* sin cotización disponible */ }
  return null;
}

export async function obtenerCotizacionEUR() {
  const cache = leerCache("eur");
  if (cache) return cache;
  try {
    const d = await fetchJSON("https://dolarapi.com/v1/cotizaciones/eur");
    if (d?.compra) { guardarCache("eur", d.compra); return d.compra; }
  } catch { /* sin cotización disponible */ }
  return null;
}
