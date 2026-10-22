# Pipeline de Sanitización y Serialización (`sanitizer.ts`)

## 📌 Propósito y Justificación
El módulo de sanitización de propuestas se encarga de convertir y normalizar las entidades crudas provenientes de Prisma ORM en estructuras de datos planas, seguras y serializables para los componentes de cliente en Next.js.

### ¿Por qué existe este módulo?
1. **Tipos `Decimal` de Prisma**: Prisma devuelve columnas numéricas con formato `Decimal`, las cuales Next.js no puede serializar mediante JSON para Client Components (provocando errores de ejecución).
2. **Jerarquía Inteligente de Nombres**: Resuelve dinámicamente el nombre de la ubicación/parque siguiendo la prioridad: `Parque Industrial` ➔ `Zona / Localidad` ➔ `Título de la Propiedad`.
3. **Escalabilidad y Mantenibilidad**: Evita mapeos manuales propensos a errores cada vez que se agrega un campo nuevo al esquema de la base de datos.

---

##  Utilidad Global: `serializarPrisma<T>`
Ubicada en `/lib/sanitizers.ts`, esta función recursiva procesa cualquier objeto o array de Prisma convirtiendo:
- Instancias de `Decimal` a `number` nativo de JavaScript.
- Instancias de `Date` a strings ISO-8601.
- Arrays y objetos anidados de manera transparente mediante recursión.

---

## 🔄 Funciones Principales

### `sanearItemsPropuesta(itemsRaw: any[]): PropuestaItemEntity[]`
- Aplica `serializarPrisma` sobre el array de ítems.
- Conserva automáticamente todos los campos del modelo mediante la sintaxis *spread* (`...item`).
- Establece valores por defecto seguros para la matemática de inversión (`fosAplicado`, `porcentajeAnticipo`, `mesesObra`, etc.).
- Normaliza la jerarquía de parques/localidades.

### `sanearPropuestaComercial(propuestaRaw: any): PropuestaComercialEntity`
- Convierte el objeto raíz de la propuesta comercial.
- Parsea el campo `payloadJson` de tipo `JsonValue` a `PropuestaPayload`.
- Delega el saneamiento del array de ítems a `sanearItemsPropuesta`.

---

## 💡 Guía para Desarrolladores (Agregar Nuevos Campos)
Gracias a la implementación genérica con `serializarPrisma`:
> **No es necesario modificar `sanitizer.ts` al agregar nuevos campos en Prisma** (ej. `esPreventa`, `fechaEstimadaEntrega`), **a menos que el campo requiera un cálculo transformativo o un fallback especial.**
