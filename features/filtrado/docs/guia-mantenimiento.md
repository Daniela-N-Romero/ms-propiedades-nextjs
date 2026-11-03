# Guía de Mantenimiento y Extensión de Filtros

Esta guía detalla los pasos estandarizados para agregar nuevos criterios de filtrado, mantener el tipado estricto y garantizar que los cambios no introduzcan regresiones de rendimiento ni advertencias de linters.

---

## 1. Checklist para Agregar un Nuevo Filtro

Para incorporar un nuevo parámetro de filtrado (por ejemplo, `aptoProfesional`, `expensasMax` o `potenciaElectrica`), seguí este orden exacto:

### Paso 1: Definir la propiedad en `filtrado.types.ts`
Abrí `features/filtrado/types/filtrado.types.ts` y agregá la propiedad al contrato `FiltrosState`:

```typescript
export interface FiltrosState {
  mercado?: string;
  categoria?: 'venta' | 'alquiler';
  // ...filtros existentes...
  
  // Nuevo filtro:
  aptoProfesional?: boolean;
}
```

### Paso 2: Actualizar `url-query-builder.ts`
El serializador y el parser deben contemplar el nuevo campo para asegurar que la URL sea bidireccional:

1. **En `buildFilterQueryString`:**
   ```typescript
   if (typeof filters.aptoProfesional === 'boolean') {
     params.set('aptoProfesional', String(filters.aptoProfesional));
   }
   ```
2. **En `parseSearchParamsToFilters`:**
   ```typescript
   const apto = searchParams.get('aptoProfesional');
   if (apto !== null) {
     filters.aptoProfesional = apto === 'true';
   }
   ```

### Paso 3: Incrementar `activeCount` en `use-filter-draft.ts`
En `features/filtrado/hooks/use-filter-draft.ts`, dentro del cómputo de `activeCount`:

```typescript
if (typeof draftFilters.aptoProfesional === 'boolean' && draftFilters.aptoProfesional) {
  count++;
}
```

### Paso 4: Agregar el control visual en los componentes
Agregá el input o checkbox tanto en `DesktopFilterSidebar` como en `MobileFilterDrawer`, conectándolo a `updateDraft`:

```tsx
<label className="flex items-center gap-2 cursor-pointer text-xs">
  <input
    type="checkbox"
    checked={Boolean(draftFilters.aptoProfesional)}
    onChange={(e) => updateDraft({ aptoProfesional: e.target.checked || undefined })}
    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
  />
  <span>Apto Profesional</span>
</label>
```

### Paso 5: Conectar la consulta en el Backend (`searchPropiedades`)
En `backend/services/property.service.ts`:
1. Agregá el campo en `SearchFilters`.
2. Asigná la condición correspondiente a `queryWhere`:
   ```typescript
   if (typeof filters.aptoProfesional === 'boolean') {
     queryWhere.aptoProfesional = filters.aptoProfesional;
   }
   ```

---

## 2. Reglas de Arquitectura y Buenas Prácticas

### ⚠️ Prohibido llamar a `setState` en un `useEffect` para sincronizar la URL
Para reflejar cambios externos de URL en el borrador, nunca uses un `useEffect` con `setDraftFilters`.
Usá la comparación durante la fase de render:
```typescript
if (prevParamsString !== currentParamsString) {
  setPrevParamsString(currentParamsString);
  setDraftFilters(parseSearchParamsToFilters(searchParams));
}
```
Esto previene bucles de renderizado, respeta el compilador de React y garantiza un pase limpio por ESLint.

### ⚠️ Preservación del Contexto de Mercado
Al implementar nuevas rutinas de reseteo, recordá siempre que el usuario no debe ser despojado de su mercado:
```typescript
const resetDraft = () => {
  setDraftFilters((prev) => ({
    mercado: prev.mercado, // OBLIGATORIO
  }));
};
```

### ⚠️ Sanitización de Parámetros en Transiciones al Mapa
Cuando se genera el enlace hacia o desde el mapa (`buildListUrlFromMapParams`), los parámetros espaciales efímeros (`lat`, `lng`, `zoom`) **deben ser eliminados** para evitar ensuciar los filtros de listado tradicionales.

---

## 3. Comandos de Verificación Obligatorios

Antes de hacer cualquier commit que afecte al módulo de filtros, ejecutá la suite de validación en la terminal:

```bash
# 1. Chequeo estricto de tipos TypeScript
npx tsc --noEmit

# 2. Análisis estático de ESLint sin warnings
npx eslint features/filtrado/

# 3. Ejecución de pruebas unitarias y de integración
npx vitest run tests/unit/filtrado
```