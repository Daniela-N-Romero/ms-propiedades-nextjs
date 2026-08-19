'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImagen, deleteImagenFromStorage } from '@/lib/supabase/upload-image';

interface MetaImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  galleryImages?: string[];
}

export function MetaImageUploader({ value, onChange, galleryImages = [] }: MetaImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedToCrop, setSelectedToCrop] = useState<string | null>(null);
  
  // Estados para el encuadre 1:1
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setSelectedToCrop(objectUrl);
  };

  const handleRemove = async () => {
    if (value && value.includes('supabase.co')) {
      await deleteImagenFromStorage(value);
    }
    onChange(null);
  };

  // Guardar recorte procesado desde Canvas a Supabase
  const handleSaveCrop = async () => {
    if (!selectedToCrop) return;
    setIsUploading(true);

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedToCrop;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const size = 1080; // Calidad estándar Meta 1:1
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Fondo blanco por defecto
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      const aspect = img.width / img.height;
      let drawWidth = size * zoom;
      let drawHeight = (size / aspect) * zoom;

      if (aspect < 1) {
        drawHeight = size * zoom;
        drawWidth = size * aspect * zoom;
      }

      const x = (size - drawWidth) / 2 + offset.x;
      const y = (size - drawHeight) / 2 + offset.y;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Convertir a blob WebP y subir a Supabase
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `meta-crop-${Date.now()}.webp`, { type: 'image/webp' });
        const uploadedUrl = await uploadImagen(croppedFile);

        if (uploadedUrl) {
          onChange(uploadedUrl);
          setSelectedToCrop(null);
        }
        setIsUploading(false);
      }, 'image/webp', 0.9);

    } catch (err) {
      console.error('Error recortando imagen:', err);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
      <div>
        <span className="font-bold text-xs text-slate-800 block">
          📷 Imagen Especial para Meta Ads / Instagram (1:1)
        </span>
        <p className="text-[11px] text-slate-500">
          Subí o elegí una imagen de la galería para encuadrarla en formato cuadrado (1080x1080).
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
            Quitar Imagen 🗑️
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs transition"
            >
              ➕ Cargar Nueva Foto
            </label>
          </div>

          {galleryImages.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-600 mb-1.5">
                O elegí una foto cargada para recortar en 1:1:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedToCrop(imgUrl);
                      setZoom(1);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className="relative w-12 h-12 rounded-lg border border-slate-300 overflow-hidden shrink-0 hover:border-blue-500 hover:scale-105 transition"
                  >
                    <Image src={imgUrl} alt={`Opción ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL CROPPER 1:1 NATIVO */}
      {selectedToCrop && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">✂️ Encuadrar Foto 1:1 Meta</h3>
              <button
                type="button"
                onClick={() => setSelectedToCrop(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div
              className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <img
                src={selectedToCrop}
                alt="Para recortar"
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                className="w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute inset-0 border-2 border-white/60 pointer-events-none rounded-xl" />
            </div>

            {/* CONTROLES ZOOM */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedToCrop(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
              >
                {isUploading ? '⏳ Procesando...' : 'Guardar Foto 1:1'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { uploadImagen, deleteImagenFromStorage } from '@/lib/supabase/upload-image';

// interface MetaImageUploaderProps {
//   value?: string | null;
//   onChange: (url: string | null) => void;
// }

// export function MetaImageUploader({ value, onChange }: MetaImageUploaderProps) {
//   const [isUploading, setIsUploading] = useState(false);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     const file = e.target.files[0];

//     try {
//       setIsUploading(true);
//       const url = await uploadImagen(file);
//       if (url) onChange(url);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleRemove = async () => {
//     if (value && value.includes('supabase.co')) {
//       await deleteImagenFromStorage(value);
//     }
//     onChange(null);
//   };

//   return (
//     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
//       <div>
//         <span className="font-bold text-xs text-slate-800 block">
//           📷 Imagen Especial para Meta Ads / Instagram (Opcional)
//         </span>
//         <p className="text-[11px] text-slate-500">
//           Subí una imagen cuadrada (1:1) o bien centrada. Si la dejás vacía, Meta usarás la foto de portada normal.
//         </p>
//       </div>

//       {value ? (
//         <div className="flex items-center gap-4">
//           <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500 shadow-sm shrink-0">
//             <Image src={value} alt="Meta Preview" fill className="object-cover" />
//           </div>
//           <button
//             type="button"
//             onClick={handleRemove}
//             className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition"
//           >
//             Quitar Imagen
//           </button>
//         </div>
//       ) : (
//         <div>
//           <input
//             type="file"
//             id="meta-image-input"
//             accept="image/png, image/jpeg, image/webp"
//             onChange={handleFileChange}
//             disabled={isUploading}
//             className="hidden"
//           />
//           <label
//             htmlFor="meta-image-input"
//             className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs transition"
//           >
//             {isUploading ? '⏳ Subiendo...' : '➕ Cargar Imagen Cuadrada Meta'}
//           </label>
//         </div>
//       )}
//     </div>
//   );
// }