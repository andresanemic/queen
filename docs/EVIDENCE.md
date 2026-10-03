# Evidence and current test status

## What the evidence is

The project sources include a test run captured on 2026-10-03, a RED log written before the implementation on 2026-09-29, and local example screens and records. The example records use fictional entities and synthetic values. They are not Stellar transactions or real payment evidence.

## Current suite: 42 of 45 pass

The supplied run, rechecked on 2026-10-03, reports 45 tests, 42 passing, 3 failing, and no skipped or cancelled tests. The functional cases pass in this captured run; the three failures are checks that deliberately require the vendored kernel copy to match the pinned digest.

| Evidence group | Names reported by the suite | What the tests cover |
|---|---|---|
| Complete route and receipt | `el recorrido completo llega a la propuesta y la propuesta verifica`; `el recibo declara qué cubrió y qué no, y lo que no cubre incluye el anclaje externo`; `la cadena del registro se puede auditar y está entera` | Reaching a proposal, checking the receipt's declared coverage and checking the local linked record |
| Authority and conversation | `un encargo sin conversación abierta vuelve bloqueado, con su salida y sin presupuesto`; `un proyecto que no contrató el encargo no puede responderlo`; `una respuesta sin recibo no es respuesta, por buena que sea`; `un tercero que habla en la conversación queda como tercero, y no como contraparte` | Requiring an opened conversation, rejecting the wrong project or speaker, and requiring a valid receipt |
| Hard ceiling and payment gate | `un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero`; `el bloqueo del techo no lo levanta ni la contraparte que lo aprueba`; `la puerta muestra el costo antes de pagarlo`; `bajo el techo, la fórmula pasa y el pago se pide una sola vez por su monto` | Blocking an over-ceiling budget, showing the cost first and requesting an in-scope amount once |
| Simulation and verification limits | `el pago quedó declarado como simulado en el propio recibo, no solo en el informe`; `el anclaje queda en pending: no hay hash que buscar en ningún explorador`; `quien verifica no es quien ejecuta` | Disclosing simulated settlement, pending external anchoring and separate verification |
| Idempotence and continuity | `formular dos veces el mismo encargo devuelve el mismo recibo, no dos`; `una tercera parte puede reponer el recorrido con solo los recibos`; `un tercero lee el recorrido entero sin Queen, y ve lo que se rechazó` | Avoiding a duplicate proposal and reading or resuming the recorded route from its receipts |
| Kernel pin checks | Three anonymous failures in `test/kernel.test.js` report: `continuity.js` has moved from the pinned digest; Queen and the kit declare different digests for `continuity.js`; the installed `opencode` copy's `continuity.js` is not the pinned cut | Detecting that the kernel copy loaded today no longer matches Queen's fixed kernel cut |

The five kernel modules were pinned to the vendored copy at source commit `54c20c7` (RC5, `2.4.9-rc.5`). The tests intentionally fail when that copy changes. The nine coded projects were built on 2026-09-29 against that cut, and their records report green results against it. The installed kernel is now 0.1.3; the re-pin is pending. Therefore today's 42/45 result is a truthful current result, not evidence of a fully passing suite against the installed kernel and not a product-readiness claim.

## Adversarial phase before implementation

`FASES.md` says the five adversarial RED cases and one control case were written and observed before implementation. The RED log shows the expected failures for these project-specific cases:

1. `rojo-1-conversacion-abierta.test.js`: a request without an opened conversation must return blocked and produce no budget.
2. `rojo-2-autoridad-de-la-contraparte.test.js`: a different project or nearby third party cannot answer for the commissioned project; a rejection stays visible and cannot be used to formulate.
3. `rojo-3-techo-del-mandato.test.js`: an amount above the human-granted ceiling must block before payment, and another project's approval cannot lift that ceiling.
4. `rojo-4-idempotencia.test.js`: formulating the same assignment again must not create a second proposal, receipt or payment request.
5. `rojo-5-respuesta-sin-recibo.test.js`: an absent or changed receipt must not count as an answer.

The control file, `control-conversacion-completa.test.js`, describes the valid route from a correctly opened conversation and receipted answer to an in-ceiling proposal. The RED log records the expected failures first; the current suite records the outcomes after implementation. These are software behavior checks on synthetic local data, not external validation.

## How to rerun after source opens

When the source opens under the review-only license, run `npm test` in the project directory. Review the three kernel digest failures against the pinned vendored copy and the kit declaration. The re-pin is pending; rerun the full suite after that change, including from a fresh session as the project phase plan specifies. Compare the captured results with the test names above. This repository does not include source today, so readers cannot independently rerun the suite from this repository alone.

No Stellar testnet or mainnet transaction is listed or claimed. The receipt's external anchor is `pending`, and the payment settlement is simulated.

## Español

## Qué evidencia existe

Las fuentes del proyecto incluyen una ejecución de pruebas del 2026-10-03, un registro RED escrito antes de la implementación el 2026-09-29, y pantallas y registros de ejemplo locales. Los registros de ejemplo usan entidades ficticias y valores sintéticos. No son transacciones de Stellar ni evidencia de pagos reales.

## Suite actual: 42 de 45 pasan

La ejecución suministrada, revisada nuevamente el 2026-10-03, informa 45 pruebas, 42 aprobadas, 3 fallidas y ninguna omitida ni cancelada. Los casos funcionales pasan en esta captura; las tres fallas son controles que exigen deliberadamente que la copia vendorizada del kernel coincida con el digest fijado.

| Grupo de evidencia | Nombres informados por la suite | Qué cubren las pruebas |
|---|---|---|
| Recorrido completo y recibo | `el recorrido completo llega a la propuesta y la propuesta verifica`; `el recibo declara qué cubrió y qué no, y lo que no cubre incluye el anclaje externo`; `la cadena del registro se puede auditar y está entera` | Llegar a una propuesta, revisar la cobertura declarada en el recibo y revisar el registro local encadenado |
| Autoridad y conversación | `un encargo sin conversación abierta vuelve bloqueado, con su salida y sin presupuesto`; `un proyecto que no contrató el encargo no puede responderlo`; `una respuesta sin recibo no es respuesta, por buena que sea`; `un tercero que habla en la conversación queda como tercero, y no como contraparte` | Exigir una conversación abierta, rechazar al proyecto o hablante incorrecto y requerir un recibo válido |
| Techo duro y compuerta de pago | `un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero`; `el bloqueo del techo no lo levanta ni la contraparte que lo aprueba`; `la puerta muestra el costo antes de pagarlo`; `bajo el techo, la fórmula pasa y el pago se pide una sola vez por su monto` | Bloquear un presupuesto sobre el techo, mostrar primero el costo y solicitar una sola vez un monto dentro del mandato |
| Límites de simulación y verificación | `el pago quedó declarado como simulado en el propio recibo, no solo en el informe`; `el anclaje queda en pending: no hay hash que buscar en ningún explorador`; `quien verifica no es quien ejecuta` | Informar la liquidación simulada, el anclaje externo pendiente y la verificación separada |
| Idempotencia y continuidad | `formular dos veces el mismo encargo devuelve el mismo recibo, no dos`; `una tercera parte puede reponer el recorrido con solo los recibos`; `un tercero lee el recorrido entero sin Queen, y ve lo que se rechazó` | Evitar una propuesta duplicada y leer o reponer el recorrido registrado desde sus recibos |
| Controles de fijación del kernel | Tres fallas anónimas en `test/kernel.test.js` informan: `continuity.js` se movió respecto del digest fijado; Queen y el kit declaran digests distintos para `continuity.js`; la copia instalada en `opencode` tiene un `continuity.js` distinto del corte fijado | Detectar que la copia del kernel cargada hoy ya no coincide con el corte que Queen fijó |

Los cinco módulos del kernel se fijaron a la copia vendorizada del commit de fuente `54c20c7` (RC5, `2.4.9-rc.5`). Las pruebas fallan deliberadamente cuando cambia esa copia. Los nueve proyectos con código se construyeron el 29 de septiembre de 2026 contra ese corte, y sus registros informan resultados verdes contra él. El kernel instalado hoy es 0.1.3; la nueva fijación está pendiente. Por eso el resultado actual de 42/45 es el resultado real de hoy, no demuestra una suite completamente aprobada contra el kernel instalado ni que el producto esté listo.

## Fase adversarial previa a la implementación

`FASES.md` dice que los cinco casos adversariales RED y un caso de control se escribieron y observaron antes de la implementación. El registro RED muestra las fallas esperadas para estos casos propios del proyecto:

1. `rojo-1-conversacion-abierta.test.js`: un encargo sin conversación abierta debe volver bloqueado y no producir presupuesto.
2. `rojo-2-autoridad-de-la-contraparte.test.js`: otro proyecto o un tercero cercano no puede responder por el proyecto contratante; el rechazo sigue visible y no se puede usar para formular.
3. `rojo-3-techo-del-mandato.test.js`: un monto que supera el techo concedido por la persona debe bloquearse antes del pago, y la aprobación de otro proyecto no puede levantar ese techo.
4. `rojo-4-idempotencia.test.js`: volver a formular el mismo encargo no debe crear otra propuesta, recibo ni solicitud de pago.
5. `rojo-5-respuesta-sin-recibo.test.js`: un recibo ausente o alterado no debe contar como respuesta.

El archivo de control, `control-conversacion-completa.test.js`, describe el recorrido válido desde una conversación abierta correctamente y una respuesta con recibo hasta una propuesta bajo el techo. El registro RED deja las fallas esperadas antes; la suite actual registra los resultados después de la implementación. Son comprobaciones de software con datos sintéticos locales, no validación externa.

## Cómo volver a correrlas cuando se abra el código

Cuando se abra el código bajo la licencia de solo revisión, ejecuta `npm test` en el directorio del proyecto. Revisa las tres fallas de digest del kernel frente a la copia vendorizada fijada y la declaración del kit. La nueva fijación está pendiente; vuelve a ejecutar la suite completa después de ese cambio, también desde una sesión nueva según el plan de fases del proyecto. Compara los resultados con los nombres de prueba anteriores. Este repositorio no incluye el código hoy, así que no es posible repetir la suite solo desde aquí.

No se lista ni afirma ninguna transacción de Stellar testnet o mainnet. El anclaje externo del recibo está en `pending` y la liquidación del pago es simulada.
