import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const styles = {
  container: { minHeight: "100vh", background: "#F8F4FC", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  wrapper: { width: "100%", maxWidth: "380px" },
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: { fontSize: "24px", fontWeight: "500", color: "#3B2460", marginBottom: "4px" },
  sub: { fontSize: "14px", color: "#B89FD0" },
  card: { background: "#fff", borderRadius: "16px", border: "0.5px solid #E0D0F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: { fontSize: "13px", padding: "10px 12px", border: "0.5px solid #E0D0F0", borderRadius: "8px", color: "#2A1845", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btn: { width: "100%", padding: "12px", background: "#9B72C0", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  error: { fontSize: "12px", color: "#A32D2D" },
  success: { fontSize: "14px", color: "#3B6D11", textAlign: "center" },
};

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError("Error al actualizar la contraseña. Intentá de nuevo.");
    else setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.success}>¡Contraseña actualizada! Ya podés ingresar con tu nueva contraseña.</div>
            <button style={styles.btn} onClick={() => window.location.href = "/"}>Ir al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={styles.container}>
        <div style={{ color: "#9B72C0", fontSize: "14px" }}>Verificando link...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.logo}>🗓 AgendaLec</div>
          <div style={styles.sub}>Nueva contraseña</div>
        </div>
        <div style={styles.card}>
          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={styles.field}>
              <label style={styles.label}>Nueva contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirmar contraseña</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={styles.input} required />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
