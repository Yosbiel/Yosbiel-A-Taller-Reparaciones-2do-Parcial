import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function DetalleOrden() {
  const { id } = useParams()
  const [orden, setOrden] = useState(null)
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Estados para el formulario de presupuesto
  const [diagnostico, setDiagnostico] = useState('')
  const [manoObra, setManoObra] = useState(0)
  const [piezas, setPiezas] = useState([])
  const [nuevaPieza, setNuevaPieza] = useState({ descripcion: '', cantidad: 1, precio: 0 })

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const resOrden = await fetch(`${PB_URL}/api/collections/ordenes/records/${id}?expand=cliente`)
      if (!resOrden.ok) throw new Error('Orden no encontrada')
      const dataOrden = await resOrden.json()
      setOrden(dataOrden)

      if (dataOrden.estado === 'en_diagnostico') {
        setDiagnostico(dataOrden.diagnostico || '')
        setManoObra(dataOrden.manoObra || 0)
        setPiezas(dataOrden.piezas || [])
      }

      // Consulta de eventos SIN el sort que causaba el error 400
      const resEventos = await fetch(`${PB_URL}/api/collections/eventos/records?filter=(orden='${id}')`)
      const dataEventos = await resEventos.json()
      setEventos(dataEventos.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [id])

  const totalPresupuesto = useMemo(() => {
    const totalPiezas = (piezas || []).reduce((acc, p) => acc + (p.cantidad * p.precio), 0)
    return Number(manoObra) + totalPiezas
  }, [manoObra, piezas])

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al cambiar de estado')
      }
      // Esperar un momento para que el hook cree el evento, luego recargar
      setTimeout(() => {
        cargarDatos()
      }, 500)
    } catch (e) {
      alert(e.message)
    }
  }

  const guardarPresupuesto = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostico: diagnostico,
          manoObra: Number(manoObra),
          piezas: piezas,
          estado: 'presupuestada'
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al guardar presupuesto')
      }
      setTimeout(() => {
        cargarDatos()
      }, 500)
    } catch (e) {
      alert(e.message)
    }
  }

  const agregarPieza = () => {
    if (nuevaPieza.descripcion && nuevaPieza.cantidad > 0) {
      setPiezas([...piezas, nuevaPieza])
      setNuevaPieza({ descripcion: '', cantidad: 1, precio: 0 })
    }
  }

  const quitarPieza = (index) => {
    setPiezas(piezas.filter((_, i) => i !== index))
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!orden) return <p>Orden no encontrada.</p>

  return (
    <div>
      <Link to="/">← Volver a la lista</Link>
      <h2>Detalle de la Orden</h2>

      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
        <p><strong>Equipo:</strong> {orden.equipo}</p>
        <p><strong>Problema:</strong> {orden.problema}</p>
        <p><strong>Estado:</strong> <span style={{ fontWeight: 'bold', color: 'blue' }}>{orden.estado}</span></p>
        <p><strong>Cliente:</strong> {orden.expand?.cliente?.nombre || 'N/A'}</p>
        
        {orden.fotos && orden.fotos.length > 0 && (
          <div>
            <strong>Fotos:</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              {orden.fotos.map((foto, i) => (
                <img key={i} src={`${PB_URL}/api/files/ordenes/${orden.id}/${foto}`} alt="foto" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
        {orden.estado === 'solicitada' && (
          <>
            <button onClick={() => cambiarEstado('en_diagnostico')}>Iniciar Diagnóstico</button>
            <button onClick={() => cambiarEstado('cancelada')} style={{ background: '#ccc' }}>Cancelar Orden</button>
          </>
        )}
        {orden.estado === 'presupuestada' && (
          <>
            <button onClick={() => cambiarEstado('aprobada')}>Aprobar Presupuesto</button>
            <button onClick={() => cambiarEstado('rechazada')} style={{ background: '#ccc' }}>Rechazar Presupuesto</button>
          </>
        )}
        {orden.estado === 'aprobada' && (
          <button onClick={() => cambiarEstado('en_reparacion')}>Iniciar Reparación</button>
        )}
        {orden.estado === 'en_reparacion' && (
          <button onClick={() => cambiarEstado('lista')}>Marcar como Lista</button>
        )}
        {orden.estado === 'lista' && (
          <button onClick={() => cambiarEstado('entregada')}>Entregar al Cliente</button>
        )}
      </div>

      {orden.estado === 'en_diagnostico' && (
        <div style={{ border: '1px solid #007bff', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Registrar Presupuesto</h3>
          <form onSubmit={guardarPresupuesto}>
            <div style={{ marginBottom: '10px' }}>
              <label>Diagnóstico:</label>
              <textarea value={diagnostico} onChange={e => setDiagnostico(e.target.value)} required style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Mano de obra ($):</label>
              <input type="number" value={manoObra} onChange={e => setManoObra(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <h4>Piezas</h4>
              <ul>
                {piezas.map((p, i) => (
                  <li key={i}>
                    {p.descripcion} (x{p.cantidad}) - ${p.precio} c/u
                    <button type="button" onClick={() => quitarPieza(i)} style={{ marginLeft: '10px', background: 'red', color: 'white', padding: '2px 5px' }}>X</button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <input placeholder="Descripción" value={nuevaPieza.descripcion} onChange={e => setNuevaPieza({...nuevaPieza, descripcion: e.target.value})} />
                <input type="number" placeholder="Cant" value={nuevaPieza.cantidad} onChange={e => setNuevaPieza({...nuevaPieza, cantidad: Number(e.target.value)})} style={{ width: '60px' }} />
                <input type="number" placeholder="Precio" value={nuevaPieza.precio} onChange={e => setNuevaPieza({...nuevaPieza, precio: Number(e.target.value)})} style={{ width: '80px' }} />
                <button type="button" onClick={agregarPieza}>Añadir</button>
              </div>
            </div>
            
            <h4>Total Presupuesto: ${totalPresupuesto.toFixed(2)}</h4>
            <button type="submit" style={{ marginTop: '10px' }}>Guardar y Presupuestar</button>
          </form>
        </div>
      )}

      {(orden.diagnostico || orden.manoObra || (orden.piezas && orden.piezas.length > 0)) && orden.estado !== 'en_diagnostico' && (
         <div style={{ marginBottom: '1rem', background: '#eef', padding: '1rem' }}>
            <h3>Presupuesto Registrado</h3>
            <p><strong>Diagnóstico:</strong> {orden.diagnostico}</p>
            <p><strong>Mano de obra:</strong> ${orden.manoObra || 0}</p>
            {orden.piezas && orden.piezas.length > 0 && (
              <ul>
                {orden.piezas.map((p, i) => <li key={i}>{p.descripcion} (x{p.cantidad}) - ${p.precio}</li>)}
              </ul>
            )}
            <p><strong>Total:</strong> ${totalPresupuesto.toFixed(2)}</p>
         </div>
      )}

      <h3>Historial de Eventos</h3>
      <ul>
        {eventos.length === 0 ? (
          <li>No hay eventos registrados.</li>
        ) : (
          eventos.map(ev => (
            <li key={ev.id}>
              {ev.de} → {ev.a} ({new Date(ev.created).toLocaleString()})
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default DetalleOrden