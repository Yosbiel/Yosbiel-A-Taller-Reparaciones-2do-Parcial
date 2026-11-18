import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function ListaOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarOrdenes = async () => {
    setCargando(true)
    setError(null)
    try {
      // Petición simplificada (sin el sort que causaba el error 400)
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

  useEffect(() => {
    cargarOrdenes()
  }, [])

  if (cargando) return <p>Cargando órdenes...</p>
  if (error) return (
    <div style={{ color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '5px' }}>
      <strong>Error al cargar las órdenes:</strong> {error}
      <br />
      <button onClick={cargarOrdenes} style={{ marginTop: '10px' }}>Reintentar</button>
    </div>
  )

  return (
    <div>
      <h2>Lista de Órdenes</h2>
      
      {ordenes.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ordenes.map(orden => (
            <li key={orden.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
              <h3>{orden.equipo}</h3>
              <p><strong>Cliente:</strong> {orden.expand?.cliente?.nombre || 'N/A'}</p>
              <p><strong>Problema:</strong> {orden.problema}</p>
              <p><strong>Estado:</strong> {orden.estado}</p>
              <Link to={`/orden/${orden.id}`}>Ver detalle</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ListaOrdenes