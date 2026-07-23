import { styles } from './whatsapp-floating-button.styles'
import { formatPrecio } from '@/lib/utils'
import { useWhatsAppButtons } from '@/features/propiedades/hooks/use-whatsapp-buttons';
import { Agente } from '@prisma-client';


interface WhatsAppFloatingButtonProps {
    propiedadId?: number;
    codigo: string;
    slug: string;
    titulo: string;
    precio: number;
    moneda: string;
    agente: Agente;
}

export default function WhatsAppFloatingButton({ codigo, slug, titulo, precio, moneda, agente }: WhatsAppFloatingButtonProps){

const { whatsAppUrl, handleWhatsAppClick } = useWhatsAppButtons({ codigo, slug, titulo, precio, moneda, agente });
    
  return (
                <div className={styles.mobileBottomBar}>
                    <div>
                        <span className={styles.mobileCode}>Código: {codigo}</span>
                        <span className={styles.mobilePrice}>{formatPrecio(precio, moneda)}</span>
                    </div>
    
                    <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleWhatsAppClick}
                        className="bg-[#25D366] text-white font-spartan font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
                    >
                        <span>💬 WhatsApp</span>
                    </a>
                </div>
  )
}
