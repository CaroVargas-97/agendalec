import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ error: "Faltan campos obligatorios" });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return res.status(400).json({ error: error.message });

    const uid = data.user.id;
    await supabase.from("profiles").insert({ id: uid, full_name: nombre, email, role: "professional" });
    await supabase.from("settings").insert({ professional_id: uid });

    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Falta el id" });

    const { data: appts } = await supabase.from("appointments").select("id").eq("professional_id", id);
    const apptIds = (appts || []).map(a => a.id);
    if (apptIds.length > 0) await supabase.from("payments").delete().in("appointment_id", apptIds);
    await supabase.from("appointments").delete().eq("professional_id", id);
    await supabase.from("services").delete().eq("professional_id", id);
    await supabase.from("availability").delete().eq("professional_id", id);
    await supabase.from("settings").delete().eq("professional_id", id);
    await supabase.from("profiles").delete().eq("id", id);
    await supabase.auth.admin.deleteUser(id);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
