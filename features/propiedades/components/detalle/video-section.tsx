'use client';

interface VideoSeccionProps {
  videoUrl: string;
}

export function VideoSeccion({ videoUrl }: VideoSeccionProps) {
  if (!videoUrl) return null;

  // 🔍 Helper para convertir URLs estándar de YouTube a formato Embed
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url; // Si ya viene en formato embed
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span>🎥</span> Recorrido en Video
      </h3>

      {/* Contenedor 16:9 Responsivo */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-inner">
        <iframe
          src={embedUrl}
          title="Video de la propiedad"
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}