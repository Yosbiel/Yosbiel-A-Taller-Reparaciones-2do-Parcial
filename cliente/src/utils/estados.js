// Mapeo de estados a etiquetas legibles
export const estadoLabel = (estado) => {
  const mapa = {
    'solicitada': 'Solicitada',
    'en_diagnostico': 'En diagnostico',
    'presupuestada': 'Presupuestada',
    'aprobada': 'Aprobada',
    'rechazada': 'Rechazada',
    'en_reparacion': 'En reparacion',
    'lista': 'Lista',
    'entregada': 'Entregada',
    'cancelada': 'Cancelada'
  }
  return mapa[estado] || estado
}

// Mapeo de estados a clases CSS para las pildoras
export const estadoColor = (estado) => {
  const colores = {
    'solicitada': 'pill-gray',
    'en_diagnostico': 'pill-blue',
    'presupuestada': 'pill-purple',
    'aprobada': 'pill-green',
    'rechazada': 'pill-red',
    'en_reparacion': 'pill-orange',
    'lista': 'pill-teal',
    'entregada': 'pill-dark',
    'cancelada': 'pill-red'
  }
  return colores[estado] || 'pill-gray'
}
