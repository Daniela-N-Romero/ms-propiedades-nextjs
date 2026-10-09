'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { EstadoPropiedadEnum } from '@/prisma/generated/enums';

interface PropertyActionsMenuProps {
  prop: {
    id: number;
    titulo: string;
    slug: string;
    status: EstadoPropiedadEnum;
    isPublished: boolean;
  };
  activeTab: 'activas' | 'papelera';
  copiedId: number | null;
  onCopyUrl: (e: React.MouseEvent) => void;
  onStatusChange: (id: number, newStatus: EstadoPropiedadEnum) => void;
  onSoftDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onRestore: (id: number) => void;
  onDeletePermanent: (id: number, titulo: string) => void;
}

export function PropertyActionsMenu({
  prop,
  activeTab,
  copiedId,
  onCopyUrl,
  onStatusChange,
  onSoftDelete,
  onDuplicate,
  onRestore,
  onDeletePermanent,
}: PropertyActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* BOTÓN TRES PUNTOS */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 hover:text-brand-dark transition-colors focus:outline-none"
        title="Opciones de propiedad"
      >
        <span className="text-lg font-black leading-none">⋮</span>
      </button>

      {/* MENÚ DESPLEGABLE */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-50 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-30 overflow-hidden divide-y divide-slate-100 text-xs font-spartan font-medium">
          {activeTab === 'activas' ? (
            <>
              {/* BLOQUE DE NAVEGACIÓN Y EDICIÓN */}
              <div className="py-1">
                <Link
                  href={`/admin/${prop.id}/editar`}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-sm">✏️</span> Editar propiedad
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onDuplicate(prop.id);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors font-bold"
                >
                  <span className="text-sm">📋</span> Duplicar (crear una copia)
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    setIsOpen(false);
                    onCopyUrl(e);
                  }}
                  disabled={!prop.isPublished}
                  className={`w-full text-left flex items-center gap-2.5 px-4 py-2 transition-colors font-bold ${
                    prop.isPublished
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-sm">
                    {copiedId === prop.id ? '✅' : prop.isPublished ? '🔗' : '🚫'}
                  </span>
                  {copiedId === prop.id ? '¡Copiado!' : prop.isPublished ? 'Copiar enlace web' : 'No publicada'}
                </button>
              </div>

              {/* BLOQUE: CAMBIAR ESTADO COMERCIAL */}
              <div className="py-1 bg-slate-50/50">
                <span className="block px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Marcar como:
                </span>
                <div className="grid grid-cols-1 px-1 gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStatusChange(prop.id, EstadoPropiedadEnum.disponible);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-bold text-[11px] ${
                      prop.status === EstadoPropiedadEnum.disponible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🟢 Disponible</span>
                    {prop.status === EstadoPropiedadEnum.disponible && <span>✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStatusChange(prop.id, EstadoPropiedadEnum.reservada);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-bold text-[11px] ${
                      prop.status === EstadoPropiedadEnum.reservada
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🟡 Reservada</span>
                    {prop.status === EstadoPropiedadEnum.reservada && <span>✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStatusChange(prop.id, EstadoPropiedadEnum.alquilada);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-bold text-[11px] ${
                      prop.status === EstadoPropiedadEnum.alquilada
                        ? 'bg-rose-100 text-rose-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🔴 Alquilada</span>
                    {prop.status === EstadoPropiedadEnum.alquilada && <span>✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStatusChange(prop.id, EstadoPropiedadEnum.vendida);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-bold text-[11px] ${
                      prop.status === EstadoPropiedadEnum.vendida
                        ? 'bg-rose-100 text-rose-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🔴 Vendida</span>
                    {prop.status === EstadoPropiedadEnum.vendida && <span>✓</span>}
                  </button>
                </div>
              </div>

              {/* BLOQUE: PAPELERA */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onSoftDelete(prop.id);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-amber-700 hover:bg-amber-50 transition-colors font-bold"
                >
                  <span className="text-sm">🗑️</span> Mover a papelera
                </button>
              </div>
            </>
          ) : (
            /* OPCIONES PAPELERA */
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onRestore(prop.id);
                }}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-emerald-700 hover:bg-emerald-50 transition-colors font-bold"
              >
                <span className="text-sm">♻️</span> Restaurar propiedad
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDeletePermanent(prop.id, prop.titulo);
                }}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-bold"
              >
                <span className="text-sm">❌</span> Eliminar definitivo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}