import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { estadoLabel, estadoColor } from '../utils/estados'

const PB_URL = 'http://127.0.0.1:8090'

function ListaOrdenes() {
  // Estados para las ordenes, carga, error y termino de busqueda
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  // Funcion para cargar las ordenes desde PocketBase
  const cargarOrdenes = async () => {
    setCargando(true)
    setError(null)
    try {
      // 1- Hacemos la peticion con el cliente expandido
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records?expand=cliente`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || `Error HTTP: ${res.status}`)
      }
      // 2- Guardamos los items en el estado
      const data = await res.json()
      setOrdenes(data.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  // useEffect para cargar las ordenes al montar el componente
  useEffect(() => {
    cargarOrdenes()
  }, [])

  // Filtrado por busqueda (equipo o cliente) y orden alfabetico por equipo
  const ordenesFiltradas = ordenes
    .filter(orden => {
      const termino = busqueda.toLowerCase()
      const equipo = (orden.equipo || '').toLowerCase()
      const cliente = (orden.expand?.cliente?.nombre || '').toLowerCase()
      return equipo.includes(termino) || cliente.includes(termino)
    })
    .sort((a, b) => (a.equipo || '').localeCompare(b.equipo || ''))

  // Renderizado condicional para carga y error
  if (cargando) return <p className="fade-in-page" style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando ordenes...</p>
  if (error) return (
    <div className="fade-in-page" style={{ color: 'red', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
      <strong>Error al cargar las ordenes:</strong> {error}
      <br />
      <button onClick={cargarOrdenes} style={{ marginTop: '10px' }}>Reintentar</button>
    </div>
  )

  return (
    <div className="fade-in-page">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>Lista de Ordenes</h2>
      
      {/* Barra de busqueda */}
      <div className="search-bar">
        <span>Buscar:</span>
        <input 
          type="text" 
          placeholder="Buscar por equipo o cliente..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Si no hay resultados, mostramos mensaje */}
      {ordenesFiltradas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No se encontraron ordenes.</p>
      ) : (
        <ul className="ordenes-grid">
          {/* Recorremos las ordenes filtradas y mostramos cada tarjeta */}
          {ordenesFiltradas.map(orden => (
            <li key={orden.id} className="order-card">
              <div>
                <h3>{orden.equipo}</h3>
                <p><strong>Cliente:</strong> {orden.expand?.cliente?.nombre || 'N/A'}</p>
                <p><strong>Problema:</strong> {orden.problema}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`pill ${estadoColor(orden.estado)}`}>
                    {estadoLabel(orden.estado)}
                  </span>
                </p>
              </div>
              {/* Boton de ancho completo para ir al detalle */}
              <Link to={`/orden/${orden.id}`} className="card-link">Ver detalle</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ListaOrdenes
