'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadImagenAction } from '@/actions/upload-action';
import { deleteImagenAction } from '@/actions/delete-action';

export interface ImagenGaleriaItem {
  url: string;
  urlClean?: string;
}

interface ImageUploaderProps {
  imagenes: (string | ImagenGaleriaItem)[];
  onChange: (urls: (string | ImagenGaleriaItem)[]) => void;
  error?: string;
  onUploadingChange?: (isUploading: boolean) => void;
  folderId?: string;
}

// Función auxiliar para comprimir y reducir imágenes pesadas en el navegador
async function comprimirEnCliente(file: File, maxDim = 1920, quality = 0.85): Promise<File> {
  // Si pesa menos de 1 MB, no hace falta procesarla antes
  if (file.size < 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Escala conservando el aspect ratio si supera la resolución máxima
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Si falla la lectura, envía el original como fallback
    };

    img.src = objectUrl;
  });
}

export function ImageUploader({
  imagenes,
  onChange,
  error,
  onUploadingChange,
  folderId,
}: ImageUploaderProps) {
  const [selectedWatermark, setSelectedWatermark] = useState<'industrial' | 'general' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const processFiles = async (fileList: File[]) => {
    if (!selectedWatermark) return;
    if (!fileList || fileList.length === 0) return;

    const validImages = fileList.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) return;

    setIsUploading(true);
    onUploadingChange?.(true);
    setFailedImages([]);

    const newImages: { url: string; urlClean?: string }[] = [];
    const errors: string[] = [];

    for (let i = 0; i < validImages.length; i++) {
      const file = validImages[i];
      setUploadProgress(`Optimizando y subiendo ${i + 1} de ${validImages.length}: ${file.name}...`);

      try {
        // 1. Compresión previa en cliente si es pesada
        const processedFile = await comprimirEnCliente(file);

        // 2. Armado de payload
        const formData = new FormData();
        formData.append('file', processedFile);
        formData.append('folderId', folderId || '');
        formData.append('watermarkType', selectedWatermark);

        // 3. Envío al servidor
        const res = await uploadImagenAction(formData);

        if (res.success && res.data) {
          newImages.push(res.data);
        } else {
          errors.push(file.name);
        }
      } catch (err) {
        console.error(`Error al procesar ${file.name}:`, err);
        errors.push(file.name);
      }
    }

    if (errors.length > 0) {
      setFailedImages(errors);
    }

    const prevImages = imagenes.filter((img) => {
      const url = typeof img === 'string' ? img : img.url;
      return url !== '/images/placeholder.png';
    });

    onChange([...prevImages, ...newImages]);

    setIsUploading(false);
    onUploadingChange?.(false);
    setUploadProgress(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && selectedWatermark) {
      setIsDragging(true);
    }
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

    if (!selectedWatermark || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleRemove = async (indexToRemove: number) => {
    const itemToRemove = imagenes[indexToRemove];
    const urlToRemove = typeof itemToRemove === 'string' ? itemToRemove : itemToRemove.url;
    await deleteImagenAction(urlToRemove);

    const updated = imagenes.filter((_, idx) => idx !== indexToRemove);
    onChange(updated.length > 0 ? updated : []);
  };

  const handleSetPortada = (indexToSet: number) => {
    if (indexToSet === 0) return;
    const selected = imagenes[indexToSet];
    const rest = imagenes.filter((_, idx) => idx !== indexToSet);
    onChange([selected, ...rest]);
  };

  return (
    
    <div className="space-y-4">
      {/* Selector de marca de agua */}
      {/* 1. SELECTOR OBLIGATORIO DE MARCA DE AGUA */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          !selectedWatermark
            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              🏷️ Tipo de Marca de Agua
              {!selectedWatermark && (
                <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Requerido
                </span>
              )}
            </span>
            <p className="text-[11px] text-slate-500">
              Seleccioná qué logo estampar antes de subir los archivos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                selectedWatermark === 'industrial'
                  ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="watermarkTypeChoice"
                value="industrial"
                disabled={isUploading}
                checked={selectedWatermark === 'industrial'}
                onChange={() => setSelectedWatermark('industrial')}
                className="hidden"
              />
              🏭 MS Industrial
            </label>

            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                selectedWatermark === 'general'
                  ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="watermarkTypeChoice"
                value="general"
                disabled={isUploading}
                checked={selectedWatermark === 'general'}
                onChange={() => setSelectedWatermark('general')}
                className="hidden"
              />
              🏢 MS General (Neutra)
            </label>
          </div>
        </div>
      </div>

      {/* BOTÓN DE CARGA Y DROPZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          !selectedWatermark
            ? 'border-slate-200 bg-slate-100/60 cursor-not-allowed opacity-75'
            : error
            ? 'border-red-400 bg-red-50/20'
            : 'border-slate-300 hover:border-brand-orange bg-slate-50/50 cursor-pointer'
        }`}
      >
        <input
          type="file"
          id="image-upload-input"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={!selectedWatermark || isUploading}
          className="hidden"
        />

        <label
          htmlFor={selectedWatermark && !isUploading ? 'image-upload-input' : undefined}
          className={`flex flex-col items-center justify-center space-y-2 ${
            !selectedWatermark ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${
              !selectedWatermark
                ? 'bg-slate-200 text-slate-400'
                : 'bg-orange-100 text-brand-orange'
            }`}
          >
            {!selectedWatermark ? '🔒' : isDragging ? '📥' : '📷'}
          </div>

          <div>
            {!selectedWatermark ? (
              <span className="font-bold text-slate-500 text-sm">
                Elegí una marca de agua arriba para habilitar la carga
              </span>
            ) : (
              <>
                <span className="font-bold text-slate-800 hover:underline">
                  {isDragging ? '¡Soltá las imágenes acá!' : 'Hacé clic para seleccionar fotos'}
                </span>
                {!isDragging && (
                  <span className="text-slate-500 text-sm"> o arrastralas a esta zona</span>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">
            JPG, PNG o WEBP. Las imágenes pesadas se optimizan automáticamente antes de subir.
          </p>
        </label>

        {isUploading && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold rounded-xl animate-pulse">
            ⏳ {uploadProgress}
          </div>
        )}
      </div>

      {/* MENSAJES DE ERROR */}
      {error && <span className="text-xs font-semibold text-red-500 block">❌ {error}</span>}

      {failedImages.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
          <p className="font-bold">⚠️ No se pudieron subir las siguientes imágenes:</p>
          <ul className="list-disc list-inside">
            {failedImages.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. GRILLA DE MINIATURAS CARGADAS */}
      {imagenes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Galería Cargada ({imagenes.length} {imagenes.length === 1 ? 'foto' : 'fotos'})
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {imagenes.map((item, idx) => {
              const isPortada = idx === 0;
              const displayUrl = typeof item === 'string' ? item : item.url;

              return (
                <div
                  key={`${displayUrl}-${idx}`}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 shadow-sm ${
                    isPortada
                      ? 'border-brand-orange ring-2 ring-orange-200'
                      : 'border-slate-200 bg-slate-100'
                  }`}
                >
                  <Image
                    src={displayUrl}
                    alt={`Preview ${idx}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />

                  {isPortada && (
                    <span className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow">
                      ⭐ Portada
                    </span>
                  )}

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