/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1- Obtener las colecciones creadas
  const clientesCol = app.findCollectionByNameOrId("clientes")
  const ordenesCol = app.findCollectionByNameOrId("ordenes")
  const eventosCol = app.findCollectionByNameOrId("eventos")

  // 2- Crear los 2 clientes
  const cliente1 = new Record(clientesCol, {
    nombre: "Juan Perez",
    telefono: "555-1111"
  })
  app.save(cliente1)

  const cliente2 = new Record(clientesCol, {
    nombre: "Maria Gomez",
    telefono: "555-2222"
  })
  app.save(cliente2)

  // 3- Crear la orden 1 (solicitada)
  const orden1 = new Record(ordenesCol, {
    cliente: cliente1.id,
    equipo: "Laptop HP Pavilion",
    problema: "No enciende",
    estado: "solicitada"
  })
  app.save(orden1)

  // 4- Crear la orden 2 (en_diagnostico)
  const orden2 = new Record(ordenesCol, {
    cliente: cliente2.id,
    equipo: "iPhone 11",
    problema: "Pantalla rota",
    estado: "en_diagnostico"
  })
  app.save(orden2)

  // 5- Crear la orden 3 (en_reparacion)
  const orden3 = new Record(ordenesCol, {
    cliente: cliente1.id,
    equipo: 'TV Samsung 50"',
    problema: "No da imagen",
    estado: "en_reparacion"
  })
  app.save(orden3)

  // 6- Crear eventos de ejemplo para la orden 3 (para que el historial no este vacio)
  const evento1 = new Record(eventosCol, { orden: orden3.id, de: "solicitada", a: "en_diagnostico" })
  app.save(evento1)
  const evento2 = new Record(eventosCol, { orden: orden3.id, de: "en_diagnostico", a: "presupuestada" })
  app.save(evento2)
  const evento3 = new Record(eventosCol, { orden: orden3.id, de: "presupuestada", a: "aprobada" })
  app.save(evento3)
  const evento4 = new Record(eventosCol, { orden: orden3.id, de: "aprobada", a: "en_reparacion" })
  app.save(evento4)
}, (app) => {
  // Codigo de reversion (opcional)
})
