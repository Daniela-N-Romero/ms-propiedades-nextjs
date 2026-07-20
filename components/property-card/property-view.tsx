//ejemplo de componente presentador: estructura que se renderiza, sin logica. solo recibe datos y los muestra

import { styles } from './PropertyCardStyles';
import { Propiedad } from '@prisma-client';



export default function PropertyView({ propiedad }: { propiedad: Propiedad }) {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        {/* Acá iría la imagen de Cloudinary */}
      </div>
      <div className={styles.content}>
        <h3 className={styles.price}>{propiedad.moneda} {Number(propiedad.precio)}</h3>
        <p className={styles.title}>{propiedad.titulo}</p>
      </div>
    </div>
  );
}