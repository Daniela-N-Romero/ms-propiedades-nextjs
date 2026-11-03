# Arquitectura Técnica del Módulo de Filtrado

## 1. Visión General y Objetivos
El módulo `features/filtrado` centraliza y estandariza la lógica de filtrado de inventario tanto para la vista de listado (`/propiedades`) como para las vistas geoespaciales (`/propiedades/mapa` y `/admin/mapa-privado`).

### Principios Fundamentales
1. **Decoupled Draft State (Patrón Borrador Desacoplado):** Ninguna interacción unitaria en la interfaz (tildar una localidad, mover un slider, alternar una moneda) dispara navegación directa o consultas a la base de datos de manera inmediata. Todo se acumula en un estado local en memoria (`draftFilters`).
2. **Navegación por Lotes (Batch Application):** La sincronización hacia la URL se consolida en una única transición no bloqueante (`useTransition`) al hacer clic en el botón primario de confirmación (`"Aplicar Filtros"`).
3. **Sincronización Reactiva sin Efectos Secundarios:** La sincronización entre parámetros de URL externos y el estado borrador ocurre durante el ciclo de renderizado de React (comparación de primitivas `searchParamsString`), eliminando bucles infinitos, parpadeos del DOM y advertencias de linter (`react-hooks/set-state-in-effect`).
4. **Preservación Contextual del Mercado:** El parámetro `mercado` (`industrial`, `residencial`, `comercial`) define la partición del catálogo activo. Al limpiar los criterios de búsqueda transitorios (precios, localidades, subtipos), el mercado se mantiene fijado para no romper el contexto de navegación del usuario.

---

## 2. Diagrama de Flujo de Datos

```
[ Usuario interactúa con la UI ]
       │
       ├─► Checkbox / Input / Select ──► updateDraft() / toggleArrayDraft()
       │                                        │
       │                                        ▼
       │                               [ draftFilters (Memoria) ]
       │                                        │
       └─► Clic en "Aplicar Filtros" ───────────┘
                       │
                       ▼
            buildFilterQueryString() (Helper Puro)
                       │
                       ▼
          startTransition(() => router.push(url))
                       │
                       ▼
             [ Next.js URL / SearchParams ]
                       │
      ┌────────────────┴────────────────┐
      ▼                                 ▼
[ Server Component: page.tsx ]     [ useFilterDraft() ]
      │                                 │
      ▼                                 ▼
searchPropiedades(searchParams)    Rastreo en Render:
      │                            prevParamsString !== currentParamsString
      ▼                                 │
[ Prisma / PostgreSQL ]                 ▼
      │                            Sincroniza draftFilters
      ▼
Renderiza resultados actualizados
```

---

## 3. Estructura de Directorios

```text
features/filtrado/
├── components/
│   ├── desktop-filter-sidebar.tsx   # Panel lateral para pantallas medianas/grandes
│   ├── mobile-filter-drawer.tsx     # Drawer táctil modal con Vaul/Radix para mobile
│   └── filtro-zonas-jerarquico.tsx  # Selector geográfico en 3 niveles (Región -> Partidos -> Localidades)
├── docs/
│   ├── arquitectura-filtros.md      # Este documento
│   └── guia-mantenimiento.md        # Procedimientos para extender y mantener filtros
├── hooks/
│   └── use-filter-draft.ts          # Hook central de estado borrador y navegación
├── types/
│   └── filtrado.types.ts            # Interfaces de estado, contratos y parámetros
├── utils/
│   └── url-query-builder.ts         # Serializador y parser puro de searchParams
└── index.ts                         # Fachada pública del módulo
```

---

## 4. Componentes Clave y Responsabilidades

### `useFilterDraft` (`hooks/use-filter-draft.ts`)
Orquesta el ciclo de vida del borrador de filtros:
- Almacena `draftFilters` en un `useState` local.
- Detecta cambios en la URL comparando `currentParamsString` con `prevParamsString` directamente en fase de render, descartando renders intermedios de forma instantánea.
- Provee mutadores atómicos (`updateDraft`, `toggleArrayDraft`, `setMultipleInArrayDraft`).
- Ejecuta `applyFilters` envolviendo el `router.push` en `startTransition`.
- Calcula `activeCount` con memoización (`useMemo`), computando todos los criterios activos incluyendo rangos numéricos y colecciones.

### `url-query-builder.ts` (`utils/url-query-builder.ts`)
Módulo puro sin dependencias de React:
- **`buildFilterQueryString(filters)`:** Serializa arrays ordenados, sanitiza valores vacíos (`null`, `undefined`, `NaN`, `""`) y antepone el prefijo `?` únicamente si existen parámetros activos.
- **`parseSearchParamsToFilters(searchParams)`:** Decodifica los parámetros desde un `URLSearchParams`, tipando arrays numéricos (`localidad`), arrays de texto (`subtipo`) y valores escalares.

### `FiltroZonasJerarquico` (`components/filtro-zonas-jerarquico.tsx`)
Administra la navegación geográfica en 3 niveles:
1. **Región Principal (`ZonaPadre`):** Selector de nivel macro (ej. GBA Sur, GBA Norte, CABA).
2. **Partido (`PartidoConLocalidades`):** Agrupación intermedia con checkbox maestro para seleccionar o deseleccionar todas las localidades pertenecientes en un solo paso.
3. **Localidades Hijas (`LocalidadHija`):** Checkboxes individuales indentados dentro de un acordeón desplegable por partido.

---

## 5. Pruebas y Validación de Calidad
El módulo cuenta con cobertura automatizada en `tests/unit/filtrado/`:
- **`url-query-builder.test.ts`:** Validación de serialización vacía, acumulación de arrays, saneamiento de nulos y preservación de mercado.
- **`use-filter-draft.test.ts`:** Validación de `activeCount`, reseteo preservando mercado y sincronización ante mutaciones externas de URL.
- **`mobile-filter-drawer.test.tsx`:** Prueba de integración validando que no ocurran navegaciones ni re-renders de red hasta que se presione el botón de confirmación.