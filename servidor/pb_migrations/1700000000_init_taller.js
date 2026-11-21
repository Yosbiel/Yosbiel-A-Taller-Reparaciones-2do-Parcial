/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Crear clientes
  const clientes = new Collection({
    name: "clientes",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "nombre", type: "text", required: true },
      { name: "telefono", type: "text", required: true }
    ]
  })
  app.save(clientes)

  // 2. Crear ordenes
  const ordenes = new Collection({
    name: "ordenes",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "cliente", type: "relation", required: true, maxSelect: 1, collectionId: clientes.id },
      { name: "equipo", type: "text", required: true },
      { name: "problema", type: "text", required: true },
      { name: "estado", type: "select", required: true, maxSelect: 1, values: ["solicitada", "en_diagnostico", "presupuestada", "aprobada", "rechazada", "en_reparacion", "lista", "entregada", "cancelada"] },
      { name: "diagnostico", type: "text" },
      { name: "manoObra", type: "number" },
      { name: "piezas", type: "json" },
      { name: "fotos", type: "file", maxSelect: 3, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] }
    ]
  })
  app.save(ordenes)

  // 3. Crear eventos
  const eventos = new Collection({
    name: "eventos",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "orden", type: "relation", required: true, maxSelect: 1, collectionId: ordenes.id },
      { name: "de", type: "text", required: true },
      { name: "a", type: "text", required: true },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false }
    ]
  })
  app.save(eventos)
}, (app) => {
  // Codigo de reversion (opcional)
})
