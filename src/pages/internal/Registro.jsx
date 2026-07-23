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
    width: "100%",
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
  },
  link: { textAlign: "center", fontSize: "13px", color: "#9B72C0", cursor: "pointer", marginTop: "4px" },
  error: { fontSize: "12px", color: "#A32D2D" },
  success: { fontSize: "12px", color: "#3B6D11", background: "#EAF3DE", padding: "10px 12px", borderRadius: "8px" },
};

export default function Registro({ onLogin }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: cfg } = await supabase.from("app_config").select("value").eq("key", "invite_code").maybeSingle();
    if (!cfg?.value || codigo.trim() !== cfg.value.trim()) {
      setError("Código de acceso incorrecto.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombre } }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Guardar perfil directamente
    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: nombre,
        email: email,
        role: "professional"
      }, { onConflict: "id" });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", ...styles.logo }}>
            <img src="/logo-flower.png" alt="" style={{ width: "26px", height: "26px" }} />
            AgendaLec
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.success}>
            ✅ ¡Cuenta creada! Revisá tu mail para confirmar tu cuenta y después podés ingresar.
          </div>
          <button style={styles.btn} onClick={onLogin}>Ir al login</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", ...styles.logo }}>
            <img src="/logo-flower.png" alt="" style={{ width: "26px", height: "26px" }} />
            AgendaLec
          </div>
          <div style={styles.sub}>Creá tu cuenta de profesional</div>
        </div>
        <div style={styles.card}>
          <form onSubmit={handleRegistro} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Maru González"
                style={styles.input}
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                style={styles.input}
                required
                minLength={6}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Código de acceso</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ingresá el código"
                style={styles.input}
                required
              />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <div style={styles.link} onClick={onLogin}>¿Ya tenés cuenta? Ingresá →</div>
        </div>
      </div>
    </div>
  );
}