'use strict';

// La pantalla: lo que una persona opera sin saber qué es un kernel.
//
// Queen's producto no es la API: es esto. Alguien corre `node src/cli.js` y ve un encargo, una
// conversación, un presupuesto y un recibo — y al final, una lista de lo que eso NO demuestra,
// que es la parte que hace que lo de arriba se pueda leer.
//
// La última pantalla nunca se salta. No es un aviso: es el resultado.

const fs = require('node:fs');
const path = require('node:path');
const { ejecutarRecorrido, ENCARGO_DEL_RECORRIDO, MANDO_DEL_RECORRIDO } = require('./recorrido.js');
const { crearAgencia, MANDO_POR_DEFECTO } = require('./agencia.js');
const { auditarCadena, leer } = require('./registro.js');
const { nucleo, declaracion } = require('./nucleo.js');

const RAIZ = path.join(__dirname, '..');
const REGISTRO = path.join(RAIZ, 'datos', 'registro.jsonl');

const ANCHO = 78;
const linea = (c = '-') => c.repeat(ANCHO);

function titulo(texto) {
  console.log(`\n${linea('=')}\n  ${texto}\n${linea('=')}`);
}

function seccion(texto) {
  console.log(`\n${linea()}\n${texto}\n${linea()}`);
}

function tabla(filas) {
  for (const fila of filas) console.log(fila);
}

async function pantallaRecorrido() {
  titulo('QUEEN — la agencia que conversa antes de cotizar');
  const pin = declaracion();
  console.log(`Nucleo: commit ${pin.commit}, copia vendorizada en vendor/vespi-kernel — la que corre en cualquier clon.`);
  console.log(`         version del kernel: ${pin.kitEnArbol} | huella verificada contra su SOURCE.md en test/kernel.test.js`);
  console.log(`Registro: ${REGISTRO}`);

  seccion('1. LLEGA EL ENCARGO');
  tabla([
    `  De:      ${ENCARGO_DEL_RECORRIDO.de}`,
    `  Pide:    ${ENCARGO_DEL_RECORRIDO.pide}`,
    `  Mandato: ${MANDO_DEL_RECORRIDO.maxAmount} ${MANDO_DEL_RECORRIDO.activo} de techo,`,
    `           destino ${MANDO_DEL_RECORRIDO.destino}, quien pausa: ${MANDO_DEL_RECORRIDO.pausers.join(', ')}`,
  ]);

  const corrida = await ejecutarRecorrido({ registro: REGISTRO });
  const entradas = corrida.agencia.registro.leer();

  seccion('2. LO QUE PASÓ, PASO A PASO (lo que un tercero lee en el registro)');
  for (const e of entradas) {
    const resumen = resumenDe(e);
    console.log(`  ${String(e.n).padStart(2)}. ${e.tipo.padEnd(22)} ${resumen}`);
  }

  seccion('3. LA PROPUESTA');
  const p = corrida.cierre.propuesta;
  tabla([
    `  Encargo:   ${p.encargo}`,
    `  A:         ${p.contraparte}`,
    `  Piezas:    ${p.piezas.map((x) => `${x.cantidad} x ${x.nombre}`).join(', ')}`,
    `  Total:     ${p.total} ${p.moneda}   (techo del mandato: ${MANDO_DEL_RECORRIDO.maxAmount})`,
    `  Destino:   ${p.destino}`,
    `  Huella:    ${p.digest.slice(0, 32)}...`,
  ]);

  seccion('4. LA PUERTA, ANTES DE PAGAR');
  const puerta = corrida.conversacion.puerta;
  if (puerta) {
    tabla([
      `  Costo:            ${puerta.costo} ${puerta.moneda}`,
      `  Destino:          ${puerta.destino}`,
      `  Lo publico:       ${puerta.publicByDefault ? 'encendido' : 'apagado'}`,
      `  Salida:           ${puerta.exit}`,
      `  Autorizado por:   ${puerta.aprobadaPor}`,
      `  Asentamiento:     SIMULADO (no hay red, no hay hash, no hay explorador)`,
    ]);
  } else {
    console.log('  No se abrio puerta: no se llego a pedir dinero.');
  }

  seccion('5. EL RECIBO');
  const r = corrida.cierre.recibo;
  tabla([
    `  Estado:       ${r.status}`,
    `  Capacidad:    ${r.capability}`,
    `  Firma:        ${r.digest.slice(0, 32)}...`,
    `  Anclaje:      ${r.anchor.status} (${r.anchor.network})`,
    `  Verifico:     ${r.verification.quien || 'el verificador externo'}, sobre la evidencia`,
    `  Cubierto:     ${r.coverage.join(' | ') || '(nada)'}`,
    `  NO cubierto:  ${r.notCovered.join(' | ')}`,
  ]);

  seccion('6. LA MISMA PROPUESTA, OTRA VEZ');
  tabla([
    `  Idempotente:  ${corrida.repetido.idempotente ? 'si' : 'no'}`,
    `  Misma huella: ${corrida.repetido.propuesta.digest === p.digest ? 'si' : 'no'}`,
    `  Pagos:        ${corrida.conversacion.pagosSolicitados} (uno solo, aunque se cerrara dos veces)`,
    `  Lineas de propuesta en el registro: ${entradas.filter((e) => e.tipo === 'propuesta_formulada').length}`,
  ]);

  const cadena = auditarCadena(REGISTRO);
  console.log(`\n  Cadena del registro: ${cadena.ok ? 'entera' : `ROTA en la linea ${cadena.rotaEn}`} (${cadena.lineas} lineas).`);

  pantallaFinal(corrida);
}

function resumenDe(entrada) {
  const d = entrada.datos;
  switch (entrada.tipo) {
    case 'encargo_recibido': return `${d.de}: ${d.pide}`;
    case 'conversacion_abierta': return `con ${d.contraparte}`;
    case 'pregunta': return `a ${d.a}: ${d.texto}`;
    case 'lectura_confirmada': return `lee el encargo`;
    case 'mensaje_de_tercero': return `${d.de}: ${d.nota}`;
    case 'respuesta_aceptada': return `${d.de} firma ${d.reciboDigest.slice(0, 12)}...`;
    case 'respuesta_rechazada': return `${d.de}: ${d.motivo}`;
    case 'propuesta_formulada': return `${d.propuesta.total} ${d.propuesta.moneda}`;
    case 'pago_simulado': return `${d.monto} ${d.moneda} -> ${d.destino} (simulado)`;
    case 'verificacion': return `por ${d.quien}: ${Object.keys(d.comprobaciones).filter((k) => d.comprobaciones[k]).length} ok, ${Object.keys(d.comprobaciones).filter((k) => !d.comprobaciones[k]).length} no`;
    case 'recibo': return `${d.digest.slice(0, 12)}...`;
    case 'cierre': return d.estado;
    case 'bloqueado': return d.salida;
    default: return '';
  }
}

function pantallaFinal(corrida) {
  console.log(`\n${linea('=')}`);
  console.log('  LO QUE ESTO NO DEMUESTRA');
  console.log(linea('='));
  const no = [
    'Que haya pasado un pago. El pago es SIMULADO: la capa de gasto y la puerta son reales,',
    'el asentamiento no existe. No hay red, no hay hash de transaccion, no hay explorador donde',
    'buscarlo, y el anclaje del recibo queda en "pending" a proposito.',
    '',
    'Que x402 haga lo que x402 hace. El texto primario del protocolo NO se leyo en esta tanda:',
    'este proyecto no nombra la norma, no cita su especificacion y no afirma conformidad. Lo que',
    'se demuestra es que el gasto se declara y se recibe dentro de la autoridad.',
    '',
    'Que haya adopcion, certificacion, ni un tercero real. La contraparte es de fantasia, las',
    'cifras son de ejemplo y no hay institucion, proyecto ni persona detras de este recorrido.',
    '',
    'Que la cadena del registro acredite autor. Detecta ediciones locales: cualquiera que pueda',
    'reescribir el archivo puede rehacer la cadena entera. La autenticidad le pertenece a quien',
    'lo guarda y lo entrega, no al registro.',
    '',
    'Que un tercero real quiera contratar esto. No se probo con ninguna persona fuera de esta',
    'corrida, y la vara esa —que alguien sin experiencia se emocione y lo recomiende— sigue en',
    'reposo desde el 2026-09-28.',
  ];
  for (const lineaTexto of no) console.log(`  ${lineaTexto}`);
  console.log(`\n  Lo que SI demuestra: ${corrida.entradas.length} pasos escritos con huella encadenada,`);
  console.log('  un presupuesto que no se formulo sin conversacion, sobre el techo, ni con el sello de');
  console.log('  una contraparte sin alcance, y un recibo que se verifica y que dice lo que no cubrio.');
  console.log(`${linea('=')}\n`);
}

async function pantallaBloqueado() {
  titulo('QUEEN — un encargo sin conversacion abierta');
  const ruta = path.join(RAIZ, 'datos', 'bloqueado.jsonl');
  const agencia = crearAgencia({ registro: ruta });
  console.log(`\n  De:   proyecto-corcheta`);
  console.log(`  Pide: un presupuesto. Y nada mas.\n`);
  const salida = await agencia.atenderEncargo(
    { id: 'enc-sin-conversacion', de: 'proyecto-corcheta', pide: 'un presupuesto' },
    { mandato: MANDO_POR_DEFECTO },
  );
  console.log(`  Estado:    ${salida.estado}`);
  console.log(`  Propuesta: ${salida.propuesta === null ? 'ninguna' : 'hay'}`);
  console.log(`  Recibo:    ${salida.recibo.status}, digest ${salida.recibo.digest.slice(0, 32)}...`);
  console.log(`  Vuelve a:  ${salida.recipientes.join(', ')}`);
  console.log(`\n  Salida: ${salida.salida}\n`);
}

function pantallaRegistro() {
  titulo('QUEEN — el registro, leido sin Queen');
  if (!fs.existsSync(REGISTRO)) {
    console.log('\n  Todavia no hay registro. Corra `node src/cli.js recorrido` primero.\n');
    return;
  }
  const entradas = leer(REGISTRO);
  for (const e of entradas) console.log(`  ${String(e.n).padStart(2)}. [${e.huella.slice(0, 10)}] ${e.tipo.padEnd(22)} ${JSON.stringify(e.datos)}`);
  const cadena = auditarCadena(REGISTRO);
  console.log(`\n  Cadena: ${cadena.ok ? 'entera' : `ROTA en la linea ${cadena.rotaEn} (${cadena.razon})`}, ${cadena.lineas} lineas.\n`);
}

function pantallaNucleo() {
  titulo('QUEEN — de que nucleo salio esto');
  const pin = declaracion();
  console.log(`\n  Commit del corte:      ${pin.commit}`);
  console.log(`  Version en el arbol:   ${pin.kitEnArbol}`);
  console.log(`  Version instalada:     ${pin.kitInstalado}`);
  console.log(`  Etiquetas coinciden:   ${pin.etiquetasCoinciden ? 'si' : 'NO — y los cinco digest si: los bytes son los mismos'}`);
  console.log(`\n  Huella de los modulos (cuerpo, sin el encabezado de procedencia):`);
  for (const [modulo, digest] of Object.entries(pin.modulos)) console.log(`    ${modulo.padEnd(16)} ${digest}`);
  console.log('\n  La misma huella se comprueba, modulo a modulo, contra el SOURCE.md de la copia en');
  console.log('  test/kernel.test.js. Si el corte se mueve, la suite se pone roja y pide repinar.\n');
}

async function main() {
  const comando = process.argv[2] || 'ayuda';
  if (comando === 'recorrido') return pantallaRecorrido();
  if (comando === 'bloqueado') return pantallaBloqueado();
  if (comando === 'registro') return pantallaRegistro();
  if (comando === 'nucleo') return pantallaNucleo();
  titulo('QUEEN');
  console.log(`
  La agencia que conversa con el proyecto que la contrata, a traves de Vespi, para
  formular un presupuesto o una propuesta con su recibo.

    node src/cli.js recorrido    el recorrido entero, y al final lo que no demuestra
    node src/cli.js bloqueado    un encargo sin conversacion: por que no hay precio
    node src/cli.js registro     el registro, leido sin Queen
    node src/cli.js nucleo       de que nucleo sale esto, y su huella

    npm test                     la suite completa
`);
}

main().catch((err) => {
  console.error(`\n  Queen se detuvo: ${err && err.message ? err.message : err}\n`);
  process.exit(1);
});
