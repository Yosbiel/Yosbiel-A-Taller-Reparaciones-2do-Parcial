import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function DetalleOrden() {
  // Obtenemos el ID de la orden desde la URL
  const { id } = useParams()
  
  // Estados principales
  const [orden, setOrden] = useState(null)
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Estados para el formulario de presupuesto
  const [diagnostico, setDiagnostico] = useState('')
  const [manoObra, setManoObra] = useState(0)
  const [piezas, setPiezas] = useState([])
  const [nuevaPieza, setNuevaPieza] = useState({ descripcion: '', cantidad: 1, precio: 0 })

  // Función para cargar la orden y sus eventos
  const cargarDatos = async () => {
    setCargando(true)
    try {
      // Cargamos la orden con el cliente expandido
      const resOrden = await fetch(`${PB_URL}/api/collections/ordenes/records/${id}?expand=cliente`)
      if (!resOrden.ok) throw new Error('Orden no encontrada')
      const dataOrden = await resOrden.json()
      setOrden(dataOrden)

      // Si está en diagnóstico, precargamos el formulario
      if (dataOrden.estado === 'en_diagnostico') {
        setDiagnostico(dataOrden.diagnostico || '')
        setManoObra(dataOrden.manoObra || 0)
        setPiezas(dataOrden.piezas || [])
      }

      // Cargamos los eventos del historial
      const resEventos = await fetch(`${PB_URL}/api/collections/eventos/records?filter=(orden='${id}')`)
      const dataEventos = await resEventos.json()
      setEventos(dataEventos.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  // useEffect para cargar los datos cuando el ID cambie o al montar
  useEffect(() => {
    cargarDatos()
  }, [id])

  // Cálculo del total del presupuesto usando useMemo (se recalcula solo si cambian piezas o mano de obra)
  const totalPresupuesto = useMemo(() => {
    const totalPiezas = (piezas || []).reduce((acc, p) => acc + (p.cantidad * p.precio), 0)
    return Number(manoObra) + totalPiezas
  }, [manoObra, piezas])

  // Función para cambiar el estado de la orden
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
      // Recargamos después de un pequeño retraso para que el hook cree el evento
      setTimeout(() => cargarDatos(), 500)
    } catch (e) {
      alert(e.message)
    }
  }

  // Función para guardar el presupuesto y pasar a estado "presupuestada"
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
      setTimeout(() => cargarDatos(), 500)
    } catch (e) {
      alert(e.message)
    }
  }

  // Añadir una pieza al presupuesto
  const agregarPieza = () => {
    if (nuevaPieza.descripcion && nuevaPieza.cantidad > 0) {
      setPiezas([...piezas, nuevaPieza])
      setNuevaPieza({ descripcion: '', cantidad: 1, precio: 0 })
    }
  }

  // Quitar una pieza del presupuesto
  const quitarPieza = (index) => {
    setPiezas(piezas.filter((_, i) => i !== index))
  }

  // Renderizado condicional
  if (cargando) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!orden) return <p>Orden no encontrada.</p>

  return (
    <div>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>Volver a la lista</Link>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Detalle de la Orden</h2>

      {/* Contenedor con los datos de la orden */}
      <div className="detail-container">
        <p><strong>Equipo:</strong> {orden.equipo}</p>
        <p><strong>Problema:</strong> {orden.problema}</p>
        <p><strong>Estado:</strong> <span style={{ color: '#6366f1', fontWeight: 'bold', textTransform: 'uppercase' }}>{orden.estado}</span></p>
        <p><strong>Cliente:</strong> {orden.expand?.cliente?.nombre || 'N/A'}</p>
        
        {/* Mostrar fotos si existen */}
        {orden.fotos && orden.fotos.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Fotos:</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {orden.fotos.map((foto, i) => (
                <img 
                  key={i} 
                  src={`${PB_URL}/api/files/ordenes/${orden.id}/${foto}`} 
                  alt="foto" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción según el estado actual */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {orden.estado === 'solicitada' && (
          <>
            <button onClick={() => cambiarEstado('en_diagnostico')}>Iniciar Diagnostico</button>
            <button className="secondary" onClick={() => cambiarEstado('cancelada')}>Cancelar Orden</button>
          </>
        )}
        {orden.estado === 'presupuestada' && (
          <>
            <button onClick={() => cambiarEstado('aprobada')}>Aprobar Presupuesto</button>
            <button className="secondary" onClick={() => cambiarEstado('rechazada')}>Rechazar Presupuesto</button>
          </>
        )}
        {orden.estado === 'aprobada' && (
          <button onClick={() => cambiarEstado('en_reparacion')}>Iniciar Reparacion</button>
        )}
        {orden.estado === 'en_reparacion' && (
          <button onClick={() => cambiarEstado('lista')}>Marcar como Lista</button>
        )}
        {orden.estado === 'lista' && (
          <button onClick={() => cambiarEstado('entregada')}>Entregar al Cliente</button>
        )}
      </div>

      {/* Formulario de presupuesto (solo si está en diagnóstico) */}
      {orden.estado === 'en_diagnostico' && (
        <div className="detail-container" style={{ borderTop: '4px solid #6366f1' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Registrar Presupuesto</h3>
          <form onSubmit={guardarPresupuesto}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Diagnostico:</label>
              <textarea 
                value={diagnostico} 
                onChange={e => setDiagnostico(e.target.value)} 
                required 
                rows="3" 
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Mano de obra ($):</label>
              <input 
                type="number" 
                value={manoObra} 
                onChange={e => setManoObra(e.target.value)} 
                required 
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Piezas</label>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.5rem' }}>
                {piezas.map((p, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span>{p.descripcion} (x{p.cantidad}) - ${p.precio} c/u</span>
                    <button type="button" className="danger" onClick={() => quitarPieza(i)}>X</button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  placeholder="Descripción" 
                  value={nuevaPieza.descripcion} 
                  onChange={e => setNuevaPieza({...nuevaPieza, descripcion: e.target.value})} 
                  style={{ flex: 2 }} 
                />
                <input 
                  type="number" 
                  placeholder="Cant" 
                  value={nuevaPieza.cantidad} 
                  onChange={e => setNuevaPieza({...nuevaPieza, cantidad: Number(e.target.value)})} 
                  style={{ flex: 1 }} 
                />
                <input 
                  type="number" 
                  placeholder="Precio" 
                  value={nuevaPieza.precio} 
                  onChange={e => setNuevaPieza({...nuevaPieza, precio: Number(e.target.value)})} 
                  style={{ flex: 1 }} 
                />
                <button type="button" onClick={agregarPieza} style={{ flex: 0 }}>Añadir</button>
              </div>
            </div>
            
            <div className="budget-box">
              <h4 style={{ color: '#1e293b' }}>Total Presupuesto: ${totalPresupuesto.toFixed(2)}</h4>
            </div>
            <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>Guardar y Presupuestar</button>
          </form>
        </div>
      )}

      {/* Mostrar presupuesto registrado (si ya no está en diagnóstico) */}
      {(orden.diagnostico || orden.manoObra || (orden.piezas && orden.piezas.length > 0)) && orden.estado !== 'en_diagnostico' && (
         <div className="detail-container budget-box">
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Presupuesto Registrado</h3>
            <p><strong>Diagnostico:</strong> {orden.diagnostico}</p>
            <p><strong>Mano de obra:</strong> ${orden.manoObra || 0}</p>
            {orden.piezas && orden.piezas.length > 0 && (
              <ul style={{ listStyle: 'circle', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                {orden.piezas.map((p, i) => <li key={i}>{p.descripcion} (x{p.cantidad}) - ${p.precio}</li>)}
              </ul>
            )}
            <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}><strong>Total:</strong> ${totalPresupuesto.toFixed(2)}</p>
         </div>
      )}

      {/* Historial de eventos */}
      <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Historial de Eventos</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {eventos.length === 0 ? (
          <li style={{ color: '#64748b' }}>No hay eventos registrados.</li>
        ) : (
          eventos.map(ev => (
            <li 
              key={ev.id} 
              style={{ background: '#fff', padding: '0.8rem', borderLeft: '4px solid #6366f1', marginBottom: '0.5rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <strong>{ev.de}</strong> -> <strong>{ev.a}</strong> 
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                ({ev.created ? new Date(ev.created).toLocaleString() : 'Fecha no disponible'})
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default DetalleOrden
