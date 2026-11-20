import { Outlet, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Layout() {
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem('tema') === 'oscuro'
  })

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
          <Link to="/">Inicio</Link>
          <Link to="/orden/nueva">Nueva Orden</Link>
          <Link to="/acerca">Acerca de</Link>
          <button className="theme-toggle" onClick={() => setTemaOscuro(!temaOscuro)}>
            {temaOscuro ? 'Modo Claro' : 'Modo Oscuro'}
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
