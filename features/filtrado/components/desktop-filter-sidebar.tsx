// features/filtrado/components/desktop-filter-sidebar.tsx
"use client";

import { useFilterDraft } from "../hooks/use-filter-draft";
import {
	FiltroZonasJerarquico,
	PartidoConLocalidades,
	ZonaPadre,
} from "./filtro-zonas-jerarquico";
import { SubtipoOption } from "../types/filtrado.types";
import { Filter, RotateCcw, Check } from "lucide-react";

interface DesktopFilterSidebarProps {
	zonasPadre: ZonaPadre[];
	partidos: PartidoConLocalidades[];
	subtipos: SubtipoOption[];
}

export function DesktopFilterSidebar({
	zonasPadre,
	partidos,
	subtipos,
}: DesktopFilterSidebarProps) {
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

	return (
		<aside className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
			{/* BARRA SUPERIOR: TÍTULO Y BOTÓN APLICAR */}
			<div className="flex items-center justify-between border-b border-slate-100 pb-4">
				<div className="flex items-center">
					<Filter className="w-4 h-4 text-slate-800" />
					<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
						Filtros
					</h3>
				</div>

				{activeCount > 0 && (
					<button
						type="button"
						onClick={resetDraft}
						className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
					>
						<RotateCcw className="w-3 h-3" />
						Limpiar
					</button>
				)}
			</div>

			{/* BOTÓN PRIMARIO: APLICAR FILTROS (STICKY SUPERIOR) */}
			<button
				type="button"
				disabled={isPending}
				onClick={() => applyFilters()}
				className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
					isPending
						? "bg-slate-200 text-slate-400 cursor-not-allowed"
						: "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
				}`}
			>
				<Check className="w-4 h-4" />
				{isPending ? "Aplicando..." : `Aplicar Filtros (${activeCount})`}
			</button>

			{/* BLOQUE 0: TIPO DE MERCADO */}
			<div className="space-y-2 pb-4 border-b border-slate-100">
				<label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
					Tipo de Inmueble
				</label>
				<div className="flex gap-1 flex-wrap">
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
								className={`px-2 py-1.5 text-xs font-bold uppercase rounded-lg border transition-colors cursor-pointer ${
									activo
										? "bg-blue-50 border-blue-600 text-blue-700"
										: "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
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
								className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition border cursor-pointer ${
									activo
										? "bg-blue-50 border-blue-600 text-blue-700"
										: "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
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
						Subtipo de Inmueble
					</label>
					<div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
						{subtipos.map((sub) => {
							const checked = draftFilters.subtipo?.includes(sub.slug) ?? false;
							return (
								<label
									key={sub.id}
									className="flex items-center gap-2 py-1 px-1 rounded hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
								>
									<input
										type="checkbox"
										checked={checked}
										onChange={() => toggleArrayDraft("subtipo", sub.slug)}
										className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
						placeholder="Mínimo"
						value={draftFilters.supMin ?? ""}
						onChange={(e) =>
							updateDraft({
								supMin: e.target.value ? Number(e.target.value) : undefined,
							})
						}
						className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
						type="number"
						placeholder="Máximo"
						value={draftFilters.supMax ?? ""}
						onChange={(e) =>
							updateDraft({
								supMax: e.target.value ? Number(e.target.value) : undefined,
							})
						}
						className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
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
								className={`px-2 py-0.5 rounded cursor-pointer ${
									draftFilters.moneda === moneda
										? "bg-slate-900 text-white"
										: "text-slate-500 hover:bg-slate-100"
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
								precioMin: e.target.value ? Number(e.target.value) : undefined,
							})
						}
						className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
						type="number"
						placeholder="Máximo"
						value={draftFilters.precioMax ?? ""}
						onChange={(e) =>
							updateDraft({
								precioMax: e.target.value ? Number(e.target.value) : undefined,
							})
						}
						className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* BOTÓN SECUNDARIO: APLICAR FILTROS (PIE DEL SIDEBAR) */}
			<div className="pt-2">
				<button
					type="button"
					disabled={isPending}
					onClick={() => applyFilters()}
					className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
						isPending
							? "bg-slate-200 text-slate-400 cursor-not-allowed"
							: "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
					}`}
				>
					<Check className="w-4 h-4" />
					{isPending ? "Aplicando..." : `Aplicar Filtros (${activeCount})`}
				</button>
			</div>
		</aside>
	);
}
