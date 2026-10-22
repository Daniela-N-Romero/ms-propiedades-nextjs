# 🛠️ Guía de Modificación y Mantenimiento (`features/propuestas/docs/guides.md`)

Esta guía detalla los pasos exactos a seguir para realizar modificaciones comunes en el módulo de propuestas, garantizando la consistencia arquitectónica y evitando inconsistencias de datos o tipado.

---

## 1. ➕ Agregar un Nuevo Campo a la Propiedad o al Ítem de Propuesta

Gracias al pipeline genérico de `serializarPrisma`, agregar un nuevo atributo requiere mínima intervención.

### Caso A: El campo proviene del esquema de Prisma (ej. `esPreventa`, `fechaEstimadaEntrega`)
1. **Prisma Schema**: Agrega la columna en `prisma/schema.prisma` y ejecuta la migración:
   ```bash
   npx prisma db push
   ```
   
2. Tipos (types/propuesta.types.ts): 
    - Si es un atributo del inmueble BBDD, agrégalo a PropiedadBase.
    - Si es un valor configurable por ítem dentro de la propuesta, agrégalo a ItemForm.

3. Hook de Formulario (hooks/use-items-propuesta.ts):

    - En la inicialización (initialItems.map(...)), el operador spread ...i pasará el campo automáticamente. Solo define un valor por defecto seguro si el valor viene undefined / null.
    - En la función togglePropiedad, asigna el valor inicial al seleccionar la propiedad del catálogo.

4. Vistas / Componentes (components/form-sections/ o views/): Renderiza el nuevo campo o checkbox usando la función updateItem.

### Caso B: El campo es Calculado / Derivado

1. Cálculo Matemático: Implementa la fórmula dentro de la estrategia correspondiente (strategies/inversion-strategy.tsx o strategies/logistica-strategy.tsx).

2. Tipado de Salida: Agrega la propiedad calculada a la interfaz MetricaInversionItem.

3. Renderizado: Consúmelo en la vista pública (views/propuesta-inversion-view.tsx).

## 2. 🚀 Agregar un Nuevo Tipo de Propuesta Comercial
Ejemplo: Agregar el tipo OCTOR_COMERCIAL o ALQUILER_DESARROLLO.

1. Enum en Prisma:
Agrega la nueva opción al enum en prisma/schema.prisma:
   ```typescript
        enum TipoPropuestaEnum {
            LOGISTICA_RUTAS
            INVERSION_DESARROLLO
            NUEVO_TIPO_PROPUESTA
        }
   ```

   Ejecuta `npx prisma db push` o `npx prisma generate`.


2. Crear la Estrategia Concreta (strategies/nuevo-tipo-strategy.tsx):
Crea la clase implementando PropuestaStrategy:

   ```typescript
        import { TipoPropuestaEnum } from '@/prisma/generated/client';
        import { PropuestaStrategy } from './propuesta-strategy.interface';

        export class NuevoTipoStrategy implements PropuestaStrategy {
            type = TipoPropuestaEnum.NUEVO_TIPO_PROPUESTA;

            calcularMetricas(items: PropuestaItemEntity[], payloadData?: any) {
                // Lógica de cálculo específica
                return items.map(...);
            }

            renderView({ propuesta, metricas }: { propuesta: any; metricas: any }) {
                return <NuevoTipoView metricas="{metricas}" propuesta="{propuesta}"/>;
            }
        }
   ```

3. Registrar en la Factoría (strategies/propuesta-factory.ts):

   ```typescript
        private static strategies: Record<string, PropuestaStrategy> = {
            LOGISTICA_RUTAS: new LogisticaStrategy(),
            INVERSION_DESARROLLO: new InversionStrategy(),
            NUEVO_TIPO_PROPUESTA: new NuevoTipoStrategy(), // 👈 Registrar aquí
        };
   ```

4. Crear la Vista Pública (views/nuevo-tipo-view.tsx):

    Diseña el layout exclusivo para este tipo de propuesta. La página pública /app/propuestas/[slug]/page.tsx la renderizará automáticamente sin cambios.

## 3. 🎨 Modificar o Crear una Sección en el Formulario
1. Crear o Editar Componente: Ubica la sección en components/form-sections/ (ej. nueva-seccion.tsx).

2. Inyectar Estados:

    Si la sección requiere nuevos estados generales, agrégalos en hooks/use-propuesta-form-state.ts o en el sub-hook especializado correspondiente (use-catalogo-propuestas, use-recomendaciones-form o use-items-propuesta).

3. Conectar en propuesta-form.tsx: Pasa los handlers y valores desestructurados desde el hook orquestador a la subsección.
## 4. ⚡ Optimizar Consultas a la Base de Datos
Si necesitas incluir nuevas relaciones desde Prisma en el servicio:

1. Dirígete a services/propuesta.service.ts.

2. Agrega la relación dentro del bloque include.

3. Regla de Rendimiento: Limita colecciones masivas mediante take: 1 y select (ejemplo: imágenes de portada o accesorios), para evitar transferir payloads pesados hacia el cliente.