import { Link } from 'react-router-dom'

function AcercaDe() {
  return (
    <div className="fade-in-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>Acerca del Proyecto</h2>
      
      <div className="detail-container">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Taller de Reparaciones</h3>
        <p><strong>Aplicación web para gestionar órdenes de reparación.</strong></p>
        <p>Este proyecto fue desarrollado como parte del segundo parcial de la asignatura Programación Web.</p>
        
        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
        
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Desarrollador</h3>
        <p><strong>Nombre:</strong> Yosbiel Alejandro Díaz Cala</p>
        <p><strong>Carrera:</strong> Ingeniería Informática (3er año)</p>
        <p><strong>Asignatura:</strong> Programación Web</p>
        
        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
        
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Tecnologías utilizadas</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>React + Vite (Frontend)</li>
          <li>PocketBase (Backend y base de datos)</li>
          <li>React Router (Navegación)</li>
        </ul>
        
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

export default AcercaDe
