import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PB_URL = 'http://127.0.0.1:8090'

function NuevaOrden() {
  const navigate = useNavigate()
  
  // Estados para el formulario, la lista de clientes y las fotos
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    cliente: '',
    equipo: '',
    problema: ''
  })
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState(null)
  
  // useRef para acceder al input de archivos y poder hacer clic en él desde el botón personalizado
  const fileInputRef = useRef(null)

  // useEffect para cargar los clientes al montar el componente
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

  // Manejador de cambios en los campos de texto/select
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Manejador de cambios en el input de archivos (limita a 3 fotos)
  const handleFileChange = (e) => {
    setFotos(Array.from(e.target.files).slice(0, 3))
  }

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      // Usamos FormData para enviar los archivos junto con los datos
      const formData = new FormData()
      formData.append('cliente', form.cliente)
      formData.append('equipo', form.equipo)
      formData.append('problema', form.problema)
      formData.append('estado', 'solicitada')

      // Añadimos cada foto al FormData
      fotos.forEach(foto => {
        formData.append('fotos', foto)
      })

      // Enviamos la petición POST a PocketBase (sin Content-Type, el navegador lo pone)
      const res = await fetch(`${PB_URL}/api/collections/ordenes/records`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Error al crear la orden')
      }

      // Si todo va bien, navegamos a la lista
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h2>Nueva Orden</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        {/* Selector de cliente */}
        <div>
          <label>Cliente:</label>
          <select name="cliente" value={form.cliente} onChange={handleChange} required>
            <option value="">Selecciona un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Campo de equipo */}
        <div>
          <label>Equipo:</label>
          <input name="equipo" value={form.equipo} onChange={handleChange} required />
        </div>

        {/* Campo de problema */}
        <div>
          <label>Problema:</label>
          <textarea name="problema" value={form.problema} onChange={handleChange} required />
        </div>

        {/* Input de fotos personalizado */}
        <div>
          <label>Fotos (máx. 3):</label>
          <div className="file-input-wrapper">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
              ref={fileInputRef}
            />
            <span className="file-input-label">Seleccionar fotos</span>
            <span className="file-count">
              {fotos.length > 0 ? `${fotos.length} seleccionada(s)` : 'Ninguna seleccionada'}
            </span>
          </div>
        </div>

        <button type="submit">Crear Orden</button>
      </form>
    </div>
  )
}

export default NuevaOrden
