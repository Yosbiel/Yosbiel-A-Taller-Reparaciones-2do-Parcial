import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { estadoLabel, estadoColor } from '../utils/estados'

const PB_URL = 'http://127.0.0.1:8090'

function DetalleOrden() {
  const { id } = useParams()
  const [orden, setOrden] = useState(null)
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [diagnostico, setDiagnostico] = useState('')
  const [manoObra, setManoObra] = useState(0)
  const [piezas, setPiezas] = useState([])
  const [nuevaPieza, setNuevaPieza] = useState({ descripcion: '', cantidad: 1, precio: 0 })
  const [formError, setFormError] = useState('')

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
      setTimeout(() => cargarDatos(), 500)
    } catch (e) {
      alert(e.message)
    }
  }

  const guardarPresupuesto = async (e) => {
    e.preventDefault()
    setFormError('')

    // 1. Validar diagnostico
    if (!diagnostico.trim() || diagnostico.trim().length < 5) {
      setFormError('El diagnostico debe tener al menos 5 caracteres.')
      return
    }

    // 2. Validar mano de obra (no negativa)
    if (Number(manoObra) < 0) {
      setFormError('La mano de obra no puede ser negativa.')
      return
    }

    // 3. Validar piezas (cantidad y precio positivos)
    for (let p of piezas) {
      if (Number(p.cantidad) <= 0) {
        setFormError('La cantidad de cada pieza debe ser mayor a 0.')
        return
      }
      if (Number(p.precio) < 0) {
        setFormError('El precio de cada pieza no puede ser negativo.')
        return
      }
    }

    try {
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostico: diagnostico.trim(),
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
      setFormError(e.message)
    }
  }

  const agregarPieza = () => {
    if (nuevaPieza.descripcion.trim() && nuevaPieza.cantidad > 0 && nuevaPieza.precio >= 0) {
      setPiezas([...piezas, nuevaPieza])
      setNuevaPieza({ descripcion: '', cantidad: 1, precio: 0 })
    }
  }

  const quitarPieza = (index) => {
    setPiezas(piezas.filter((_, i) => i !== index))
  }

  if (cargando) return <p className="fade-in-page" style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!orden) return <p>Orden no encontrada.</p>

  return (
    <div className="fade-in-page">
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>Volver a la lista</Link>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>Detalle de la Orden</h2>

      <div className="detail-container">
        <p><strong>Equipo:</strong> {orden.equipo}</p>
        <p><strong>Problema:</strong> {orden.problema}</p>
        <p>
          <strong>Estado:</strong>{' '}
          <span className={`pill ${estadoColor(orden.estado)}`}>
            {estadoLabel(orden.estado)}
          </span>
        </p>
        <p><strong>Cliente:</strong> {orden.expand?.cliente?.nombre || 'N/A'}</p>
        
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

      {orden.estado === 'en_diagnostico' && (
        <div className="detail-container" style={{ borderTop: '4px solid #6366f1' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Registrar Presupuesto</h3>
          {formError && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{formError}</div>}
          
          <form onSubmit={guardarPresupuesto} onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault()
              guardarPresupuesto(e)
            }
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Diagnostico:</label>
              <textarea value={diagnostico} onChange={e => setDiagnostico(e.target.value)} rows="3" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Mano de obra ($):</label>
              <input type="number" min="0" value={manoObra} onChange={e => setManoObra(e.target.value)} />
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
                <input placeholder="Descripcion" value={nuevaPieza.descripcion} onChange={e => setNuevaPieza({...nuevaPieza, descripcion: e.target.value})} style={{ flex: 2 }} />
                <input type="number" min="1" placeholder="Cant" value={nuevaPieza.cantidad} onChange={e => setNuevaPieza({...nuevaPieza, cantidad: Number(e.target.value)})} style={{ flex: 1 }} />
                <input type="number" min="0" placeholder="Precio" value={nuevaPieza.precio} onChange={e => setNuevaPieza({...nuevaPieza, precio: Number(e.target.value)})} style={{ flex: 1 }} />
                <button type="button" onClick={agregarPieza} style={{ flex: 0 }}>Anadir</button>
              </div>
            </div>
            
            <div className="budget-box">
              <h4 style={{ color: 'var(--text-color)' }}>Total Presupuesto: ${totalPresupuesto.toFixed(2)}</h4>
            </div>
            <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>Guardar y Presupuestar</button>
          </form>
        </div>
      )}

      {(orden.diagnostico || orden.manoObra || (orden.piezas && orden.piezas.length > 0)) && orden.estado !== 'en_diagnostico' && (
         <div className="detail-container budget-box">
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Presupuesto Registrado</h3>
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

      <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Historial de Eventos</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {eventos.length === 0 ? (
          <li style={{ color: '#64748b' }}>No hay eventos registrados.</li>
        ) : (
          eventos.map(ev => (
            <li key={ev.id} style={{ background: 'var(--card-bg)', padding: '0.8rem', borderLeft: '4px solid #6366f1', marginBottom: '0.5rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: 'var(--text-color)' }}>
              <strong>{estadoLabel(ev.de)}</strong> - <strong>{estadoLabel(ev.a)}</strong> 
              <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
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
