import { styles } from './contacto-form.styles';

interface FormContactoViewProps {
  formState: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    motivo: string;
    mensaje: string;
    isSubmitting: boolean;
    submitted: boolean;
    motivoSelectId: string;
  };
  setters: {
    setNombre: (v: string) => void;
    setApellido: (v: string) => void;
    setEmail: (v: string) => void;
    setTelefono: (v: string) => void;
    setMotivo: (v: string) => void;
    setMensaje: (v: string) => void;
  };
  handleSubmit: (e: React.SubmitEvent) => void;
}


export default function FormContactoView({
  formState,
  setters,
  handleSubmit,
}: FormContactoViewProps) {
  if (formState.submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3 max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-spartan">¡Consulta Recibida!</h3>
        <p className="text-slate-600 text-sm">
          Muchas gracias por contactarte con MS Propiedades. Un asesor especializado revisará tu solicitud y se pondrá en contacto a la brevedad.
        </p>
      </div>
    );
  }
    return (
        <form id="formulario-contacto" onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-6">
            <div className={styles.columns}>
                <div>
                    <label className={styles.label}>Nombre</label>
                    <input
                        type="text"
                        required
                        value={formState.nombre}
                        onChange={(e) => setters.setNombre(e.target.value)} className={styles.input} />
                </div>
                <div>
                    <label className={styles.label}>Apellido</label>
                    <input
                        type="text"
                        required
                        value={formState.apellido}
                        onChange={(e) => setters.setApellido(e.target.value)}
                        className={styles.input} />
                </div>
            </div>

            <div className={styles.columns}>
                <div>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setters.setEmail(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div>
                    <label className={styles.label}>Teléfono de Contacto</label>
                    <input
                        type="tel"
                        required
                        value={formState.telefono}
                        onChange={(e) => setters.setTelefono(e.target.value)}
                        className={styles.input}
                    />
                </div>
            </div>

            <div>
                <label className={styles.label}>Motivo de la consulta</label>
                <select
                    required
                    className={styles.input}
                    name="motivo"
                    id={formState.motivoSelectId}
                    value={formState.motivo}
                    onChange={(e) => setters.setMotivo(e.target.value)}>

                    <option value="vender">Quiero vender / alquilar mi propiedad</option>
                    <option value="buscar_alquiler">Busco alquiler</option>
                    <option value="buscar_comprar">Busco comprar</option>
                    <option value="tasar">Quiero tasar mi propiedad</option>
                    <option value="asesoramiento">Busco asesoramiento profesional</option>

                </select>
            </div>

            <div>
                <label className={styles.label}>Mensaje o Detalles adicionales</label>
                <textarea
                    rows={4}
                    className={styles.input}
                    placeholder="Contanos qué tipo de nave o lote estás buscando o las características de tu inmueble..."
                    value={formState.mensaje}
                    onChange={(e) => setters.setMensaje(e.target.value)}></textarea>
            </div>

            <button
                type="submit"
                disabled={formState.isSubmitting}
                className={styles.submitFormBtn}
            >
                {formState.isSubmitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
            </button>
        </form>
    )
}


