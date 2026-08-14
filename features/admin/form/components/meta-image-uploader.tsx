'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadImagen, deleteImagenFromStorage } from '@/lib/supabase/upload-image';

interface MetaImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function MetaImageUploader({ value, onChange }: MetaImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      const url = await uploadImagen(file);
      if (url) onChange(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value && value.includes('supabase.co')) {
      await deleteImagenFromStorage(value);
    }
    onChange(null);
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
      <div>
        <span className="font-bold text-xs text-slate-800 block">
          📷 Imagen Especial para Meta Ads / Instagram (Opcional)
        </span>
        <p className="text-[11px] text-slate-500">
          Subí una imagen cuadrada (1:1) o bien centrada. Si la dejás vacía, Meta usarás la foto de portada normal.
        </p>
      </div>

      {value ? (
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500 shadow-sm shrink-0">
            <Image src={value} alt="Meta Preview" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition"
          >
            Quitar Imagen
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id="meta-image-input"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <label
            htmlFor="meta-image-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs transition"
          >
            {isUploading ? '⏳ Subiendo...' : '➕ Cargar Imagen Cuadrada Meta'}
          </label>
        </div>
      )}
    </div>
  );
}