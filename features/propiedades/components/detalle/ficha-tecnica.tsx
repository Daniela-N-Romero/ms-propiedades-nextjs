import { formatPrecio } from "@/lib/utils-formatting";
import { styles } from "./ficha-tecnica.styles";
import { ICONOS_CARACTERISTICAS } from "@/types/caracteristicas";

interface FichaTecnicaProps {
	precio: number;
	moneda: string;
	financiacion?: string | null;
	superficieTotal: number | null;
	superficieCubierta: number | null;
	descripcion: string | null;
	caracteristicas?: Record<string, any> | null;
	subtipoNombre?: string;
}

export default function FichaTecnica({
	precio,
	moneda,
	financiacion,
	superficieTotal,
	superficieCubierta,
	descripcion,
	caracteristicas,
	subtipoNombre,
}: FichaTecnicaProps) {
	const formatCamelCase = (str: string) => {
		return str
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (s) => s.toUpperCase())
			.trim();
	};

	const caracteristicasValidas = Object.entries(caracteristicas || {}).filter(
		([key, value]) => {
			if (key === "bano" && caracteristicas?.banos !== undefined) return false;
			if (value === null || value === undefined || value === "") return false;
			if (typeof value === "boolean") return value === true;
			if (typeof value === "number") return value > 0;
			if (typeof value === "object" && value !== null) {
				const obj = value as Record<string, any>;
				if (obj.custom) return Boolean(obj.label);
				return (
					obj.valor !== undefined && obj.valor !== "" && obj.valor !== null
				);
			}
			return true;
		},
	);

	return (
		<div className="space-y-8">
			{/* BARRA HIGHLIGHTS */}
			<div className={styles.highlightsContainer}>
				<div className={styles.highlightItem}>
					<span className={styles.highlightLabel}>Valor de la Propiedad</span>
					<span className={styles.highlightPrice}>
						{formatPrecio(precio, moneda)}
						{financiacion && (
							<span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
								💳 {financiacion}
							</span>
						)}
					</span>
				</div>

				<div className={styles.highlightItem}>
					<span className={styles.highlightLabel}>Superficie Total</span>
					<span className={styles.highlightValue}>
						{superficieTotal
							? `${superficieTotal.toLocaleString("es-AR")} m²`
							: "Consultar"}
					</span>
				</div>

				<div className={styles.highlightItem}>
					<span className={styles.highlightLabel}>Superficie Cubierta</span>
					<span className={styles.highlightValue}>
						{superficieCubierta
							? `${superficieCubierta.toLocaleString("es-AR")} m²`
							: "Consultar"}
					</span>
				</div>

				<div className={styles.highlightItem}>
					<span className={styles.highlightLabel}>Tipo de Inmueble</span>
					<span className={styles.highlightValue}>
						{subtipoNombre || "Industrial"}
					</span>
				</div>
			</div>

			{/* DICCIONARIO DE CARACTERÍSTICAS */}
			{caracteristicasValidas.length > 0 && (
				<div>
					<h3 className={styles.sectionTitle}>Equipamiento y Servicios</h3>
					<div className={styles.featuresGrid}>
						{caracteristicasValidas.map(([key, value]) => {
							let label = "";
							let icon = "✔";
							let valorFormateado = "";

							const valObj =
								typeof value === "object" && value !== null
									? (value as Record<string, any>)
									: null;

							// A. Si es una característica PERSONALIZADA
							if (valObj && valObj.custom) {
								label = valObj.label;
								icon = valObj.icon || "✨";
							} else {
								const metaKey =
									key === "oficinasM2"
										? "oficinas"
										: key === "bano"
											? "banos"
											: key;
								const meta = ICONOS_CARACTERISTICAS[metaKey] || {
									label: formatCamelCase(key),
									icon: "✔",
								};
								label = meta.label;
								icon = meta.icon;

								// B. Formato Híbrido { modo: 'm2' | 'cant', valor: 50 }
								if (valObj) {
									const modo = valObj.modo || "cant";
									const val = valObj.valor;
									if (val !== undefined && val !== "") {
										valorFormateado = `: ${val} ${modo === "m2" ? "m²" : modo === "cant" && Number(val) === 1 ? "" : ""}`;
									}
								}
								// C. Selects (Ej: Potencia T1/T2/T3)
								else if (
									typeof value === "string" &&
									key === "potenciaElectrica"
								) {
									valorFormateado = `: ${value}`;
								}
								// D. Antiguos Numéricos
								else if (
									typeof value === "number" ||
									typeof value === "string"
								) {
									valorFormateado = `: ${value}`;
									if (key.toLowerCase().includes("altura")) {
										valorFormateado += " m";
									} else if (key === "oficinasM2") {
										valorFormateado += " m²";
									}
								}
							}

							return (
								<div key={key} className={styles.featureCard}>
									<span className={styles.featureIcon}>{icon}</span>
									<span className={styles.featureLabel}>
										{label}
										{typeof value !== "boolean" && valorFormateado}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* DESCRIPCIÓN */}
			{descripcion && (
				<div className="mb-6">
					<h3 className={styles.sectionTitle}>Descripción General</h3>
					<div className={styles.descriptionText}>{descripcion}</div>
					<p className="mt-3 text-slate-500 font-bold">
						MS PROPIEDADES INDUSTRIALES - Matías Settecerze Col. 1219
					</p>
				</div>
			)}
		</div>
	);
}
