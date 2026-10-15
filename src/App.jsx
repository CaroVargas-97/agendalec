import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./supabase";
import Login from "./pages/internal/Login";
import Registro from "./pages/internal/Registro";
import Layout from "./components/internal/Layout";
// Carga diferida: cada pantalla baja su propio pedazo solo cuando se abre,
// en vez de que todo (panel + reserva) venga en un solo archivo gigante.
// Así la primera carga —sobre todo la reserva pública— es mucho más liviana.
const Dashboard = lazy(() => import("./pages/internal/Dashboard"));
const Agenda = lazy(() => import("./pages/internal/Agenda"));
const Configuracion = lazy(() => import("./pages/internal/Configuracion"));
const Clientes = lazy(() => import("./pages/internal/Clientes"));
const Cobros = lazy(() => import("./pages/internal/Cobros"));
const Estadisticas = lazy(() => import("./pages/internal/Estadisticas"));
const Grupales = lazy(() => import("./pages/internal/Grupales"));
const Limpiezas = lazy(() => import("./pages/internal/Limpiezas"));
const Reserva = lazy(() => import("./pages/public/Reserva"));
const Saldo = lazy(() => import("./pages/public/Saldo"));
const Terminos = lazy(() => import("./pages/public/Terminos"));
const ResetPassword = lazy(() => import("./pages/internal/ResetPassword"));

const Cargando = () => (
  <div style={{ minHeight: "100vh", background: "#F8F4FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <div style={{ color: "#9B72C0", fontSize: "14px" }}>Cargando...</div>
  </div>
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Al tocar una notificación push, el service worker abre/navega acá con
  // ?page=agenda&turno=<id> — se lee una sola vez al cargar para saber a
  // qué pantalla (y qué turno abrir dentro de ella) hay que ir de una.
  const paramsIniciales = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(paramsIniciales.get("page") || "dashboard");
  const [deepLinkTurno, setDeepLinkTurno] = useState(paramsIniciales.get("turno"));
  const [authPage, setAuthPage] = useState("login");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Una vez logueada, se precargan en segundo plano los "pedazos" de cada
  // sección del panel (sin frenar la carga inicial), así cambiar de sección
  // es instantáneo en vez de bajar el pedazo recién al hacer clic.
  useEffect(() => {
    if (!session) return;
    const precargar = () => {
      import("./pages/internal/Agenda");
      import("./pages/internal/Cobros");
      import("./pages/internal/Clientes");
      import("./pages/internal/Estadisticas");
      import("./pages/internal/Grupales");
      import("./pages/internal/Limpiezas");
      import("./pages/internal/Configuracion");
    };
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(precargar);
    return () => cancel(id);
  }, [session]);

  // Si la app ya estaba abierta cuando llega una notificación, el service
  // worker no navega la pestaña por su cuenta (Safari/iOS lo ignora) —
  // en cambio manda este mensaje y acá se cambia de pantalla a mano.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event) => {
      if (event.data?.type !== "agendalec-navigate") return;
      const params = new URLSearchParams(event.data.url?.split("?")[1] || "");
      setPage(params.get("page") || "dashboard");
      setDeepLinkTurno(params.get("turno"));
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  const path = window.location.pathname;
  const publica = path === "/reservar" ? <Reserva />
    : path === "/saldo" ? <Saldo />
    : path === "/terminos" ? <Terminos />
    : path === "/reset-password" ? <ResetPassword />
    : null;
  if (publica) return <Suspense fallback={<Cargando />}>{publica}</Suspense>;

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
            <img src="/logo-flower.png" alt="" style={{ width: "56px", height: "56px", marginBottom: "8px" }} />
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
    if (page === "agenda") return <Agenda setPage={setPage} deepLinkTurno={deepLinkTurno} />;
    if (page === "config") return <Configuracion setPage={setPage} />;
    if (page === "clientes") return <Clientes setPage={setPage} />;
    if (page === "cobros") return <Cobros setPage={setPage} />;
    if (page === "estadisticas") return <Estadisticas setPage={setPage} />;
    if (page === "grupales") return <Grupales setPage={setPage} />;
    if (page === "limpiezas") return <Limpiezas setPage={setPage} />;
    return <Dashboard setPage={setPage} />;
  };

  return (
    <Layout page={page} setPage={setPage}>
      <Suspense fallback={<Cargando />}>
        {renderPage()}
      </Suspense>
    </Layout>
  );
}

export default App;