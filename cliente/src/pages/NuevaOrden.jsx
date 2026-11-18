import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function NuevaOrden() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    cliente: '',
    equipo: '',
    problema: ''
  })
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // Cargar clientes al montar
  useEffect(() => {
    async function cargarClientes() {
      try {
        const res = await fetch(`${PB_URL}/api/collections/clientes/records`)
        const data = await res.json()
        setClientes(data.items || [])
      } catch (e) {
        console.error(e)
      }
    }
    cargarClientes()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    // Convertimos a array y limitamos a 3
    setFotos(Array.from(e.target.files).slice(0, 3))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      // Usamos FormData para enviar archivos
      const formData = new FormData()
      formData.append('cliente', form.cliente)
      formData.append('equipo', form.equipo)
      formData.append('problema', form.problema)
      formData.append('estado', 'solicitada')

      // Añadir fotos si hay
      fotos.forEach(foto => {
        formData.append('fotos', foto)
      })

      const res = await fetch(`${PB_URL}/api/collections/ordenes/records`, {
        method: 'POST',
        // NO ponemos Content-Type, fetch lo pone automáticamente con boundary
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Error al crear la orden')
      }

      navigate('/') // Volver a la lista
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h2>Nueva Orden</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <div>
          <label>Cliente:</label>
          <select name="cliente" value={form.cliente} onChange={handleChange} required>
            <option value="">Selecciona un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Equipo:</label>
          <input name="equipo" value={form.equipo} onChange={handleChange} required />
        </div>

        <div>
          <label>Problema:</label>
          <textarea name="problema" value={form.problema} onChange={handleChange} required />
        </div>

        <div>
          <label>Fotos (máx. 3):</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            ref={fileInputRef}
          />
          {fotos.length > 0 && <p>{fotos.length} foto(s) seleccionada(s)</p>}
        </div>

        <button type="submit">Crear Orden</button>
      </form>
    </div>
  )
}

export default NuevaOrden