# ♟️ Patrón Strategy & Factory (`features/propuestas/strategies/`)

## 📌 Propósito y Justificación
El módulo de propuestas soporta múltiples modalidades comerciales (ej. **Logística & Rutas** vs **Inversión & ROI**). Para evitar condicionales masivos (`if/else` o `switch`) repartidos por la interfaz y el backend, utilizamos el patrón de diseño **Strategy** combinado con un **Factory**.

---

## 🏗️ Componentes de la Arquitectura

### 1. Interfaz Base (`propuesta-strategy.interface.ts`)
Define el contrato estándar que debe implementar cualquier tipo de propuesta en la plataforma:
- `type`: Enum de Prisma que identifica el tipo de propuesta (`TipoPropuestaEnum`).
- `calcularMetricas(items, payloadData)`: Procesa la lista de inmuebles y retorna el cálculo financiero o logístico.
- `renderView({ propuesta, metricas })`: Devuelve la vista de React lista para renderizar el informe público.

### 2. Estrategias Concretas
- **`InversionStrategy` (`inversion-strategy.tsx`)**:
  - Calcula la matemática financiera de desarrollo y obra.
  - Modela el FOS, costo de obra ($USD/m²), ahorro por tarifa preferencial, flujo de fondos (lote financiado vs contado), desglose de anticipo/cuotas y ROI proyectado.
  - Evalúa la cualidad de **Preventa** y meses de entrega estimados.
  - Renderiza `PropuestaInversionView`.

- **`LogisticaStrategy` (`logistica-strategy.tsx`)**:
  - Procesa los tiempos de viaje y distancias hacia el punto de referencia/interés.
  - Genera el precio por m² referencial y la prioridad de ubicaciones.
  - Renderiza `PropuestaLogisticaView` (con mapas interactivos y trazado de rutas via OSRM).

### 3. Factoría (`propuesta-factory.ts`)
Encargada de instanciar dinámicamente la estrategia adecuada según el tipo de propuesta guardado en la base de datos:

```typescript
export class PropuestaFactory {
  static getStrategy(tipo?: string): PropuestaStrategy {
    return this.strategies[tipo] || this.strategies['LOGISTICA_RUTAS'];
  }
}