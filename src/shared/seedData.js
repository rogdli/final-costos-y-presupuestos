export const TIPOS_FUNCIONALES = ['Costo directo', 'Mano de obra directa', 'CIF', 'Gasto Adm. y Venta']
export const COMPORTAMIENTOS = ['Variable', 'Fijo']
export const METODOS_CIF = { UNIDADES: 'unidades', HORAS: 'horas' }

export const seedProductos = [
  { id: 'pollo-asado', nombre: 'Pollo asado', cantidadVendida: 500, horasProduccion: 100, precioCompetencia: 8500 },
  {
    id: 'docena-empanadas',
    nombre: 'Docena de empanadas',
    cantidadVendida: 400,
    horasProduccion: 140,
    precioCompetencia: 9500,
  },
  {
    id: 'milanesa-guarnicion',
    nombre: 'Milanesa con guarnición',
    cantidadVendida: 450,
    horasProduccion: 160,
    precioCompetencia: 10500,
  },
]

export const seedComprobantes = [
  { numero: 1, concepto: 'Compra de pollos frescos', importe: 2600000, productoId: 'pollo-asado', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 2, concepto: 'Compra de carne para empanadas', importe: 1200000, productoId: 'docena-empanadas', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 3, concepto: 'Compra de tapas de empanadas', importe: 720000, productoId: 'docena-empanadas', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 4, concepto: 'Compra de carne para milanesas', importe: 1710000, productoId: 'milanesa-guarnicion', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 5, concepto: 'Compra de papas', importe: 450000, productoId: 'milanesa-guarnicion', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 6, concepto: 'Compra de pan rallado y huevos', importe: 360000, productoId: 'milanesa-guarnicion', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 7, concepto: 'Compra de envases para pollos', importe: 200000, productoId: 'pollo-asado', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 8, concepto: 'Compra de envases para empanadas', importe: 140000, productoId: 'docena-empanadas', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 9, concepto: 'Compra de envases para milanesas', importe: 180000, productoId: 'milanesa-guarnicion', tipoFuncional: 'Costo directo', comportamiento: 'Variable' },
  { numero: 10, concepto: 'Compra de condimentos generales', importe: 250000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 11, concepto: 'Factura de gas', importe: 450000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 12, concepto: 'Factura de energía eléctrica', importe: 550000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 13, concepto: 'Alquiler del local', importe: 1200000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 14, concepto: 'Sueldo supervisor de cocina', importe: 1000000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 15, concepto: 'Limpieza de cocina', importe: 250000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 16, concepto: 'Mantenimiento de equipos', importe: 250000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 17, concepto: 'Depreciación de hornos y freidoras', importe: 350000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 18, concepto: 'Seguro del local', importe: 150000, productoId: null, tipoFuncional: 'CIF', comportamiento: 'Fijo' },
  { numero: 19, concepto: 'Sueldos cocineros', importe: 2400000, productoId: null, tipoFuncional: 'Mano de obra directa', comportamiento: 'Variable' },
  { numero: 20, concepto: 'Formulario F-931 - cargas sociales cocineros', importe: 1150000, productoId: null, tipoFuncional: 'Mano de obra directa', comportamiento: 'Variable' },
  { numero: 21, concepto: 'Sueldos administración y atención', importe: 1400000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
  { numero: 22, concepto: 'Formulario F-931 - cargas sociales administración', importe: 620000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
  { numero: 23, concepto: 'Publicidad y redes sociales', importe: 250000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
  { numero: 24, concepto: 'Honorarios contador', importe: 250000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
  { numero: 25, concepto: 'Internet y sistema de facturación', importe: 100000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
  { numero: 26, concepto: 'Tasas municipales', importe: 300000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
  { numero: 27, concepto: 'Monotributo', importe: 180000, productoId: null, tipoFuncional: 'Gasto Adm. y Venta', comportamiento: 'Fijo' },
]

export const seedUtilidadObjetivo = 1350000
