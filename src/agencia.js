'use strict';

// La agencia: el encargo entra por acá y sale un presupuesto con su recibo, o un bloqueo con
// su salida. No hay tercer camino, y esa es la forma completa del producto.
//
// `atenderEncargo` es la puerta de entrada y es la que responde al primer rojo: un encargo
// llega solo, sin conversación, y no produce precio. Lo primero que se pregunta no es cuánto
// cuesta, es con quién se está hablando.

const fs = require('node:fs');
const path = require('node:path');
const { abrirConversacion, PRECIOS } = require('./conversacion.js');
const registro = require('./registro.js');
const { nucleo, declaracion } = require('./nucleo.js');

const MANDO_POR_DEFECTO = {
  persona: 'persona-que-otorga',
  activo: 'USD',
  maxAmount: '60000',
  destino: 'billetera-de-ejemplo',
  pausers: ['persona-que-otorga'],
};

function crearAgencia({ registro: ruta, raiz } = {}) {
  const donde = ruta || path.join(__dirname, '..', 'datos', 'registro.jsonl');
  const raizProyecto = raiz || path.join(__dirname, '..');

  return {
    registro: {
      escribir: (tipo, datos) => registro.escribir(donde, tipo, datos),
      leer: () => registro.leer(donde),
      auditar: () => registro.auditarCadena(donde),
    },
    ruta: donde,
    nucleo: nucleo,
    nucleoDeclarado: declaracion(),

    abrirConversacion(encargo, { mandato } = {}) {
      const mandatoVigente = { ...MANDO_POR_DEFECTO, ...(mandato || {}) };
      registro.escribir(donde, 'encargo_recibido', {
        de: encargo.de,
        id: encargo.id,
        pide: encargo.pide,
        mandato: { ...mandatoVigente, pausers: undefined },
      });
      return abrirConversacion({ encargo, mandato: mandatoVigente, registro: donde, raiz: raizProyecto });
    },

    // El encargo sin conversacion. Se abre una conversacion vacia, se intenta cerrar, y el
    // nucleo sella el bloqueo. No hay una rama escondida que diga "sin conversacion, sin
    // presupuesto": esa rama es la que se ejecuta.
    async atenderEncargo(encargo, { mandato } = {}) {
      const conversacion = this.abrirConversacion(encargo, { mandato });
      return conversacion.cerrar();
    },
  };
}

module.exports = { crearAgencia, MANDO_POR_DEFECTO, PRECIOS };
