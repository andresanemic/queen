'use strict';

// ROJO 5 — una conversacion con un tercero que no dejo recibo no es evidencia.
//
// Es el rojo que mas se parece a la vida real. Alguien escribe en el canal, contesta algo
// razonable, y el agente lo trata como si fuera un dato porque "se lo dijeron". Nadie lo firmo.
// Una semana despues nadie sabe si ese numero estaba acordado o si fue una idea de paso.
//
// Y no es solo el mensaje sin recibo: es el recibo que no verifica, en sus dos formas. Si
// editan la respuesta y pegan el recibo viejo, el recibo sigue integro pero ya no corresponde
// al cuerpo. Si editan el recibo y dejan el digest viejo, el propio digest no cuadra. Los dos
// tienen que caerse, y el atado lo comprueba el verificador del nucleo, no uno hecho a mano.

const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');

const { crearAgencia, PRECIOS, MANDO_POR_DEFECTO } = require('../src/agencia.js');
const { reciboDeRespuesta, verificarRespuesta } = require('../src/conversacion.js');
const { nucleo } = require('../src/nucleo.js');

const ENCARGO = { id: 'enc-005', de: 'proyecto-corcheta', pide: 'campana de lanzamiento' };
const PIEZAS = [{ nombre: 'concepto', cantidad: 1 }];

function agenciaLimpia() {
  const registro = path.join(os.tmpdir(), `queen-rojo5-${process.pid}-${Math.random().toString(36).slice(2)}.jsonl`);
  return crearAgencia({ registro });
}

function respuestaBase() {
  return { de: ENCARGO.de, alcance: ENCARGO.id, piezas: PIEZAS, recibo: null };
}

test('una respuesta sin recibo no es respuesta, por buena que sea', () => {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  conversacion.confirmarLectura({ de: ENCARGO.de });
  const veredicto = conversacion.responder({ ...respuestaBase(), recibo: null });

  assert.equal(veredicto.aceptada, false);
  assert.match(veredicto.razon, /recibo/i, 'el rechazo dice que no vino firmado');
  assert.equal(conversacion.respuestaAceptada, null);
});

test('un recibo editado despues de escrito no verifica, y la respuesta se cae', () => {
  const respuesta = respuestaBase();
  respuesta.recibo = reciboDeRespuesta(respuesta);

  // Caso A: editan la respuesta y pegan el recibo viejo. El recibo sigue integro —su propio
  // digest cuadra— pero ya no corresponde al cuerpo que acompaña.
  const cuerpoEditado = { ...respuesta, piezas: [{ nombre: 'concepto', cantidad: 9 }] };
  const porCuerpo = verificarRespuesta(cuerpoEditado);
  assert.equal(porCuerpo.ok, false, 'el recibo tiene que estar atado a la respuesta que firma');
  assert.match(porCuerpo.razon, /otro cuerpo|atado/i);
  assert.equal(nucleo.receipt.verifyReceipt(cuerpoEditado.recibo).ok, true, 'el recibo intacto verifica por si mismo: por eso hace falta el atado');

  // Caso B: editan el recibo y dejan el digest viejo. Aca el propio recibo no verifica.
  const reciboEditado = { ...respuesta.recibo, outcome: 'pago-real-realizado' };
  assert.equal(nucleo.receipt.verifyReceipt(reciboEditado).ok, false, 'y el digest no cuadra con el recibo editado');
  assert.equal(verificarRespuesta({ ...respuesta, recibo: reciboEditado }).ok, false, 'los dos caminos caen');
});

test('una respuesta con el recibo que no es suyo no avanza la conversacion', () => {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  conversacion.confirmarLectura({ de: ENCARGO.de });
  const respuesta = respuestaBase();
  respuesta.recibo = reciboDeRespuesta(respuesta);
  const manipulada = { ...respuesta, piezas: [{ nombre: 'concepto', cantidad: 9 }] };

  const veredicto = conversacion.responder(manipulada);
  assert.equal(veredicto.aceptada, false, 'el recibo de la contraparte no alcanza si no es de este cuerpo');
  assert.match(veredicto.razon, /recibo|cuerpo|digest|verifica/i);
});

test('un tercero que habla en la conversacion queda como tercero, y no como contraparte', () => {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  conversacion.confirmarLectura({ de: ENCARGO.de });
  const respuesta = respuestaBase();
  respuesta.recibo = reciboDeRespuesta(respuesta);
  conversacion.responder(respuesta);

  // Un tercero entra despues, con su propio recibo bien hecho. Sigue sin ser la contraparte.
  const delTercero = { de: 'observador-externo', alcance: ENCARGO.id, piezas: [{ nombre: 'produccion', cantidad: 3 }], recibo: null };
  delTercero.recibo = reciboDeRespuesta(delTercero);
  const veredicto = conversacion.responder(delTercero);

  assert.equal(veredicto.aceptada, false);
  assert.equal(conversacion.respuestaAceptada.de, 'proyecto-corcheta', 'la respuesta que manda sigue siendo la de la contraparte');
});

test('el total sale de la respuesta aceptada, y el dato del tercero no se colo', async () => {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  conversacion.confirmarLectura({ de: ENCARGO.de });
  const r = respuestaBase();
  r.recibo = reciboDeRespuesta(r);
  conversacion.responder(r);
  const delTercero = { de: 'observador-externo', alcance: ENCARGO.id, piezas: [{ nombre: 'produccion', cantidad: 3 }], recibo: null };
  delTercero.recibo = reciboDeRespuesta(delTercero);
  conversacion.responder(delTercero);
  const cierre = await conversacion.cerrar();

  assert.equal(cierre.estado, 'completa');
  assert.equal(cierre.propuesta.total, PRECIOS.concepto, 'lo que cuenta es lo que firmo la contraparte');
  assert.ok(conversacion.mensajesTerceros >= 1, 'el tercero se cuenta como mensaje, no como respuesta');
});
