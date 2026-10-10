'use strict';

// La conversación: lo que Queen hace para poder formular algo.
//
// No es un registro de chat. Es una **delegación del núcleo**: Queen abre la conversación
// entregando el encargo a la contraparte, la contraparte devuelve lo que necesita, y Queen
// revisa la entrega antes de integrarla. Todo lo que `delegation.js` ya sabe —que solo el
// orquestador revisa, que nada se integra sin revisión, que el recibo se sella— se hereda en
// vez de reescribirse.
//
// Sobre eso hay dos guardas que el núcleo no tiene, porque son de jurisdicción y el núcleo no
// conoce proyectos:
//
//  1. **Solo responde la contraparte, y solo sobre su encargo.** Un mensaje de otro proyecto —
//     aunque llegue bien firmado— no avanza nada: se registra como mensaje de tercero.
//  2. **Una respuesta sin recibo no es respuesta.** Y un recibo que no corresponde al cuerpo que
//     acompaña tampoco: el digest ata la firma al cuerpo, y ese atado se comprueba.
//
// Todo lo que corre por el núcleo es `async` porque el núcleo lo es, y esta API también: no se
// envuelve en un `await` falso para que el código Caller se vea más sencillo.

const path = require('node:path');
const { createHash } = require('node:crypto');
const { nucleo } = require('./nucleo.js');
const { escribir } = require('./registro.js');

const PRECIOS = {
  concepto: 40000,
  produccion: 30000,
  campana: 20000,
};

// La forma canónica de una respuesta. Es la que entra al digest del recibo, así que cualquier
// cambio en ella cambia la firma: por eso el recibo ata a esta cadena y no a un objeto vivo.
function canonico(respuesta) {
  return JSON.stringify({
    de: respuesta.de,
    alcance: respuesta.alcance,
    piezas: (respuesta.piezas || []).map((p) => ({ nombre: p.nombre, cantidad: p.cantidad })),
  });
}

// El recibo lo sella la contraparte, con el núcleo, sobre su propia respuesta.
function reciboDeRespuesta(respuesta) {
  return nucleo.receipt.buildReceipt({
    operation: {
      id: `resp-${respuesta.de}-${respuesta.alcance}`,
      goal: `respuesta de ${respuesta.de} al encargo ${respuesta.alcance}: ${canonico(respuesta)}`,
    },
    capabilityId: 'respuesta-de-contraparte',
    authority: { spend: [] },
    outcome: {
      status: 'verified',
      exercised: [],
      detail: 'la contraparte declara su alcance y sus piezas',
    },
    evidence: { status: 'entregado', success: true, type: 'respuesta', code: respuesta.alcance },
    verification: {
      verified: true,
      checks: { 'alcance declarado': true },
      reason: 'la contraparte sello su propia respuesta con el nucleo',
    },
  });
}

// Dos comprobaciones, y las dos tienen que pasar: que el recibo verifique por sí mismo, y que
// el recibo sea el de esta respuesta y no el de otra.
function verificarRespuesta(respuesta) {
  if (!respuesta || typeof respuesta !== 'object') {
    return { ok: false, razon: 'una respuesta tiene que ser un objeto' };
  }
  if (!respuesta.recibo || typeof respuesta.recibo !== 'object') {
    return { ok: false, razon: 'la respuesta no vino con recibo: no esta firmada' };
  }
  const integro = nucleo.receipt.verifyReceipt(respuesta.recibo);
  if (!integro.ok) {
    return { ok: false, razon: `el recibo no verifica: ${integro.reason}` };
  }
  const atado = String(respuesta.recibo.operation.goal).indexOf(canonico(respuesta));
  if (atado === -1) {
    return { ok: false, razon: 'el recibo esta firmado sobre otro cuerpo: no corresponde a esta respuesta' };
  }
  return { ok: true, razon: 'recibo integro y atado a esta respuesta' };
}

function totalDe(piezas) {
  return (piezas || []).reduce((suma, p) => {
    const precio = PRECIOS[p.nombre];
    if (precio === undefined) throw new Error(`pieza sin precio declarado: ${p.nombre}`);
    return suma + precio * p.cantidad;
  }, 0);
}

function abierto(mandato, encargo) {
  return { ...mandato, expirado: Boolean(mandato.expiresAt) && Date.parse(mandato.expiresAt) <= Date.now() };
}

function abrirConversacion({ encargo, mandato, registro, raiz }) {
  const { delegation } = nucleo;

  const conversacion = {
    encargo,
    mandato,
    registro,
    contraparte: encargo.de,
    orquestador: 'queen-agente',
    abierta: false,
    lecturaConfirmada: false,
    respuestaAceptada: null,
    reciboDelegacion: null,
    mensajesTerceros: 0,
    pagosSolicitados: 0,
    pagoSolicitado: null,
    puerta: null,
    _propuestas: new Map(),
    _cerrada: null,
  };

  // Queen entrega el encargo a la contraparte. El medio es el propio proyecto: lo que Queen
  // toca es lo suyo y el registro, y nada fuera.
  const d = delegation.createDelegation({
    task: `encargo ${encargo.id} de ${encargo.de}: ${encargo.pide}`,
    medium: { cwd: raiz || path.join(__dirname, '..'), material: ['datos/'], forbidden: ['notas/'] },
    delegate: encargo.de,
    orchestrator: 'queen-agente',
  });
  conversacion._d = d;

  escribir(registro, 'conversacion_abierta', {
    encargoId: encargo.id,
    contraparte: encargo.de,
    orquestador: 'queen-agente',
    delegado: encargo.de,
  });

  function preguntar({ a, texto }) {
    escribir(registro, 'pregunta', { a, texto });
    return { a, texto };
  }

  function confirmarLectura({ de }) {
    if (de !== encargo.de) return { relaunch: true, reason: 'solo la contraparte confirma la lectura' };
    const arranque = delegation.recordStart(d, { readTask: true });
    conversacion.lecturaConfirmada = true;
    conversacion.abierta = !arranque.relaunch;
    escribir(registro, 'lectura_confirmada', { de });
    return arranque;
  }

  function responder(respuesta) {
    if (!conversacion.lecturaConfirmada) {
      escribir(registro, 'respuesta_rechazada', {
        de: respuesta && respuesta.de,
        motivo: 'la contraparte no habia confirmado la lectura del encargo',
      });
      return { aceptada: false, razon: 'la conversacion no esta abierta: la contraparte no confirmo la lectura' };
    }

    // 1. Jurisdiccion. Observar una conversacion no concede jurisdiction sobre ella.
    if (!respuesta || respuesta.de !== encargo.de) {
      const de = respuesta ? respuesta.de : 'desconocido';
      conversacion.mensajesTerceros += 1;
      escribir(registro, 'mensaje_de_tercero', { de, nota: 'habla en la conversacion pero no es la contraparte' });
      escribir(registro, 'respuesta_rechazada', { de, motivo: `${de} no es la contraparte del encargo ${encargo.id}` });
      return { aceptada: false, razon: `${de} no es la contraparte de este encargo` };
    }

    // 2. Alcance. La autoridad de la contraparte no viaja a otro encargo suyo.
    if (respuesta.alcance !== encargo.id) {
      escribir(registro, 'respuesta_rechazada', {
        de: respuesta.de,
        motivo: `el alcance declarado (${respuesta.alcance}) no cubre el encargo ${encargo.id}`,
      });
      return { aceptada: false, razon: 'el alcance de la respuesta no cubre este encargo' };
    }

    // 3. Firma. Sin recibo no hay respuesta, y un recibo de otro cuerpo tampoco.
    const firma = verificarRespuesta(respuesta);
    if (!firma.ok) {
      escribir(registro, 'respuesta_rechazada', { de: respuesta.de, motivo: firma.razon });
      return { aceptada: false, razon: firma.razon };
    }

    let total;
    try {
      total = totalDe(respuesta.piezas);
    } catch (err) {
      escribir(registro, 'respuesta_rechazada', { de: respuesta.de, motivo: err.message });
      return { aceptada: false, razon: err.message };
    }

    conversacion.respuestaAceptada = { ...respuesta, total };
    delegation.recordResult(d, { output: canonico(respuesta), touched: [] });
    escribir(registro, 'respuesta_aceptada', {
      de: respuesta.de,
      alcance: respuesta.alcance,
      piezas: respuesta.piezas,
      reciboDigest: respuesta.recibo.digest,
    });
    return { aceptada: true, razon: 'la contraparte responde dentro de su alcance y con su recibo' };
  }

  // El núcleo sella el bloqueo. `impossible` es la vía del núcleo para lo que no cabe dentro de
  // lo otorgado: vuelve bloqueado, con la razón y la salida, sin ejecutar el efecto. Queen no
  // escribe un "blocked" a mano: escribe la razón y deja que el núcleo la selle.
  async function bloquear({ salida, detalle, recipientes }) {
    const op = nucleo.operation.createOperation({
      goal: `${encargo.id}: ${detalle.motivo}`,
      authority: { spend: [], pausers: mandato.pausers || [] },
      agent: 'queen-agente',
      exit: salida,
      action: 'formular-presupuesto',
    });
    const capacidad = {
      id: 'formular-presupuesto',
      required: () => ({ impossible: true, reason: `${detalle.motivo}: ${JSON.stringify(detalle)}`, exit: salida }),
      perform: () => ({ ok: true }),
    };
    const corrida = await nucleo.operation.runOperation(op, capacidad, {
      ask: () => null,
      verify: () => ({ verified: false, checks: {}, reason: 'no aplica a una operacion bloqueada' }),
    });
    escribir(registro, 'bloqueado', { salida, detalle, recipientes });
    return {
      estado: 'bloqueado',
      propuesta: null,
      recibo: corrida.receipt,
      idempotente: false,
      salida,
      detalle,
      recipientes,
    };
  }

  async function cerrar() {
    if (conversacion._cerrada) return { ...conversacion._cerrada, idempotente: true };

    if (!conversacion.lecturaConfirmada || !conversacion.abierta) {
      return bloquear({
        salida: 'no hay conversacion abierta con la contraparte: abre la conversacion y pide lo que falta antes de formular',
        detalle: { motivo: 'conversacion no abierta' },
        // A quien vuelve: la contraparte puede contestar, y la persona que otorga el mandato es
        // quien puede cortar el encargo. Los dos, en el orden en que pueden actuar.
        recipientes: [encargo.de, mandato.persona],
      });
    }
    if (!conversacion.respuestaAceptada) {
      return bloquear({
        salida: 'la contraparte no respondio con recibo: no hay nada sobre lo que formular',
        detalle: { motivo: 'sin respuesta firmada' },
        recipientes: [encargo.de, mandato.persona],
      });
    }

    // La delegacion se revisa y se integra: solo despues de eso hay recibo de la conversacion.
    delegation.reviewDelegation(d, {
      reviewer: 'queen-agente',
      accept: true,
      findings: ['la respuesta viene de la contraparte, dentro de su alcance y firmada'],
    });
    conversacion.reciboDelegacion = delegation.integrateDelegation(d);

    return formular();
  }

  async function formular() {
    const total = conversacion.respuestaAceptada.total;
    const techo = Number(mandato.maxAmount);
    const vigente = abierto(mandato, encargo);

    // El reloj del mandato. Vencido, no revive solo.
    if (vigente.expirado) {
      return bloquear({
        salida: `el mandato vencio el ${mandato.expiresAt}: sin mandato vigente no hay presupuesto; solo la persona que lo otorga puede renovarlo`,
        detalle: { motivo: 'mandato vencido', total, techo, excedePor: 0 },
        recipientes: [mandato.persona],
      });
    }

    // El techo es un limite duro, y es duro para Queen: no se pide el dinero ni para preguntar.
    if (total > techo) {
      return bloquear({
        salida: `el presupuesto formulation (${total} ${mandato.activo}) excede el techo del mandato (${techo} ${mandato.activo}); vuelve a la persona que lo otorga, que puede cambiar el techo o recortar el encargo. La contraparte no puede ampliarlo`,
        detalle: { motivo: 'excede el techo del mandato', total, techo, excedePor: total - techo },
        recipientes: [mandato.persona],
      });
    }

    const clave = createHash('sha256')
      .update(`${encargo.id}|${mandato.maxAmount}|${mandato.destino}|${canonico(conversacion.respuestaAceptada)}`, 'utf8')
      .digest('hex');

    if (conversacion._propuestas.has(clave)) {
      // Idempotente de verdad: se devuelve lo hecho, no se vuelve a ejecutar el efecto.
      return { ...conversacion._propuestas.get(clave), idempotente: true };
    }

    const propuesta = {
      encargo: encargo.id,
      contraparte: encargo.de,
      alcance: conversacion.respuestaAceptada.alcance,
      piezas: conversacion.respuestaAceptada.piezas,
      total,
      moneda: mandato.activo,
      destino: mandato.destino,
    };
    propuesta.digest = createHash('sha256').update(JSON.stringify(propuesta), 'utf8').digest('hex');

    escribir(registro, 'propuesta_formulada', { propuesta, idempotente: false });

    // El pago pasa por el núcleo: la capacidad declara el gasto, la puerta muestra el costo
    // antes de pagarlo, y el efecto queda en un recibo. Lo simulado es el asentamiento.
    const { correrPago } = require('./pago.js');
    const pago = await correrPago({
      mandato,
      monto: total,
      destino: mandato.destino,
      contraparte: encargo.de,
      encargoId: encargo.id,
      persona: mandato.persona,
      registro,
    });
    conversacion.pagosSolicitados += 1;
    conversacion.pagoSolicitado = { monto: total, moneda: mandato.activo, destino: mandato.destino };
    conversacion.puerta = pago.puerta;

    const resultado = {
      estado: 'completa',
      propuesta,
      recibo: pago.recibo,
      idempotente: false,
      salida: 'la propuesta quedo formulada dentro del techo y con su recibo; el pago quedo simulado',
      detalle: { total, techo, excedePor: 0, simulado: true },
      recipientes: [mandato.persona],
    };
    conversacion._propuestas.set(clave, resultado);
    conversacion._cerrada = resultado;
    escribir(registro, 'recibo', { recibo: pago.recibo, digest: pago.recibo.digest });
    escribir(registro, 'cierre', { estado: 'completa' });
    return resultado;
  }

  Object.assign(conversacion, { preguntar, confirmarLectura, responder, cerrar });
  return conversacion;
}

module.exports = { abrirConversacion, reciboDeRespuesta, verificarRespuesta, canonico, totalDe, PRECIOS };
