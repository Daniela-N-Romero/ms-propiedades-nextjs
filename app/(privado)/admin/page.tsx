'use client';
import { useAlertModal } from '@/components/hooks/use-alert-modal';
import { AlertModal } from '@/components/ui/alert-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
//TO DO: SEPARAR ESTILOS? 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminHomePage() {
  const router = useRouter();
  const [loadingLogout, setLoadingLogout] = useState(false);

  // Manejo de Logout
  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoadingLogout(false);
    }
  };
  const { alertState, showAlert, closeAlert } = useAlertModal();
  return (
    <>
      {/* 1. NAVBAR DE ADMINISTRACIÓN */}
      <nav className="bg-slate-900 text-white mb-8 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-dark border border-slate-700 text-white font-extrabold rounded-xl flex items-center justify-center text-sm shadow-sm">
              MS
            </div>
            <div>
              <span className="font-spartan font-bold text-base block leading-tight">
                MS Propiedades
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-semibold">
                Panel Interno
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">
              👋 Hola, Admin
            </span>
            <button
              onClick={handleLogout}
              disabled={loadingLogout}
              className="px-3.5 py-2 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-200 text-xs font-spartan font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
            >
              {loadingLogout ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. CONTENIDO PRINCIPAL (HUB DE CARDS) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-spartan text-slate-800">
            ¿Qué deseas gestionar hoy?
          </h1>
          <p className="text-xs text-slate-500">
            Seleccioná una de las herramientas operativas para comenzar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* TARJETA 1: PROPIEDADES (La principal) */}
          <Link
            href="/admin/dashboard"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3 text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-105 transition-transform">
                🏠
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                Propiedades
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ver listado completo, cargar nuevas propiedades, editar precios, imágenes y estados de publicación.
              </p>
            </div>
            <div className="mt-6">
              <span className="w-full py-2.5 bg-blue-600 group-hover:bg-blue-700 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl block text-center shadow-sm transition-colors">
                Ingresar al Dashboard
              </span>
            </div>
          </Link>

          {/* TARJETA 2: PROPIETARIOS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🧑
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900">
                Propietarios
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Base de datos de dueños, contactos telefónicos de WhatsApp y notas privadas de negociación.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => showAlert('Módulo de Propietarios en desarrollo', { type: 'info' })}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Gestionar Propietarios
              </button>
            </div>
          </div>

          {/* TARJETA 3: MAPA PRIVADO */}
          <Link
            href="/admin/mapa-privado"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group text-center"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-105 transition-transform">
                🗺️
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900 group-hover:text-purple-600 transition-colors">
                Mapa Privado
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visualización geográfica interna con discriminación de cartera propia vs inmuebles de colegas.
              </p>
            </div>
            <div className="mt-6">
              <span className="w-full py-2.5 bg-purple-600 group-hover:bg-purple-700 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl block text-center shadow-sm transition-colors">
                Ver Mapa Privado
              </span>
            </div>
          </Link>

          {/* TARJETA 4: GESTOR DE ARCHIVOS Y FICHAS (REEMPLAZA A EQUIPO/AGENTES) */}
          <Link
            href="/admin/archivos"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group text-center"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-105 transition-transform">
                📄
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors">
                Gestor de Archivos
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Buscador de PDFs adjuntos y generador de Ficha Blanca de Propiedad para colegas (sin logo).
              </p>
            </div>
            <div className="mt-6">
              <span className="w-full py-2.5 bg-amber-600 group-hover:bg-amber-700 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl block text-center shadow-sm transition-colors">
                Abrir Gestor
              </span>
            </div>
          </Link>

          {/* TARJETA 5: CONFIGURACIÓN */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                ⚙️
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900">
                Configuración
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ajustes del sistema, cambio de contraseña del agente y parámetros generales de la plataforma.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => showAlert('Módulo de Configuración en desarrollo', { type: 'info' })}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Ajustes Generales
              </button>
            </div>
          </div>

          {/* TARJETA 5: BLOG */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between text-center mb-5">
            <div className="space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                📘
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900">
                Blog
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Creación y edición de posts de información relacionados al rubro para genreación de SEO.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => showAlert('Módulo de Blog en desarrollo', { type: 'info' })}
                className="w-full py-2.5 bg-red-500 hover:bg-slate-900 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Gestionar Posts
              </button>
            </div>
          </div>

          {/* TARJETA 6: PUBLICIDAD Y CATÁLOGO META (NUEVA) */}
          <Link
            href="/admin/meta"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group text-center"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-105 transition-transform">
                🌐
              </div>
              <h3 className="font-spartan font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                Publicidad & Meta Feed
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sincronización automática de catálogo con Facebook e Instagram Ads, enlace de Scheduled Feed y reglas de publicación.
              </p>
            </div>
            <div className="mt-6">
              <span className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-spartan font-bold text-xs uppercase tracking-wider block rounded-xl transition-colors shadow-sm"
              >
                Configurar Feed Meta
              </span>
            </div>
          </Link>


        </div>
      </div>
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

    </>
  );
}