// Confirma que la request trae un token de sesión válido de un profesional
// logueado. Se usa en endpoints internos que antes no chequeaban nada.
export async function requireProfesional(req, supabase) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (perfil?.role !== "professional") return null;
  return user;
}

// Para los cron jobs: Vercel manda este header automáticamente en cada
// corrida programada si existe la env var CRON_SECRET. Cualquier otra
// request (sin ese secreto) se rechaza.
export function requireCron(req) {
  if (!process.env.CRON_SECRET) return true; // sin secreto configurado, no bloquea (ver aviso en Vercel)
  return req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
}
