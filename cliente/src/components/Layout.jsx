import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Layout() {
  // Estado para el tema (inicia con lo que haya en localStorage o claro)
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem('tema') === 'oscuro'
  })
  
  // Hook para saber en que ruta estamos y resaltar el enlace activo
  const location = useLocation()

  // useEffect para aplicar la clase 'dark' al body y guardar el tema en localStorage
  useEffect(() => {
    if (temaOscuro) {
      document.body.classList.add('dark')
      localStorage.setItem('tema', 'oscuro')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('tema', 'claro')
    }
  }, [temaOscuro])

  return (
    <div>
      {/* Cabecera con navegacion */}
      <header>
        <h1>Taller de Reparaciones</h1>
        <nav>
          {/* Enlaces con clase 'active' si coinciden con la ruta actual */}
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link>
          <Link to="/orden/nueva" className={location.pathname === '/orden/nueva' ? 'active' : ''}>Nueva Orden</Link>
          <Link to="/acerca" className={location.pathname === '/acerca' ? 'active' : ''}>Acerca de</Link>
          
          {/* Boton de tema con icono que cambia segun el estado */}
          <button className="theme-toggle" onClick={() => setTemaOscuro(!temaOscuro)}>
            <span className="theme-icon">{temaOscuro ? '\u2600' : '\u263D'}</span>
          </button>
        </nav>
      </header>
      
      {/* Contenido de las paginas hijas */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
