# 📂 Estructura General del Módulo (`features/propuestas/`)

## 📌 Mapa de Carpetas y Responsabilidades

```text
features/propuestas/
├── api/                  # Handlers HTTP delegados desde app/api
├── components/           # Componentes de UI y secciones de formulario
│   └── form-sections/    # Subsecciones modulares del formulario de edición
├── controllers/          # Controladores HTTP (reciben Request, devuelven NextResponse)
├── docs/                 # Documentación técnica del módulo
├── hooks/                # Sub-hooks modulares y orquestador usePropuestaFormState
├── services/             # Lógica de base de datos e integración con Prisma
├── strategies/           # Patrón Strategy/Factory para tipos de propuesta
├── types/                # Interfaces TypeScript unificadas y sin duplicación
├── utils/                # Sanitizadores y utilidades de serialización
└── views/                # Vistas públicas de propuestas (Inversión y Logística)
```

## 🎯 Flujo de Trabajo Unificado
1. Ruta HTTP (app/api/propuestas/route.ts):
Actúa únicamente como conector público, delegando a features/propuestas/controllers/propuesta.controller.ts.

2. Controlador:
Invoca a PropuestasService en features/propuestas/services/propuesta.service.ts.

3. Servicio & Base de Datos:
Consulta Prisma y pasa la respuesta cruda a sanitizer.ts.

4. Sanitizador:
Limpia Decimal y Date mediante serializarPrisma, normaliza jerarquías de nombres de parque/zona y entrega una entidad serializable (PropuestaComercialEntity).

5. Formulario & Hooks:
El hook usePropuestaFormState coordina la carga del catálogo, selección de inmuebles y recomendaciones mediante 3 sub-hooks especializados.

6. Estrategia Visual:PropuestaFactory selecciona la estrategia correcta para calcular indicadores clave y renderizar la vista final.