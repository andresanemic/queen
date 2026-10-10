'use strict';

// El recorrido: de la nada a un presupuesto con su recibo, y a una pantalla que dice lo que
// ese presupuesto no demuestra.
//
// Los actores son de fantasía y las cifras son de ejemplo. El recorrido corre completo y
// escribe todo en el registro: lo que se pidió, lo que se preguntó, lo que respondió la
// contraparte, lo que se rechazó, lo que se formuló, lo que se pagó (simulado), lo que se
// verificó y lo que quedó sin cubrir.
//
// Al final corre también la doble formulación, porque idempotencia sin que se vea en el
// recorrido es una afirmación de manual, no una propiedad.

const fs = require('node:fs');
const path = require('node:path');
const { crearAgencia } = require('./agencia.js');
const { reciboDeRespuesta } = require('./conversacion.js');
const { auditarCadena } = require('./registro.js');

const ENCARGO_DEL_RECORRIDO = {
  id: 'enc-corcheta-001',
  de: 'proyecto-corcheta',
  pide: 'presupuesto para una campana de lanzamiento de tres piezas',
};

const PIEZAS_DEL_RECORRIDO = [
  { nombre: 'concepto', cantidad: 1 },
  { nombre: 'produccion', cantidad: 1 },
];

const MANDO_DEL_RECORRIDO = {
  persona: 'persona-que-otorga',
  activo: 'USD',
  maxAmount: '80000',
  destino: 'billetera-de-ejemplo',
  pausers: ['persona-que-otorga'],
};

const PREGUNTAS = [
  { a: 'proyecto-corcheta', texto: 'que piezas necesita y cuantas' },
  { a: 'proyecto-corcheta', texto: 'para cuando las necesita y con que destino de cobro' },
];

// Un tercero que se cuela en la conversacion. Se registra y se rechaza: el recorrido tiene que
// poder mostrar que algo se rechazo, o el registro no demuestra nada.
const TERCERO = {
  de: 'observador-externo',
  piezas: [{ nombre: 'campana', cantidad: 3 }],
};

async function ejecutarRecorrido({ registro: ruta, raiz } = {}) {
  const donde = ruta || path.join(__dirname, '..', 'datos', 'registro.jsonl');
  const agencia = crearAgencia({ registro: donde, raiz });

  const conversacion = agencia.abrirConversacion(ENCARGO_DEL_RECORRIDO, { mandato: MANDO_DEL_RECORRIDO });

  // La contraparte confirma que leyo el encargo. Sin esto, no hay conversacion.
  conversacion.confirmarLectura({ de: ENCARGO_DEL_RECORRIDO.de });

  for (const pregunta of PREGUNTAS) conversacion.preguntar(pregunta);

  // El tercero habla primero, con su propio recibo bien hecho. No cambia nada.
  const delTercero = { de: TERCERO.de, alcance: ENCARGO_DEL_RECORRIDO.id, piezas: TERCERO.piezas, recibo: null };
  delTercero.recibo = reciboDeRespuesta(delTercero);
  conversacion.responder(delTercero);

  // Ahora la contraparte, con su recibo y dentro de su alcance.
  const respuesta = {
    de: ENCARGO_DEL_RECORRIDO.de,
    alcance: ENCARGO_DEL_RECORRIDO.id,
    piezas: PIEZAS_DEL_RECORRIDO,
    recibo: null,
  };
  respuesta.recibo = reciboDeRespuesta(respuesta);
  conversacion.responder(respuesta);

  const cierre = await conversacion.cerrar();

  // La doble formulacion, a la vista: el mismo encargo no produce un segundo precio.
  const repetido = await conversacion.cerrar();

  const cadena = auditarCadena(donde);
  const entradas = agencia.registro.leer();

  return {
    ruta: donde,
    agencia,
    conversacion,
    cierre,
    repetido,
    cadena,
    entradas,
    nucleo: agencia.nucleoDeclarado,
    pasos: resumen(entradas),
  };
}

function resumen(entradas) {
  return entradas.map((e) => `${String(e.n).padStart(2, ' ')}. ${e.tipo}`);
}

module.exports = {
  ejecutarRecorrido,
  ENCARGO_DEL_RECORRIDO,
  PIEZAS_DEL_RECORRIDO,
  MANDO_DEL_RECORRIDO,
  PREGUNTAS,
};
