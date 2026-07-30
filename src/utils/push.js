import { supabase } from "../supabase";

// Clave pública VAPID: es pública por diseño, va en el frontend.
const VAPID_PUBLIC_KEY = "BK5G_mUoa0Nn9m7sk1MGssLDxpAYnEPVMRok3wCQWjSrax6EUY7SIoFmDOGwDvF0meG5nG7bbxldFreWyuNX9J8";

const base64ToUint8Array = (base64) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
};

export const pushSoportado = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const permisoActual = () =>
  typeof Notification !== "undefined" ? Notification.permission : "unsupported";

// Comprueba si este dispositivo ya está registrado para recibir avisos.
export async function yaSuscripto() {
  if (!pushSoportado()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

export async function activarNotificaciones() {
  if (!pushSoportado()) {
    return { ok: false, error: "Este dispositivo o navegador no soporta notificaciones. En iPhone hay que abrir la app desde el ícono de la pantalla de inicio." };
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    return { ok: false, error: "No nos diste permiso para enviarte notificaciones. Podés habilitarlo desde los ajustes del teléfono." };
  }

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "Tenés que iniciar sesión." };

  const json = sub.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert({
    professional_id: session.user.id,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  }, { onConflict: "endpoint" });

  if (error) return { ok: false, error: "No se pudo guardar: " + error.message };
  return { ok: true };
}

export async function desactivarNotificaciones() {
  if (!pushSoportado()) return { ok: false };
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && await reg.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  }
  return { ok: true };
}
