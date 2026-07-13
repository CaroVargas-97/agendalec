import { useState } from "react";
import { supabase } from "../../supabase";

const styles = {
  container: {
    minHeight: "100vh",
    background: "#F8F4FC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  wrapper: { width: "100%", maxWidth: "380px" },
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: { fontSize: "24px", fontWeight: "500", color: "#3B2460", marginBottom: "4px" },
  sub: { fontSize: "14px", color: "#B89FD0" },
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "0.5px solid #E0D0F0",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", color: "#9B72C0" },
  input: {
    fontSize: "13px",
    padding: "10px 12px",
    border: "0.5px solid #E0D0F0",
    borderRadius: "8px",
    color: "#2A1845",
    outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#9B72C0",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginTop: "4px",
  },
  link: { textAlign: "center", fontSize: "13px", color: "#9B72C0", cursor: "pointer", marginTop: "4px" },
  error: { fontSize: "12px", color: "#A32D2D" },
};

export default function Login({ onRegistro, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email o contraseña incorrectos");
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) setError("No se pudo enviar el mail. Verificá el email.");
    else setResetSent(true);
    setLoading(false);
  };

  if (resetMode) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.header}>
            <div style={styles.logo}>🗓 AgendaLec</div>
            <div style={styles.sub}>Recuperar contraseña</div>
          </div>
          <div style={styles.card}>
            {resetSent ? (
              <>
                <div style={{ fontSize: "14px", color: "#3B6D11", textAlign: "center" }}>
                  Te mandamos un mail a <strong>{email}</strong> con el link para resetear tu contraseña.
                </div>
                <div style={styles.link} onClick={() => { setResetMode(false); setResetSent(false); }}>← Volver al login</div>
              </>
            ) : (
              <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@mail.com"
                    style={styles.input}
                    required
                  />
                </div>
                {error && <div style={styles.error}>{error}</div>}
                <button type="submit" disabled={loading} style={styles.btn}>
                  {loading ? "Enviando..." : "Enviar link de recuperación"}
                </button>
                <div style={styles.link} onClick={() => setResetMode(false)}>← Volver al login</div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.logo}>🗓 AgendaLec</div>
          <div style={styles.sub}>Ingresá a tu cuenta</div>
        </div>
        <div style={styles.card}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@mail.com"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div style={styles.link} onClick={() => setResetMode(true)}>¿Olvidaste tu contraseña?</div>
          {onBack && <div style={{ ...styles.link, marginTop: "0" }} onClick={onBack}>← Volver al inicio</div>}
          <div style={styles.link} onClick={onRegistro}>¿No tenés cuenta? Registrate →</div>
        </div>
      </div>
    </div>
  );
}