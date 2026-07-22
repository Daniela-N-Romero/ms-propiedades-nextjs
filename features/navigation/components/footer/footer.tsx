import Link from 'next/link';
import { getContactLinks } from '@/backend/services/config.service';
import { styles } from './footer.styles';

export default async function footer() {
    const links = await getContactLinks();

    return (
        <footer className={styles.footer}>
            {/* SECCIÓN PRINCIPAL DE LINKS */}
            <div className={styles.container}>
                <div className={styles.brandCol}>
                    <h3 className={styles.logo}>MS Propiedades</h3>
                    <p className="text-xs text-slate-400">Especialistas en inmuebles industriales, comerciales y logísticos.</p>
                </div>

                <div>
                    <span className={styles.colTitle}>Búsquedas</span>
                    <ul className={styles.list}>
                        <li><Link href="/propiedades?tipo=industrial" className={styles.link}>Naves Industriales</Link></li>
                        <li><Link href="/propiedades?tipo=industrial&subtipo=galpon" className={styles.link}>Galpones</Link></li>
                        <li><Link href="/propiedades?tipo=comercial" className={styles.link}>Locales Comerciales</Link></li>
                        <li><Link href="/propiedades?tipo=campos" className={styles.link}>Fracciones / Campos</Link></li>
                    </ul>
                </div>

                <div>
                    <span className={styles.colTitle}>Contacto</span>
                    <ul className={styles.list}>
                        <li><a href={links.whatsapp} target="_blank" className="text-green-500 font-medium hover:underline">WhatsApp</a></li>
                        <li><a href={`tel:+${links.telefono}`} className={styles.link}>Llamar</a></li>
                    </ul>
                </div>

                <div>
                    <span className={styles.colTitle}>Seguinos</span>
                    <ul className={styles.list}>
                        <li><a href={links.instagram}target="_blank" className={styles.link}>Instagram</a></li>
                        <li><a href={links.facebook} target="_blank" className={styles.link}>Facebook</a></li>
                        <li><a href={links.linkedIn} target="_blank" className={styles.link}>LinkedIn</a></li>
                    </ul>
                </div>
            </div>

            {/* DISCLAIMER LEGAL INMOBILIARIO */}
            <div className={styles.disclaimerBox}>
                <p>Las medidas, superficies y proporciones consignadas en este sitio web son aproximadas y se exponen a título meramente informativo. Los precios indicados están sujetos a modificaciones sin previo aviso y no constituyen una oferta vinculante.</p>
                <p>Las imágenes, renders y fotografías son de carácter ilustrativo y pueden haber sido modificadas digitalmente o no reflejar el estado actual exacto del inmueble. Las operaciones definitivas están supeditadas a la aprobación del propietario y a la posterior firma del contrato formal.</p>
            </div>

            {/* BARRA INFERIOR / COPYRIGHT / LOGIN SECRETO */}
            <div className={styles.bottomBar}>
                <p>© MS Propiedades 2026. Todos los derechos reservados.</p>
                <div className={styles.loginDiv}>
                    <p>Col. 1219 - CPMCZE (Canning, Ezeiza)</p>

                    {/* El link secreto de administración: se camufla con el fondo, parece texto común */}
                    <Link href="/admin" className={styles.secretLogin}>.  •  </Link>
                </div>
            </div>
        </footer>
    );
}