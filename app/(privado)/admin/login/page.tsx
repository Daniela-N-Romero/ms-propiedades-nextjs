'use client';
//TO DO: SEPARAR ESTILOS? 


import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        
        {/* LOGO E IDENTIDAD DE MARCA */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-dark text-white font-extrabold rounded-2xl text-xl shadow-md">
            MS
          </div>
          <h1 className="text-2xl font-bold font-spartan text-slate-900">
            Panel de Control
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Acceso exclusivo para gestión inmobiliaria
          </p>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* FORMULARIO DE ACCESO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-spartan text-slate-700 uppercase tracking-wider mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: admin"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark text-sm transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-spartan text-slate-700 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark text-sm transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-dark hover:bg-slate-800 text-white font-spartan font-bold uppercase text-xs tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
}