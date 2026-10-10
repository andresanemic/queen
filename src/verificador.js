'use strict';

// El verificador: tercera parte, y no la misma que ejecuta.
//
// El núcleo le pasa a `verify` **solo la evidencia**. Nunca el objeto que produjo el efecto,
// nunca el informe del ejecutor, nunca la respuesta de la contraparte. Por eso no hay forma de
// que aquí salga "confio en el ejecutor": lo que hay es evidencia, y con la evidencia se
// comprueba una cosa por una.
//
// El veredicto es honesto por construcción: cada comprobación es una afirmación sobre lo que se
// pudo verificar. Las que no se pudieron van en `false`, y el núcleo las manda a `notCovered` —
// junto con el anclaje externo— sin que nadie tenga que editarlas a mano. Por eso el recibo del
// recorrido puede salir `verified` y llevar al mismo tiempo `x402 settlement on a live network`
// entre lo no cubierto: son dos afirmaciones sobre cosas distintas.

const NOMBRE = 'verificador-externo';

function verificarPago(evidence, { monto, destino, techo, contraparte, encargoId }) {
  const es = (clave) => Boolean(evidence && evidence[clave] !== undefined && evidence[clave] !== null);

  const montoDeclarado = es('amount') ? String(evidence.amount) : null;
  const dentroDelTecho = montoDeclarado !== null && Number(montoDeclarado) <= Number(techo);
  const alDestinoCorrecto = es('payer') && evidence.payer === destino;
  const declaradoSimulado = evidence && evidence.code === 'SIMULADO' && evidence.network === 'simulado:sin-red';

  const checks = {
    'el gasto declarado cabe en el techo del mandato': dentroDelTecho,
    'el efecto quedo en el destino que declara el mandato': alDestinoCorrecto,
    'quien pago es la contraparte del encargo': isCuadra(evidence, contraparte, encargoId),
    'el pago se declaro simulado y no como pago real': declaradoSimulado,
    // Estas tres no se pueden comprobar aca, y no se dan por buenas.
    'x402 settlement on a live network': false,
    'tx hash on-chain in a public explorer': false,
    'pago real a un tercero real': false,
  };

  const verificado = checks['el gasto declarado cabe en el techo del mandato']
    && checks['el efecto quedo en el destino que declara el mandato']
    && checks['quien pago es la contraparte del encargo']
    && checks['el pago se declaro simulado y no como pago real'];

  return {
    verified: verificado,
    checks,
    reason: verificado
      ? 'lo que se pudo verificar se verifico: el gasto cabe en el mandato, quedo en el destino declarado y quedo marcado como simulado. El asentamiento en red no existe y no se da por comprobado'
      : 'la evidencia no alcanza para dar el pago por verificado',
  };
}

// Que el pago venga de la contraparte del encargo. La evidencia no tiene un campo "de": lo
// lleva en `operationId`, que la capacidad compone con el encargo y la contraparte. Se
// comprueba contra la evidencia, no contra lo que la capacidad declarada.
function isCuadra(evidence, contraparte, encargoId) {
  if (!evidence || typeof evidence.operationId !== 'string') return false;
  return evidence.operationId.indexOf(String(encargoId)) !== -1 && evidence.operationId.indexOf(String(contraparte)) !== -1;
}

module.exports = { verificarPago, NOMBRE };
