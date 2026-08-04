// src/features/propiedades/components/pdf-uploader.tsx
'use client';

import { useState } from 'react';
import { uploadPdfClean } from '@/lib/supabase/upload-pdf';

interface PdfUploaderProps {
  pdfUrl?: string | null;
  onChange: (url: string) => void;
}

export function PdfUploader({ pdfUrl, onChange }: PdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

const processPdfFile = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo en formato PDF válido.');
      return;
    }

    setIsUploading(true);
    const url = await uploadPdfClean(file);
    setIsUploading(false);

    if (url) {
      onChange(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPdfFile(file);
      e.target.value = ''; // Reset input
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
      const file = e.dataTransfer.files[0];
      processPdfFile(file);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Ficha Técnica PDF
      </label>

      {pdfUrl ? (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-xs font-bold text-slate-800">Ficha Adjunta</p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-brand-orange hover:underline truncate block"
              >
                Abrir documento PDF en Supabase ↗
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs font-bold text-red-600 hover:text-red-800 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
          >
            Quitar 🗑️
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            isDragging
              ? 'border-brand-orange bg-orange-100/50 scale-[1.01]'
              : 'border-slate-300 hover:border-brand-orange bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            id="pdf-upload-input"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <label
            htmlFor="pdf-upload-input"
            className="cursor-pointer flex items-center justify-center gap-2 select-none"
          >
            <span className="text-xl">{isDragging ? '📥' : '📄'}</span>
            <span className="text-xs font-bold text-slate-700 hover:underline">
              {isUploading
                ? '⏳ Subiendo PDF a Supabase...'
                : isDragging
                ? '¡Soltá el PDF acá!'
                : 'Hacé clic para subir o arrastrá el archivo PDF'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}