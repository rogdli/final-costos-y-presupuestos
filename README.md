# Costos Rotisería

Mini app para calcular costos, precios y punto de equilibrio de una PyME. Cubre los 10 requerimientos obligatorios de la materia y usa como caso de prueba una rotisería.

## Cómo correr

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm test      # motor de cálculo, comparado con la resolución de cátedra
pnpm build
```

## Estructura

Cada carpeta de `src/` corresponde a una capacidad del negocio, no a una capa técnica.

| Carpeta | Requerimiento |
|---|---|
| `productos/` | Alta de productos |
| `comprobantes/` | Carga de compras y gastos |
| `costos-directos/` | Materiales y MOD |
| `cif/` | Asignación de indirectos por unidades u horas |
| `gastos-fijos/` | Administración y venta |
| `costos-unitarios/` | Costo directo, CIF y costo total unitario |
| `precios/` | Comparación con la competencia, precio mínimo y sugerido |
| `punto-equilibrio/` | Margen de contribución, PE en $ y resultado operativo |
| `alertas/` | Cobertura de costos fijos |
| `simulacion/` | Escenarios de precio, cantidad y utilidad objetivo |

Las carpetas con cálculos tienen un módulo `*.calc.js` sin React, con su test al lado. `shared/` reúne lo que usan varias carpetas: datos de ejemplo, persistencia y componentes de interfaz.

## Datos y persistencia

La app arranca con el caso de la rotisería cargado: 3 productos y 27 comprobantes. Los cambios se guardan solos en el `localStorage` del navegador.

**Exportar Excel** descarga un `.xlsx` con las hojas Productos, Comprobantes y Parametros. **Importar Excel** lee ese mismo formato.

## Validación

Los tests (`*.calc.test.js`, `pnpm test`) comparan cada resultado del motor de cálculo con la resolución de cátedra, `Resolucion_Practico_Costos_Rotiseria.xlsx`.
