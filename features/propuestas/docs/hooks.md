# Custom Hooks y Gestión de Estado (`features/propuestas/hooks/`)

##  Overview
Para evitar el anti-patrón de "God Hook" (Hook Todopoderoso), la lógica del formulario de propuestas se divide en **tres sub-hooks especializados** orquestados por un hook principal.

---

## Modulos de Hooks

### 1. `useCatalogoPropuestas(esInversion: boolean)`
- **Responsabilidad**: Descarga asíncrona y filtrado del catálogo de propiedades y parques industriales.
- **Funcionalidad**:
  - Trae propiedades activas desde `/api/properties` y parques desde `/api/parques-industriales`.
  - Filtra por término de búsqueda (título, código, zona) y aplica el filtro exclusivo de "Terrenos/Lotes" si la propuesta es de tipo `INVERSION_DESARROLLO`.

### 2. `useRecomendacionesForm(initialPayload?: any)`
- **Responsabilidad**: Gestión de la sección de conclusiones estratégicas.
- **Funcionalidad**:
  - Administra el estado de visibilidad y título de la sección.
  - Permite crear, actualizar y eliminar tarjetas de recomendación personalizadas.

### 3. `useItemsPropuesta(...)`
- **Responsabilidad**: Gestión de los inmuebles seleccionados en la propuesta.
- **Funcionalidad**:
  - Maneja el toggle (agregar/quitar) de propiedades en la propuesta.
  - Ejecuta la **re-sincronización asíncrona de nombres de parques**: Cuando se completa la descarga del catálogo, cruza `parqueIndustrialId` para garantizar que la tarjeta muestre el nombre del parque industrial real.
  - Proporciona utilidades de cálculo rápido de métricas e indicadores de mayor ROI (`maxRoiCalculado`).

---

## 🎼 Hook Orquestador: `usePropuestaFormState`
Ubicado en `features/propuestas/hooks/use-propuesta-form-state.ts`.
- **Propósito**: Actúa como punto de entrada unificado para los componentes de vista (`propuesta-form.tsx`).
- Instancia los sub-hooks especializados y expone una interfaz limpia con todos los métodos y estados necesarios para la vista.

```typescript
// Ejemplo de uso en componente
const formState = usePropuestaFormState(initialData, propuestaId);
const { itemsSeleccionados, togglePropiedad, tarjetasRecom } = formState;