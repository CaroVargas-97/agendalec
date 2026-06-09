import { useState } from "react";
import { supabase } from "../../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email o contraseña incorrectos");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F4FC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-medium text-[#3B2460] mb-1">AgendaLec</div>
          <div className="text-sm text-[#B89FD0]">Ingresá a tu cuenta</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E0D0F0] p-6 flex flex-direction-col gap-4">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#9B72C0]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@mail.com"
                className="text-sm px-3 py-2 border border-[#E0D0F0] rounded-lg text-[#2A1845] focus:outline-none focus:border-[#9B72C0]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#9B72C0]">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="text-sm px-3 py-2 border border-[#E0D0F0] rounded-lg text-[#2A1845] focus:outline-none focus:border-[#9B72C0]"
                required
              />
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#9B72C0] text-white rounded-lg text-sm font-medium hover:bg-[#7B5EA7] transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}