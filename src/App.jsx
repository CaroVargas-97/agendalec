import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./pages/internal/Login";
import Registro from "./pages/internal/Registro";
import Dashboard from "./pages/internal/Dashboard";
import Agenda from "./pages/internal/Agenda";
import Configuracion from "./pages/internal/Configuracion";
import Clientes from "./pages/internal/Clientes";
import Cobros from "./pages/internal/Cobros";
import Estadisticas from "./pages/internal/Estadisticas";
import Reserva from "./pages/public/Reserva";
import Terminos from "./pages/public/Terminos";
import Layout from "./components/internal/Layout";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [authPage, setAuthPage] = useState("login");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const path = window.location.pathname;
  if (path === "/reservar") return <Reserva />;
  if (path === "/terminos") return <Terminos />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F8F4FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ color: "#9B72C0", fontSize: "14px" }}>Cargando...</div>
    </div>
  );

  if (!session) {
    if (authPage === "registro") return <Registro onLogin={() => setAuthPage("login")} />;
    if (showLogin) return <Login onRegistro={() => setAuthPage("registro")} onBack={() => setShowLogin(false)} />;
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <div>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗓</div>
            <div style={{ fontSize: "22px", fontWeight: "600", color: "#2A1845" }}>AgendaLec</div>
            <div style={{ fontSize: "14px", color: "#B89FD0", marginTop: "4px" }}>Gestión de turnos</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "260px" }}>
            <a href="/reservar" style={{ display: "block", padding: "14px", background: "#9B72C0", color: "#fff", borderRadius: "12px", fontSize: "15px", fontWeight: "500", textDecoration: "none", textAlign: "center" }}>
              Reservar un turno
            </a>
            <button onClick={() => setShowLogin(true)} style={{ padding: "14px", background: "#fff", color: "#9B72C0", border: "0.5px solid #D0B8E8", borderRadius: "12px", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Soy profesional
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (page === "agenda") return <Agenda setPage={setPage} />;
    if (page === "config") return <Configuracion setPage={setPage} />;
    if (page === "clientes") return <Clientes setPage={setPage} />;
    if (page === "cobros") return <Cobros setPage={setPage} />;
    if (page === "estadisticas") return <Estadisticas setPage={setPage} />;
    return <Dashboard setPage={setPage} />;
  };

  return (
    <Layout page={page} setPage={setPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;