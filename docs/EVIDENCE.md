# Evidence and current test status

## Evidence available to a reader

The project material includes a captured terminal walkthrough and JSONL records, a test run captured on 2026-10-09 (`docs/suite-2026-10-09.txt`), which supersedes the 2026-10-03 capture that was red, and a RED log dated 2026-09-29 that predates the implementation. The walkthrough uses fictional entities and synthetic values. It is not a record of a real client, payment, Stellar transaction or external service.

The public repository does not include source code, so the suite cannot be rerun from this repository alone. The test names and outcomes below are reproduced from the supplied test record; they are not a fresh run performed while editing this documentation. Four entries appear as `<anonymous>` in the capture; their passing outcome is counted in the summary.

## Current suite: 45 pass

The supplied `docs/suite-2026-10-09.txt` reports 45 tests, pass 45, fail 0, with none skipped or cancelled. It was run as `node --test test/*.test.js` in a clean clone with empty HOME and no network, on Node v24.15.0, against Vespi 0.1.5 (commit `ed559e8`) vendored in `vendor/vespi-kernel` and verified against its SOURCE.md. The 2026-10-03 capture was red because the project was pinned to the old 0.1.3 cut (`54c20c7`); that re-pin is done. Every row below passed in the 2026-10-09 capture.

| Evidence area | Test names in the supplied run | What they check |
|---|---|---|
| Full route and receipt | `el recorrido completo llega a la propuesta y la propuesta verifica`; `el total sale de las piezas de la respuesta, con precios de ejemplo`; `el recibo declara que cubrio y que no, y lo que no cubre incluye el anclaje externo`; `la cadena del registro se puede auditar y esta entera`; `los precios del recorrido son de ejemplo y el recargo de la contraparte no se inventa solo`; `el total sale de la tabla de precios, no del camino que se tomo`; `la huella de la propuesta no depende de la hora: dos corridas dan la misma`; `cambiar una cantidad cambia la huella: no es la misma propuesta`; `otro encargo es otra propuesta, y si se agrega a su propio registro` | The route reaches a proposal, totals come from the accepted price table, the receipt reports coverage and exclusions, and the local chain can be audited. |
| Conversation and counterparty | `un encargo sin conversacion abierta vuelve bloqueado, con su salida y sin presupuesto`; `el bloqueo lo sello el nucleo y su digest verifica`; `el bloqueo nombra a la persona que puede resolverlo, no a un agente`; `una conversacion abierta que la contraparte nunca leyó tampoco alcanza`; `el registro deja escrito que se pidio y por que no se formulo`; `la cadena del registro aguanta el bloqueo entero`; `un proyecto que no contrato el encargo no puede responderlo`; `la contraparte correcta tampoco puede responder un encargo que no es el suyo`; `el rechazo queda escrito, y un tercero lo lee sin Queen`; `con la respuesta ajena rechazada, la conversacion no cierra y nada se formula`; `la misma respuesta, ahora con recibo y de la contraparte, si pasa` | A request needs an opened and read conversation; the wrong project or nearby observer cannot answer for the commissioning project, and blocks name their resolver. |
| Receipt validity | `una respuesta sin recibo no es respuesta, por buena que sea`; `un recibo editado despues de escrito no verifica, y la respuesta se cae`; `una respuesta con el recibo que no es suyo no avanza la conversacion`; `un tercero que habla en la conversacion queda como tercero, y no como contraparte`; `el total sale de la respuesta aceptada, y el dato del tercero no se colo` | A missing, changed or mismatched receipt cannot advance the conversation, and third-party data does not leak into the total. |
| Ceiling and payment gate | `un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero`; `el bloqueo del techo no lo levanta ni la contraparte que lo aprueba`; `el bloqueo nombra el numero que falta, no solo que falto`; `el bloqueo del techo lo sello el nucleo, con su digest`; `bajo el techo, la formula pasa y el pago se pide una sola vez por su monto`; `la puerta muestra el costo antes de pagarlo`; `un techo vencido no revive solo` | An over-ceiling amount blocks before payment, client approval cannot enlarge the mandate, blocks name the missing number, and the cost appears at the gate. |
| Simulated settlement and verification | `el pago quedo declarado como simulado en el propio recibo, no solo en el informe`; `el anclaje queda en pending: no hay hash que buscar en ningun explorador`; `quien verifica no es quien ejecuta` | The receipt labels settlement simulated, leaves the external anchor pending and separates executor from verifier. |
| Idempotence and continuity | `la doble formulacion se ve en el recorrido: el mismo encargo no dio dos precios`; `cerrar dos veces la misma conversacion devuelve el mismo recibo, no dos`; `formular dos veces paga una sola vez`; `el registro guarda una sola linea de propuesta, aunque se cierre tres veces`; `una tercera parte puede reponer el recorrido con solo los recibos`; `un tercero lee el recorrido entero sin Queen, y ve lo que se rechazo` | Repeating formulation or closing does not create another receipt, proposal line or payment, and another reader can inspect or resume the route. |
| Kernel digest pins | Four passing entries logged as `<anonymous>` in `docs/suite-2026-10-09.txt` | The vendored Vespi 0.1.5 copy (commit `ed559e8`) verifies against its SOURCE.md (per-module digest and commit). |

### Why the earlier capture was red

On 2026-10-03 the loaded `continuity.js` digest no longer matched Queen's pin, Queen's digest differed from the kit's declaration, and the installed `opencode` copy was not the pinned file. Those three checks correctly reported the drift from the old cut. The project has since re-pinned to Vespi 0.1.5, and the 2026-10-09 capture shows every check passing.

## What the adversarial phase found

The phase record says five adversarial RED cases and one control were written and observed before implementation. The test cases were designed to go red if Queen could formulate without an opened conversation, accept the wrong counterparty, exceed the person's ceiling, create duplicate results on repetition, or treat an absent or changed receipt as an answer. The control described the valid route from an opened and read conversation to a receipted, in-ceiling proposal.

The supplied RED log captures an early run of 39 tests with 4 passing and 35 red. The conversation and proposal behavior was still unimplemented then. This is evidence that the route was specified as red before implementation, not proof that all later code is correct. The 2026-10-09 capture supersedes the 2026-10-03 result with all checks passing.

## The recorded walkthrough

The screen capture follows `proyecto-corcheta` from request to receipt. It reports a 70,000 USD proposal under an 80,000 USD example mandate; an observer is rejected; the payment request is labeled simulated; the verifier reports four checks okay and three not covered; the receipt is `verified`; the anchor remains `pending (stellar:testnet)`; and the JSONL chain is reported intact at 13 lines. Repeating formulation returns the same receipt and leaves one proposal line and one simulated payment request.

The `verified` label applies to the receipt checks the verifier recalculated against the local evidence. The same receipt lists live settlement, a public on-chain transaction hash, payment to a real third party and an external anchor as not covered. No actual payment or Stellar testnet transaction is claimed.

## How to review when source opens

When source is available under the review-only license, run `npm test` from the project directory and compare the outcomes with the captured test names above. The suite must report the same count (45 tests, 45 pass, none skipped), with `docs/suite-2026-10-09.txt` as the reference.

<a id="espanol"></a>

# Evidencia y estado actual de las pruebas

## Evidencia disponible para quien lee

El material del proyecto incluye una pantalla de terminal y registros JSONL capturados, una ejecución de pruebas capturada el 2026-10-09 (`docs/suite-2026-10-09.txt`), que sustituye a la captura del 2026-10-03 que estaba en rojo, y un registro RED del 2026-09-29 anterior a la implementación. El recorrido usa entidades ficticias y valores sintéticos. No es un registro de un cliente, pago, transacción de Stellar o servicio externo real.

El repositorio público no incluye el código fuente, así que no se puede volver a ejecutar la suite desde este repositorio. Los nombres y resultados de las pruebas que siguen se transcriben del registro suministrado; no son una ejecución nueva hecha mientras se editaba esta documentación. Cuatro entradas aparecen como `<anonymous>` en la captura; su resultado aprobado está contado en el resumen.

## Suite actual: 45 aprobadas

El archivo `docs/suite-2026-10-09.txt` informa 45 pruebas, 45 aprobadas, 0 fallan, 0 omitidas y ninguna cancelada. Se corrió con `node --test test/*.test.js` en un clon limpio con HOME vacío y sin red, en Node v24.15.0, contra Vespi 0.1.5 (commit `ed559e8`) copiado en `vendor/vespi-kernel` y verificado contra su SOURCE.md. La captura del 2026-10-03 estaba en rojo porque el proyecto apuntaba al corte viejo 0.1.3 (`54c20c7`); esa nueva fijación ya está hecha. Cada fila de abajo pasó en la captura del 2026-10-09.

| Área de evidencia | Nombres de prueba en la ejecución suministrada | Qué comprueban |
|---|---|---|
| Recorrido completo y recibo | `el recorrido completo llega a la propuesta y la propuesta verifica`; `el total sale de las piezas de la respuesta, con precios de ejemplo`; `el recibo declara que cubrio y que no, y lo que no cubre incluye el anclaje externo`; `la cadena del registro se puede auditar y esta entera`; `los precios del recorrido son de ejemplo y el recargo de la contraparte no se inventa solo`; `el total sale de la tabla de precios, no del camino que se tomo`; `la huella de la propuesta no depende de la hora: dos corridas dan la misma`; `cambiar una cantidad cambia la huella: no es la misma propuesta`; `otro encargo es otra propuesta, y si se agrega a su propio registro` | El recorrido llega a una propuesta, los totales salen de la tabla de precios aceptada, el recibo declara cobertura y exclusiones, y se puede auditar la cadena local. |
| Conversación y contraparte | `un encargo sin conversacion abierta vuelve bloqueado, con su salida y sin presupuesto`; `el bloqueo lo sello el nucleo y su digest verifica`; `el bloqueo nombra a la persona que puede resolverlo, no a un agente`; `una conversacion abierta que la contraparte nunca leyó tampoco alcanza`; `el registro deja escrito que se pidio y por que no se formulo`; `la cadena del registro aguanta el bloqueo entero`; `un proyecto que no contrato el encargo no puede responderlo`; `la contraparte correcta tampoco puede responder un encargo que no es el suyo`; `el rechazo queda escrito, y un tercero lo lee sin Queen`; `con la respuesta ajena rechazada, la conversacion no cierra y nada se formula`; `la misma respuesta, ahora con recibo y de la contraparte, si pasa` | El encargo requiere una conversación abierta y leída; el proyecto incorrecto o un observador cercano no puede responder por el proyecto contratante, y los bloqueos nombran a quien los resuelve. |
| Validez del recibo | `una respuesta sin recibo no es respuesta, por buena que sea`; `un recibo editado despues de escrito no verifica, y la respuesta se cae`; `una respuesta con el recibo que no es suyo no avanza la conversacion`; `un tercero que habla en la conversacion queda como tercero, y no como contraparte`; `el total sale de la respuesta aceptada, y el dato del tercero no se colo` | Un recibo ausente, cambiado o que no corresponde no puede hacer avanzar la conversación, y el dato de un tercero no se filtra al total. |
| Techo y compuerta de pago | `un presupuesto sobre el techo vuelve bloqueado y nunca pide el dinero`; `el bloqueo del techo no lo levanta ni la contraparte que lo aprueba`; `el bloqueo nombra el numero que falta, no solo que falto`; `el bloqueo del techo lo sello el nucleo, con su digest`; `bajo el techo, la formula pasa y el pago se pide una sola vez por su monto`; `la puerta muestra el costo antes de pagarlo`; `un techo vencido no revive solo` | Un monto sobre el techo se bloquea antes del pago, el cliente no puede ampliar el mandato, los bloqueos nombran el número que falta y el costo se muestra en la compuerta. |
| Liquidación simulada y verificación | `el pago quedo declarado como simulado en el propio recibo, no solo en el informe`; `el anclaje queda en pending: no hay hash que buscar en ningun explorador`; `quien verifica no es quien ejecuta` | El recibo etiqueta la liquidación como simulada, deja el anclaje externo en pending y separa a quien ejecuta de quien verifica. |
| Idempotencia y continuidad | `la doble formulacion se ve en el recorrido: el mismo encargo no dio dos precios`; `cerrar dos veces la misma conversacion devuelve el mismo recibo, no dos`; `formular dos veces paga una sola vez`; `el registro guarda una sola linea de propuesta, aunque se cierre tres veces`; `una tercera parte puede reponer el recorrido con solo los recibos`; `un tercero lee el recorrido entero sin Queen, y ve lo que se rechazo` | Repetir la formulación o el cierre no crea otro recibo, línea de propuesta o pago, y otra persona puede revisar o reponer el recorrido. |
| Fijaciones por digest del kernel | Cuatro entradas aprobadas registradas como `<anonymous>` en `docs/suite-2026-10-09.txt` | La copia vendorizada de Vespi 0.1.5 (commit `ed559e8`) verifica contra su SOURCE.md (digest por módulo y commit). |

### Por qué la captura anterior estaba en rojo

El 2026-10-03 el digest de `continuity.js` cargado ya no coincidía con la fijación de Queen, el digest de Queen difería de la declaración del kit y la copia instalada en `opencode` no era el archivo fijado. Esas tres comprobaciones informaron correctamente la deriva respecto del corte viejo. El proyecto fijó después Vespi 0.1.5, y la captura del 2026-10-09 muestra todas las comprobaciones aprobadas.

## Qué encontró la fase adversarial

El registro de fases dice que cinco casos adversariales RED y un control se escribieron y observaron antes de la implementación. Los casos se diseñaron para quedar en rojo si Queen formulaba sin conversación abierta, aceptaba a la contraparte incorrecta, superaba el techo de la persona, duplicaba resultados al repetir o trataba un recibo ausente o cambiado como respuesta. El control describía el recorrido válido desde una conversación abierta y leída hasta una propuesta bajo techo con recibo.

El registro RED suministrado captura una ejecución temprana de 39 pruebas, con 4 aprobadas y 35 en rojo. El comportamiento de conversación y propuesta todavía no estaba implementado. Esto prueba que el recorrido se especificó en rojo antes de implementarlo, no que todo el código posterior sea correcto. La captura del 2026-10-09 sustituye el resultado del 2026-10-03 con todas las comprobaciones aprobadas.

## El recorrido registrado

La pantalla capturada sigue a `proyecto-corcheta` desde el encargo hasta el recibo. Informa una propuesta de 70.000 USD bajo un mandato de ejemplo de 80.000 USD; rechaza a un observador; etiqueta como simulada la solicitud de pago; el verificador informa cuatro comprobaciones correctas y tres no cubiertas; el recibo queda `verified`; el anclaje permanece `pending (stellar:testnet)`; y la cadena JSONL aparece íntegra con 13 líneas. Al repetir la formulación, devuelve el mismo recibo y deja una sola línea de propuesta y una sola solicitud de pago simulado.

La etiqueta `verified` se aplica a las comprobaciones del recibo que el verificador recalculó contra la evidencia local. El mismo recibo enumera como no cubiertos la liquidación en vivo, un hash público en cadena, el pago a un tercero real y el anclaje externo. No se afirma que haya ocurrido un pago ni una transacción en Stellar testnet.

## Cómo revisar cuando se abra el código

Cuando el código esté disponible bajo la licencia de solo revisión, ejecuta `npm test` desde el directorio del proyecto y compara los resultados con los nombres de prueba anteriores. La suite debe informar el mismo conteo (45 pruebas, 45 aprobadas, ninguna omitida), con `docs/suite-2026-10-09.txt` como referencia.
