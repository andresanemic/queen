'use strict';

// ROJO 3 — un presupuesto que excede el techo delegado no se pide: vuelve a la persona.
//
// El techo es un límite duro, y es duro para Queen. Si lo que hay que formular cuesta más de
// lo que le otorgaron, Queen no abre la puerta a pagarlo ni siquiera para preguntar: vuelve
// bloqueada con su salida. Ni siquiera la contraparte que dice "si, pagalo" lo desbloquea,
// porque la contraparte no es quien otorga el techo: la persona si.
//
// Lo segundo que se prueba es el otro lado: cuando el techo NO alcanza, la puerta se abre y
// muestra el costo antes de que alguien lo pague (decision 19). Un techo que nunca se cruza
// tampoco es una puerta.

const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');

const { crearAgencia, PRECIOS } = require('../src/agencia.js');
const { reciboDeRespuesta } = require('../src/conversacion.js');

const ENCARGO = { id: 'enc-003', de: 'proyecto-corcheta', pide: 'campana de lanzamiento de tres piezas' };

// 40 000 + 30 000 + 20 000 = 90 000, sobre un techo de 60 000.
const PIEZAS_CARAS = [
  { nombre: 'concepto', cantidad: 2 },
  { nombre: 'produccion', cantidad: 1 },
  { nombre: 'campana', cantidad: 1 },
];

function agenciaLimpia() {
  const registro = path.join(os.tmpdir(), `queen-rojo3-${process.pid}-${Math.random().toString(36).slice(2)}.jsonl`);
  return crearAgencia({ registro });
}

function techo(maxAmount) {
  return {
    persona: 'persona-que-otorga',
    activo: 'USD',
    maxAmount: String(maxAmount),
    destino: 'billetera-de-ejemplo',
    pausers: ['persona-que-otorga'],
  };
}

async function llevarHastaLaFormulacion(mandato, piezas) {
  const agencia = agenciaLimpia();
  const conversacion = agencia.abrirConversacion(ENCARGO, { mandato });
  conversacion.confirmarLectura({ de: ENCARGO.de });
  const respuesta = { de: ENCARGO.de, alcance: ENCARGO.id, piezas, recibo: null };
  respuesta.recibo = reciboDeRespuesta(respuesta);
  conversacion.responder(respuesta);
  return { agencia, conversacion, cierre: await conversacion.cerrar() };
}

test('un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero', async () => {
  const total = PIEZAS_CARAS.reduce((s, p) => s + PRECIOS[p.nombre] * p.cantidad, 0);
  assert.ok(total > 60000, `el caso tiene que estar sobre el techo; total=${total}`);

  const { conversacion, cierre } = await llevarHastaLaFormulacion(techo(60000), PIEZAS_CARAS);

  assert.equal(cierre.estado, 'bloqueado', 'sobre el techo no hay presupuesto');
  assert.equal(cierre.propuesta, null, 'no se formula lo que no cabe');
  assert.equal(conversacion.pagosSolicitados, 0, 'y no se le pide dinero a nadie: la puerta ni se abre');
  assert.match(cierre.salida, /techo/i, 'la salida dice que el problema es el techo');
  assert.match(cierre.salida, /persona/i, 'y a quien vuelve');
});

test('el bloqueo del techo no lo levanta ni la contraparte que lo aprueba', async () => {
  // La contraparte responde que el presupuesto le sirve. Sigue sin caber en el mandato de la
  // persona, y el mandato es de la persona.
  const { conversacion, cierre } = await llevarHastaLaFormulacion(techo(60000), PIEZAS_CARAS);
  conversacion.responder({
    de: ENCARGO.de,
    alcance: ENCARGO.id,
    piezas: PIEZAS_CARAS,
    acepta: true,
    recibo: reciboDeRespuesta({ de: ENCARGO.de, alcance: ENCARGO.id, piezas: PIEZAS_CARAS }),
  });

  assert.equal(cierre.estado, 'bloqueado', 'la contraparte no otorga el techo de la persona');
  assert.equal(conversacion.pagosSolicitados, 0);
});

test('el bloqueo nombra el numero que falta, no solo que falto', async () => {
  const total = PIEZAS_CARAS.reduce((s, p) => s + PRECIOS[p.nombre] * p.cantidad, 0);
  const { cierre } = await llevarHastaLaFormulacion(techo(60000), PIEZAS_CARAS);

  assert.ok(cierre.detalle.total > 0, 'el bloqueo trae el total que se pidio');
  assert.equal(cierre.detalle.techo, 60000, 'y el techo que habia');
  assert.equal(cierre.detalle.excedePor, total - 60000, 'y por cuanto se paso');
});

test('el bloqueo del techo lo sello el nucleo, con su digest', async () => {
  const { agencia, cierre } = await llevarHastaLaFormulacion(techo(60000), PIEZAS_CARAS);

  assert.equal(cierre.recibo.status, 'blocked');
  assert.equal(agencia.nucleo.receipt.verifyReceipt(cierre.recibo).ok, true);
});

test('bajo el techo, la formula pasa y el pago se pide una sola vez por su monto', async () => {
  const piezas = [{ nombre: 'concepto', cantidad: 1 }];
  const { conversacion, cierre } = await llevarHastaLaFormulacion(techo(60000), piezas);

  assert.equal(cierre.estado, 'completa', 'el camino bueno tiene que andar');
  assert.equal(cierre.propuesta.total, PRECIOS.concepto);
  assert.equal(conversacion.pagosSolicitados, 1, 'un pago, no dos');
  assert.equal(conversacion.pagoSolicitado.monto, PRECIOS.concepto, 'y por el monto formulado, no por el techo');
});

test('la puerta muestra el costo antes de pagarlo', async () => {
  const piezas = [{ nombre: 'concepto', cantidad: 1 }];
  const { conversacion } = await llevarHastaLaFormulacion(techo(60000), piezas);
  const puerta = conversacion.puerta;

  assert.ok(puerta, 'hubo una puerta');
  assert.equal(puerta.costo, PRECIOS.concepto, 'la puerta muestra lo que cuesta, antes');
  assert.equal(puerta.publicByDefault, false, 'lo que sale a publico viene apagado (decision 19)');
  assert.ok(puerta.exit && puerta.exit.length > 0, 'todo rechazo nombra la salida');
  assert.equal(puerta.aprobadaPor, 'persona-que-otorga', 'y el que aprueba es la persona, no el agente');
});

test('un techo vencido no revive solo', async () => {
  const vencido = { ...techo(60000), expiresAt: '2020-01-01T00:00:00.000Z' };
  const piezas = [{ nombre: 'concepto', cantidad: 1 }];
  const { conversacion, cierre } = await llevarHastaLaFormulacion(vencido, piezas);

  assert.equal(cierre.estado, 'bloqueado', 'un mandato cuyo reloj vencio no autoriza nada');
  assert.equal(cierre.detalle.motivo, 'mandato vencido');
  assert.equal(conversacion.pagosSolicitados, 0);
});
