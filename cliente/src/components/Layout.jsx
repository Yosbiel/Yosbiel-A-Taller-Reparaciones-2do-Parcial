import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div>
      {/* Cabecera con navegación */}
      <header>
        <h1>Taller de Reparaciones</h1>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/orden/nueva">Nueva Orden</Link>
        </nav>
      </header>
      
      {/* Contenido de las páginas hijas (Outlet) */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
