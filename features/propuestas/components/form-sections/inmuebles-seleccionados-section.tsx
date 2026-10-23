"use client";

import React from "react";
import { ItemForm, PropiedadSimple } from "../../types/propuesta.types";

interface Props {
	itemsSeleccionados: ItemForm[];
	setItemsSeleccionados: React.Dispatch<React.SetStateAction<ItemForm[]>>;
	propiedadesBD: PropiedadSimple[];
	extraerSuperficieLote: (p: PropiedadSimple) => number;
	extraerMesesEntrega: (p: PropiedadSimple, item?: ItemForm) => number;
	togglePropiedad: (prop: PropiedadSimple) => void;
	esInversion: boolean;
	calcularMetricasItem: (item: ItemForm) => {
		supNave: number;
		costoObraTotal: number;
		inversionTotal: number;
		ingresoAnualUSD: number;
		roiAnual: number;
	};
}

export function InmueblesSeleccionadosSection({
	itemsSeleccionados,
	setItemsSeleccionados,
	propiedadesBD,
	extraerSuperficieLote,
	extraerMesesEntrega,
	togglePropiedad,
	esInversion,
	calcularMetricasItem,
}: Props) {
	const parseSeguro = (val: any): number => {
		if (val === null || val === undefined) return 0;
		const cleanStr = String(val).replace(/[^0-9.]/g, "");
		const num = Number(cleanStr);
		return isNaN(num) ? 0 : num;
	};

	const updateItem = (propiedadId: number, campos: Partial<ItemForm>) => {
		setItemsSeleccionados(
			itemsSeleccionados.map((i) =>
				i.propiedadId === propiedadId ? { ...i, ...campos } : i,
			),
		);
	};

	return (
		<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
			<h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
				🏬 Inmuebles Seleccionados ({itemsSeleccionados.length})
			</h2>

			{itemsSeleccionados.length === 0 ? (
				<div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
					Aún no has seleccionado propiedades. Selecciona al menos una del
					catálogo inferior.
				</div>
			) : (
				<div className="space-y-4">
					{itemsSeleccionados.map((item, idx) => {
						const prop = propiedadesBD.find((p) => p.id === item.propiedadId);
						if (!prop) return null;
						// 🔍 AGREGAR ESTE LOG DE CONTROL VISUAL:
						console.log(`🖼️ [DEBUG RENDER ITEM #${idx + 1}]`, {
							item_esPreventa: item.esPreventa,
							item_mesesEntrega: item.mesesEntrega,
							prop_esPreventa: prop.esPreventa,
						});
						const supLote = extraerSuperficieLote(prop);
						const mesesEntregaCalculados = extraerMesesEntrega(prop, item);

						return (
							<div
								key={item.propiedadId}
								className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 shadow-2xs"
							>
								<div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
									<div>
										<p>
											<span className="bg-slate-800 text-white font-bold text-xs px-2.5 py-0.5 rounded-md">
												#{idx + 1}
											</span>
											<span className="font-bold text-sm text-slate-900 ml-1.5">
												{prop.titulo}
											</span>
											<span className="ml-1 text-xs text-slate-500 font-semibold">
												({prop.moneda}{" "}
												{parseSeguro(prop.precio).toLocaleString("es-AR")} |
												Lote: {supLote.toLocaleString("es-AR")} m²)
											</span>
										</p>
									</div>
									<button
										type="button"
										onClick={() => togglePropiedad(prop)}
										className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
									>
										✕ Quitar
									</button>
								</div>

								{esInversion ? (
									<div className="space-y-4">
										{/* RESUMEN FINANCIERO EN TIEMPO REAL */}
										{(() => {
											const metricas = calcularMetricasItem(item);
											return (
												<div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-white">
													<div className="flex items-center gap-4 text-xs">
														<div>
															<span className="text-[10px] font-bold text-slate-400 block uppercase">
																Inversión Total
															</span>
															<strong className="text-white font-extrabold">
																USD{" "}
																{metricas.inversionTotal.toLocaleString(
																	"es-AR",
																)}
															</strong>
														</div>
														<div>
															<span className="text-[10px] font-bold text-slate-400 block uppercase">
																Ingreso Anual Est.
															</span>
															<strong className="text-emerald-400 font-extrabold">
																USD{" "}
																{metricas.ingresoAnualUSD.toLocaleString(
																	"es-AR",
																)}{" "}
																/ año
															</strong>
														</div>
													</div>

													<div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/40">
														<span className="text-[10px] font-extrabold text-amber-400 uppercase">
															ROI Proyectado:
														</span>
														<strong className="text-sm font-black text-amber-400">
															{metricas.roiAnual}% Anual
														</strong>
													</div>
												</div>
											);
										})()}

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											<div>
												<label className="block text-[11px] font-bold text-slate-700 mb-1">
													1. Parque / Ubicación (Auto desde DB o Editable)
												</label>
												<input
													type="text"
													value={item.nombre ?? ""}
													onChange={(e) =>
														updateItem(prop.id, { nombre: e.target.value })
													}
													className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-amber-500"
												/>
											</div>

											<div>
												<label className="block text-[11px] font-bold text-slate-700 mb-1">
													2. Accesos / Conectividad (Opcional - Breve)
												</label>
												<input
													type="text"
													value={item.notaLogistica ?? ""}
													onChange={(e) =>
														updateItem(prop.id, {
															notaLogistica: e.target.value,
														})
													}
													placeholder="Ej: Salida directa a Autopista Ezeiza-Cañuelas km 42"
													className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
												/>
											</div>
										</div>

										{/* FOS e Inputs Financieros */}
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80">
											<div>
												<label className="block text-[11px] font-bold text-amber-900 mb-1">
													FOS Aplicado
												</label>
												<input
													type="number"
													step="0.05"
													min="0.1"
													max="1"
													value={item.fosAplicado ?? 0.6}
													onChange={(e) => {
														const fosVal = Number(e.target.value);
														const nuevaNave =
															supLote > 0 ? Math.round(supLote * fosVal) : 0;
														updateItem(prop.id, {
															fosAplicado: fosVal,
															supNaveProyectada: nuevaNave,
														});
													}}
													className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-black text-amber-900 outline-none focus:border-amber-500"
												/>
											</div>

											<div>
												<label className="block text-[11px] font-bold text-slate-700 mb-1">
													Nave (m²)
												</label>
												<input
													type="number"
													value={item.supNaveProyectada ?? 0}
													onChange={(e) =>
														updateItem(prop.id, {
															supNaveProyectada: Number(e.target.value),
														})
													}
													className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
												/>
											</div>

											<div>
												<label className="block text-[11px] font-bold text-slate-700 mb-1">
													Alquiler ($USD/m²)
												</label>
												<input
													type="number"
													step="0.5"
													value={item.alquilerM2Estimado ?? 5.0}
													onChange={(e) =>
														updateItem(prop.id, {
															alquilerM2Estimado: Number(e.target.value),
														})
													}
													className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2 text-xs font-black text-emerald-900 outline-none focus:border-emerald-500"
												/>
											</div>

											<div>
												<label className="block text-[11px] font-bold text-slate-700 mb-1">
													Plan de Pago
												</label>
												<input
													type="text"
													value={item.cuotasTexto ?? ""}
													onChange={(e) =>
														updateItem(prop.id, {
															cuotasTexto: e.target.value,
														})
													}
													placeholder="Opcional"
													className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 outline-none focus:border-amber-500"
												/>
											</div>
										</div>

										{/* REFERENCIA DESDE LA BBDD */}
										{prop.financiacion && (
											<div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
												<span>
													📌 <strong>Condiciones de financiación:</strong>{" "}
													{prop.financiacion}
												</span>
												<button
													type="button"
													onClick={() => {
														updateItem(prop.id, {
															cuotasTexto: prop.financiacion || "",
														});
													}}
													className="text-[10px] bg-amber-200/60 hover:bg-amber-300/60 font-bold px-2.5 py-1 rounded-lg text-amber-950 transition-colors"
												>
													Usar de Referencia
												</button>
											</div>
										)}

										{/* MODALIDAD DE COMPRA Y CAMPOS DE DESEMBOLSO */}
										<div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
											<div className="flex items-center justify-between border-b border-slate-100 pb-2">
												<span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
													💳 Esquema de Compra y Desembolso
												</span>
												<div className="flex gap-2">
													<button
														type="button"
														onClick={() =>
															updateItem(prop.id, { esFinanciado: true })
														}
														className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
															item.esFinanciado !== false
																? "bg-amber-500 text-slate-950"
																: "bg-slate-100 text-slate-600"
														}`}
													>
														Lote Financiado
													</button>
													<button
														type="button"
														onClick={() =>
															updateItem(prop.id, { esFinanciado: false })
														}
														className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
															item.esFinanciado === false
																? "bg-amber-500 text-slate-950"
																: "bg-slate-100 text-slate-600"
														}`}
													>
														Al Contado
													</button>
												</div>
											</div>

											{/* ESTADO DE PREVENTA (INFORMATIVO DESDE BBDD) */}
											<div className="flex items-center gap-2 pt-2 border-t border-slate-100">
												<div className="flex items-center gap-2 text-xs font-bold text-slate-700">
													<>
													<span
														className={`w-3 h-3 rounded-full ${prop.esPreventa ? "bg-amber-500" : "bg-slate-300"}`}
													/>
													<span>
														{prop.esPreventa
															? "🚀 Lote en Preventa"
															: "📍 Posesión / Entrega Inmediata"}
													</span>
													</>
													{item.esPreventa && (
														<p className="text-slate-600 mt-1 block font-medium">
															Faltan ~{mesesEntregaCalculados} meses para la posesión (Fecha estimada:{" "}
															{prop.fechaEstimadaEntrega
																? new Date(
																		prop.fechaEstimadaEntrega,
																	).toLocaleDateString("es-AR", {
																		month: "long",
																		year: "numeric",
																	})
																: "No definida"}
															).
														</p>
													)}
												</div>
											</div>

											{item.esFinanciado === false ? (
												<div className="space-y-3">
													<p className="text-xs text-slate-600 font-medium">
														ℹ️ El pago es al contado, por lo que el desembolso
														inicial es igual al total de la inversión en tierra.
													</p>
													<div>
														<label className="block text-[11px] font-bold text-slate-700 mb-1">
															Oferta Sugerida por Pago Contado (Opcional)
														</label>
														<input
															type="number"
															placeholder="Ej: USD 230.000 (Sugerencia de negociación)"
															value={item.ofertaContadoUSD ?? ""}
															onChange={(e) =>
																updateItem(prop.id, {
																	ofertaContadoUSD: e.target.value
																		? Number(e.target.value)
																		: undefined,
																})
															}
															className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
														/>
													</div>
												</div>
											) : (
												<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
													<div>
														<label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
															% Anticipo Lote
														</label>
														<input
															type="number"
															value={item.porcentajeAnticipo ?? 0}
															onChange={(e) =>
																updateItem(prop.id, {
																	porcentajeAnticipo: Number(e.target.value),
																})
															}
															className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold outline-none"
														/>
													</div>
													<div>
														<label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
															Plazo Cuotas Lote
														</label>
														<input
															type="number"
															value={item.cantidadCuotas ?? 24}
															onChange={(e) =>
																updateItem(prop.id, {
																	cantidadCuotas: Number(e.target.value),
																})
															}
															className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold outline-none"
														/>
													</div>
													<div>
														<label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
															Meses Obra (Vacancia)
														</label>
														<input
															type="number"
															value={item.mesesObra ?? 8}
															onChange={(e) =>
																updateItem(prop.id, {
																	mesesObra: Number(e.target.value),
																})
															}
															className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold outline-none"
														/>
													</div>
												</div>
											)}
										</div>
										<div>
											<label className="block text-[11px] font-bold text-slate-700 mb-1">
												Notas especiales
											</label>
											<input
												type="text"
												value={item.notaEspecial ?? ""}
												onChange={(e) =>
													updateItem(prop.id, {
														notaEspecial: e.target.value,
													})
												}
												placeholder="Aclaraciones necesarias acerca de la propiedad (opcional)"
												className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 outline-none focus:border-amber-500"
											/>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<input
											type="text"
											placeholder="Nota Logística"
											value={item.notaLogistica ?? ""}
											onChange={(e) =>
												updateItem(prop.id, { notaLogistica: e.target.value })
											}
											className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
										/>
										<input
											type="text"
											placeholder="Tiempo / Salida Vial"
											value={item.tiempoEstimadoString ?? ""}
											onChange={(e) =>
												updateItem(prop.id, {
													tiempoEstimadoString: e.target.value,
												})
											}
											className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
										/>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
