'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadImagen, deleteImagenFromStorage } from '@/lib/supabase/upload-image';

interface ImageUploaderProps {
  imagenes: string[];
  onChange: (urls: string[]) => void;
  error?: string;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ImageUploader({ imagenes, onChange, error, onUploadingChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

// Procesar archivos (tanto por input click como por Drag & Drop)
  const processFiles = async (fileList: File[]) => {
    if (!fileList || fileList.length === 0) return;

    // Filtrar solo imágenes
    const validImages = fileList.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) return;

    setIsUploading(true);
    onUploadingChange?.(true);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < validImages.length; i++) {
      const file = validImages[i];
      setUploadProgress(`Comprimiendo y subiendo ${i + 1} de ${validImages.length}...`);

      const url = await uploadImagen(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    // Filtrar placeholder previo si existía
    const prevImages = imagenes.filter((img) => img !== '/images/placeholder.png');
    onChange([...prevImages, ...uploadedUrls]);

    setIsUploading(false);
    onUploadingChange?.(false);
    setUploadProgress(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset
    }
  };

  // --- EVENTOS DRAG AND DROP ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleRemove = async (indexToRemove: number) => {
    const urlToRemove = imagenes[indexToRemove];
    
    // Si es una imagen subida a Supabase, la borramos del bucket
    if (urlToRemove.includes('supabase.co')) {
      await deleteImagenFromStorage(urlToRemove);
    }

    const updated = imagenes.filter((_, idx) => idx !== indexToRemove);
    onChange(updated.length > 0 ? updated : []);
  };

  const handleSetPortada = (indexToSet: number) => {
    if (indexToSet === 0) return;
    const selected = imagenes[indexToSet];
    const rest = imagenes.filter((_, idx) => idx !== indexToSet);
    onChange([selected, ...rest]); // Pone la seleccionada al principio
  };

  return (
    <div className="space-y-4">
      {/* BOTÓN DE CARGA Y DROPZONE */}
      <div onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop} 
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
        error ? 'border-red-400 bg-red-50/20' : 'border-slate-300 hover:border-brand-orange bg-slate-50/50'
      }`}>
        <input
          type="file"
          id="image-upload-input"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        <label
          htmlFor="image-upload-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center text-2xl">
            {isDragging ? '📥' : '📷'}
          </div>
          <div>
            <span className="font-bold text-slate-800 hover:underline">
              {isDragging ? '¡Soltá las imágenes acá!' : 'Hacé clic para seleccionar fotos'}
            </span>
            {!isDragging && <span className="text-slate-500 text-sm"> o arrastralas a esta zona</span>}
          </div>
          <p className="text-xs text-slate-400">
            Soporta JPG, PNG, WEBP. Se comprimen automáticamente a WebP antes de subirse.
          </p>
        </label>

        {isUploading && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold rounded-xl animate-pulse">
            ⏳ {uploadProgress}
          </div>
        )}
      </div>

      {error && <span className="text-xs font-semibold text-red-500 block">❌ {error}</span>}

      {/* GRILLA DE PREVIEWS */}
      {imagenes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Galería Cargada ({imagenes.length} {imagenes.length === 1 ? 'foto' : 'fotos'})
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {imagenes.map((url, idx) => {
              const isPortada = idx === 0;
              const displayUrl = url;

              return (
                <div
                  key={`${url}-${idx}`}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 shadow-sm ${
                    isPortada ? 'border-brand-orange ring-2 ring-orange-200' : 'border-slate-200 bg-slate-100'
                  }`}
                >
                  <Image
                    src={displayUrl}
                    alt={`Preview ${idx}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />

                  {/* BADGE PORTADA */}
                  {isPortada && (
                    <span className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow">
                      ⭐ Portada
                    </span>
                  )}

                  {/* ACCIONES HOVER */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {!isPortada && (
                      <button
                        type="button"
                        onClick={() => handleSetPortada(idx)}
                        className="w-full py-1 text-[11px] font-bold bg-white text-slate-800 rounded-lg hover:bg-slate-100 shadow"
                      >
                        Hacer Portada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="w-full py-1 text-[11px] font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                    >
                      Eliminar 🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}