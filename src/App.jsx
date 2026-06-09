import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./pages/internal/Login";
import Dashboard from "./pages/internal/Dashboard";
import Agenda from "./pages/internal/Agenda";
import Configuracion from "./pages/internal/Configuracion";
import Clientes from "./pages/internal/Clientes";
import Cobros from "./pages/internal/Cobros";
import Reserva from "./pages/public/Reserva";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // App pública — sin login
  const isPublic = window.location.pathname === "/reservar";
  if (isPublic) return <Reserva />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F8F4FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ color: "#9B72C0", fontSize: "14px" }}>Cargando...</div>
    </div>
  );

  if (!session) return <Login />;
  if (page === "agenda") return <Agenda setPage={setPage} />;
  if (page === "config") return <Configuracion setPage={setPage} />;
  if (page === "clientes") return <Clientes setPage={setPage} />;
  if (page === "cobros") return <Cobros setPage={setPage} />;
  return <Dashboard setPage={setPage} />;
}

export default App;