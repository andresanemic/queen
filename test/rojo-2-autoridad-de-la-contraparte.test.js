'use strict';

// ROJO 2 — una respuesta de un proyecto ajeno, o sin alcance para este encargo, no es respuesta.
//
// En un ecosistema donde todos hablan, el modo de falla no es el silencio: es el mensaje
// equivocado llegando al lugar correcto. Un proyecto vecino contesta el encargo con datos que
// parecen buenos. Y la contraparte correcta contesta, pero para otro encargo suyo.
//
// Los dos casos se registran como RECHAZO con su razón, porque un rechazo que no se escribe es
// un rechazo que la próxima vez se cuela. Y el tercero puede leerlo sin Queen.

const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');

const { crearAgencia, MANDO_POR_DEFECTO, PRECIOS } = require('../src/agencia.js');
const { reciboDeRespuesta } = require('../src/conversacion.js');

const ENCARGO = {
  id: 'enc-002',
  de: 'proyecto-corcheta',
  pide: 'presupuesto para una campana de lanzamiento de tres piezas',
};

const RESPUESTA_VALIDA = {
  de: 'proyecto-corcheta',
  alcance: 'enc-002',
  piezas: [
    { nombre: 'concepto', cantidad: 1 },
    { nombre: 'campana', cantidad: 1 },
  ],
};

function agenciaLimpia() {
  const registro = path.join(os.tmpdir(), `queen-rojo2-${process.pid}-${Math.random().toString(36).slice(2)}.jsonl`);
  return crearAgencia({ registro });
}

function conRespuesta(mutado) {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  conversacion.confirmarLectura({ de: ENCARGO.de });
  const respuesta = { ...RESPUESTA_VALIDA, ...mutado };
  return { agencia, conversacion, respuesta: { ...respuesta, recibo: reciboDeRespuesta(respuesta) } };
}

test('un proyecto que no contrato el encargo no puede responderlo', () => {
  const { conversacion, respuesta } = conRespuesta({ de: 'proyecto-vecino' });
  const veredicto = conversacion.responder(respuesta);

  assert.equal(veredicto.aceptada, false, 'quien no contrato el encargo no tiene jurisdiccion sobre el');
  assert.match(veredicto.razon, /contraparte/i, 'el rechazo dice por que');
  assert.equal(conversacion.respuestaAceptada, null, 'no hay respuesta que pueda sostener un presupuesto');
});

test('la contraparte correcta tampoco puede responder un encargo que no es el suyo', () => {
  const { conversacion, respuesta } = conRespuesta({ alcance: 'enc-999' });
  const veredicto = conversacion.responder(respuesta);

  assert.equal(veredicto.aceptada, false, 'la autoridad de la contraparte no viaja a otro encargo');
  assert.match(veredicto.razon, /alcance/i, 'el rechazo dice que el alcance no cubre este encargo');
  assert.equal(conversacion.respuestaAceptada, null);
});

test('el rechazo queda escrito, y un tercero lo lee sin Queen', () => {
  const { agencia, conversacion, respuesta } = conRespuesta({ de: 'proyecto-vecino' });
  conversacion.responder(respuesta);
  const tipos = agencia.registro.leer().map((e) => e.tipo);

  assert.ok(tipos.includes('respuesta_rechazada'), 'el rechazo se escribe, no se calla');
  const rechazos = agencia.registro.leer().filter((e) => e.tipo === 'respuesta_rechazada');
  assert.equal(rechazos.length, 1);
  assert.equal(rechazos[0].datos.de, 'proyecto-vecino', 'el registro dice quien se cuelo, no solo que algo fallo');
});

test('con la respuesta ajena rechazada, la conversacion no cierra y nada se formula', async () => {
  const { conversacion, respuesta } = conRespuesta({ de: 'proyecto-vecino' });
  conversacion.responder(respuesta);
  const cierre = await conversacion.cerrar();

  assert.notEqual(cierre.estado, 'completa', 'no hay conversacion completa sin la contraparte');
  assert.equal(cierre.propuesta, null, 'y no hay presupuesto que formular');
  assert.equal(conversacion.reciboDelegacion, null, 'la delegacion no se integro: nadie reviso una respuesta que no cuenta');
  assert.equal(conversacion.pagosSolicitados, 0, 'y no se pidio dinero');
});

test('la misma respuesta, ahora con recibo y de la contraparte, si pasa', () => {
  const { conversacion, respuesta } = conRespuesta({});
  const veredicto = conversacion.responder(respuesta);

  assert.equal(veredicto.aceptada, true, 'el camino bueno tambien tiene que andar, o el rojo no demuestra nada');
  assert.equal(conversacion.respuestaAceptada.de, 'proyecto-corcheta');
});

test('los precios del recorrido son de ejemplo y el recargo de la contraparte no se inventa solo', async () => {
  const { conversacion, respuesta } = conRespuesta({});
  conversacion.responder(respuesta);
  const cierre = await conversacion.cerrar();
  const esperado = RESPUESTA_VALIDA.piezas.reduce((suma, p) => suma + PRECIOS[p.nombre] * p.cantidad, 0);

  assert.equal(cierre.propuesta.total, esperado, 'el total sale de la tabla, no del tono de la respuesta');
});
