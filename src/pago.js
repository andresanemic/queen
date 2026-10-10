'use strict';

// La capa de pago: x402, funcionando contra la autoridad y **simulando el asentamiento**.
//
// Qué es REAL acá y qué no, separado antes de escribir una línea, porque separarlo después es
// como se cuela un "pago realizado" en un receipt:
//
//   REAL      — la capacidad declara el gasto; el núcleo decide si la autoridad lo cubre; si no,
//               se abre la puerta y muestra el costo ANTES de pagarlo; el efecto queda en un
//               recibo sellado con digest, cobertura y no cubierto; el verificador externo lo
//               recalcula desde la evidencia.
//   SIMULADO  — el asentamiento. No hay red, no hay nodo, no hay monedero, no hay hash de
//               transacción y no hay explorador. La "evidencia" que devuelve la capacidad es un
//               objeto local con la marca `SIMULADO` escrita dentro, y el anclaje del recibo
//               queda en `pending`.
//   NO VERIFICADO — la especificación de x402. No se leyó el texto primario en esta tanda, así
//               que este proyecto no nombra la norma, no cita la especificación y no afirma
//               conformidad: el kernel 0.1.5 incluye el módulo x402, pero este proyecto solo simula el asentamiento y no afirma conformidad.
//
// La autoridad con la que corre la operación **no se autoinvoca**: `spend` va vacío, así que el
// núcleo no alcanza a cubrir el gasto y abre la puerta. La persona que lo autoriza no es el
// agente, y el núcleo rechaza un `by` igual al id del agente.

const { nucleo } = require('./nucleo.js');
const { escribir } = require('./registro.js');
const { verificarPago, NOMBRE: VERIFICADOR } = require('./verificador.js');

const AGENTE = 'queen-pagador';

function capacidadPagoX402({ monto, destino, activo, contraparte, encargoId }) {
  return {
    id: 'pago-x402-simulado',
    // El gasto se declara. Es lo unico que el kernel necesita para decidir si la autoridad
    // alcanza; el monto vive aqui y no en la propuesta, que es un documento.
    required: () => ({ spend: [{ asset: activo, amount: String(monto), to: destino }] }),
    perform: async () => ({
      ok: true,
      // Todo lo que se puede escribir con las claves que el recibo admite. La marca de
      // simulacion va DENTRO de la evidencia, no en un cartel de la interfaz.
      evidence: {
        status: 'simulado',
        success: true,
        type: 'x402',
        code: 'SIMULADO',
        network: 'simulado:sin-red',
        payer: destino,
        amount: String(monto),
        operationId: `x402-${encargoId}-${contraparte}`,
        ledger: 0,
      },
    }),
  };
}

async function correrPago({ mandato, monto, destino, contraparte, encargoId, persona, registro }) {
  const op = nucleo.operation.createOperation({
    goal: `cobro de ${monto} ${mandato.activo} a ${contraparte} por el encargo ${encargoId}`,
    // Sin grant propio: el agente no se autoriza a si mismo. La puerta es la unica via.
    authority: { spend: [], pausers: mandato.pausers || [] },
    agent: AGENTE,
    exit: `cambia el techo del mandato o cancela el encargo ${encargoId}`,
    action: 'pagar-x402',
  });

  const capacidad = capacidadPagoX402({ monto, destino, activo: mandato.activo, contraparte, encargoId });

  let puerta = null;
  const corrida = await nucleo.operation.runOperation(op, capacidad, {
    // La puerta: el kernel arma el payload con el costo, la salida y que lo publico viene
    // apagado. La persona que autoriza no es el agente.
    ask: (payload) => {
      const costo = Array.isArray(payload.cost) && payload.cost.length > 0 ? Number(payload.cost[0].amount) : null;
      puerta = {
        costo,
        moneda: payload.cost && payload.cost[0] ? payload.cost[0].asset : mandato.activo,
        destino: payload.cost && payload.cost[0] ? payload.cost[0].to : destino,
        requirements: payload.requirements,
        publicByDefault: payload.publicByDefault,
        exit: payload.exit,
        aprobadaPor: persona,
        simulada: true,
      };
      escribir(registro, 'pago_simulado', { monto, moneda: mandato.activo, destino, simulado: true });
      return { approved: true, by: persona };
    },
    // Solo la evidencia. El verificador no ve la capacidad ni la propuesta.
    verify: (evidence) => verificarPago(evidence, { monto, destino, techo: mandato.maxAmount, contraparte, encargoId }),
  });

  const comprobaciones = verificarPago(corrida.receipt ? corrida.receipt.evidence : {}, {
    monto, destino, techo: mandato.maxAmount, contraparte, encargoId,
  });
  escribir(registro, 'verificacion', {
    quien: VERIFICADOR,
    comprobaciones: comprobaciones.checks,
    cubierto: corrida.receipt ? corrida.receipt.coverage : [],
    noCubierto: corrida.receipt ? corrida.receipt.notCovered : [],
  });

  return { puerta, recibo: corrida.receipt, estado: corrida.status, salida: corrida.status };
}

module.exports = { capacidadPagoX402, correrPago, AGENTE };
