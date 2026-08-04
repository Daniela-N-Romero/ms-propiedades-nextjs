'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { getInputClass } from '../utils/form-utils';
import { ImageUploader } from '../image-uploader';
import { PdfUploader } from '../pdf-uploader';

interface MultimediaSectionProps {
  form: UseFormReturn<PropertyFormValues>;
}

export function MultimediaSection({ form }: MultimediaSectionProps) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-brand-orange font-bold text-sm">
          3
        </span>
        <h2 className="text-base font-bold text-slate-900">Galería de Fotos y Documentos</h2>
      </div>

      {/* GALERÍA SUPABASE */}
      <Controller
        name="imagenes"
        control={control}
        render={({ field }) => (
          <ImageUploader
            imagenes={field.value || []}
            onChange={field.onChange}
            error={errors.imagenes?.message}
          />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Video de YouTube (URL)
          </label>
          <input
            {...register('videoUrl')}
            placeholder="https://www.youtube.com/watch?v=..."
            className={getInputClass(!!errors.videoUrl)}
          />
        </div>

        {/* UPLOADER DE PDF */}
        <Controller
          name="pdfUrl"
          control={control}
          render={({ field }) => (
            <PdfUploader
              pdfUrl={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}