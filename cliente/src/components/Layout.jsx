import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div>
      <header style={{ background: '#333', color: '#fff', padding: '1rem' }}>
        <h1>Taller de Reparaciones</h1>
        <nav>
          <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Inicio</Link>
          <Link to="/orden/nueva" style={{ color: '#fff' }}>Nueva Orden</Link>
        </nav>
      </header>
      
      <main style={{ padding: '1rem' }}>
        {/* Aquí se renderizan las páginas hijas */}
        <Outlet />
      </main>
    </div>
  )
}

export default Layout