'use strict';

// ROJO 1 — un encargo sin conversación abierta no produce presupuesto.
//
// El encargo es lo primero que llega, y llega solo: un texto con un proyecto y lo que quiere.
// La tentación de un agente es mirar el texto y decir un precio. Queen no puede, y este
// archivo dice por qué: el precio sin conversación es una conjetura con formato de presupuesto,
// y en pantalla se ven igual.
//
// Lo que se espera no es un error, es un BLOQUEO con su salida: la tarea vuelve a la persona
// con la razón y con quién puede resolverlo (decisión 16).

const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');

const { crearAgencia, MANDO_POR_DEFECTO } = require('../src/agencia.js');

function agenciaLimpia() {
  const registro = path.join(os.tmpdir(), `queen-rojo1-${process.pid}-${Math.random().toString(36).slice(2)}.jsonl`);
  return crearAgencia({ registro });
}

const ENCARGO = {
  id: 'enc-001',
  de: 'proyecto-corcheta',
  pide: 'presupuesto para una campana de lanzamiento de tres piezas',
};

test('un encargo sin conversacion abierta vuelve bloqueado, con su salida y sin presupuesto', async () => {
  const agencia = agenciaLimpia();
  const salida = await agencia.atenderEncargo(ENCARGO, { mandato: MANDO_POR_DEFECTO });

  assert.equal(salida.estado, 'bloqueado', 'un encargo sin conversacion abierta no puede terminar en presupuesto');
  assert.equal(salida.propuesta, null, 'no puede haber propuesta sin conversacion');
  assert.equal(salida.recibo.status, 'blocked', 'el nucleo tiene que sellar el bloqueo');
  assert.ok(salida.salida && salida.salida.length > 0, 'el bloqueo vuelve con su salida: que puede hacer la persona');
  assert.match(salida.salida, /conversaci/i, 'la salida tiene que nombrar lo que falta: la conversacion');
});

test('el bloqueo lo sello el nucleo y su digest verifica', async () => {
  const agencia = agenciaLimpia();
  const salida = await agencia.atenderEncargo(ENCARGO, { mandato: MANDO_POR_DEFECTO });

  assert.equal(agencia.nucleo.receipt.verifyReceipt(salida.recibo).ok, true, 'el bloqueo tambien es un recibo verificable');
  assert.equal(salida.recibo.anchor.status, 'pending', 'y no esta anclado en ninguna red');
});

test('el bloqueo nombra a la persona que puede resolverlo, no a un agente', async () => {
  const agencia = agenciaLimpia();
  const salida = await agencia.atenderEncargo(ENCARGO, { mandato: MANDO_POR_DEFECTO });

  assert.equal(salida.recibo.decidedBy ?? null, null, 'nadie consiente por la persona: el agente no firma su propio bloqueo');
  assert.ok(salida.recipientes.length > 0, 'el bloqueo declara a quien vuelve');
  assert.ok(salida.recipientes.includes('persona-que-otorga'), 'la persona que otorga el mandato esta entre quienes pueden resolverlo');
  assert.ok(salida.recipientes.includes(ENCARGO.de), 'y la contraparte, que es quien puede contestar');
});

test('una conversacion abierta que la contraparte nunca leyó tampoco alcanza', async () => {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  // La contraparte existe pero nunca confirmo que leyó el encargo.
  const salida = await conversacion.cerrar();

  assert.equal(salida.estado, 'bloqueado');
  assert.equal(conversacion.abierta, false, 'una conversacion que la contraparte no leyó no esta abierta');
  assert.match(salida.salida, /conversaci/i);
});

test('el registro deja escrito que se pidio y por que no se formulo', async () => {
  const agencia = agenciaLimpia();
  await agencia.atenderEncargo(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  const tipos = agencia.registro.leer().map((e) => e.tipo);

  assert.ok(tipos.includes('encargo_recibido'), 'lo que se pidio queda escrito');
  assert.ok(tipos.includes('bloqueado'), 'y tambien por que no se formulo');
  assert.ok(!tipos.includes('propuesta_formulada'), 'y no hay ninguna propuesta, porque no debia haberla');
});

test('la cadena del registro aguanta el bloqueo entero', async () => {
  const agencia = agenciaLimpia();
  await agencia.atenderEncargo(ENCARGO, { mandato: MANDO_POR_DEFECTO });
  const auditoria = agencia.registro.auditar();

  assert.equal(auditoria.ok, true, `la cadena se rompio en la linea ${auditoria.rotaEn}`);
});
