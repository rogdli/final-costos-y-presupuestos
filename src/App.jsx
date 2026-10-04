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
} from 'lucide-react'
import './App.css'
import { seedProductos, seedComprobantes, seedUtilidadObjetivo } from './shared/seedData'
import { cargarEstado, guardarEstado, exportarExcel, importarExcel } from './shared/storage'
import { calcularCasoCompleto, simular } from './simulacion/simulacion.calc'
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
    descripcion: 'Materiales directos y mano de obra asignada por hora de producción.',
  },
  {
    id: 'cif',
    label: 'CIF',
    Icon: Factory,
    descripcion: 'Asignación de costos indirectos de fabricación entre productos.',
  },
  {
    id: 'gastos-fijos',
    label: 'Gastos fijos',
    Icon: Building2,
    descripcion: 'Gastos fijos de administración y ventas del período.',
  },
  {
    id: 'costos-unitarios',
    label: 'Costos unitarios',
    Icon: Calculator,
    descripcion: 'Costo directo, CIF y costo total unitario por producto.',
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
    descripcion: 'Escenarios: modificá precios, cantidades y utilidad objetivo sin alterar los datos base.',
  },
]

const ESTADO_INICIAL = { precios: {}, cantidades: {} }
const estadoGuardado = cargarEstado()

export default function App() {
  const [productos, setProductos] = useState(estadoGuardado?.productos ?? seedProductos)
  const [comprobantes, setComprobantes] = useState(estadoGuardado?.comprobantes ?? seedComprobantes)
  const [metodoCif, setMetodoCif] = useState(estadoGuardado?.metodoCif ?? METODO_CIF.UNIDADES)
  const [utilidadObjetivo, setUtilidadObjetivo] = useState(estadoGuardado?.utilidadObjetivo ?? seedUtilidadObjetivo)
  const [overrides, setOverrides] = useState(estadoGuardado?.overrides ?? ESTADO_INICIAL)
  const [seccion, setSeccion] = useState(SECCIONES[0].id)

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

  async function handleImportar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await importarExcel(file)
    setProductos(data.productos ?? seedProductos)
    setComprobantes(data.comprobantes ?? seedComprobantes)
    setMetodoCif(data.metodoCif ?? METODO_CIF.UNIDADES)
    setUtilidadObjetivo(data.utilidadObjetivo ?? seedUtilidadObjetivo)
    setOverrides(ESTADO_INICIAL)
    e.target.value = ''
  }

  const activa = SECCIONES.find((s) => s.id === seccion)

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <p className="app-sidebar__brand">Costos Rotisería</p>
        <nav className="app-sidebar__nav">
          {SECCIONES.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`app-sidebar__item ${seccion === id ? 'app-sidebar__item--active' : ''}`}
              onClick={() => setSeccion(id)}
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

        <main className="app-content" key={seccion}>
          {seccion === 'productos' && (
            <ProductosForm
              productos={productos}
              onAgregar={(p) => setProductos([...productos, p])}
              onEliminar={(id) => setProductos(productos.filter((p) => p.id !== id))}
            />
          )}

          {seccion === 'comprobantes' && (
            <ComprobantesForm
              comprobantes={comprobantes}
              productos={productos}
              onAgregar={(c) => setComprobantes([...comprobantes, c])}
              onEliminar={(numero) => setComprobantes(comprobantes.filter((c) => c.numero !== numero))}
            />
          )}

          {seccion === 'costos-directos' && (
            <CostosDirectos productos={productos} costoDirecto={casoBase.costoDirecto} />
          )}

          {seccion === 'cif' && (
            <Cif productos={productos} cif={casoBase.cif} metodoCif={metodoCif} onCambiarMetodo={setMetodoCif} />
          )}

          {seccion === 'gastos-fijos' && <GastosFijos comprobantes={comprobantes} total={casoBase.gastosFijosTotales} />}

          {seccion === 'costos-unitarios' && (
            <CostosUnitarios productos={productos} costosUnitarios={casoBase.costosUnitarios} />
          )}

          {seccion === 'precios' && (
            <Precios productos={productos} margen={casoBase.margen} preciosSugeridos={casoBase.preciosSugeridos} />
          )}

          {seccion === 'punto-equilibrio' && (
            <PuntoEquilibrio
              costosFijosTotales={casoBase.costosFijosTotales}
              margen={casoBase.margen}
              puntoEquilibrio={casoBase.puntoEquilibrio}
            />
          )}

          {seccion === 'simulacion' && (
            <Simulador
              productos={productos}
              overrides={overrides}
              utilidadObjetivo={utilidadObjetivo}
              onCambiarPrecio={(id, valor) => setOverride('precios', id, valor)}
              onCambiarCantidad={(id, valor) => setOverride('cantidades', id, valor)}
              onCambiarUtilidadObjetivo={(valor) => setUtilidadObjetivo(Number(valor) || 0)}
              onRestablecer={() => setOverrides(ESTADO_INICIAL)}
              casoSimulado={casoSimulado}
            />
          )}
        </main>
      </div>
    </div>
  )
}
