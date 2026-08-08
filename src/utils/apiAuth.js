import { supabase } from "../supabase";

// Header de autorización para llamar a los endpoints internos (/api/*) que
// verifican sesión del lado del servidor.
export async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` };
}
