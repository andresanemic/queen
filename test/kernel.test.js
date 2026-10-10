'use strict';

// El corte del núcleo, verificado por bytes.
//
// Queen consume la copia vendorizada en `vendor/vespi-kernel`: la que viaja con el proyecto y
// la que corre en cualquier clon. Esa copia tiene un encabezado de procedencia de tres líneas
// y, debajo, los bytes exactos del commit fijado. Estos digest son los que su `SOURCE.md`
// declara; si el corte se mueve, esta prueba falla en vez de dejar que el proyecto siga
// corriendo contra un núcleo que nadie revisó.
//
// Y no basta con afirmar el corte: la prueba compara, módulo por módulo, lo que la copia
// vendorizada **tiene** contra lo que su `SOURCE.md` **declara**, y el commit que cada
// encabezado nombra. El proyecto afirma una cosa y la copia puede tener otra; eso se mide,
// no se supone.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const RAIZ = path.join(__dirname, '..');
const KERNEL = path.join(RAIZ, 'vendor', 'vespi-kernel');

const MODULOS = ['authority.js', 'continuity.js', 'delegation.js', 'operation.js', 'receipt.js'];

// El commit del corte, el que la cabecera de cada módulo nombra y el que `SOURCE.md` declara.
// La cabecera lleva la forma corta de git, siete caracteres: `ed559e8` es el prefijo de
// `ed559e83c976dd6e6a379a5510db776206f670b4`, el commit que `SOURCE.md` fija.
const COMMIT = 'ed559e8';
const COMMIT_COMPLETO = 'ed559e83c976dd6e6a379a5510db776206f670b4';

// El corte fijado, leído de la tabla que la propia copia declara. Si la copia movió el corte,
// esta constante queda vieja a propósito y la segunda prueba lo dice con nombre.
const ESPERADOS = {
  'authority.js': 'fcf7952489d6f9c42616b52f54832524926d2f2ba6c0ea6514480a7bdc7a265e',
  'continuity.js': 'abbee9cab8c92b2c4680dba2d573bf8eb6a50ab63194e4a0b0b525af5f044e6c',
  'delegation.js': '357d8b9398ac2b2c3508565e6c2293cc6abff3801f09a60f985dc1c781e002a3',
  'operation.js': '9a95815fc10435cb55415da1531e1545168eaf209518630b83f24b10f0e78d48',
  'receipt.js': 'd006eff3538b2c701366ba09d1e41a32d267b2bad44177f0095541ce9b2a644d',
};

function cuerpoDelModulo(archivo) {
  const crudo = fs.readFileSync(path.join(KERNEL, archivo));
  // Se salta exactamente tres líneas: el encabezado de procedencia.
  const fin = crudo.indexOf(10, crudo.indexOf(10, crudo.indexOf(10) + 1) + 1);
  assert.ok(fin > 0, `${archivo}: no tiene encabezado de procedencia de tres líneas`);
  return crudo.slice(fin + 1);
}

test('', async () => {
  for (const [archivo, esperado] of Object.entries(ESPERADOS)) {
    const real = createHash('sha256').update(cuerpoDelModulo(archivo)).digest('hex');
    assert.equal(real, esperado, `${archivo}: el núcleo se movió; repíntalo a mano y vuelve a correr la suite`);
  }
});

test('', async () => {
  const fuente = fs.readFileSync(path.join(KERNEL, 'SOURCE.md'), 'utf8');
  assert.ok(fuente.includes(`commit \`${COMMIT_COMPLETO}\``), `SOURCE.md ya no fija el commit ${COMMIT_COMPLETO}`);

  for (const [archivo, esperado] of Object.entries(ESPERADOS)) {
    const fila = fuente.split('\n').find((linea) => linea.startsWith(`| \`${archivo}\``));
    assert.ok(fila, `${archivo}: el SOURCE.md de la copia ya no declara este módulo`);
    const declarado = fila.match(/\|\s*`?([0-9a-f]{64})`?\s*\|/);
    assert.ok(declarado, `${archivo}: la fila no trae un digest legible`);
    assert.equal(declarado[1], esperado, `${archivo}: Queen y la copia declaran digest distintos; el corte se movió`);
  }
});

test('', async () => {
  const commits = new Set();
  for (const archivo of MODULOS) {
    const lineas = fs.readFileSync(path.join(KERNEL, archivo), 'utf8').split('\n').slice(0, 3).join(' ');
    const encontrado = lineas.match(/commit ([0-9a-f]{7,40})/);
    assert.ok(encontrado, `${archivo}: el encabezado no declara un commit`);
    commits.add(encontrado[1].slice(0, 7));
  }
  assert.equal(commits.size, 1, `los cinco módulos no apuntan al mismo commit: ${[...commits].join(', ')}`);
  assert.equal([...commits][0], COMMIT, `el encabezado declaró ${[...commits][0]} y el corte fijado es ${COMMIT}`);
});

// La copia que corre, contra su propia declaración. Antes esta prueba medía las copias
// instaladas en cada host (`~/.claude`, `~/.codex`, `~/.config`): una suite que depende de lo
// que haya instalado en la máquina no se puede correr en un clon limpio, y una copia ausente
// la dejaba roja sin que el proyecto hubiera cambiado. Ahora mide lo que el proyecto realmente
// consume: cada `.js` de `vendor/vespi-kernel` contra el digest y el commit que `SOURCE.md`
// declara para él. Lo instalado en un host queda fuera del contrato de este proyecto.
test('', async () => {
  const fuente = fs.readFileSync(path.join(KERNEL, 'SOURCE.md'), 'utf8');

  // Lo que la tabla declara, módulo por módulo.
  const declarados = new Map();
  for (const fila of fuente.split('\n')) {
    const encontrada = fila.match(/^\|\s*`([a-z0-9-]+\.js)`\s*\|\s*`?([0-9a-f]{64})`?\s*\|\s*(\d+)\s*\|/);
    if (encontrada) declarados.set(encontrada[1], { digest: encontrada[2], bytes: Number(encontrada[3]) });
  }
  assert.ok(declarados.size > 0, 'SOURCE.md no declaró ningún módulo');

  // Lo que la copia tiene. Un .js sin fila es un módulo que nadie fijó.
  const presentes = fs.readdirSync(KERNEL).filter((nombre) => nombre.endsWith('.js'));
  for (const archivo of presentes) {
    assert.ok(declarados.has(archivo), `${archivo}: la copia lo tiene y SOURCE.md no lo declara`);
  }

  for (const [archivo, declarado] of declarados) {
    const ruta = path.join(KERNEL, archivo);
    assert.ok(fs.existsSync(ruta), `${archivo}: SOURCE.md lo declara y la copia no lo tiene`);
    const cuerpo = cuerpoDelModulo(archivo);
    assert.equal(cuerpo.length, declarado.bytes, `${archivo}: ${cuerpo.length} bytes de cuerpo, y SOURCE.md declara ${declarado.bytes}`);
    const real = createHash('sha256').update(cuerpo).digest('hex');
    assert.equal(real, declarado.digest, `${archivo}: el cuerpo no es el corte que SOURCE.md declara`);

    const lineas = fs.readFileSync(ruta, 'utf8').split('\n').slice(0, 3).join(' ');
    const encontrado = lineas.match(/commit ([0-9a-f]{7,40})/);
    assert.ok(encontrado, `${archivo}: el encabezado no declara un commit`);
    assert.equal(encontrado[1].slice(0, 7), COMMIT, `${archivo}: su encabezado apunta a ${encontrado[1].slice(0, 7)} y el corte es ${COMMIT}`);
  }
});
