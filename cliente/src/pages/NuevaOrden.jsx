import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function NuevaOrden() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({ cliente: '', equipo: '', problema: '' })
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${PB_URL}/api/collections/clientes/records`)
      .then(res => res.json())
      .then(data => setClientes(data.items || []))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validacion manual
    if (!form.cliente) return setError('Selecciona un cliente.')
    if (!form.equipo.trim()) return setError('El equipo es obligatorio.')
    if (!form.problema.trim()) return setError('El problema es obligatorio.')

    try {
      const formData = new FormData()
      formData.append('cliente', form.cliente)
      formData.append('equipo', form.equipo)
      formData.append('problema', form.problema)
      formData.append('estado', 'solicitada')
      fotos.forEach(f => formData.append('fotos', f))

      const res = await fetch(`${PB_URL}/api/collections/ordenes/records`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al crear la orden')
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fade-in-page">
      <h2>Nueva Orden</h2>
      {error && <div className="error-message" style={{ color: 'red', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
          e.preventDefault()
          handleSubmit(e)
        }
      }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <div>
          <label>Cliente:</label>
          <select name="cliente" value={form.cliente} onChange={handleChange}>
            <option value="">Selecciona un cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label>Equipo:</label>
          <input name="equipo" value={form.equipo} onChange={handleChange} />
        </div>
        <div>
          <label>Problema:</label>
          <textarea name="problema" value={form.problema} onChange={handleChange} />
        </div>
        <div>
          <label>Fotos (max. 3):</label>
          <div className="file-input-wrapper">
            <input type="file" multiple accept="image/*" onChange={(e) => setFotos(Array.from(e.target.files).slice(0, 3))} />
            <span className="file-input-label">Seleccionar fotos</span>
            <span className="file-count">{fotos.length > 0 ? `${fotos.length} seleccionada(s)` : 'Ninguna'}</span>
          </div>
        </div>
        <button type="submit">Crear Orden</button>
      </form>
    </div>
  )
}

export default NuevaOrden
