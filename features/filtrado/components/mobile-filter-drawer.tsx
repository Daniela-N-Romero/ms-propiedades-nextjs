"use client";

import { useEffect } from "react";
import { useFilterDraft } from "../hooks/use-filter-draft";
import {
	FiltroZonasJerarquico,
	PartidoConLocalidades,
	ZonaPadre,
} from "./filtro-zonas-jerarquico";
import { SubtipoOption } from "../types/filtrado.types";
import { X, Filter, RotateCcw, Check } from "lucide-react";

interface MobileFilterDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	zonasPadre: ZonaPadre[];
	partidos: PartidoConLocalidades[];
	subtipos: SubtipoOption[];
}

export function MobileFilterDrawer({
	isOpen,
	onClose,
	zonasPadre,
	partidos,
	subtipos,
}: MobileFilterDrawerProps) {
	const {
		draftFilters,
		updateDraft,
		toggleArrayDraft,
		setMultipleInArrayDraft,
		resetDraft,
		applyFilters,
		activeCount,
		isPending,
    handleCambioMercado
	} = useFilterDraft();

	// Bloqueo de scroll en el body cuando el modal está desplegado
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const handleApply = () => {
		applyFilters(() => {
			onClose();
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
			{/* 1. BACKDROP / FONDO OSCURECIDO */}
			<div
				className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* 2. PANEL DESLIZABLE (DRAWER) */}
			<div className="relative w-full max-h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
				{/* CABECERA CON MANIJA TÁCTIL Y BOTÓN CERRAR */}
				<div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-slate-800" />
						<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
							Filtros
						</h3>
						{activeCount > 0 && (
							<span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
								{activeCount}
							</span>
						)}
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* CONTENIDO DESPLAZABLE (FORMULARIO CON SCROLL INTERNO) */}
				<div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-28">
					{/* BLOQUE 0: TIPO DE MERCADO (MOBILE) */}
					<div className="space-y-2 pb-4 border-b border-slate-100">
						<label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
							Tipo de Inmueble
						</label>
						<div className="grid grid-cols-2 gap-2">
							{[
								{ label: "Todos", value: undefined },
								{ label: "Industrial", value: "industrial" },
								{ label: "Residencial", value: "residencial" },
								{ label: "Comercial", value: "comercial" },
							].map((m) => {
								const activo =
									(!draftFilters.mercado && !m.value) ||
									draftFilters.mercado === m.value;
								return (
									<button
										key={m.label}
										type="button"
										onClick={() => handleCambioMercado(m.value)}
										className={`py-2 px-3 text-xs font-bold uppercase rounded-lg border transition-colors text-center ${
											activo
												? "bg-blue-50 border-blue-600 text-blue-700"
												: "bg-slate-50 border-slate-200 text-slate-600 active:bg-slate-100"
										}`}
									>
										{m.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* BLOQUE 1: TIPO DE OPERACIÓN */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
							Operación
						</label>
						<div className="grid grid-cols-2 gap-2">
							{["alquiler", "venta"].map((op) => {
								const activo = draftFilters.categoria?.toLowerCase() === op;
								return (
									<button
										key={op}
										type="button"
										onClick={() =>
											updateDraft({ categoria: activo ? undefined : op })
										}
										className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${
											activo
												? "bg-blue-50 border-blue-600 text-blue-700"
												: "bg-slate-50 border-slate-200 text-slate-600 active:bg-slate-100"
										}`}
									>
										{op}
									</button>
								);
							})}
						</div>
					</div>

					{/* BLOQUE 2: SUBTIPOS DE INMUEBLE */}
					{subtipos.length > 0 && (
						<div className="space-y-2 border-t border-slate-100 pt-4">
							<label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
								Subipo de Inmueble
							</label>
							<div className="space-y-1.5">
								{subtipos.map((sub) => {
									const checked =
										draftFilters.subtipo?.includes(sub.slug) ?? false;
									return (
										<label
											key={sub.id}
											className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg active:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
										>
											<input
												type="checkbox"
												checked={checked}
												onChange={() => toggleArrayDraft("subtipo", sub.slug)}
												className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
											/>
											<span>{sub.nombre}</span>
										</label>
									);
								})}
							</div>
						</div>
					)}

					{/* BLOQUE 3: UBICACIÓN JERÁRQUICA (REGIÓN > PARTIDOS > LOCALIDADES) */}
					<div className="border-t border-slate-100 pt-4">
						<FiltroZonasJerarquico
							zonasPadre={zonasPadre}
							partidos={partidos}
							localidadesSeleccionadas={draftFilters.localidad || []}
							onToggleLocalidad={(id) => toggleArrayDraft("localidad", id)}
							onSelectMultipleLocalidades={(ids, agregar) =>
								setMultipleInArrayDraft("localidad", ids, agregar)
							}
						/>
					</div>

					{/* BLOQUE 4: SUPERFICIE TOTAL (M²) */}
					<div className="space-y-2 border-t border-slate-100 pt-4">
						<label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
							Superficie Total (m²)
						</label>
						<div className="grid grid-cols-2 gap-2">
							<input
								type="number"
								placeholder="Mínimo m²"
								value={draftFilters.supMin ?? ""}
								onChange={(e) =>
									updateDraft({
										supMin: e.target.value ? Number(e.target.value) : undefined,
									})
								}
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="number"
								placeholder="Máximo m²"
								value={draftFilters.supMax ?? ""}
								onChange={(e) =>
									updateDraft({
										supMax: e.target.value ? Number(e.target.value) : undefined,
									})
								}
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* BLOQUE 5: RANGO DE PRECIO */}
					<div className="space-y-2 border-t border-slate-100 pt-4">
						<div className="flex items-center justify-between">
							<label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
								Precio
							</label>
							<div className="flex gap-1 text-[11px] font-bold">
								{["USD", "ARS"].map((moneda) => (
									<button
										key={moneda}
										type="button"
										onClick={() => updateDraft({ moneda })}
										className={`px-2.5 py-1 rounded-lg cursor-pointer ${
											draftFilters.moneda === moneda
												? "bg-slate-900 text-white"
												: "text-slate-500 bg-slate-100"
										}`}
									>
										{moneda}
									</button>
								))}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<input
								type="number"
								placeholder="Mínimo"
								value={draftFilters.precioMin ?? ""}
								onChange={(e) =>
									updateDraft({
										precioMin: e.target.value
											? Number(e.target.value)
											: undefined,
									})
								}
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="number"
								placeholder="Máximo"
								value={draftFilters.precioMax ?? ""}
								onChange={(e) =>
									updateDraft({
										precioMax: e.target.value
											? Number(e.target.value)
											: undefined,
									})
								}
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* 3. BARRA FIJA AL PIE CON LAS ACCIONES DE RETENCIÓN / CONFIRMACIÓN */}
				<div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex items-center gap-3 shadow-lg">
					<button
						type="button"
						onClick={resetDraft}
						className="flex-1 py-3 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:bg-slate-100 transition"
					>
						<RotateCcw className="w-3.5 h-3.5 text-slate-400" />
						Limpiar
					</button>

					<button
						type="button"
						disabled={isPending}
						onClick={handleApply}
						className={`flex-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
							isPending
								? "bg-slate-200 text-slate-400 cursor-not-allowed"
								: "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
						}`}
					>
						<Check className="w-4 h-4" />
						{isPending ? "Aplicando..." : `Aplicar (${activeCount})`}
					</button>
				</div>
			</div>
		</div>
	);
}
