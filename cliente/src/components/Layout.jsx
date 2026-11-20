import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Layout() {
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem('tema') === 'oscuro'
  })
  
  const location = useLocation()

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
      <header>
        <h1>Taller de Reparaciones</h1>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link>
          <Link to="/orden/nueva" className={location.pathname === '/orden/nueva' ? 'active' : ''}>Nueva Orden</Link>
          <Link to="/acerca" className={location.pathname === '/acerca' ? 'active' : ''}>Acerca de</Link>
          
          <button className="theme-toggle" onClick={() => setTemaOscuro(!temaOscuro)}>
            <span className="theme-icon">{temaOscuro ? '\u2600' : '\u263D'}</span>
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
