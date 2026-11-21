import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function NuevaOrden() {
  const navigate = useNavigate()
  
  // Estados para el formulario, la lista de clientes y las fotos
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({ cliente: '', equipo: '', problema: '' })
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState(null)

  // useEffect para cargar los clientes al montar el componente
  useEffect(() => {
    fetch(`${PB_URL}/api/collections/clientes/records`)
      .then(res => res.json())
      .then(data => setClientes(data.items || []))
  }, [])

  // Manejador de cambios en los campos de texto/select
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Manejador del envio del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validaciones manuales
    // 1- Cliente seleccionado
    if (!form.cliente) return setError('Selecciona un cliente.')
    // 2- Equipo con al menos 2 caracteres
    if (!form.equipo.trim() || form.equipo.trim().length < 2) 
      return setError('El equipo debe tener al menos 2 caracteres.')
    // 3- Problema con al menos 5 caracteres
    if (!form.problema.trim() || form.problema.trim().length < 5) 
      return setError('El problema debe tener al menos 5 caracteres.')

    try {
      // Usamos FormData para enviar los archivos junto con los datos
      const formData = new FormData()
      formData.append('cliente', form.cliente)
      formData.append('equipo', form.equipo.trim())
      formData.append('problema', form.problema.trim())
      formData.append('estado', 'solicitada')
      // Añadimos cada foto al FormData
      fotos.forEach(f => formData.append('fotos', f))

      // Enviamos la peticion POST a PocketBase
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al crear la orden')
      
      // Si todo va bien, navegamos a la lista
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fade-in-page">
      <h2>Nueva Orden</h2>
      
      {/* Mensaje de error personalizado */}
      {error && <div className="error-message" style={{ color: 'red', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      {/* Formulario con soporte para Enter */}
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
