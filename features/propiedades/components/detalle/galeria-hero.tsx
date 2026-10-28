"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomImage } from "@/components/ui/custom-image";
import { styles, statusColors } from "./galeria.styles";
import type { EstadoPropiedadEnum, Imagen } from "@prisma-client";
import { AccionesPropiedad } from "./acciones-propiedad";
import { trackDownloadPDF } from "@/lib/analytics";

interface GaleriaHeroProps {
	titulo: string;
	codigo: string;
	categoria: string; // 'venta' | 'alquiler'
	zonaNombre: string;
	padreZonaNombre?: string;
	imagenes: Imagen[];
	pdfUrl?: string | null;
	propiedadId?: number;
	propiedadStatus: EstadoPropiedadEnum;
	videoUrl?: string;
}

export default function GaleriaHero({
	titulo,
	codigo,
	categoria,
	zonaNombre,
	padreZonaNombre,
	imagenes,
	pdfUrl,
	propiedadId,
	propiedadStatus,
	videoUrl,
}: GaleriaHeroProps) {
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	// Si no hay fotos cargadas en el array, usamos un placeholder
	const fotosDisplay: Imagen[] =
		imagenes && imagenes.length > 0
			? imagenes
			: [
					{
						id: 0,
						url: "/images/placeholder.png",
						urlWatermark: null,
						orden: 0,
						propiedadId: 0,
					},
				];

	const openLightboxAt = (index: number) => {
		setCurrentIndex(index);
		setIsLightboxOpen(true);
	};

	const nextPhoto = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % fotosDisplay.length);
	}, [fotosDisplay.length]);

	const prevPhoto = useCallback(() => {
		setCurrentIndex(
			(prev) => (prev - 1 + fotosDisplay.length) % fotosDisplay.length,
		);
	}, [fotosDisplay.length]);

	// Manejo de teclas (Esc para cerrar, Flechas para navegar)
	useEffect(() => {
		if (!isLightboxOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsLightboxOpen(false);
			if (e.key === "ArrowRight") nextPhoto();
			if (e.key === "ArrowLeft") prevPhoto();
		};

		window.addEventListener("keydown", handleKeyDown);
		// Bloquear el scroll del body cuando el modal está abierto
		document.body.style.overflow = "hidden";

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isLightboxOpen, nextPhoto, prevPhoto]);

	const getWatermarkUrl = (img: Imagen) => {
		if (!img) return "/images/placeholder.png";

		if (img.urlWatermark) {
			return img.urlWatermark;
		}

		return img.url || "/images/placeholder.png";
	};

	const colorClass =
		statusColors[propiedadStatus] || "bg-slate-200 text-slate-700";

	return (
		<div className="space-y-4">
			{/* 🏷️ ENCABEZADO / TITULAR */}
			<div className={styles.headerContainer}>
				{/* Fila superior: Categoría + Código a la izquierda, Compartir a la derecha en mobile */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						<span className={styles.badgeOperacion}>En {categoria}</span>
						<span className={styles.codigoBadge}>CÓDIGO: {codigo}</span>
					</div>

					{/* Botones de acción en mobile (no le quitan ancho al título) */}
					<div className="shrink-0 md:hidden">
						<AccionesPropiedad
							titulo={titulo}
							codigo={codigo}
							variant="icons"
						/>
					</div>
				</div>

				{/* Título a ancho completo en mobile, con acciones a la derecha en desktop */}
				<div className="mt-2 md:flex md:items-start md:justify-between md:gap-4">
					<h1 className={styles.titulo}>
						{titulo}{" "}
						<span
							className={`uppercase font-bold whitespace-nowrap ${statusColors[propiedadStatus.toLowerCase()] || "text-gray-500"}`}
						>
							- {propiedadStatus}
						</span>
					</h1>

					{/* Botones de acción en desktop */}
					<div className="hidden shrink-0 pt-1 md:block">
						<AccionesPropiedad
							titulo={titulo}
							codigo={codigo}
							variant="icons"
						/>
					</div>
				</div>

				<p className={styles.ubicacion}>
					📍 {padreZonaNombre ? `${padreZonaNombre} > ` : ""}
					{zonaNombre}
				</p>
				{pdfUrl && (
					<p className="mr-3 max-w-50">
						<a
							href={pdfUrl ? pdfUrl : `/api/properties/${propiedadId}/pdf`}
							onClick={() => trackDownloadPDF(codigo, titulo)}
							target="_blank"
							rel="noopener noreferrer"
							className={styles.btnPdf}
						>
							📄 Descargar Ficha PDF
						</a>
					</p>
				)}
			</div>

			{/* 🖼️ GRID MOSAICO DE FOTOS (HERO) */}
			<div className={styles.galleryGrid}>
				{/* Foto Principal Grande (Izquierda o Completa en Mobile) */}
				<div
					className={styles.mainImageContainer}
					onClick={() => openLightboxAt(0)}
				>
					<CustomImage
						src={getWatermarkUrl(fotosDisplay[0])}
						alt={titulo}
						fill
						preload={true}
						unoptimized
						sizes="(max-width: 768px) 100vw, 50vw"
						className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 object-center"
					/>
				</div>

				{/* Grilla Secundaria (Derecha - Solo visible en Desktop para 4 fotos adicionales) */}
				<div className={styles.secondaryGrid}>
					{fotosDisplay.slice(1, 5).map((img, idx) => (
						<div
							key={img.id || idx}
							className={styles.smallImageContainer}
							onClick={() => openLightboxAt(idx + 1)}
						>
							<CustomImage
								src={getWatermarkUrl(img)}
								alt={`${titulo} - foto ${idx + 2}`}
								fill
								unoptimized
								sizes="25vw"
								className="object-cover hover:scale-110 transition-transform duration-500"
							/>
						</div>
					))}
				</div>

				{/* 📍 CONTENEDOR FLOTANTE DE BOTONES (Fila horizontal en la esquina inferior derecha) */}
				<div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 flex flex-col items-end gap-2">
					{videoUrl && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								const el = document.getElementById("seccion-video");
								if (el)
									el.scrollIntoView({ behavior: "smooth", block: "center" });
							}}
							className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 text-xs font-spartan font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 border border-slate-200 hover:scale-105 whitespace-nowrap"
						>
							🎥 Ver Video
						</button>
					)}

					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							openLightboxAt(0);
						}}
						className={styles.btnVerTodas}
					>
						📷 Ver todas las fotos ({fotosDisplay.length})
					</button>
				</div>
			</div>

			{/* 🌌 LIGHTBOX / MODAL FULLSCREEN */}
			{isLightboxOpen && (
				<div
					className={styles.lightboxOverlay}
					onClick={() => setIsLightboxOpen(false)}
				>
					{/* Header del Lightbox */}
					<div id="lightboxHeader" className={styles.lightboxHeader}>
						<span className={styles.lightboxCounter}>
							Foto {currentIndex + 1} de {fotosDisplay.length} — REF: {codigo}
						</span>
						<button
							type="button"
							onClick={() => setIsLightboxOpen(false)}
							className={styles.lightboxCloseBtn}
						>
							✕
						</button>
					</div>

					{/* Área Principal con Foto Activa y Botones de Navegación */}
					<div id="lightboxMainArea" className={styles.lightboxMainArea}>
						{fotosDisplay.length > 1 && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									prevPhoto();
								}}
								className={styles.lightboxNavBtnLeft}
							>
								‹
							</button>
						)}

						<div className="relative w-full h-full max-w-5xl max-h-[80vh]">
							<CustomImage
								src={getWatermarkUrl(fotosDisplay[currentIndex])}
								alt={titulo}
								fill
								priority
								unoptimized
								className="object-contain"
								onClick={(e) => {
									e.stopPropagation();
								}}
							/>
						</div>

						{fotosDisplay.length > 1 && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									nextPhoto();
								}}
								className={styles.lightboxNavBtnRight}
							>
								›
							</button>
						)}
					</div>

					{/* Footer del Lightbox con Thumbnails pequeños */}
					<div
						className="flex gap-2 justify-center overflow-x-auto py-2 z-20"
						onClick={(e) => e.stopPropagation()}
					>
						{fotosDisplay.map((img, idx) => (
							<button
								key={img.id || idx}
								type="button"
								onClick={() => setCurrentIndex(idx)}
								className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
									currentIndex === idx
										? "border-brand-orange scale-105"
										: "border-transparent opacity-50 hover:opacity-100"
								}`}
							>
								<CustomImage
									src={getWatermarkUrl(img)}
									alt="thumb"
									fill
									unoptimized
									className="object-cover"
								/>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
