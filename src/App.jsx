import { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Receipt,
  Hammer,
  Factory,
  Building2,
  Calculator,
  Tag as TagIcon,
  Scale,
  SlidersHorizontal,
  Download,
  Upload,
  TriangleAlert,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import './App.css'
import { seedProductos, seedComprobantes, seedUtilidadObjetivo } from './shared/seedData'
import { cargarEstado, guardarEstado, exportarExcel, importarExcel } from './shared/storage'
import { calcularCasoCompleto, simular } from './simulacion/simulacion.calc'
import { calcularDesgloseFijos } from './gastos-fijos/gastosFijos.calc'
import { METODO_CIF } from './cif/cif.calc'
import Button from './shared/ui/Button'
import CoberturaBadge from './alertas/CoberturaBadge'

import ProductosForm from './productos/ProductosForm'
import ComprobantesForm from './comprobantes/ComprobantesForm'
import CostosDirectos from './costos-directos/CostosDirectos'
import Cif from './cif/Cif'
import GastosFijos from './gastos-fijos/GastosFijos'
import CostosUnitarios from './costos-unitarios/CostosUnitarios'
import Precios from './precios/Precios'
import PuntoEquilibrio from './punto-equilibrio/PuntoEquilibrio'
import Simulador from './simulacion/Simulador'

const SECCIONES = [
  {
    id: 'productos',
    label: 'Productos',
    Icon: Package,
    descripcion: 'Alta de productos: cantidad vendida, horas de producción y precio de competencia.',
  },
  {
    id: 'comprobantes',
    label: 'Comprobantes',
    Icon: Receipt,
    descripcion: 'Carga de compras y gastos, clasificados por tipo funcional y comportamiento.',
  },
  {
    id: 'costos-directos',
    label: 'Costos directos',
    Icon: Hammer,
    descripcion: 'Comprobantes imputados a un producto: materiales y mano de obra directa.',
  },
  {
    id: 'cif',
    label: 'Indirectos',
    Icon: Factory,
    descripcion: 'Pool de costos indirectos repartido entre productos por unidades vendidas u horas de producción.',
  },
  {
    id: 'gastos-fijos',
    label: 'Costos fijos',
    Icon: Building2,
    descripcion: 'Gastos de administración y ventas, y total de costos fijos de la empresa.',
  },
  {
    id: 'costos-unitarios',
    label: 'Costos unitarios',
    Icon: Calculator,
    descripcion: 'Costo directo, indirecto, total y variable unitario por producto.',
  },
  {
    id: 'precios',
    label: 'Precios',
    Icon: TagIcon,
    descripcion: 'Precio de competencia comparado contra el precio mínimo y el sugerido.',
  },
  {
    id: 'punto-equilibrio',
    label: 'Punto de equilibrio',
    Icon: Scale,
    descripcion: 'Margen de contribución, punto de equilibrio en pesos y resultado operativo.',
  },
  {
    id: 'simulacion',
    label: 'Simulador',
    Icon: SlidersHorizontal,
    descripcion: 'Escenarios: precios, cantidades, costos y utilidad objetivo, sin alterar los datos base.',
  },
]

const ESTADO_INICIAL = { precios: {}, cantidades: {}, ajusteVariables: 0, ajusteFijos: 0 }
const estadoGuardado = cargarEstado()

const MENU_PLEGADO_KEY = 'costos-rotiseria:menu-plegado'

function cargarMenuPlegado() {
  try {
    return localStorage.getItem(MENU_PLEGADO_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [productos, setProductos] = useState(estadoGuardado?.productos ?? seedProductos)
  const [comprobantes, setComprobantes] = useState(estadoGuardado?.comprobantes ?? seedComprobantes)
  const [metodoCif, setMetodoCif] = useState(estadoGuardado?.metodoCif ?? METODO_CIF.HORAS)
  const [utilidadObjetivo, setUtilidadObjetivo] = useState(estadoGuardado?.utilidadObjetivo ?? seedUtilidadObjetivo)
  const [overrides, setOverrides] = useState({ ...ESTADO_INICIAL, ...estadoGuardado?.overrides })
  const [seccion, setSeccion] = useState(SECCIONES[0].id)
  const [errorImportacion, setErrorImportacion] = useState('')
  const [menuPlegado, setMenuPlegado] = useState(cargarMenuPlegado)

  useEffect(() => {
    try {
      localStorage.setItem(MENU_PLEGADO_KEY, menuPlegado ? '1' : '0')
    } catch {}
  }, [menuPlegado])

  useEffect(() => {
    guardarEstado({ productos, comprobantes, metodoCif, utilidadObjetivo, overrides })
  }, [productos, comprobantes, metodoCif, utilidadObjetivo, overrides])

  const casoBase = useMemo(
    () => calcularCasoCompleto(productos, comprobantes, { metodoCif, utilidadObjetivo }),
    [productos, comprobantes, metodoCif, utilidadObjetivo]
  )

  const casoSimulado = useMemo(
    () => simular(productos, comprobantes, { ...overrides, metodoCif, utilidadObjetivo }),
    [productos, comprobantes, overrides, metodoCif, utilidadObjetivo]
  )

  const desgloseFijos = useMemo(() => calcularDesgloseFijos(comprobantes), [comprobantes])

  function setOverride(campo, productoId, valor) {
    setOverrides((prev) => {
      const siguiente = { ...prev[campo] }
      if (valor === '') {
        delete siguiente[productoId]
      } else {
        siguiente[productoId] = Number(valor)
      }
      return { ...prev, [campo]: siguiente }
    })
  }

  /**
   * Al eliminar un producto sus comprobantes directos pasan a General, para que
   * su importe siga entrando al cálculo como indirecto en vez de perderse.
   */
  function eliminarProducto(id) {
    setProductos((prev) => prev.filter((p) => p.id !== id))
    setComprobantes((prev) => prev.map((c) => (c.productoId === id ? { ...c, productoId: null } : c)))
    setOverrides((prev) => {
      const precios = { ...prev.precios }
      const cantidades = { ...prev.cantidades }
      delete precios[id]
      delete cantidades[id]
      return { ...prev, precios, cantidades }
    })
  }

  async function handleImportar(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const data = await importarExcel(file)
      setProductos(data.productos)
      setComprobantes(data.comprobantes)
      setMetodoCif(data.metodoCif ?? METODO_CIF.HORAS)
      setUtilidadObjetivo(data.utilidadObjetivo ?? seedUtilidadObjetivo)
      setOverrides(ESTADO_INICIAL)
      setErrorImportacion('')
    } catch (error) {
      setErrorImportacion(error.message)
    }
  }

  const activa = SECCIONES.find((s) => s.id === seccion)

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${menuPlegado ? 'app-sidebar--plegado' : ''}`}>
        <div className="app-sidebar__header">
          <p className="app-sidebar__brand">Costos Rotisería</p>
          <button
            className="app-sidebar__toggle"
            onClick={() => setMenuPlegado((plegado) => !plegado)}
            aria-label={menuPlegado ? 'Desplegar menú' : 'Plegar menú'}
            aria-expanded={!menuPlegado}
            title={menuPlegado ? 'Desplegar menú' : 'Plegar menú'}
          >
            {menuPlegado ? (
              <PanelLeftOpen size={16} strokeWidth={1.5} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={1.5} />
            )}
          </button>
        </div>
        <nav className="app-sidebar__nav">
          {SECCIONES.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`app-sidebar__item ${seccion === id ? 'app-sidebar__item--active' : ''}`}
              onClick={() => setSeccion(id)}
              aria-label={label}
              title={menuPlegado ? label : undefined}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar__heading">
            <span className="app-topbar__icon">
              <activa.Icon size={18} strokeWidth={1.5} />
            </span>
            <div>
              <h1>{activa.label}</h1>
              <p className="app-topbar__subtitle">{activa.descripcion}</p>
            </div>
          </div>
          <div className="app-topbar__actions">
            {seccion !== 'punto-equilibrio' && seccion !== 'simulacion' && (
              <CoberturaBadge cubreCostosFijos={casoBase.puntoEquilibrio.cubreCostosFijos} />
            )}
            <Button
              variant="ghost"
              onClick={() => exportarExcel({ productos, comprobantes, metodoCif, utilidadObjetivo })}
            >
              <Download size={14} strokeWidth={1.5} />
              Exportar Excel
            </Button>
            <label className="ui-button ui-button--ghost">
              <Upload size={14} strokeWidth={1.5} />
              Importar Excel
              <input type="file" accept=".xlsx,.xls" hidden onChange={handleImportar} />
            </label>
          </div>
        </header>

        {errorImportacion && (
          <div className="ui-alert ui-alert--warn app-import-error">
            <TriangleAlert size={16} strokeWidth={1.5} />
            <span>{errorImportacion}</span>
            <Button variant="ghost" onClick={() => setErrorImportacion('')}>
              Cerrar
            </Button>
          </div>
        )}

        <main className="app-content" key={seccion}>
          {seccion === 'productos' && (
            <ProductosForm
              productos={productos}
              comprobantes={comprobantes}
              onAgregar={(p) => setProductos([...productos, p])}
              onEliminar={eliminarProducto}
            />
          )}

          {seccion === 'comprobantes' && (
            <ComprobantesForm
              comprobantes={comprobantes}
              productos={productos}
              control={casoBase.control}
              onAgregar={(c) => setComprobantes([...comprobantes, c])}
              onEliminar={(numero) => setComprobantes(comprobantes.filter((c) => c.numero !== numero))}
            />
          )}

          {seccion === 'costos-directos' && (
            <CostosDirectos productos={productos} costoDirecto={casoBase.costoDirecto} />
          )}

          {seccion === 'cif' && (
            <Cif
              productos={productos}
              cif={casoBase.cif}
              control={casoBase.control}
              metodoCif={metodoCif}
              onCambiarMetodo={setMetodoCif}
            />
          )}

          {seccion === 'gastos-fijos' && (
            <GastosFijos
              comprobantes={comprobantes}
              gastosAdministracion={casoBase.gastosFijosTotales}
              costosFijosTotales={casoBase.costosFijosTotales}
              desglose={desgloseFijos}
            />
          )}

          {seccion === 'costos-unitarios' && (
            <CostosUnitarios productos={productos} costosUnitarios={casoBase.costosUnitarios} />
          )}

          {seccion === 'precios' && (
            <Precios
              productos={productos}
              margen={casoBase.margen}
              preciosSugeridos={casoBase.preciosSugeridos}
              utilidadObjetivo={utilidadObjetivo}
            />
          )}

          {seccion === 'punto-equilibrio' && (
            <PuntoEquilibrio
              productos={productos}
              costosFijosTotales={casoBase.costosFijosTotales}
              ingresosTotales={casoBase.ingresosTotales}
              costoVariableTotal={casoBase.costoVariableTotal}
              margen={casoBase.margen}
              puntoEquilibrio={casoBase.puntoEquilibrio}
              pePorProducto={casoBase.pePorProducto}
            />
          )}

          {seccion === 'simulacion' && (
            <Simulador
              productos={productos}
              overrides={overrides}
              utilidadObjetivo={utilidadObjetivo}
              onCambiarPrecio={(id, valor) => setOverride('precios', id, valor)}
              onCambiarCantidad={(id, valor) => setOverride('cantidades', id, valor)}
              onCambiarAjuste={(campo, valor) => setOverrides((prev) => ({ ...prev, [campo]: Number(valor) || 0 }))}
              onCambiarUtilidadObjetivo={(valor) => setUtilidadObjetivo(Number(valor) || 0)}
              onRestablecer={() => setOverrides(ESTADO_INICIAL)}
              casoBase={casoBase}
              casoSimulado={casoSimulado}
            />
          )}
        </main>
      </div>
    </div>
  )
}
