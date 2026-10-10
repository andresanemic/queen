'use strict';

// ROJO 4 — la misma propuesta, formulada dos veces, es la misma.
//
// Un presupuesto que aparece dos veces son dos presupuestos. Quien elige se queda con el que
// vio primero, y el segundo parece una negociacion mas cara o mas barata segun a quien se le
// enseñe. La idempotencia no es una mejora de robustez: es la diferencia entre un registro y
// dos.
//
// El criterio es estricto: mismo encargo, misma respuesta, mismo mandato → una sola propuesta,
// un solo pago, una sola linea en el registro, y el segundo llamado devuelve el recibo original
// en vez de rehacerlo. Cambiar el encargo o cambiar una cantidad es otra propuesta, y eso si se
// agrega.
//
// Y hay una distincion que el rojo obliga a hacer explicita: **la propuesta es idempotente por
// contenido** —su huella no depende de cuando se corrio—, **el recibo lleva la hora de la
// corrida**. Por eso dos corridas independientes dan la misma propuesta y recibos distintos, y
// eso no es una contradiccion: son dos cosas distintas con dos propiedades distintas.

const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');

const { crearAgencia, PRECIOS } = require('../src/agencia.js');
const { reciboDeRespuesta } = require('../src/conversacion.js');

function agenciaLimpia() {
  const registro = path.join(os.tmpdir(), `queen-rojo4-${process.pid}-${Math.random().toString(36).slice(2)}.jsonl`);
  return crearAgencia({ registro });
}

const MANDATO = {
  persona: 'persona-que-otorga',
  activo: 'USD',
  maxAmount: '90000',
  destino: 'billetera-de-ejemplo',
  pausers: ['persona-que-otorga'],
};

const PIEZAS = [{ nombre: 'concepto', cantidad: 1 }, { nombre: 'produccion', cantidad: 1 }];

function conversacionCon(encargoId = 'enc-004', piezas = PIEZAS) {
  const agencia = agenciaLimpia();
  const encargo = { id: encargoId, de: 'proyecto-corcheta', pide: 'campana de lanzamiento' };
  const conversacion = agencia.abrirConversacion(encargo, { mandato: MANDATO });
  conversacion.confirmarLectura({ de: encargo.de });
  const respuesta = { de: encargo.de, alcance: encargo.id, piezas, recibo: null };
  respuesta.recibo = reciboDeRespuesta(respuesta);
  conversacion.responder(respuesta);
  return { agencia, conversacion, encargo };
}

test('cerrar dos veces la misma conversacion devuelve el mismo recibo, no dos', async () => {
  const { conversacion } = conversacionCon();
  const primera = await conversacion.cerrar();
  const segunda = await conversacion.cerrar();

  assert.equal(primera.estado, 'completa');
  assert.equal(segunda.estado, 'completa');
  assert.equal(segunda.propuesta.digest, primera.propuesta.digest, 'misma entrada, misma huella');
  assert.equal(segunda.recibo.digest, primera.recibo.digest, 'y el segundo llamado no rehizo el recibo');
  assert.equal(segunda.idempotente, true, 'el segundo llamado lo dice');
  assert.equal(primera.idempotente, false, 'el primero no tiene por que decirlo');
});

test('formular dos veces paga una sola vez', async () => {
  const { conversacion } = conversacionCon();
  await conversacion.cerrar();
  await conversacion.cerrar();
  await conversacion.cerrar();

  assert.equal(conversacion.pagosSolicitados, 1, 'tres cierres, un pago: el efecto no se repite');
});

test('el registro guarda una sola linea de propuesta, aunque se cierre tres veces', async () => {
  const { agencia, conversacion } = conversacionCon();
  await conversacion.cerrar();
  await conversacion.cerrar();
  await conversacion.cerrar();

  const propuestas = agencia.registro.leer().filter((e) => e.tipo === 'propuesta_formulada');
  assert.equal(propuestas.length, 1, 'tres llamados, una linea: el registro no lleva dos precios colgados');

  const pagos = agencia.registro.leer().filter((e) => e.tipo === 'pago_simulado');
  assert.equal(pagos.length, 1, 'y tampoco dos pagos');
});

test('el total sale de la tabla de precios, no del camino que se tomo', async () => {
  const { conversacion } = conversacionCon();
  const cierre = await conversacion.cerrar();
  const esperado = PIEZAS.reduce((s, p) => s + PRECIOS[p.nombre] * p.cantidad, 0);

  assert.equal(cierre.propuesta.total, esperado);
  assert.equal(cierre.propuesta.moneda, 'USD', 'el presupuesto dice en que esta, no solo cuanto');
});

test('la huella de la propuesta no depende de la hora: dos corridas dan la misma', async () => {
  const a = await conversacionCon('enc-004').conversacion.cerrar();
  const b = await conversacionCon('enc-004').conversacion.cerrar();

  assert.equal(a.propuesta.digest, b.propuesta.digest, 'mismo encargo y mismas piezas, misma propuesta');
  assert.notEqual(a.recibo.digest, b.recibo.digest, 'pero los recibos son de corridas distintas y llevan su hora');
  assert.notEqual(a.recibo.at, b.recibo.at, 'que es exactamente por que el recibo no puede ser la huella de la propuesta');
});

test('cambiar una cantidad cambia la huella: no es la misma propuesta', async () => {
  const a = await conversacionCon('enc-004', [{ nombre: 'concepto', cantidad: 1 }]).conversacion.cerrar();
  const b = await conversacionCon('enc-004', [{ nombre: 'concepto', cantidad: 2 }]).conversacion.cerrar();

  assert.notEqual(a.propuesta.digest, b.propuesta.digest, 'dos piezas no es un presupuesto');
});

test('otro encargo es otra propuesta, y si se agrega a su propio registro', async () => {
  const primera = conversacionCon('enc-004');
  const segunda = conversacionCon('enc-005');
  const cierreA = await primera.conversacion.cerrar();
  const cierreB = await segunda.conversacion.cerrar();

  assert.notEqual(cierreA.propuesta.digest, cierreB.propuesta.digest, 'enc-005 es otro encargo');
  const enElPrimero = primera.agencia.registro.leer().filter((e) => e.tipo === 'propuesta_formulada');
  assert.equal(enElPrimero.length, 1, 'enc-005 no aparece en el registro de enc-004');
  const enElSegundo = segunda.agencia.registro.leer().filter((e) => e.tipo === 'propuesta_formulada');
  assert.equal(enElSegundo.length, 1, 'ni al reves');
});
