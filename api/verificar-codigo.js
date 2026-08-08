import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// El código de invitación se compara acá, del lado del servidor: antes se
// leía directo de app_config con la clave pública, así que cualquiera podía
// pedirlo por REST sin sesión y quedarse con el código real.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { codigo } = req.body || {};
  if (!codigo) return res.status(400).json({ valido: false });

  const { data: cfg } = await supabase.from("app_config").select("value").eq("key", "invite_code").maybeSingle();
  const valido = !!cfg?.value && codigo.trim() === cfg.value.trim();

  return res.status(200).json({ valido });
}
