import Link from 'next/link';
import Image from 'next/image'
import { links } from '@/features/navigation/components/navigation-links'
import { styles } from './header.styles';

interface HeaderViewProps {
    isMenuOpen: boolean;
    toggleMenu: () => void;
}

export default function HeaderView({ isMenuOpen, toggleMenu }: HeaderViewProps) {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* LOGO */}
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/images/logos/ms-blue-logo.svg"
                        width={190}
                        height={150}
                        alt="Logo de MS Propiedades"
                    />
                </Link>

                {/* NAVEGACIÓN DESKTOP */}
                <nav className={styles.navDesktop}>
                    <Link href="/" className={styles.link}>Inicio</Link>
                    <Link href="/propiedades" className={styles.link}>Buscador</Link>
                    <Link href="/tasaciones" className={styles.link}>Tasaciones</Link>
                    <Link href="/contacto" className={styles.link}>Contacto</Link>

                    {/* Redes e interacciones */}
                    <div className={styles.socialGroup}>
                        <a href={links.instagram} target="_blank" className={styles.socialLink}>
                            <Image src="/images/logos/social-media/instagram-logo.svg" width={20} height={20} alt="Enlace a Instagram" />
                        </a>
                        <a href={links.facebook} target="_blank" className={styles.socialLink}>
                            <Image src="/images/logos/social-media/facebook-logo.svg" width={23} height={23} alt="Enlace a Facebook" />
                        </a>
                        <a href={links.linkedIn} target="_blank" className={styles.socialLink}>
                            <Image src="/images/logos/social-media/linkedin-logo.svg" width={23} height={23} alt="Enlace a LinkedIn" />
                        </a>
                        <a href={links.whatsapp} target="_blank" className="text-sm font-semibold text-green-600 hover:text-green-700 pl-2">
                            <Image src="/images/logos/social-media/whatsapp-logo.svg" width={26} height={26} alt="Enlace a WhatsApp" />
                        </a>
                    </div>
                </nav>

                {/* BOTÓN HAMBURGUESA MÓVIL */}
                <button onClick={toggleMenu} className={styles.burgerBtn} aria-label="Menu">
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* MENÚ MÓVIL DESPLEGABLE */}
            {isMenuOpen && (
                <nav className={styles.mobileMenu}>
                    <Link href="/" onClick={toggleMenu} className={styles.mobileLink}>Inicio</Link>
                    <Link href="/propiedades" onClick={toggleMenu} className={styles.mobileLink}>Buscador</Link>
                    <Link href="/tasaciones" onClick={toggleMenu} className={styles.mobileLink}>Tasaciones</Link>
                    <Link href="/contacto" onClick={toggleMenu} className={styles.mobileLink}>Contacto</Link>

                    <div className={styles.mobileSocials}>
                        <a href={links.instagram} target="_blank" className={styles.mobileLink}> 
                            <Image src="/images/logos/social-media/instagram-logo.svg" width={20} height={20} alt="Enlace a Instagram" />
                            </a>

                        <a href={links.facebook} target="_blank" className={styles.mobileLink}>
                            <Image src="/images/logos/social-media/facebook-logo.svg" width={23} height={23} alt="Enlace a Facebook" />
                        </a>
                        <a href={links.linkedIn} target="_blank" className={styles.mobileLink}>
                            <Image src="/images/logos/social-media/linkedin-logo.svg" width={23} height={23} alt="Enlace a LinkedIn" />
                        </a>
                        <a href={links.whatsapp} target="_blank" className="text-green-600 font-bold">
                            <Image src="/images/logos/social-media/whatsapp-logo.svg" width={26} height={26} alt="Enlace a WhatsApp" />
                        </a>
                    </div>
                </nav>
            )}
        </header>
    );
}