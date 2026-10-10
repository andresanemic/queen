'use strict';

// La puerta por donde entra el núcleo.
//
// Queen no importa el núcleo del árbol de desarrollo del kernel ni de una versión instalada en
// un host: importa la copia **vendorizada** en `vendor/vespi-kernel`, que viaja con el proyecto
// y es la que corre en cualquier clon. `test/kernel.test.js` fija los digest de esa copia y los
// compara, módulo por módulo, contra el `SOURCE.md` que ella misma declara; si el corte se
// mueve, la suite se pone roja con un mensaje que dice que hay que repinar, y eso es el control
// funcionando.
//
// La huella se calcula acá, en cada carga, y se expone: el informe y la pantalla del recorrido
// muestran de qué núcleo sale, no de cuál se recuerda.

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const RAIZ = path.join(__dirname, '..');
const KERNEL = path.join(RAIZ, 'vendor', 'vespi-kernel');

const MODULOS = ['authority.js', 'continuity.js', 'delegation.js', 'operation.js', 'receipt.js'];

function cuerpoDelModulo(ruta) {
  const crudo = fs.readFileSync(ruta);
  const fin = crudo.indexOf(10, crudo.indexOf(10, crudo.indexOf(10) + 1) + 1);
  if (fin <= 0) throw new Error(`sin encabezado de procedencia: ${ruta}`);
  return crudo.slice(fin + 1);
}

function huella() {
  const digests = {};
  for (const modulo of MODULOS) {
    digests[modulo] = createHash('sha256').update(cuerpoDelModulo(path.join(KERNEL, modulo))).digest('hex');
  }
  return digests;
}

function commitDeProcedencia() {
  const encontrados = new Set();
  for (const modulo of MODULOS) {
    const encabezado = fs.readFileSync(path.join(KERNEL, modulo), 'utf8').split('\n').slice(0, 3).join(' ');
    const encontrado = encabezado.match(/commit ([0-9a-f]{7,40})/);
    if (!encontrado) throw new Error(`el encabezado de ${modulo} no declara commit`);
    encontrados.add(encontrado[1].slice(0, 7));
  }
  if (encontrados.size !== 1) throw new Error(`los cinco módulos no apuntan al mismo commit: ${[...encontrados].join(', ')}`);
  return [...encontrados][0];
}

// La versión que dice la copia que corre. Cuando el núcleo se leía de un árbol de kit y de una
// copia instalada, acá se mostraban las dos etiquetas; ahora hay una sola copia y viaja dentro
// del proyecto, así que las dos lecturas caen sobre el mismo `package.json`. Si ese manifiesto
// no declara versión, se toma de la cabecera de su `SOURCE.md`, que es la que nombra el corte.
function versionDelArbol() {
  return leerVersion(path.join(KERNEL, 'package.json'));
}

function versionInstalada() {
  return versionDelArbol();
}

function leerVersion(ruta) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8')).version;
  } catch {
    return null;
  }
}

function versionDeProcedencia() {
  try {
    const fuente = fs.readFileSync(path.join(KERNEL, 'SOURCE.md'), 'utf8');
    const encontrada = fuente.match(/kernel \*\*(\d+\.\d+\.\d+[^\s*]*)\*\*/);
    return encontrada ? encontrada[1] : null;
  } catch {
    return null;
  }
}

if (!fs.existsSync(KERNEL)) {
  throw new Error(`no se encuentra la copia vendorizada del núcleo en ${KERNEL}`);
}

const nucleo = {
  authority: require(path.join(KERNEL, 'authority.js')),
  operation: require(path.join(KERNEL, 'operation.js')),
  receipt: require(path.join(KERNEL, 'receipt.js')),
  delegation: require(path.join(KERNEL, 'delegation.js')),
  continuity: require(path.join(KERNEL, 'continuity.js')),
};

module.exports = {
  KERNEL,
  MODULOS,
  nucleo,
  huella,
  commitDeProcedencia,
  versionDelArbol,
  versionInstalada,
  versionDeProcedencia,
  declaracion: () => {
    const arbol = versionDelArbol() || versionDeProcedencia();
    const instalado = versionInstalada() || versionDeProcedencia();
    return {
      commit: commitDeProcedencia(),
      modulos: huella(),
      kitEnArbol: arbol,
      kitInstalado: instalado,
      etiquetasCoinciden: arbol === instalado,
    };
  },
};
