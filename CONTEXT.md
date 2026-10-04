# Contexto del proyecto: Mini app de costos

Documento de referencia del trabajo integrador de **Sistemas de Costos y Presupuestos**. Explica qué hace la aplicación, qué pide la consigna, cómo funciona cada pestaña, y cómo adaptar el mismo sistema a un rubro propio.

---

## 1. Qué es la aplicación

Una mini app web (React + Vite) que, a partir de los comprobantes de compras y gastos de un mes y de los datos de los productos que vende una PyME, calcula:

- El **costo directo** de cada producto (materiales + mano de obra directa).
- Los **costos indirectos de fabricación (CIF)** asignados por dos criterios: unidades vendidas u horas de producción.
- El **costo total unitario** (costeo por absorción, informativo).
- El **margen de contribución**, el **punto de equilibrio** en pesos y el **resultado operativo** (costeo variable).
- Si el **precio actual** cubre los costos fijos, y qué **precio mínimo** y **precio sugerido** (con utilidad objetivo) conviene cobrar.
- **Escenarios** de simulación (cambiar precios, cantidades y utilidad objetivo sin tocar los datos base).

No tiene backend. Los datos se guardan automáticamente en el navegador (`localStorage`) y se pueden **exportar e importar como Excel** (`.xlsx`).

El caso de prueba que trae cargado es la **Rotisería**, y sus resultados coinciden número por número con la resolución de cátedra (`Resolucion_Practico_Costos_Rotiseria.xlsx`). Esa coincidencia está verificada en los tests (`pnpm test`).

---

## 2. La consigna

Fuentes: `Enunciado_Practico_Costos_Rotiseria_Actualizado.md` y `Requerimientos mini app de costos.md`.

### 2.1 Objetivo del trabajo

El objetivo no es "una calculadora", sino un **sistema de información de costos** que ayude a tomar decisiones de gestión:

1. Clasificar comprobantes como costos directos, CIF o gastos de administración y ventas.
2. Clasificar los importes como fijos o variables.
3. Asignar mano de obra directa y cargas sociales de cocineros según horas de producción.
4. Asignar CIF por dos criterios: unidades vendidas y horas de producción.
5. Determinar costo directo unitario, CIF unitario y costo total unitario.
6. Calcular margen de contribución, punto de equilibrio y resultado operativo.
7. Redefinir precios de venta cuando los precios de la competencia no cubren los costos fijos.
8. Traducir la lógica de costos en requerimientos funcionales para una mini app.

### 2.2 Requerimientos obligatorios (tabla de la cátedra)

| Módulo | Requerimiento | Detalle | Obligatorio |
|---|---|---|---|
| Productos | Alta de productos | Nombre, cantidad vendida, horas de producción y precio de competencia | Sí |
| Comprobantes | Carga de compras y gastos | Concepto, importe, tipo funcional, comportamiento y producto asociado | Sí |
| Costos directos | Materiales y MOD | Asociar materias primas, envases, sueldos de cocineros y F-931 de cocineros | Sí |
| CIF | Asignación de indirectos | Permitir elegir unidades vendidas u horas de producción | Sí |
| Gastos fijos | Administración y venta | Incluir sueldos administrativos, F-931 administración, monotributo y otros gastos | Sí |
| Costos unitarios | Cálculo automático | Costo directo unitario, CIF unitario y costo total unitario | Sí |
| Precios | Comparación competencia | Precio competencia, precio mínimo y precio sugerido con utilidad | Sí |
| Punto de equilibrio | Cálculo automático | Margen de contribución, PE en pesos y resultado operativo | Sí |
| Alertas | Control de cobertura | Indicar si con precio actual cubre o no costos fijos | Sí |
| Simulación | Escenarios | Permitir modificar precios, cantidades, costos y utilidad objetivo | Sí |

### 2.3 Consignas de resolución del caso (en orden)

**A. Clasificación de comprobantes**
1. Clasificar cada comprobante como Material Directo, Mano de Obra Directa, CIF o Gasto de Administración y Ventas.
2. Indicar si cada comprobante es costo/gasto fijo o variable.
3. Los sueldos de cocineros y el F-931 de cocineros son MOD porque existen horas de producción para distribuirlos.
4. Condimentos, gas, electricidad, alquiler, supervisor, limpieza, mantenimiento, depreciación y seguro son CIF fijos.
5. Sueldos de administración, F-931 de administración, publicidad, contador, internet, tasas municipales y monotributo son gastos fijos de administración y ventas.

**B. Costo directo unitario**
6. Determinar los materiales directos de cada producto.
7. Calcular el costo laboral total de cocineros (sueldos + F-931).
8. Calcular la tasa de MOD por hora: costo laboral total / horas totales de producción.
9. Asignar la MOD a cada producto según sus horas de producción.
10. Calcular el costo directo total y unitario de cada producto.

**C. Asignación de CIF**
11. Calcular el total de CIF fijos.
12. Asignar los CIF por unidades vendidas.
13. Asignar los CIF por horas de producción.
14. Calcular el CIF unitario bajo ambos métodos.
15. Comparar los resultados y explicar cuál criterio es más razonable.

**D. Precio de competencia y punto de equilibrio**
16. Tomar como precio inicial el precio de la competencia.
17. Margen de contribución unitario = precio de venta − costo variable unitario.
18. Margen de contribución total.
19. Costos fijos totales = CIF fijos + gastos fijos de administración y ventas.
20. Determinar si la empresa cubre sus costos fijos con los precios de la competencia.

**E. Redefinición de precios**
21. Contribución marginal unitaria mínima = costos fijos totales / unidades vendidas.
22. Precio mínimo de equilibrio = costo variable unitario + contribución marginal unitaria mínima.
23. Precios sugeridos incorporando una utilidad mensual deseada.
24. Alerta si el margen de contribución total es menor que los costos fijos totales.

### 2.4 Conceptos teóricos que justifican el diseño

Tomados de los apuntes de la cátedra (`Sistema de Costeo en Pymes.md`, `Unidad_1_Costos_y_Gastos presentacion.md`, `Clase jueves 14_05.md`):

- **Costo vs. gasto:** el costo permite producir; el gasto permite operar.
- **Directo vs. indirecto:** un costo directo se identifica con el producto; un CIF es compartido y hay que distribuirlo con una base (unidades, horas máquina, horas MOD, etc.).
- **Costeo por absorción:** asigna todos los costos, fijos incluidos, a los productos. Sirve para el costo total unitario, pero los CIF fijos se reparten con un criterio arbitrario.
- **Costeo variable (directo):** solo resta costos variables para calcular el margen de contribución por producto. Los costos fijos se tratan a nivel empresa. Es el método que usa la app para precios y punto de equilibrio, porque evita decisiones erróneas (por ejemplo, discontinuar un producto que sí aporta a cubrir fijos).
- **Punto de equilibrio:** nivel de actividad donde ingresos = costos; PE en unidades = CF / MC unitario; PE en pesos = CF / índice de margen de contribución.

---

## 3. Cómo funciona la app, pestaña por pestaña

La barra lateral oscura tiene nueve secciones. En la barra superior de cada una hay un título, una descripción, un **indicador de cobertura** (salvo en Punto de equilibrio y Simulador, donde el mensaje completo ya está visible) y los botones **Exportar Excel** / **Importar Excel**.

### 3.1 Productos
- **Qué muestra:** tabla con los productos (nombre, cantidad vendida, horas de producción, precio de competencia).
- **Qué permite:** agregar y eliminar productos.
- **Requerimiento:** Alta de productos.
- **Cálculo:** ninguno; es la fuente de datos de todo lo demás.

### 3.2 Comprobantes
- **Qué muestra:** los comprobantes del período, con número, concepto, importe, tipo funcional (etiqueta), comportamiento fijo/variable (etiqueta) y producto asociado.
- **Qué permite:** cargar y eliminar comprobantes. Los campos son concepto, importe, tipo funcional (Costo directo, Mano de obra directa, CIF, Gasto Adm. y Venta), comportamiento (Variable / Fijo) y producto asociado (o "General").
- **Requerimiento:** Carga de compras y gastos.
- **Cálculo:** ninguno directo; sus importes alimentan las demás pestañas según el tipo funcional.

### 3.3 Costos directos
- **Qué muestra:** costo laboral de cocineros (MOD), tasa MOD por hora, y por producto: materiales directos, MOD asignada, costo directo total y costo directo unitario.
- **Cálculo:**
  - Materiales del producto = suma de comprobantes tipo *Costo directo* asociados a ese producto.
  - Costo laboral = suma de comprobantes tipo *Mano de obra directa*.
  - Tasa MOD/hora = costo laboral / horas totales de producción.
  - MOD asignada = tasa × horas del producto.
  - Costo directo unitario = (materiales + MOD asignada) / cantidad vendida.
- **Requerimiento:** Materiales y MOD.

### 3.4 CIF
- **Qué muestra:** CIF fijos totales, tasa de asignación, y por producto el CIF asignado y el CIF unitario.
- **Qué permite:** elegir el criterio de asignación con un toggle: **Unidades vendidas** u **Horas de producción**.
- **Cálculo:**
  - CIF total = suma de comprobantes tipo *CIF*.
  - Por unidades: tasa = CIF total / unidades totales; asignado = tasa × cantidad.
  - Por horas: tasa = CIF total / horas totales; asignado = tasa × horas.
  - CIF unitario = CIF asignado / cantidad vendida.
- **Requerimiento:** Asignación de indirectos.
- **Nota:** el criterio elegido afecta a *Costos unitarios*. No afecta a *Precios* ni a *Punto de equilibrio*, que usan costeo variable.

### 3.5 Gastos fijos
- **Qué muestra:** total de gastos de administración y ventas, y el detalle de cada comprobante incluido.
- **Cálculo:** suma de comprobantes tipo *Gasto Adm. y Venta*.
- **Requerimiento:** Administración y venta.

### 3.6 Costos unitarios
- **Qué muestra:** por producto, costo directo unitario, CIF unitario (según el criterio elegido en CIF) y costo total unitario.
- **Cálculo:** costo total unitario = costo directo unitario + CIF unitario.
- **Concepto:** costeo por absorción, informativo. No se usa para decidir precios.
- **Requerimiento:** Cálculo automático de costos unitarios.

### 3.7 Precios
- **Qué muestra:** por producto, precio de competencia, margen de contribución unitario con ese precio, precio mínimo (punto de equilibrio) y precio sugerido (con utilidad objetivo).
- **Cálculo:**
  - Costo variable unitario = costo directo unitario (MD + MOD; el CIF no entra porque es fijo).
  - Contribución mínima unitaria = costos fijos totales / unidades totales.
  - Contribución deseada = contribución mínima + utilidad objetivo / unidades totales.
  - Precio mínimo = costo variable unitario + contribución mínima.
  - Precio sugerido = costo variable unitario + contribución deseada.
- **Requerimiento:** Comparación con competencia.

### 3.8 Punto de equilibrio
- **Qué muestra:** cinco indicadores: costos fijos totales, margen de contribución total, índice de margen de contribución, punto de equilibrio en pesos y resultado operativo. Debajo, el mensaje de cobertura completo.
- **Cálculo:**
  - MC unitario = precio − costo variable unitario; MC total = Σ MC unitario × cantidad.
  - Índice de MC (IMC) = MC total / ventas totales.
  - PE en $ = costos fijos totales / IMC.
  - Resultado operativo = MC total − costos fijos totales.
  - Cubre costos fijos si el resultado operativo ≥ 0.
- **Requerimientos:** Cálculo automático de PE y Alertas.

### 3.9 Simulador
- **Qué muestra:** para cada producto, dos campos opcionales (precio y cantidad) que sobreescriben el valor base. Un campo de utilidad mensual objetivo. Debajo, margen de contribución y resultado operativo simulados, y el mensaje de cobertura del escenario.
- **Qué permite:** modificar escenarios y restablecerlos. Los datos base no cambian.
- **Requerimiento:** Simulación.

### 3.10 Elementos transversales
- **Indicador de cobertura (badge):** visible en la barra superior salvo en Punto de equilibrio y Simulador. Muestra "Cubre costos fijos" o "No cubre costos fijos".
- **Exportar Excel:** genera `costos-rotiseria.xlsx` con tres hojas: *Productos*, *Comprobantes* y *Parametros* (método CIF y utilidad objetivo).
- **Importar Excel:** lee un archivo con esas mismas hojas y reemplaza los datos actuales.
- **Autoguardado:** el estado se guarda en `localStorage` del navegador en cada cambio.

---

## 4. Estructura del código

Organizada por **capacidad de negocio** (*screaming architecture*). Cada carpeta bajo `src/` corresponde a un requerimiento o pestaña:

```
src/
├── App.jsx                       # Navegación lateral, estado global, orquestación
├── productos/                    # Pestaña Productos
├── comprobantes/                 # Pestaña Comprobantes
├── costos-directos/              # Costos directos  (costosDirectos.calc.js + test)
├── cif/                          # CIF              (cif.calc.js + test)
├── gastos-fijos/                 # Gastos fijos     (gastosFijos.calc.js + test)
├── costos-unitarios/             # Costos unitarios (costosUnitarios.calc.js + test)
├── precios/                      # Precios          (precios.calc.js + test)
├── punto-equilibrio/             # Punto de equilibrio (puntoEquilibrio.calc.js + test)
├── alertas/                      # Badge y alerta de cobertura
├── simulacion/                   # Simulador        (simulacion.calc.js + test)
└── shared/
    ├── seedData.js               # Caso de la Rotisería (datos de arranque)
    ├── storage.js                # localStorage + exportar/importar Excel
    ├── comprobantes.js           # Helpers de suma por tipo funcional
    ├── format.js                 # Formato de moneda y porcentaje (es-AR)
    ├── styles/tokens.css         # Tokens de diseño
    └── ui/                       # Card, Table, Field, Button, Tag, MetricTile, etc.
```

Regla: los archivos `*.calc.js` son funciones puras, sin React. Se testean en aislamiento contra los valores de la resolución.

Comandos:

```bash
pnpm install
pnpm dev         # http://localhost:5173
pnpm test        # 16 tests del motor de cálculo
pnpm build
pnpm lint
```

---

## 5. Cómo adaptar el sistema a un rubro propio

El sistema no depende de la rotisería. Depende de **cuatro tipos de datos** y de **las mismas reglas de clasificación**. Para cambiar de rubro hay que reemplazar los datos, no la lógica.

### 5.1 Qué tiene que tener el rubro

Para que los conceptos de la consigna se puedan aplicar, el negocio elegido necesita:

1. **Al menos 2 o 3 productos o servicios distintos** que se vendan en un período (cantidad vendida).
2. **Un proceso de transformación o prestación medible en horas** por producto. Puede ser horas de producción, de elaboración, de servicio o de máquina. Sin horas no hay MOD ni CIF por horas.
3. **Costos directos identificables por producto** (materiales, insumos, envases, componentes).
4. **Mano de obra con sueldos y cargas sociales** que se pueda repartir por horas.
5. **Costos indirectos compartidos** entre productos (energía, alquiler, supervisión, limpieza, mantenimiento, depreciación, seguros).
6. **Gastos de administración y ventas** (contador, administración, publicidad, tasas, monotributo, internet).
7. **Un precio de competencia** observable por producto.

Un rubro que no tiene la punto 2 (horas) no puede cumplir los requerimientos de MOD y CIF por horas. Conviene descartarlo.

### 5.2 Criterios para elegir el rubro

- Que tenga **procesos reales de producción o servicio** que se puedan medir en horas. Ejemplos de tipo: elaboración de alimentos, panadería, confección, carpintería, imprenta, talleres, lavadero, peluquería con varios servicios, catering, laboratorio, servicios técnicos con cuadrillas.
- Que la **MOD sea significativa** y tenga sueldos con cargas sociales (F-931), no solo honorarios.
- Que tenga **al menos un indirecto compartido grande** (alquiler, energía, supervisión).
- Que el **precio de competencia sea fácil de relevar** (listas de precios publicadas, menú, tarifario).
- Que los **datos del mes se puedan estimar o conseguir** (aunque sean ficticios, deben ser coherentes).
- Evitar rubros puramente de reventa o comercio: no tienen horas de producción ni MOD directa, y el ejercicio pierde sentido.

### 5.3 Qué reemplazar y qué dejar igual

| Elemento | Qué hacer |
|---|---|
| Nombres de productos, cantidades, horas y precios de competencia | **Reemplazar** en `shared/seedData.js` (`seedProductos`) |
| Comprobantes (conceptos, importes, tipo funcional, comportamiento, producto asociado) | **Reemplazar** en `shared/seedData.js` (`seedComprobantes`) |
| Utilidad mensual objetivo | **Reemplazar** en `shared/seedData.js` (`seedUtilidadObjetivo`) |
| Nombre de la app y textos de la barra lateral | Cambiar en `App.jsx` (`<p className="app-sidebar__brand">`) y `index.html` (`<title>`) |
| Descripciones de cada sección | Cambiar en `App.jsx` (campo `descripcion` en `SECCIONES`) |
| Reglas de clasificación (tipos funcionales y comportamientos) | **Dejar igual.** Son las de la consigna. |
| Fórmulas de cálculo (`*.calc.js`) | **Dejar igual.** Son las de la consigna. |
| Diseño, estructura de carpetas, Excel de exportación | **Dejar igual**, salvo que quieras cambiar el estilo. |

### 5.4 Plantilla de datos para el rubro nuevo

Completar estas dos tablas antes de tocar código.

**Productos o servicios (mínimo 3)**

| Producto / servicio | Cantidad vendida (período) | Horas de producción/servicio | Precio de competencia |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

**Comprobantes del período (mínimo 20, con la misma variedad que la rotisería)**

| N° | Concepto | Importe | Tipo funcional | Comportamiento | Producto asociado |
|---|---|---|---|---|---|
| 1 | | | Costo directo / Mano de obra directa / CIF / Gasto Adm. y Venta | Variable / Fijo | Nombre del producto o "General" |

Con esa variedad, el ejercicio debe incluir:

- **Costos directos variables asociados a productos** (materiales, insumos, envases), al menos uno por producto.
- **MOD con cargas sociales** (sueldos del personal de producción + F-931 de producción).
- **CIF fijos** compartidos (al menos 5 conceptos, por ejemplo energía, alquiler, supervisión, limpieza, mantenimiento, depreciación, seguros).
- **Gastos fijos de administración y ventas** (al menos 5 conceptos).
- **Un resultado que cubra costos fijos con precios de competencia y otro que no**, para que las alertas y la redefinición de precios tengan sentido. Si el rubro cubre con holgura, la sección de precios sugeridos pierde valor; ajustar cantidades o precios para que haya un caso ajustado.

### 5.5 Verificación antes de entregar

1. Los tipos funcionales suman lo que se espera: la MOD solo sale de los comprobantes *Mano de obra directa*, el CIF solo de *CIF*, y los gastos fijos solo de *Gasto Adm. y Venta*.
2. Todos los comprobantes *Costo directo* tienen producto asociado. Un material "General" no se asigna a ningún producto y queda sin costo directo.
3. Las horas de producción suman un total mayor que cero.
4. El precio sugerido por producto es mayor que el precio mínimo, y ambos son mayores que el costo variable unitario.
5. Con el precio sugerido aplicado en el Simulador, el resultado operativo es igual a la utilidad objetivo (chequeo de consistencia del motor).
6. Exportar a Excel, cerrar la app, importar de nuevo: los datos no cambian.
7. Escribir en el informe, para cada resultado, qué fórmula de la consigna lo produce.

### 5.6 Qué entregar en el trabajo

- La **app adaptada** (repo con código, README y este documento).
- El **Excel de resolución** del rubro nuevo, con las mismas siete hojas que la cátedra usa para la Rotisería (Datos, Clasificación, Costos unitarios, CIF por unidades, CIF por horas, PE y precios, Requerimientos). Se puede generar con la app y completar a mano las hojas de cálculo intermedias.
- La **justificación** de la elección del CIF más razonable (consigna 15) para el rubro elegido.
- La **explicación del criterio** de costeo variable frente a absorción para la decisión de precios (consigna 16 a 24).

---

## 6. Resumen para retomar el trabajo

- La app ya está completa y verificada con el caso de la Rotisería.
- Para un rubro propio: elegir el negocio según 5.1 y 5.2, completar las plantillas de 5.4, reemplazar solo los datos semilla y los textos de marca según 5.3, y verificar con 5.5.
- Las fórmulas no se modifican. Si el resultado no tiene sentido, el problema está en los datos o en la clasificación de los comprobantes, no en el motor.
