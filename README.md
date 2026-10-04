# Costos Rotisería — El Buen Sabor

Mini app de gestión de costos para el trabajo integrador de Sistemas de Costos y Presupuestos. Cubre los 10 requerimientos obligatorios de la cátedra usando como caso de validación la Rotisería "El Buen Sabor".

## Cómo correr

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # motor de cálculo, verificado contra la resolución de cátedra
npm run build
```

## Estructura

El proyecto usa **screaming architecture**: cada carpeta bajo `src/` es una capacidad de negocio, no una capa técnica.

| Carpeta | Requerimiento obligatorio |
|---|---|
| `productos/` | Alta de productos |
| `comprobantes/` | Carga de compras y gastos |
| `costos-directos/` | Materiales y MOD |
| `cif/` | Asignación de indirectos (por unidades u horas) |
| `gastos-fijos/` | Administración y venta |
| `costos-unitarios/` | Costo directo, CIF y costo total unitario |
| `precios/` | Comparación con competencia, precio mínimo y sugerido |
| `punto-equilibrio/` | Margen de contribución, PE en $ y resultado operativo |
| `alertas/` | Control de cobertura de costos fijos |
| `simulacion/` | Escenarios (precio, cantidad, costos, utilidad objetivo) |

Cada capacidad con lógica de cálculo expone un módulo `*.calc.js` puro junto a su test. `shared/` contiene lo transversal: datos semilla, persistencia y las primitivas de UI del sistema de diseño.

## Datos y persistencia

La app arranca con el caso completo de la Rotisería (3 productos, 27 comprobantes) precargado. El estado se autoguarda en `localStorage`. Los botones **Exportar Excel** / **Importar Excel** generan o leen un `.xlsx` con hojas de Productos, Comprobantes y Parámetros.

## Validación

El motor de cálculo (`*.calc.test.js`, `npm test`) está verificado número por número contra `Resolucion_Practico_Costos_Rotiseria.xlsx`, la resolución de cátedra del práctico.
