'use strict';

// CASO DE CONTROL — una conversacion que debe poder completarse.
//
// Los cinco rojos de la otra parte pourraient ser un sistema que solo sabe decir que no, y eso
// tambien es un producto. Este archivo es el que no puede fallar: el recorrido entero, del
// encargo a la propuesta con su recibo, y lo que de verdad demuestra y lo que no.
//
// La linea que mas importa es la del pago: el recibo sale `verified` —porque lo que se
// verifico fue real— con el anclaje en `pending` y con `x402 settlement on a live network`
// entre lo no cubierto. Un sistema que pasara esto diciendo "pago realizado" estaria mintiendo
// en la unica linea que el otro lee.

const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');

const { nucleo } = require('../src/nucleo.js');
const { auditarCadena } = require('../src/registro.js');
const { PRECIOS } = require('../src/agencia.js');
const { PIEZAS_DEL_RECORRIDO, MANDO_DEL_RECORRIDO, ejecutarRecorrido } = require('../src/recorrido.js');

function registroLimpio() {
  return path.join(os.tmpdir(), `queen-control-${process.pid}-${Math.random().toString(36).slice(2)}.jsonl`);
}

async function correr() {
  const corrida = await ejecutarRecorrido({ registro: registroLimpio() });
  const entradas = corrida.agencia.registro.leer();
  const ultimas = {};
  for (const e of entradas) ultimas[e.tipo] = e;
  return {
    ...corrida,
    entradas,
    estado: ultimas.cierre ? ultimas.cierre.datos.estado : null,
    propuesta: ultimas.propuesta_formulada ? ultimas.propuesta_formulada.datos.propuesta : null,
    recibo: ultimas.recibo ? ultimas.recibo.datos.recibo : null,
    verificaciones: entradas.filter((e) => e.tipo === 'verificacion').map((e) => e.datos),
  };
}

test('el recorrido completo llega a la propuesta y la propuesta verifica', async () => {
  const r = await correr();

  assert.equal(r.estado, 'completa', 'esta conversacion tenia que poder completarse');
  assert.ok(r.propuesta, 'hay propuesta');
  assert.equal(r.recibo.status, 'verified', 'y el nucleo la sello como verificada');
  assert.equal(nucleo.receipt.verifyReceipt(r.recibo).ok, true, 'el recibo verifica con el verificador del nucleo');
});

test('el total sale de las piezas de la respuesta, con precios de ejemplo', async () => {
  const r = await correr();
  const esperado = PIEZAS_DEL_RECORRIDO.reduce((s, p) => s + PRECIOS[p.nombre] * p.cantidad, 0);

  assert.equal(r.propuesta.total, esperado);
  assert.equal(r.propuesta.moneda, 'USD');
  assert.equal(r.propuesta.total <= Number(MANDO_DEL_RECORRIDO.maxAmount), true, 'el recorrido tiene que caber en el techo');
});

test('el recibo declara que cubrio y que no, y lo que no cubre incluye el anclaje externo', async () => {
  const r = await correr();

  assert.ok(Array.isArray(r.recibo.coverage) && r.recibo.coverage.length > 0, 'un recibo sin cobertura no dice nada');
  assert.ok(r.recibo.notCovered.includes('external anchor'), 'el anclaje externo nunca se da por cubierto');
  assert.ok(r.recibo.coverage.length > 0 && r.recibo.coverage.length < 10, 'y la cobertura es una lista corta y real');
});

test('el pago quedo declarado como simulado en el propio recibo, no solo en el informe', async () => {
  const r = await correr();
  const simulaciones = r.recibo.notCovered.filter((c) => /x402|network|settlement|on-chain/i.test(c));

  assert.ok(simulaciones.length > 0, 'lo simulado tiene que estar en el no cubierto del recibo');
  assert.ok(simulaciones.some((c) => /x402/i.test(c)), 'y nombrar el pago, no solo decir "algo no se cubrio"');
});

test('el anclaje queda en pending: no hay hash que buscar en ningun explorador', async () => {
  const r = await correr();

  assert.equal(r.recibo.anchor.status, 'pending');
  assert.equal(r.recibo.anchor.txHash, undefined, 'no hay txHash: no se invento uno de ejemplo');
});

test('quien verifica no es quien ejecuta', async () => {
  const r = await correr();
  const ejecutores = new Set(['queen-agente', 'queen-pagador']);

  assert.ok(r.verificaciones.length > 0, 'algo se verifico');
  for (const v of r.verificaciones) {
    assert.equal(ejecutores.has(v.quien), false, `el ejecutor ${v.quien} no verifica su propio efecto`);
  }
});

test('la cadena del registro se puede auditar y esta entera', async () => {
  const r = await correr();
  const auditoria = auditarCadena(r.ruta);

  assert.equal(auditoria.ok, true, `la cadena se rompio en la linea ${auditoria.rotaEn}: ${auditoria.razon}`);
  assert.ok(auditoria.lineas > 5, 'y hay recorrido detras, no dos lineas');
});

test('un tercero lee el recorrido entero sin Queen, y ve lo que se rechazo', async () => {
  const r = await correr();
  const tipos = new Set(r.entradas.map((e) => e.tipo));

  for (const necesario of ['encargo_recibido', 'conversacion_abierta', 'pregunta', 'respuesta_aceptada', 'propuesta_formulada', 'verificacion', 'recibo']) {
    assert.ok(tipos.has(necesario), `al tercero le falta ${necesario}`);
  }
  assert.ok(tipos.has('respuesta_rechazada') || tipos.has('mensaje_de_tercero'), 'el recorrido tiene que dejar ver que algo se rechazo');
});

test('una tercera parte puede reponer el recorrido con solo los recibos', async () => {
  const r = await correr();
  const repuesto = nucleo.continuity.resumeFromReceipts([r.recibo]);

  assert.ok(repuesto !== null && typeof repuesto === 'object', 'el nucleo sabe reponer la operacion desde el recibo solo');
  assert.equal(typeof repuesto.reason, 'string', 'y dice por que la operacion quedo como quedo');
});

test('la doble formulacion se ve en el recorrido: el mismo encargo no dio dos precios', async () => {
  const r = await correr();

  assert.equal(r.repetido.idempotente, true, 'el segundo llamado se identifica como idempotente');
  assert.equal(r.repetido.propuesta.digest, r.cierre.propuesta.digest, 'y devuelve la misma propuesta');
  const propuestas = r.entradas.filter((e) => e.tipo === 'propuesta_formulada');
  assert.equal(propuestas.length, 1, 'con una sola linea de propuesta en el registro');
});
