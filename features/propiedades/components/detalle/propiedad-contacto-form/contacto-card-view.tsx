'use client';

import { styles } from './contacto-card.styles';

interface ContactoCardViewProps {
    formState: {
        nombre: string;
        apellido: string;
        email: string;
        telefono: string;
        mensaje: string;
        isSubmitting: boolean;
        submitted: boolean;
    };
    setters: {
        setNombre: (v: string) => void;
        setApellido: (v: string) => void;
        setEmail: (v: string) => void;
        setTelefono: (v: string) => void;
        setMensaje: (v: string) => void;
    };
    handleSubmitCard: (e: React.SubmitEvent) => void;
}

export default function ContactoCardView({
    formState,
    setters,
    handleSubmitCard
}: ContactoCardViewProps) {

    return (
        <>
                <div className="pt-2 border-t border-slate-100">
                    <h5 className={styles.formTitle}>Enviar Mensaje Directo</h5>

                    {formState.submitted ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center space-y-1">
                            <p className="font-bold">¡Mensaje Enviado!</p>
                            <p>Un asesor se pondrá en contacto a la brevedad.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitCard} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Nombre *"
                                required
                                className={styles.input}
                                value={formState.nombre}
                                onChange={(e) => setters.setNombre(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Apellido *"
                                required
                                className={styles.input}
                                value={formState.apellido}
                                onChange={(e) => setters.setApellido(e.target.value)}
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                required
                                className={styles.input}
                                value={formState.email}
                                onChange={(e) => setters.setEmail(e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono / WhatsApp *"
                                required
                                className={styles.input}
                                value={formState.telefono}
                                onChange={(e) => setters.setTelefono(e.target.value)}
                            />
                            <textarea
                                className={styles.textarea}
                                value={formState.mensaje}
                                onChange={(e) => setters.setMensaje(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={formState.isSubmitting}
                                className={styles.btnSubmit}
                            >
                                {formState.isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
                            </button>
                        </form>
                    )}
                </div>
        </>
    );
}