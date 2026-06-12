const s = {
  wrap: { minHeight: "100vh", background: "#F8F4FC", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: "600px" },
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: { fontSize: "20px", fontWeight: "500", color: "#3B2460", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#9B72C0" },
  card: { background: "#fff", borderRadius: "16px", border: "0.5px solid #E0D0F0", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "18px", fontWeight: "500", color: "#2A1845" },
  fecha: { fontSize: "12px", color: "#B89FD0" },
  h2: { fontSize: "14px", fontWeight: "500", color: "#3B2460", marginTop: "4px" },
  p: { fontSize: "13px", color: "#5C3F99", lineHeight: 1.6 },
  highlight: { background: "#F3EEFA", padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #9B72C0", fontSize: "13px", color: "#3B2460" },
  highlightRosa: { background: "#FDE8F0", padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #E88BB0", fontSize: "13px", color: "#A0407A" },
  link: { fontSize: "13px", color: "#9B72C0", cursor: "pointer", textAlign: "center", marginTop: "8px" },
  footer: { textAlign: "center", fontSize: "11px", color: "#B89FD0", marginTop: "1.5rem" },
};

export default function Terminos() {
  return (
    <div style={s.wrap}>
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.logo}>🗓 AgendaLec</div>
          <div style={s.sub}>Términos y Condiciones</div>
        </div>

        <div style={s.card}>
          <div style={s.title}>Términos y Condiciones de Uso</div>
          <div style={s.fecha}>Última actualización: junio 2026</div>

          <div style={s.h2}>Reservas y pagos</div>
          <div style={s.p}>Al reservar, la persona abona el 50% como seña. El saldo restante debe pagarse dentro de las 12 horas previas al turno mediante transferencia bancaria o Mercado Pago según indique el profesional.</div>

          <div style={s.h2}>Cancelación por la persona</div>
          <div style={s.highlight}>
            Con <strong>más de 24hs</strong> de anticipación → reembolso completo de la seña.<br />
            Con <strong>menos de 24hs</strong> → sin reembolso.
          </div>

          <div style={s.h2}>Cancelación por el profesional</div>
          <div style={s.highlightRosa}>
            Si el profesional cancela (por enfermedad u otro motivo), la persona puede elegir: <strong>reprogramar</strong> o recibir el <strong>reembolso completo</strong> de la seña, sin importar el plazo.
          </div>

          <div style={s.h2}>Datos personales</div>
          <div style={s.p}>Los datos (nombre y celular) se usan solo para gestionar los turnos, bajo la Ley 25.326 de Protección de Datos Personales de Argentina. No se comparten con terceros.</div>

          <div style={s.h2}>Personas del exterior</div>
          <div style={s.p}>Para pagos en moneda extranjera, el profesional coordina el medio de pago directamente por WhatsApp.</div>

          <div style={s.link} onClick={() => window.history.back()}>← Volver</div>
        </div>

        <div style={s.footer}>© 2026 AgendaLec. Todos los derechos reservados.</div>
      </div>
    </div>
  );
}
