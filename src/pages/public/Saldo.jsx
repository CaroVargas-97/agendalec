import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const s = {
  wrap: { minHeight: "100vh", background: "#F3EEFF", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 1rem" },
  header: { width: "100%", maxWidth: "440px", marginBottom: "1.5rem" },
  logo: { fontSize: "17px", fontWeight: "500", color: "#3B2460" },
  logoSub: { fontSize: "10px", color: "#9B72C0", marginTop: "1px" },
  card: { background: "#fff", borderRadius: "20px", border: "0.5px solid #E0D0F0", padding: "1.5rem", width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 8px 32px rgba(42,24,69,0.10)" },
  title: { fontSize: "17px", fontWeight: "500", color: "#2A1845" },
  sub: { fontSize: "13px", color: "#9B72C0", marginTop: "2px" },
  resumenBox: { background: "#F8F4FC", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", border: "0.5px solid #EDE8FA" },
  resRow: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  resLabel: { color: "#9B72C0" },
  resValor: { color: "#2A1845", fontWeight: "500" },
  aliasBox: { background: "#EDE8FA", borderRadius: "12px", padding: "14px", textAlign: "center" },
  aliasTitulo: { fontSize: "12px", color: "#5C3F99", fontWeight: "500" },
  aliasValor: { fontSize: "17px", fontWeight: "600", color: "#3B2460", marginTop: "4px" },
  aliasCopy: { fontSize: "11px", color: "#9B72C0", marginTop: "6px", cursor: "pointer", textDecoration: "underline" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "11px", color: "#B89FD0", textTransform: "uppercase", letterSpacing: "0.4px" },
  fileBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", border: "0.5px solid #E0D0F0", borderRadius: "10px", background: "#fff", cursor: "pointer" },
  btnConfirmar: { width: "100%", padding: "13px", background: "#3B2460", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 14px rgba(59,36,96,0.3)" },
  error: { fontSize: "13px", color: "#A32D2D", textAlign: "center" },
};

const symFor = (cur) => cur === "USD" ? "U$S " : cur === "EUR" ? "€" : "$";

export default function Saldo() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [listo, setListo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const pagoId = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!pagoId) { setError("Este link no es válido."); setLoading(false); return; }
    supabase.rpc("obtener_info_saldo", { p_payment_id: pagoId }).then(({ data, error }) => {
      if (error || !data || data.length === 0) {
        setError("No encontramos este saldo — puede que ya esté confirmado, o el link esté vencido. Consultá con Espacio Lec.");
        setLoading(false);
        return;
      }
      setInfo(data[0]);
      setListo(data[0].ya_tiene_comprobante);
      setLoading(false);
    });
  }, [pagoId]);

  const copiarAlias = () => {
    navigator.clipboard.writeText(info.alias);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const confirmar = async () => {
    if (!comprobante) return;
    setSubiendo(true);
    setError("");
    const ext = comprobante.name.split(".").pop();
    const { data: uploadData, error: errUpload } = await supabase.storage
      .from("comprobantes")
      .upload(`${info.appointment_id}-saldo.${ext}`, comprobante, { contentType: comprobante.type, upsert: true });
    if (errUpload) { setError("No se pudo subir el archivo: " + errUpload.message); setSubiendo(false); return; }

    const { data: { publicUrl: rawUrl } } = supabase.storage.from("comprobantes").getPublicUrl(uploadData.path);
    const publicUrl = `${rawUrl}?t=${Date.now()}`;

    const { data: ok, error: errRpc } = await supabase.rpc("adjuntar_comprobante", { p_payment_id: pagoId, p_receipt_url: publicUrl });
    if (errRpc || !ok) { setError("No se pudo guardar el comprobante. Probá de nuevo."); setSubiendo(false); return; }

    setListo(true);
    setSubiendo(false);
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo-flower.png" alt="" style={{ width: "22px", height: "22px" }} />
          <div>
            <div style={s.logo}>Espacio Lec</div>
            <div style={s.logoSub}>Confirmación de saldo</div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "1rem", color: "#9B72C0", fontSize: "13px" }}>Cargando...</div>
        ) : error ? (
          <div style={s.error}>{error}</div>
        ) : listo ? (
          <>
            <div style={{ fontSize: "32px", textAlign: "center" }}>✓</div>
            <div style={{ ...s.title, textAlign: "center" }}>¡Comprobante recibido!</div>
            <div style={{ ...s.sub, textAlign: "center" }}>Gracias {info.cliente?.split(" ")[0]}, ya lo vamos a confirmar. ¡Te esperamos! 🤍</div>
          </>
        ) : (
          <>
            <div>
              <div style={s.title}>Hola {info.cliente?.split(" ")[0]}! 👋</div>
              <div style={s.sub}>Confirmá el pago del saldo de tu turno</div>
            </div>

            <div style={s.resumenBox}>
              <div style={s.resRow}><span style={s.resLabel}>Servicio</span><span style={s.resValor}>{info.servicio}</span></div>
              <div style={s.resRow}><span style={s.resLabel}>Saldo a transferir</span><span style={s.resValor}>{symFor(info.moneda)}{parseFloat(info.monto).toLocaleString("es-AR")}</span></div>
            </div>

            <div style={s.aliasBox}>
              <div style={s.aliasTitulo}>Transferí al alias</div>
              <div style={s.aliasValor}>{info.alias}</div>
              <div style={s.aliasCopy} onClick={copiarAlias}>{copiado ? "✓ Copiado!" : "Copiar alias"}</div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Comprobante de transferencia</label>
              <label style={{ ...s.fileBtn, borderColor: comprobante ? "#9B72C0" : "#E0D0F0", background: comprobante ? "#F3EEFA" : "#fff" }}>
                <span style={{ fontSize: "18px" }}>{comprobante ? "✅" : "📎"}</span>
                <span style={{ fontSize: "13px", color: comprobante ? "#5C3F99" : "#B89FD0", flex: 1 }}>
                  {comprobante ? comprobante.name : "Adjuntar captura o PDF"}
                </span>
                <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => setComprobante(e.target.files[0] || null)} />
              </label>
            </div>

            {error && <div style={s.error}>{error}</div>}

            <button style={{ ...s.btnConfirmar, opacity: subiendo ? 0.7 : 1 }} disabled={subiendo} onClick={confirmar}>
              {subiendo ? "Enviando..." : "✓ Confirmar pago"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
