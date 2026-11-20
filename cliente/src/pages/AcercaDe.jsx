import { Link } from 'react-router-dom'

function AcercaDe() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>Acerca del Proyecto</h2>
      
      <div className="detail-container">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Taller de Reparaciones</h3>
        <p><strong>Aplicacion web para gestionar ordenes de reparacion.</strong></p>
        <p>Este proyecto fue desarrollado como parte del segundo parcial de la asignatura Programacion Web.</p>
        
        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
        
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Desarrollador</h3>
        <p><strong>Nombre:</strong> Yosbiel Alejandro Diaz Cala</p>
        <p><strong>Carrera:</strong> Ingenieria Informatica (3er ano)</p>
        <p><strong>Asignatura:</strong> Programacion Web</p>
        
        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
        
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Tecnologias utilizadas</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>React + Vite (Frontend)</li>
          <li>PocketBase (Backend y base de datos)</li>
          <li>React Router (Navegacion)</li>
        </ul>
        
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

export default AcercaDe
