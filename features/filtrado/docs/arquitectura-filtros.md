# Arquitectura y Ciclo de Vida del Módulo de Filtros

**MS Propiedades Industriales**  
*Módulo: `features/filtrado` (Modo Lista y Modo Mapa)*

---

## 1. Problema Previo vs. Nueva Solución

### El Problema (Enfoque Reactivo Inmediato)
Anteriormente, cada interacción del usuario (marcar un checkbox de localidad, seleccionar un subtipo de inmueble o escribir un dígito en el rango de precios) disparaba inmediatamente una navegación en el router de Next.js (`router.push`).
* **En el Servidor:** Cada navegación forzaba al Server Component a re-ejecutar en paralelo consultas pesadas a la base de datos (`searchPropiedades`, `getLocalidadesActivasPorTipo`, `getSubtiposPorTipoMercado`).
* **En Mobile:** El hilo de ejecución del navegador se bloqueaba, generando la sensación de que los checkboxes no respondían al tacto o requerían múltiples toques.
* **En Desktop:** La grilla de resultados o el mapa parpadeaban continuamente (Layout Shift) antes de que el usuario terminara de configurar sus criterios.

### La Solución (Patrón Draft State + Batching Unificado)
Se desacopla la **interacción del usuario** de la **ejecución de la consulta**:
1. Al cargar la pantalla, los parámetros de la URL se leen una sola vez y se clonan en un estado provisional en memoria (`draftFilters`).
2. Cualquier interacción (tildar, destildar, escribir números) muta únicamente ese estado local a velocidad nativa (< 10ms), sin llamadas de red ni recargas.
3. El usuario presiona el botón **"Aplicar Filtros (X)"** (tanto en Mobile como en Desktop).
4. El helper `buildFilterQueryString` limpia, valida y consolida todos los parámetros en una sola URL sin duplicados.
5. Se dispara **1 sola petición de red** protegida por `useTransition` para evitar bloqueos visuales.

---

## 2. Diagrama de Flujo de Datos

```
[ URL Actual de Next.js ]
          │
          ▼ (Al montar: parseSearchParamsToFilters)
[ Estado Borrador: draftFilters (useFilterDraft) ] ◄── (Checkboxes / Inputs reactivos locales)
          │
          ▼ (Usuario presiona "Aplicar Filtros")
[ Serializador: buildFilterQueryString ]
          │  - Elimina duplicados (?localidad=1&localidad=1)
          │  - Descarta valores inválidos o NaN
          │  - Preserva claves estructurales (?mercado=industrial)
          ▼
[ router.push / Next.js Server Component ]
          │
          ▼
[ Prisma ORM: searchPropiedades (1 sola query) ]
          │
          ▼
[ Actualización Fluida de Resultados / Mapa ]
```

---

## 3. Estructura de Archivos del Módulo

* **`types/filtrado.types.ts`:** Define el contrato de datos TypeScript para filtros, catálogos y componentes.
* **`utils/url-query-builder.ts`:** Funciones puras (sin dependencias de React) encargadas de parsear y serializar los parámetros de búsqueda de forma higiénica.
* **`hooks/use-filter-draft.ts`:** Hook central que orquesta el estado en borrador, la alternancia de opciones y la ejecución de la consulta.
* **`components/panel-filtros.tsx`:** Contenedor visual que aloja los controles tanto para el sidebar de escritorio como para el drawer móvil.
* **`tests/filtrado/url-query-builder.test.ts`:** Batería de pruebas unitarias que blindan el formato de las URLs contra regresiones.

---

## 4. Guía para Agregar un Nuevo Filtro

Si en el futuro se necesita añadir un nuevo criterio de búsqueda (por ejemplo, `fuerzaMotriz: boolean` o `alturaMin: number`):

1. **Declarar en Tipos (`types/filtrado.types.ts`):**
   Agregar la propiedad opcional a la interfaz `FiltrosState`.
2. **Sanitizar en Serializador (`utils/url-query-builder.ts`):**
   * En `buildFilterQueryString`, agregar la condición para escribir el parámetro en `params.set(...)` si tiene un valor válido.
   * En `parseSearchParamsToFilters`, extraerlo de `searchParams` y convertirlo a su tipo de dato correspondiente (booleano, número o string).
3. **Actualizar Contador (`use-filter-draft.ts`):**
   Sumar el nuevo criterio dentro del cálculo del `useMemo` de `activeCount`.
4. **Agregar Test (`tests/filtrado/url-query-builder.test.ts`):**
   Comprobar que el nuevo parámetro se serialice y parsee adecuadamente.