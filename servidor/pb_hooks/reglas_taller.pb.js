/// <reference path="../pb_data/types.d.ts" />

onRecordUpdateRequest((e) => {
  const original = e.record.original()
  const nuevo = e.record
  const estadoAnterior = original.get("estado")
  const estadoNuevo = nuevo.get("estado")

  if (estadoAnterior === estadoNuevo) {
    e.next()
    return
  }

  if (["rechazada", "cancelada", "entregada"].includes(estadoAnterior)) {
    throw new BadRequestError("Una orden cerrada no puede modificarse.")
  }

  const permitidos = {
    "solicitada": ["en_diagnostico", "cancelada"],
    "en_diagnostico": ["presupuestada"],
    "presupuestada": ["aprobada", "rechazada"],
    "aprobada": ["en_reparacion"],
    "en_reparacion": ["lista"],
    "lista": ["entregada"]
  }

  if (!permitidos[estadoAnterior] || !permitidos[estadoAnterior].includes(estadoNuevo)) {
    throw new BadRequestError(`Cambio de estado no permitido: ${estadoAnterior} -> ${estadoNuevo}`)
  }
  e.next()
}, "ordenes")

onRecordAfterUpdateSuccess((e) => {
  const original = e.record.original()
  const nuevo = e.record
  if (original.get("estado") !== nuevo.get("estado")) {
    const collection = $app.findCollectionByNameOrId("eventos")
    const evento = new Record(collection, {
      orden: nuevo.id,
      de: original.get("estado"),
      a: nuevo.get("estado")
    })
    $app.save(evento)
  }
  e.next()
}, "ordenes")

onRecordCreateRequest((e) => {
  throw new BadRequestError("Los eventos solo se crean automáticamente por el sistema.")
}, "eventos")