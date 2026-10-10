'use strict';

// El registro que lee un tercero, sin Queen.
//
// Es un JSONL: una entrada por línea, se abre con cualquier editor y se lee sin el proyecto.
// Tres cosas lo hacen confiable y ninguna es cosmetics:
//
//  1. **Esquema cerrado.** Cada tipo declara sus campos. Una entrada con un campo que no está
//     declarado se rechaza. Así un nombre no se puede escribir aunque alguien lo intente, y el
//     registro no crece hacia donde nadie lo revisó.
//  2. **Cadena de huellas.** Cada línea lleva la huella de la anterior. Reescribir una línea
//     vieja rompe la cadena hacia adelante, y `auditarCadena()` lo dice en qué línea.
//  3. **Append-only.** `escribir` solo agrega; no hay función que borre una entrada.
//
// Lo que NO es: no está anclado en ninguna red y no está firmado por nadie. La cadena detecta
// ediciones locales, no a un autor. Eso lo dice el informe, no el archivo.

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const ESQUEMA = {
  encargo_recibido: ['de', 'id', 'pide', 'mandato'],
  conversacion_abierta: ['encargoId', 'contraparte', 'orquestador', 'delegado'],
  lectura_confirmada: ['de'],
  pregunta: ['a', 'texto'],
  mensaje_de_tercero: ['de', 'nota'],
  respuesta_aceptada: ['de', 'alcance', 'piezas', 'reciboDigest'],
  respuesta_rechazada: ['de', 'motivo'],
  propuesta_formulada: ['propuesta', 'idempotente'],
  pago_simulado: ['monto', 'moneda', 'destino', 'simulado'],
  verificacion: ['quien', 'comprobaciones', 'cubierto', 'noCubierto'],
  recibo: ['recibo', 'digest'],
  cierre: ['estado'],
  bloqueado: ['salida', 'detalle', 'recipientes'],
};

function digestDe(entrada) {
  const copia = { ...entrada };
  delete copia.huella;
  delete copia.anterior;
  return createHash('sha256').update(JSON.stringify(copia), 'utf8').digest('hex');
}

function leer(ruta) {
  if (!fs.existsSync(ruta)) return [];
  const crudo = fs.readFileSync(ruta, 'utf8');
  return crudo
    .split('\n')
    .filter((linea) => linea.trim().length > 0)
    .map((linea) => JSON.parse(linea));
}

function ultimaHuella(ruta) {
  const entradas = leer(ruta);
  return entradas.length === 0 ? null : entradas[entradas.length - 1].huella;
}

function escribir(ruta, tipo, datos) {
  const campos = ESQUEMA[tipo];
  if (!campos) throw new Error(`tipo de entrada no declarado: ${tipo}`);
  const extra = Object.keys(datos).filter((clave) => !campos.includes(clave));
  if (extra.length > 0) throw new Error(`la entrada ${tipo} trae campos no declarados: ${extra.join(', ')}`);
  const faltan = campos.filter((clave) => !(clave in datos));
  if (faltan.length > 0) throw new Error(`a la entrada ${tipo} le faltan campos: ${faltan.join(', ')}`);

  const entrada = {
    n: leer(ruta).length + 1,
    tipo,
    datos,
    anterior: ultimaHuella(ruta),
    at: new Date().toISOString(),
  };
  entrada.huella = digestDe(entrada);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.appendFileSync(ruta, `${JSON.stringify(entrada)}\n`, 'utf8');
  return entrada;
}

function auditarCadena(ruta) {
  const entradas = leer(ruta);
  let anterior = null;
  for (const entrada of entradas) {
    const esperada = digestDe(entrada);
    if (entrada.anterior !== anterior) {
      return { ok: false, rotaEn: entrada.n, razon: 'la entrada no apunta a la huella anterior', lineas: entradas.length };
    }
    if (entrada.huella !== esperada) {
      return { ok: false, rotaEn: entrada.n, razon: 'la huella no corresponde al contenido', lineas: entradas.length };
    }
    anterior = entrada.huella;
  }
  return { ok: true, rotaEn: null, razon: null, lineas: entradas.length };
}

module.exports = { ESQUEMA, escribir, leer, auditarCadena, digestDe };
