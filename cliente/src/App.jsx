import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ListaOrdenes from './pages/ListaOrdenes.jsx'
import DetalleOrden from './pages/DetalleOrden.jsx'
import NuevaOrden from './pages/NuevaOrden.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'
import AcercaDe from './pages/AcercaDe.jsx'

function App() {
  return (
    <Routes>
      {/* Ruta principal con Layout (contiene el Outlet) */}
      <Route path="/" element={<Layout />}>
        {/* Ruta por defecto (lista de ordenes) */}
        <Route index element={<ListaOrdenes />} />
        {/* Ruta para crear una nueva orden */}
        <Route path="orden/nueva" element={<NuevaOrden />} />
        {/* Ruta con parametro de ID para ver el detalle */}
        <Route path="orden/:id" element={<DetalleOrden />} />
        {/* Ruta para la pagina Acerca de */}
        <Route path="acerca" element={<AcercaDe />} />
        {/* Ruta comodin para paginas no encontradas */}
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
