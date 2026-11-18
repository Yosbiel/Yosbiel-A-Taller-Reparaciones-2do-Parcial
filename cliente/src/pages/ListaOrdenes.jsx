import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function ListaOrdenes() {
  // Estados para las órdenes, carga, error y término de búsqueda
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  // Función para cargar las órdenes desde PocketBase con el cliente expandido
  const cargarOrdenes = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records?expand=cliente`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || `Error HTTP: ${res.status}`)
      }
      const data = await res.json()
      setOrdenes(data.items || [])
    } catch (e) {
      console.error("Error al cargar:", e)
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  // useEffect para cargar las órdenes al montar
  useEffect(() => {
    cargarOrdenes()
  }, [])

  // Filtrado por búsqueda (equipo o cliente) y orden alfabético por equipo
  const ordenesFiltradas = ordenes
    .filter(orden => {
      const termino = busqueda.toLowerCase()
      const equipo = (orden.equipo || '').toLowerCase()
      const cliente = (orden.expand?.cliente?.nombre || '').toLowerCase()
      return equipo.includes(termino) || cliente.includes(termino)
    })
    .sort((a, b) => (a.equipo || '').localeCompare(b.equipo || ''))

  // Renderizado condicional para carga y error
  if (cargando) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando órdenes...</p>
  if (error) return (
    <div style={{ color: 'red', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
      <strong>Error al cargar las órdenes:</strong> {error}
      <br />
      <button onClick={cargarOrdenes} style={{ marginTop: '10px' }}>Reintentar</button>
    </div>
  )

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Lista de Órdenes</h2>
      
      {/* Barra de búsqueda con icono de lupa (carácter unicode) */}
      <div className="search-bar">
        <span>⌕</span>
        <input 
          type="text" 
          placeholder="Buscar por equipo o cliente..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de órdenes usando el grid de CSS */}
      {ordenesFiltradas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No se encontraron órdenes.</p>
      ) : (
        <ul className="ordenes-grid">
          {ordenesFiltradas.map(orden => (
            <li key={orden.id} className="order-card">
              <div>
                <h3>{orden.equipo}</h3>
                <p><strong>Cliente:</strong> {orden.expand?.cliente?.nombre || 'N/A'}</p>
                <p><strong>Problema:</strong> {orden.problema}</p>
                <p><strong>Estado:</strong> <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{orden.estado}</span></p>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Link to={`/orden/${orden.id}`}>Ver detalle →</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ListaOrdenes
