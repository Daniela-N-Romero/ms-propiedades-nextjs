'use client';

interface VideoSeccionProps {
  videoUrl: string;
}

export function VideoSeccion({ videoUrl }: VideoSeccionProps) {
  if (!videoUrl) return null;

  // 🔍 Helper para convertir URLs estándar de YouTube a formato Embed
 const getEmbedUrl = (url: string) => {
    try {
      const cleanUrl = url.trim();

// 1. YouTube Shorts: youtube.com/shorts/VIDEO_ID
    if (cleanUrl.includes('youtube.com/shorts/')) {
      const videoId = cleanUrl.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('/')[0];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : cleanUrl;
    }

    // 2. YouTube Estándar: youtube.com/watch?v=VIDEO_ID
    if (cleanUrl.includes('youtube.com/watch')) {
      const videoId = new URL(cleanUrl).searchParams.get('v');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : cleanUrl;
    }

    // 3. YouTube Corto: youtu.be/VIDEO_ID
    if (cleanUrl.includes('youtu.be/')) {
      const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : cleanUrl;
    }

    // 4. YouTube ya en formato Embed (limpia ?feature=share o parámetros conflictivos)
    if (cleanUrl.includes('youtube.com/embed/') || cleanUrl.includes('youtube-nocookie.com/embed/')) {
      const splitTarget = cleanUrl.includes('youtube-nocookie.com/embed/') 
        ? 'youtube-nocookie.com/embed/' 
        : 'youtube.com/embed/';
      const videoId = cleanUrl.split(splitTarget)[1]?.split('?')[0]?.split('/')[0];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : cleanUrl;
    }

    // 5. Vimeo: vimeo.com/VIDEO_ID
    if (cleanUrl.includes('vimeo.com/')) {
      const videoId = cleanUrl.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : cleanUrl;
    }
      return cleanUrl;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="bg-white p-6 mb-7 rounded-2xl shadow-sm border border-slate-200 space-y-4">
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