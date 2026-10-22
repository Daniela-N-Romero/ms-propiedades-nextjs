"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MetricasInversionResult } from "../types/propuesta.types";

interface Props {
	propuesta: any;
	metricas: MetricasInversionResult;
}

export function PropuestaInversionView({ propuesta, metricas }: Props) {
	const maxRoiOption = [...metricas.comparativa].sort(
		(a, b) => b.roiAnual - a.roiAnual,
	)[0];

	const [opcionSeleccionadaId, setOpcionSeleccionadaId] = useState<string>(
		maxRoiOption?.id || metricas.comparativa[0]?.id || "",
	);

	const [animarBarras, setAnimarBarras] = useState(false);
	const seccionBarrasRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (maxRoiOption?.id) {
			setOpcionSeleccionadaId(maxRoiOption.id);
		}
	}, [metricas]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setAnimarBarras(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);

		if (seccionBarrasRef.current) {
			observer.observe(seccionBarrasRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const handleSeleccionarYScroll = (id: string) => {
		setOpcionSeleccionadaId(id);
		const el = document.getElementById(`detalle-opcion-${id}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	const tarifaAplicada =
		metricas.tieneAhorroPreferencial && metricas.costoObraPreferencial
			? metricas.costoObraPreferencial
			: metricas.costoObraMercado;

	const recom = propuesta.payloadJson?.recomendaciones;

	const diferenciaTarifaM2 =
		metricas.costoObraMercado - (metricas.costoObraPreferencial || 0);

	const supNaveTop = maxRoiOption?.supNave || 0;
	const ahorroNaveDestacada = supNaveTop * diferenciaTarifaM2;
	
	return (
		<div className="space-y-6 sm:space-y-8 animate-fade-in px-1 sm:px-0">
			{/* 1. TARJETAS DE MÉTRICAS GENERALES */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
				<div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-md">
					<span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
						{metricas.tieneAhorroPreferencial
							? "Costo Obra Preferencial"
							: "Costo Obra Estimado"}
					</span>
					<span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
						USD {tarifaAplicada} / m²
					</span>
					<p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
						Tarifa base estimada para naves cubiertas
					</p>
				</div>

				<div className="bg-slate-900 border border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden">
					<span className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
						Máxima Rentabilidad ROI
					</span>
					<span className="text-xl sm:text-2xl font-black text-amber-400 block mt-0.5">
						{metricas.maxRoi}% Anual
					</span>
					<p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
						Opción destacada:{" "}
						<strong className="text-white">{maxRoiOption?.nombre}</strong>
					</p>
				</div>

				<div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-md">
					<span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
						Opciones Comparadas
					</span>
					<span className="text-xl sm:text-2xl font-black text-blue-400 block mt-0.5">
						{metricas.comparativa.length} Ubicaciones
					</span>
					<p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
						Lotes y desarrollos industriales analizados
					</p>
				</div>
			</div>

			{/* BANNER DE AHORRO DIRECTO EN USD */}
			{metricas.tieneAhorroPreferencial && metricas.costoObraPreferencial && (
				<div className="bg-linear-to-r from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div className="space-y-1">
							<span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
								💡 Ventaja Competitiva Exclusiva MS Propiedades
							</span>
							<h3 className="mt-2 text-lg sm:text-xl font-black text-white leading-snug">
								Tarifa Preferencial de Obra: USD{" "}
								{metricas.costoObraPreferencial}/m² vs. USD{" "}
								{metricas.costoObraMercado}/m² de Mercado
							</h3>
							<p className="text-xs text-slate-300">
								Gracias a nuestro acuerdo exclusivo con constructores
								industriales, obtenés un ahorro directo de{" "}
								<strong>USD {diferenciaTarifaM2}/m²</strong> en la ejecución de
								la nave.
							</p>
						</div>

						<div className="bg-emerald-500/10 border border-emerald-500/30 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-left md:text-right w-full md:w-auto shrink-0">
							<span className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-bold block">
								Ahorro en Nave de {supNaveTop.toLocaleString("es-AR")} m²
							</span>
							<span className="text-xl sm:text-2xl font-black text-emerald-400 block">
								~ USD {ahorroNaveDestacada.toLocaleString("es-AR")}
							</span>
							<span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
								({maxRoiOption?.nombre || "Opción Destacada"})
							</span>
						</div>
					</div>
				</div>
			)}

			{/* 2. BARRAS COMPARATIVAS */}
			<div
				ref={seccionBarrasRef}
				className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md space-y-4"
			>
				<h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
					📊 Comparativa de Rentabilidad Bruta Anual (ROI %)
				</h3>

				<div className="space-y-3">
					{metricas.comparativa.map((item, index) => {
						const porcentajeBarra = Math.min(
							(item.roiAnual / (metricas.maxRoi * 1.15)) * 100,
							100,
						);
						const esGanador = item.id === maxRoiOption?.id;
						const esSeleccionado = item.id === opcionSeleccionadaId;						

						return (
							<div
								key={item.id}
								onClick={() => handleSeleccionarYScroll(item.id)}
								className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
									esSeleccionado
										? "bg-slate-800 border-amber-500/80 shadow-lg scale-[1.01]"
										: "bg-slate-950/60 border-slate-800 hover:border-slate-700"
								}`}
							>
								<div className="flex justify-between items-center mb-1.5 gap-2">
									<div className="flex items-center gap-1.5 flex-wrap min-w-0">
										<span className="font-bold text-xs sm:text-sm text-white truncate">
											#{index + 1}: {item.nombre}
										</span>
										{item.supNave > 0 && (
											<span className="text-slate-400 font-normal text-[10px] sm:text-xs">
												(Lote: {item.supLote.toLocaleString("es-AR")}, Nave:{" "}
												{item.supNave.toLocaleString("es-AR")} m²)
											</span>
										)}
										{item.esPreventa && (
											<span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shrink-0">
												🚀 Preventa
											</span>
										)}
										{esGanador && (
											<span className="bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shrink-0">
												🏆 Top ROI
											</span>
										)}
									</div>
									<span className="font-black text-sm sm:text-base text-amber-400 shrink-0">
										{item.roiAnual}%
									</span>
								</div>

								<div className="w-full bg-slate-800 rounded-full h-2.5 sm:h-3 overflow-hidden p-0.5 border border-slate-700">
									<div
										className={`h-full rounded-full transition-all duration-1000 ease-out ${
											esGanador ? "bg-amber-400" : "bg-blue-500"
										}`}
										style={{
											width: animarBarras ? `${porcentajeBarra}%` : "0%",
										}}
									/>
								</div>

								<div className="flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] text-slate-400 mt-1.5 gap-0.5 sm:gap-0">
									<span>
										Inversión Total:{" "}
										<strong className="text-slate-300">
											USD {item.inversionTotal.toLocaleString("es-AR")}
										</strong>
									</span>
									<span>
										Ingreso:{" "}
										<strong className="text-emerald-400">
											USD {item.ingresoMensualTotal.toLocaleString("es-AR")}/mes
										</strong>{" "}
										(USD {item.ingresoAnualTotal.toLocaleString("es-AR")}/año)
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 3. DESGLOSE INDIVIDUAL */}
			<div className="space-y-4">
				<h3 className="text-sm sm:text-base font-bold text-white">
					🏬 Detalle Individual de Opciones de Inversión
				</h3>

				<div className="grid grid-cols-1 gap-6">
					{metricas.comparativa.map((item) => {
						const propOriginal = propuesta.items?.find(
							(i: any) => i.id === item.id,
						)?.propiedad;
						const imagenUrl =
							propOriginal?.imagenes?.[0]?.url || "/images/placeholder.png";
						const esSeleccionado = item.id === opcionSeleccionadaId;
						
						const textoEntrega = item.mesesEntrega > 0
							? `Entrega estimada en ${item.mesesEntrega} ${item.mesesEntrega === 1 ? 'mes' : 'meses'}`
							: item.fechaEstimadaEntrega
								? `Entrega en ${new Date(item.fechaEstimadaEntrega).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
								: "Entrega Inmediata / En desarrollo";

						// --- CÁLCULO DE COBERTURA DE RENTA DE PREVENTA ---
						const mesesEntrega = item.mesesEntrega || 0;
						const mesesObra = item.mesesObra || 0;
						const inicioCobroMes = mesesEntrega + mesesObra + 1;
						const cantidadCuotas = item.cantidadCuotas || 0;

						// Hay apalancamiento si se empieza a cobrar alquiler antes de terminar de pagar las cuotas del lote
						const aplicaApalancamientoRenta =
							item.esFinanciado &&
							cantidadCuotas > 0 &&
							inicioCobroMes <= cantidadCuotas;

						// Desembolso inicial sólo del terreno para la preventa
						const anticipoSoloLoteUSD =
							item.porcentajeAnticipo && item.porcentajeAnticipo > 0
								? Math.round((item.costoTierra * item.porcentajeAnticipo) / 100)
								: item.costoTierra;

						return (
							<div
								key={item.id}
								id={`detalle-opcion-${item.id}`}
								className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center transition-all duration-300 ${
									esSeleccionado
										? "border-amber-500/80 ring-1 ring-amber-500/30"
										: "border-slate-800"
								}`}
							>
								{/* IMAGEN DE LA PROPIEDAD */}
								<div className="lg:col-span-4 relative h-48 sm:h-56 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
									<Image
										src={imagenUrl}
										alt={item.nombre}
										fill
										className="object-cover"
									/>
									<div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] font-bold text-white">
										📍 {item.localidad}
									</div>
								</div>

								{/* DETALLES DE LA PROPIEDAD */}
								<div className="lg:col-span-8 space-y-4">
									<div className="flex justify-between items-start border-b border-slate-800 pb-3 gap-2">
										<div>
											<h4 className="text-base sm:text-lg font-bold text-white">
												{item.nombre}
											</h4>
											{item.ubicacionDescripcion && (
												<p className="text-xs text-slate-300 font-medium mt-0.5">
													{item.ubicacionDescripcion}
												</p>
											)}

											{/* --- CASO 1: ESTRATEGIA DE PREVENTA --- */}
											{item.esPreventa ? (
												<div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3 sm:p-4 space-y-3 mt-2">
													<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2 gap-2">
														<h5 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
															🚀 Oportunidad en Preventa
														</h5>
														<span className="bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[8px] sm:text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
															{textoEntrega}
														</span>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
														{/* 1. Desembolso Inicial Solo Lote */}
														<div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-0.5">
															<span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																Desembolso Inicial Requerido
															</span>
															<span className="text-xs sm:text-sm font-black text-white block">
																USD {anticipoSoloLoteUSD.toLocaleString("es-AR")}
															</span>
															<p className="text-[9px] sm:text-[10px] text-slate-400">
																{item.porcentajeAnticipo > 0
																	? `Anticipo Lote (${item.porcentajeAnticipo}%) sin desembolsar obra todavía.`
																	: `Pago inicial del lote sin costo de obra inmediato.`}
															</p>
														</div>

														{/* 2. Tarjeta Central Dinámica */}
														{aplicaApalancamientoRenta ? (
															<div className="bg-slate-900 border border-amber-500/30 p-2.5 sm:p-3 rounded-xl space-y-0.5">
																<span className="text-amber-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																	Aporte Alquiler (Mes {inicioCobroMes} al {cantidadCuotas})
																</span>
																<span className="text-xs sm:text-sm font-black text-emerald-400 block">
																	+ USD {item.ingresoMensualTotal.toLocaleString("es-AR")}/mes
																</span>
																<p className="text-[9px] sm:text-[10px] text-slate-300">
																	El alquiler cubre cuotas finales tras la toma de posesión y obra.
																</p>
															</div>
														) : (
															<div className="bg-slate-900 border border-amber-500/30 p-2.5 sm:p-3 rounded-xl space-y-0.5">
																<span className="text-amber-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																	Ventaja Financiera
																</span>
																<span className="text-xs sm:text-sm font-black text-amber-300 block">
																	Apalancamiento en pozo
																</span>
																<p className="text-[9px] sm:text-[10px] text-slate-300">
																	Mayor flexibilidad de pago mientras avanza la obra del parque.
																</p>
															</div>
														)}

														{/* 3. Alquiler Estimado Post-Obra */}
														<div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-0.5">
															<span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																Alquiler Estimado (Post-Obra)
															</span>
															<span className="text-xs sm:text-sm font-black text-emerald-400 block">
																USD {item.ingresoMensualTotal.toLocaleString("es-AR")} / mes
															</span>
															<p className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold">
																Proyección de renta una vez entregado el lote y finalizada la nave.
															</p>
														</div>
													</div>
												</div>
											) : item.esFinanciado ? (
												/* --- CASO 2: ESTRATEGIA DE FINANCIACIÓN (LOTE LISTO) --- */
												<p className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-1 leading-snug">
													Lote industrial de{" "}
													<strong>
														{item.supLote?.toLocaleString("es-AR")} m²
													</strong>{" "}
													estructurado con{" "}
													{item.porcentajeAnticipo !== undefined &&
													item.porcentajeAnticipo !== null ? (
														item.porcentajeAnticipo === 0 ? (
															<span className="text-amber-300 font-semibold">
																sin anticipo
															</span>
														) : (
															<strong className="text-amber-300">
																Anticipo del {item.porcentajeAnticipo}%
															</strong>
														)
													) : null}{" "}
													y saldo financiado en{" "}
													<strong>{item.cantidadCuotas} cuotas</strong>.
												</p>
											) : (
												/* --- CASO 3: CONTADO --- */
												<p className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-1 leading-snug">
													Lote industrial de{" "}
													<strong>
														{item.supLote?.toLocaleString("es-AR")} m²
													</strong>{" "}
													en modalidad de{" "}
													<strong className="text-blue-400">
														Pago 100% al Contado
													</strong>
													.
												</p>
											)}

											{item.notaEspecial && (
												<div>
													<p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 leading-snug italic">
														* Importante: {item.notaEspecial}
													</p>
												</div>
											)}
										</div>

										<div className="text-right shrink-0">
											<span className="text-[10px] sm:text-xs text-slate-400 block">
												ROI Proyectado
											</span>
											<span className="text-xl sm:text-2xl font-black text-amber-400">
												{item.roiAnual}%
											</span>
										</div>
									</div>

									{/* GRILLA DE COSTOS BÁSICOS */}
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
										<div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
											<span className="text-slate-400 text-[9px] sm:text-[10px] block font-bold uppercase truncate">
												COSTO TIERRA
											</span>
											<span className="font-bold text-white text-xs sm:text-sm block truncate">
												USD {item.costoTierra.toLocaleString("es-AR")}
											</span>
											<span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">
												({item.supLote.toLocaleString("es-AR")} m²)
											</span>
										</div>

										<div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
											<span className="text-slate-400 text-[9px] sm:text-[10px] block font-bold uppercase truncate">
												NAVE PROYECTADA
											</span>
											<span className="font-bold text-amber-300 text-xs sm:text-sm block truncate">
												{item.supNave.toLocaleString("es-AR")} m²
											</span>
										</div>

										<div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
											<span className="text-slate-400 text-[9px] sm:text-[10px] block font-bold uppercase truncate">
												COSTO OBRA
											</span>
											<span className="font-bold text-white text-xs sm:text-sm block truncate">
												USD {item.costoObraTotal.toLocaleString("es-AR")}
											</span>
										</div>

										<div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 min-w-0">
											<span className="text-slate-400 text-[9px] sm:text-[10px] block font-bold uppercase truncate">
												INVERSIÓN TOTAL
											</span>
											<span className="font-bold text-emerald-400 text-xs sm:text-sm block truncate">
												USD {item.inversionTotal.toLocaleString("es-AR")}
											</span>
										</div>
									</div>

									{/* MÓDULO DE FLUJO DE FONDOS (SOLO PARA PROPIEDADES NO PREVENTA QUE SEAN FINANCIADAS) */}
									{!item.esPreventa && item.esFinanciado && (
										(() => {
											const esSuperavit =
												(item.resultadoNetoMensualUSD ?? 0) >= 0;
											const resultadoAbsoluto = Math.abs(
												item.resultadoNetoMensualUSD ?? 0,
											);

											const cuota = item.cuotaMensualLoteUSD ?? 1;
											const renta = item.ingresoMensualTotal ?? 0;
											const porcentajeCubierto = Math.min(
												Math.round((renta / cuota) * 100),
												100,
											);

											return (
												<div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3 sm:p-4 space-y-3">
													<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2 gap-2">
														<h5 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
															🚀 Estrategia: "El lote se paga con el alquiler"
														</h5>
														{esSuperavit ? (
															<span className="bg-emerald-400/10 border border-emerald-500/30 text-emerald-400 text-[8px] sm:text-[9px] font-black px-2.5 py-1 rounded-full uppercase self-start sm:self-auto">
																🟢 Superávit Neto desde Mes {item.mesesObra + 1}
															</span>
														) : (
															<span className="bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[8px] sm:text-[9px] font-black px-2.5 py-1 rounded-full uppercase self-start sm:self-auto">
																💡 El Alquiler Paga el {porcentajeCubierto}% de la Cuota
															</span>
														)}
													</div>

													<div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
														<div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-0.5">
															<span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																Desembolso Inicial Requerido
															</span>
															<span className="text-xs sm:text-sm font-black text-white block">
																USD {item.desembolsoInicialRequeridoUSD?.toLocaleString("es-AR")}
															</span>
															<p className="text-[9px] sm:text-[10px] text-slate-400">
																{item.porcentajeAnticipo > 0
																	? `Anticipo Lote (${item.porcentajeAnticipo}%)`
																	: `Sin anticipo`}{" "}
																+ 100% Costo Obra
															</p>
														</div>

														<div className="bg-slate-900 border border-amber-500/30 p-2.5 sm:p-3 rounded-xl space-y-0.5">
															<span className="text-amber-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																Aporte Mensual por Alquiler (Mes {item.mesesObra + 1} al {item.cantidadCuotas})
															</span>
															<span className="text-xs sm:text-sm font-black text-emerald-400 block">
																+ USD {renta.toLocaleString("es-AR")} / mes
															</span>
															<p className="text-[9px] sm:text-[10px] text-slate-300">
																Absorbe el {porcentajeCubierto}% de la cuota. Integración restante: USD {resultadoAbsoluto.toLocaleString("es-AR")}/mes.
															</p>
														</div>

														<div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-0.5">
															<span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block uppercase">
																Costo Neto Final del Activo (Mes {item.cantidadCuotas})
															</span>
															<span className="text-xs sm:text-sm font-black text-white block">
																USD {item.costoNetoFinalActivoUSD?.toLocaleString("es-AR")}
															</span>
															<p className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold">
																El alquiler subsidia USD {item.ahorroTotalRentaUSD?.toLocaleString("es-AR")} del valor de la tierra
															</p>
														</div>
													</div>
												</div>
											);
										})()
									)}

									{/* MÓDULO DE NEGOCIACIÓN PARA CONTADO (SI NO ES PREVENTA NI FINANCIADO) */}
									{!item.esPreventa && !item.esFinanciado && (
										<div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
											<div className="flex justify-between items-center border-b border-slate-800 pb-2">
												<h5 className="font-extrabold text-blue-400 text-xs flex items-center gap-1.5">
													💵 Modalidad al Contado: Estrategia de Negociación
												</h5>
												<span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
													Cierre Directo
												</span>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 text-xs items-center">
												<div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-1">
													<span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block uppercase">
														Ventaja de Liquidez
													</span>
													<p className="text-slate-300 font-medium text-xs leading-snug">
														Permite concretar el boleto con posesión inmediata, optimizando tiempos de obra.
													</p>
												</div>

												{item.ofertaContadoUSD && item.ofertaContadoUSD > 0 ? (
													<div className="bg-slate-900 border border-amber-500/40 p-2.5 sm:p-3 rounded-xl space-y-1">
														<span className="text-amber-400 text-[9px] sm:text-[10px] font-bold block uppercase">
															🎯 Oferta Inicial Sugerida
														</span>
														<div className="flex items-baseline gap-2">
															<span className="text-sm sm:text-base font-black text-amber-300">
																USD {item.ofertaContadoUSD.toLocaleString("es-AR")}
															</span>
															<span className="text-[10px] sm:text-xs text-slate-400 font-normal">
																(Precio Lista: USD {item.costoTierra.toLocaleString("es-AR")})
															</span>
														</div>
													</div>
												) : (
													<div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-1">
														<span className="text-slate-400 text-[9px] sm:text-[10px] font-bold block uppercase">
															Margen de Negociación
														</span>
														<span className="text-xs sm:text-sm font-bold text-white">
															USD {item.costoTierra.toLocaleString("es-AR")}
														</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* PIE DE TARJETA */}
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
										<div className="text-slate-400 text-[11px] sm:text-xs">
											Alquiler Estimado:{" "}
											<strong className="text-emerald-400">
												USD {item.alquilerM2}/m²
											</strong>{" "}
											(~ USD {item.ingresoAnualTotal.toLocaleString("es-AR")}/año)
										</div>

										{propOriginal?.slug && (
											<Link
												href={`/propiedades/${propOriginal.slug}`}
												target="_blank"
												className="w-full sm:w-auto text-center text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
											>
												Ver Ficha Técnica →
											</Link>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 4. BLOQUE DE CONCLUSIONES Y RECOMENDACIONES EDITABLES */}
			{recom?.mostrarSeccion !== false &&
				recom?.tarjetas &&
				recom.tarjetas.some((t: any) => t.activa) &&
				(() => {
					const tarjetasActivas = recom.tarjetas.filter(
						(card: any) => card.activa,
					);
					const cantidad = tarjetasActivas.length;

					const gridClass =
						cantidad === 1
							? "grid-cols-1"
							: cantidad === 2
								? "grid-cols-1 md:grid-cols-2"
								: "grid-cols-1 md:grid-cols-3";

					return (
						<div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
							<h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
								{recom?.tituloGeneral ||
									"🎯 Conclusiones & Recomendaciones de Inversión"}
							</h3>

							<div className={`grid ${gridClass} gap-3 sm:gap-4`}>
								{tarjetasActivas.map((card: any) => (
									<div
										key={card.id}
										className={`bg-slate-950 rounded-xl border border-amber-500/30 flex flex-col justify-between ${
											cantidad === 1 ? "p-5 sm:p-6" : "p-3.5 sm:p-4"
										}`}
									>
										<div className="space-y-2">
											<div className="flex items-center justify-between gap-2 flex-wrap">
												<h4
													className={`font-bold text-amber-400 ${
														cantidad === 1
															? "text-base sm:text-lg"
															: "text-xs sm:text-sm"
													}`}
												>
													{card.titulo}
												</h4>
												{card.opcionAsociadaId && (
													<span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shrink-0">
														📍 {card.opcionAsociadaId}
													</span>
												)}
											</div>

											<p
												className={`text-slate-300 leading-relaxed ${
													cantidad === 1
														? "text-sm sm:text-base mt-2"
														: "text-xs mt-1.5"
												}`}
											>
												{card.texto}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})()}
		</div>
	);
}