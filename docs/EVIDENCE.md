# Evidence and current test status

## Evidence available to a reader

The project material includes a captured terminal walkthrough and JSONL records, a test run captured and rechecked on 2026-10-03, and a RED log dated 2026-09-29 that predates the implementation. The walkthrough uses fictional entities and synthetic values. It is not a record of a real client, payment, Stellar transaction or external service.

The public repository does not include source code, so the suite cannot be rerun from this repository alone. The test names and outcomes below are reproduced from the supplied test record; they are not a fresh run performed while editing this documentation.

## Current suite: 42 of 45 pass

The supplied `suite-hoy.txt` reports 45 tests, 42 passing, 3 failing, with none skipped or cancelled. The functional cases pass in that capture. The three failures are kernel digest checks, which are supposed to detect that the loaded kernel no longer matches the fixed cut.

| Evidence area | Test names in the supplied run | What they check |
|---|---|---|
| Full route and receipt | `el recorrido completo llega a la propuesta y la propuesta verifica`; `el recibo declara que cubrio y que no, y lo que no cubre incluye el anclaje externo`; `la cadena del registro se puede auditar y esta entera` | The route reaches a proposal, the receipt reports coverage and exclusions, and the local chain can be audited. |
| Conversation and counterparty | `un encargo sin conversacion abierta vuelve bloqueado, con su salida y sin presupuesto`; `un proyecto que no contrato el encargo no puede responderlo`; `un tercero que habla en la conversacion queda como tercero, y no como contraparte` | A request needs an opened conversation; the wrong project or nearby observer cannot answer for the commissioning project. |
| Receipt validity | `una respuesta sin recibo no es respuesta, por buena que sea`; `un recibo editado despues de escrito no verifica, y la respuesta se cae`; `una respuesta con el recibo que no es suyo no avanza la conversacion` | A missing, changed or mismatched receipt cannot advance the conversation. |
| Ceiling and payment gate | `un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero`; `el bloqueo del techo no lo levanta ni la contraparte que lo aprueba`; `la puerta muestra el costo antes de pagarlo` | An over-ceiling amount blocks before payment, client approval cannot enlarge the mandate, and the cost appears at the gate. |
| Simulated settlement and verification | `el pago quedo declarado como simulado en el propio recibo, no solo en el informe`; `el anclaje queda en pending: no hay hash que buscar en ningun explorador`; `quien verifica no es quien ejecuta` | The receipt labels settlement simulated, leaves the external anchor pending and separates executor from verifier. |
| Idempotence and continuity | `formular dos veces el mismo encargo devuelve el mismo recibo, no dos`; `una tercera parte puede reponer el recorrido con solo los recibos`; `un tercero lee el recorrido entero sin Queen, y ve lo que se rechazo` | Repeating formulation does not create another receipt or proposal, and another reader can inspect or resume the route. |
| Kernel digest pins | Three failures in `test/kernel.test.js`: the loaded `continuity.js` digest differs from Queen's pin; Queen and the kit declare different digests; the installed `opencode` copy is not the pinned `continuity.js`. | Detects that Queen's vendored kernel and the installed copy have moved away from the fixed cut. |

### Why the result is 42/45

Queen's supplied pin is `ceba712aa3d9300a83382b90dd5ab97bb5809fe1a3f779c99f0984bf6305e73e`. The current loaded `continuity.js` digest in the test failure is `073ecacdf099b0af53e49f3cecf1ba7e9e3ea910a4505ee422034857ac9d8d81`; the kit still declares the former digest. The installed `opencode` copy also has the changed file. Those three checks fail for this pin drift. That is a concrete integrity failure, not an unspecified functional failure. Queen's re-pin is pending, so 42/45 is the honest current result and not a clean suite against the installed kernel.

The nine coded projects' records say they passed against the 2026-09-29 kernel cut `54c20c7` (RC5, installed label `2.4.9-rc.5`). That result describes that recorded cut. The kernel installed today is identified in the supplied project material as `0.1.3`; the old green record does not replace today's failed digest checks.

## What the adversarial phase found

The phase record says five adversarial RED cases and one control were written and observed before implementation. The test cases were designed to fail if Queen could formulate without an opened conversation, accept the wrong counterparty, exceed the person's ceiling, create duplicate results on repetition, or treat an absent or changed receipt as an answer. The control described the valid route from an opened and read conversation to a receipted, in-ceiling proposal.

The supplied RED log captures an early run with 39 tests, 4 passing and 35 failing. The conversation and proposal behavior was still unimplemented then. This is evidence that the route was specified as failing before implementation, not proof that all later code is correct. The current captured suite is separate evidence of the later result, including the three present kernel pin failures.

## The recorded walkthrough

The screen capture follows `proyecto-corcheta` from request to receipt. It reports a 70,000 USD proposal under an 80,000 USD example mandate; an observer is rejected; the payment request is labeled simulated; the verifier reports four checks okay and three not covered; the receipt is `verified`; the anchor remains `pending (stellar:testnet)`; and the JSONL chain is reported intact at 13 lines. Repeating formulation returns the same receipt and leaves one proposal line and one simulated payment request.

The `verified` label applies to the receipt checks the verifier recalculated against the local evidence. The same receipt lists live settlement, a public on-chain transaction hash, payment to a real third party and an external anchor as not covered. No actual payment or Stellar testnet transaction is claimed.

## How to review when source opens

When source is available under the review-only license, run `npm test` from the project directory and compare the outcomes with the captured test names above. Inspect the three kernel digest failures and complete the pending re-pin before describing the suite as passing against the installed kernel. The project phase plan also calls for a fresh-session run after the re-pin. This README does not claim that either has happened.

## Español

# Evidencia y estado actual de las pruebas

## Evidencia disponible para quien lee

El material del proyecto incluye una pantalla de terminal y registros JSONL capturados, una ejecución de pruebas capturada y revisada nuevamente el 2026-10-03, y un registro RED del 2026-09-29 anterior a la implementación. El recorrido usa entidades ficticias y valores sintéticos. No es un registro de un cliente, pago, transacción de Stellar o servicio externo real.

El repositorio público no incluye el código fuente, así que no se puede volver a ejecutar la suite desde este repositorio. Los nombres y resultados de las pruebas que siguen se transcriben del registro suministrado; no son una ejecución nueva hecha mientras se editaba esta documentación.

## Suite actual: pasan 42 de 45

El archivo suministrado `suite-hoy.txt` informa 45 pruebas, 42 aprobadas y 3 fallidas, sin pruebas omitidas ni canceladas. Los casos funcionales pasan en esa captura. Las tres fallas son controles de digest del kernel, diseñados para detectar que el kernel cargado ya no coincide con el corte fijado.

| Área de evidencia | Nombres de prueba en la ejecución suministrada | Qué comprueban |
|---|---|---|
| Recorrido completo y recibo | `el recorrido completo llega a la propuesta y la propuesta verifica`; `el recibo declara que cubrio y que no, y lo que no cubre incluye el anclaje externo`; `la cadena del registro se puede auditar y esta entera` | El recorrido llega a una propuesta, el recibo declara cobertura y exclusiones, y se puede auditar la cadena local. |
| Conversación y contraparte | `un encargo sin conversacion abierta vuelve bloqueado, con su salida y sin presupuesto`; `un proyecto que no contrato el encargo no puede responderlo`; `un tercero que habla en la conversacion queda como tercero, y no como contraparte` | El encargo requiere una conversación abierta; el proyecto incorrecto o un observador cercano no puede responder por el proyecto contratante. |
| Validez del recibo | `una respuesta sin recibo no es respuesta, por buena que sea`; `un recibo editado despues de escrito no verifica, y la respuesta se cae`; `una respuesta con el recibo que no es suyo no avanza la conversacion` | Un recibo ausente, cambiado o que no corresponde no puede hacer avanzar la conversación. |
| Techo y compuerta de pago | `un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero`; `el bloqueo del techo no lo levanta ni la contraparte que lo aprueba`; `la puerta muestra el costo antes de pagarlo` | Un monto sobre el techo se bloquea antes del pago, el cliente no puede ampliar el mandato y el costo se muestra en la compuerta. |
| Liquidación simulada y verificación | `el pago quedo declarado como simulado en el propio recibo, no solo en el informe`; `el anclaje queda en pending: no hay hash que buscar en ningun explorador`; `quien verifica no es quien ejecuta` | El recibo etiqueta la liquidación como simulada, deja pendiente el anclaje externo y separa a quien ejecuta de quien verifica. |
| Idempotencia y continuidad | `formular dos veces el mismo encargo devuelve el mismo recibo, no dos`; `una tercera parte puede reponer el recorrido con solo los recibos`; `un tercero lee el recorrido entero sin Queen, y ve lo que se rechazo` | Repetir la formulación no crea otro recibo o propuesta, y otra persona puede revisar o reponer el recorrido. |
| Fijaciones por digest del kernel | Tres fallas en `test/kernel.test.js`: el digest de `continuity.js` cargado difiere del que fijó Queen; Queen y el kit declaran digests distintos; la copia instalada de `opencode` no es el `continuity.js` fijado. | Detectan que el kernel vendorizado por Queen y la copia instalada cambiaron respecto del corte fijado. |

### Por qué el resultado es 42/45

La fijación suministrada por Queen es `ceba712aa3d9300a83382b90dd5ab97bb5809fe1a3f779c99f0984bf6305e73e`. El digest actual de `continuity.js` que aparece en el fallo de prueba es `073ecacdf099b0af53e49f3cecf1ba7e9e3ea910a4505ee422034857ac9d8d81`; el kit todavía declara el digest anterior. La copia instalada en `opencode` también contiene el archivo cambiado. Esas tres comprobaciones fallan por esa deriva de fijación. Es un fallo de integridad concreto, no un fallo funcional sin explicar. La nueva fijación de Queen está pendiente, así que 42/45 es el resultado actual honesto y no una suite limpia frente al kernel instalado.

Los registros de los nueve proyectos con código dicen que pasaban contra el corte del kernel `54c20c7` del 29 de septiembre de 2026 (RC5, etiqueta instalada `2.4.9-rc.5`). Ese resultado describe aquel corte registrado. El material suministrado identifica el kernel instalado hoy como `0.1.3`; el registro verde anterior no sustituye las fallas actuales de digest.

## Qué encontró la fase adversarial

El registro de fases dice que cinco casos adversariales RED y un control se escribieron y observaron antes de la implementación. Los casos se diseñaron para fallar si Queen formulaba sin conversación abierta, aceptaba a la contraparte incorrecta, superaba el techo de la persona, duplicaba resultados al repetir o trataba un recibo ausente o cambiado como respuesta. El control describía el recorrido válido desde una conversación abierta y leída hasta una propuesta bajo techo con recibo.

El registro RED suministrado captura una ejecución temprana con 39 pruebas, 4 aprobadas y 35 fallidas. El comportamiento de conversación y propuesta todavía no estaba implementado. Esto prueba que el recorrido se especificó como fallido antes de implementarlo, no que todo el código posterior sea correcto. La suite capturada actualmente es evidencia aparte del resultado posterior, incluidas las tres fallas de fijación del kernel.

## El recorrido registrado

La pantalla capturada sigue a `proyecto-corcheta` desde el encargo hasta el recibo. Informa una propuesta de 70.000 USD bajo un mandato de ejemplo de 80.000 USD; rechaza a un observador; etiqueta como simulada la solicitud de pago; el verificador informa cuatro comprobaciones correctas y tres no cubiertas; el recibo queda `verified`; el anclaje permanece `pending (stellar:testnet)`; y la cadena JSONL aparece íntegra con 13 líneas. Al repetir la formulación, devuelve el mismo recibo y deja una sola línea de propuesta y una sola solicitud de pago simulado.

La etiqueta `verified` se aplica a las comprobaciones del recibo que el verificador recalculó contra la evidencia local. El mismo recibo enumera como no cubiertos la liquidación en vivo, un hash público en cadena, el pago a un tercero real y el anclaje externo. No se afirma que haya ocurrido un pago ni una transacción en Stellar testnet.

## Cómo revisar cuando se abra el código

Cuando el código esté disponible bajo la licencia de solo revisión, ejecuta `npm test` desde el directorio del proyecto y compara los resultados con los nombres de prueba anteriores. Revisa las tres fallas de digest del kernel y completa la nueva fijación pendiente antes de describir la suite como aprobada frente al kernel instalado. El plan de fases también pide una ejecución desde una sesión nueva después de fijar el kernel. Este documento no afirma que alguna de esas tareas ya se haya realizado.
