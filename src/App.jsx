import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./pages/internal/Login";
import Dashboard from "./pages/internal/Dashboard";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F8F4FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ color: "#9B72C0", fontSize: "14px" }}>Cargando...</div>
    </div>
  );

  if (!session) return <Login />;
  return <Dashboard />;
}

export default App;