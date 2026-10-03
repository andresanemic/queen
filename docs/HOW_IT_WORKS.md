# How Queen works

Queen's unit is a conversation with the project that made the request. The conversation must be opened, read and answered within scope with a verifiable receipt before Queen can formulate a proposal. This is the agreement's governing rule, not a claim that the public repository contains a live service.

## Two grants, two boundaries

The person's mandate authorizes Queen. It sets `maxAmount`, the asset, destination, expiry and the people allowed to pause. The commissioning project's request provides a separate authority: it defines the job and the scope of a reply that can count. Neither grant can stand in for the other. A client reply cannot raise the person's ceiling, and the person's ceiling does not make an unrelated reply valid.

```text
Person's mandate                           Commissioning project's request
maxAmount · asset · destination            job · scope · conversation
          \                                       /
           v                                     v
                 Queen opens and reads
                 the conversation through Vespi
                  asks · checks reply receipt
                   rejects wrong speaker/scope
                              |
                              v
                 proposal within maxAmount
                              |
                              v
                simulated payment request
                              |
                              v
                 receipt + local JSONL record
                              |
                              v
               separate verifier · third reader
```

## Walkthrough, from request to record

The supplied example is synthetic and fictional. `proyecto-corcheta` asks for a launch campaign budget for three pieces. A person grants a sample ceiling of 80,000 USD, a sample destination and a pause authority. The following sequence summarizes the recorded run; the terminal excerpt in the [README](../README.md#what-it-looks-like-in-practice) preserves its observed event labels.

1. **Receive the assignment.** Queen records which project asked and what it requested.
2. **Open and confirm the conversation.** Queen opens a conversation with that project and records that it read the assignment before asking questions.
3. **Ask for missing details.** The captured run asks which pieces and quantities are needed, when they are due and what collection destination applies.
4. **Reject a nearby voice.** `observador-externo` speaks in the conversation, but is not the project that commissioned the job. Its message is recorded as rejected and cannot supply proposal details.
5. **Accept the scoped answer.** The commissioning project answers with a receipt whose digest can be recalculated. A missing, changed or mismatched receipt does not count as an answer.
6. **Formulate under the mandate.** The sample proposal is 70,000 USD against an 80,000 USD ceiling. An over-ceiling amount returns blocked before payment is requested, even if the project approves it.
7. **Show the cost at the gate.** The route shows the amount and destination before the payment request. The x402 payment layer is labeled simulated: spending is checked against authority, but settlement is not performed.
8. **Seal and verify.** Receipts carry a digest, declared `coverage` and `notCovered`. A separate verifier recalculates checks from evidence rather than accepting the executor's report. In the recorded example it reports four checks as okay and three as not covered.
9. **Keep a readable route.** Queen writes events to a local JSONL file. Each line links to the previous line's hash. A third reader can inspect the rejection and reconstruct the route from receipts without Queen.
10. **Repeat without duplicating.** Formulating the same request again returns the same receipt and leaves one proposal line and one simulated payment request in the captured record.

## Actors, rights and boundaries

| Actor | What it may do or establish | What it cannot establish |
|---|---|---|
| Person granting the mandate | Grant a ceiling, asset, destination, expiry and pause authority | A grant does not make the project answer or validate its facts. |
| Commissioning project | Define its request and answer within that request's scope | Its answer cannot increase the person's ceiling or answer for a different project. |
| Queen | Open the conversation, ask, validate scope and receipts, formulate and record | It cannot consent for the person, enlarge a grant or force a blocked action. |
| Verifier | Recalculate declared checks using the evidence | It does not prove real-world truth, identity, payment or external settlement. |
| Third reader | Inspect the presented record and receipts, or resume the documented route from receipts | A hash chain does not prove who created or kept the record. A complete replacement can be rehashed. |

## What happens when a rule fails

An assignment without an opened conversation returns blocked with its reason and a path for the person to resolve it. A counterparty that has not read the conversation is not enough. A different project, a nearby observer or an out-of-scope reply is recorded as rejected. A response without a valid receipt does not advance the conversation. A budget above the human-granted ceiling is blocked before the payment request, and another project's approval cannot lift the ceiling. An expired mandate does not revive by itself.

Delegation narrows authority: a derived scope and budget must be subsets of the parent's. The agreement also states that Queen cannot approve its own gated action on behalf of the person. Where the documented path cannot proceed within the grant, it returns a blocked result rather than manufacturing consent.

## The record and what its integrity means

The JSONL record uses a closed schema, so an undeclared field is rejected. The hash chain lets a reader detect a changed line in the file as presented. It is a local integrity check, not a signature from an outside institution and not durable storage by itself. Someone able to replace the complete file can recompute the chain. The receipt's declared coverage also matters: an external anchor stays in `notCovered` and its status remains `pending`.

## Español

# Cómo funciona Queen

La unidad de Queen es una conversación con el proyecto que hizo el encargo. La conversación debe estar abierta, leída y respondida dentro del alcance con un recibo verificable antes de que Queen pueda formular una propuesta. Esta es la regla que gobierna el acuerdo, no una afirmación de que el repositorio público contenga un servicio en vivo.

## Dos permisos, dos límites

El mandato de la persona autoriza a Queen. Fija `maxAmount`, el activo, el destino, el vencimiento y quién puede pausar. El encargo del proyecto contratante otorga una autoridad distinta: define el trabajo y el alcance de una respuesta que puede contar. Ninguno reemplaza al otro. La respuesta del cliente no puede elevar el techo de la persona, y el techo de la persona no vuelve válida una respuesta ajena.

```text
Mandato de la persona                       Encargo del proyecto contratante
maxAmount · activo · destino                trabajo · alcance · conversación
          \                                       /
           v                                     v
                Queen abre y lee
                la conversación a través de Vespi
                  pregunta · revisa recibo
                   rechaza voz/alcance ajeno
                              |
                              v
                   propuesta bajo maxAmount
                              |
                              v
                   solicitud de pago simulada
                              |
                              v
                 recibo + registro JSONL local
                              |
                              v
               verificador separado · tercer lector
```

## Recorrido, del encargo al registro

El ejemplo suministrado es sintético y ficticio. `proyecto-corcheta` pide un presupuesto para una campaña de lanzamiento de tres piezas. Una persona concede un techo de ejemplo de 80.000 USD, un destino de ejemplo y una autoridad de pausa. La siguiente secuencia resume la corrida registrada; el extracto de terminal del [README](../README.md#como-se-ve-en-la-practica) conserva las etiquetas observadas.

1. **Recibir el encargo.** Queen registra qué proyecto pidió y qué solicitó.
2. **Abrir y confirmar la conversación.** Queen abre una conversación con ese proyecto y registra que leyó el encargo antes de preguntar.
3. **Preguntar por los datos faltantes.** La corrida capturada pregunta qué piezas y cantidades hacen falta, para cuándo y cuál es el destino de cobro.
4. **Rechazar una voz cercana.** `observador-externo` habla en la conversación, pero no es el proyecto contratante. Su mensaje queda rechazado y no puede aportar detalles para la propuesta.
5. **Aceptar la respuesta dentro del alcance.** El proyecto contratante responde con un recibo cuyo digest puede recalcularse. Un recibo ausente, cambiado o que no corresponde no cuenta como respuesta.
6. **Formular dentro del mandato.** La propuesta de ejemplo es de 70.000 USD frente a un techo de 80.000 USD. Si lo supera, vuelve bloqueada antes de solicitar el pago, aunque el proyecto la apruebe.
7. **Mostrar el costo en la compuerta.** El recorrido muestra el monto y el destino antes de la solicitud de pago. La capa x402 se etiqueta como simulada: el gasto se comprueba frente a la autoridad, pero no se liquida.
8. **Sellar y verificar.** Los recibos llevan un digest, `coverage` y `notCovered` declarados. Un verificador separado recalcula las comprobaciones desde la evidencia, en vez de aceptar el informe del ejecutor. En el ejemplo registrado informa cuatro comprobaciones como correctas y tres como no cubiertas.
9. **Conservar un recorrido legible.** Queen escribe eventos en un archivo JSONL local. Cada línea enlaza la huella de la anterior. Una tercera persona puede revisar el rechazo y reponer el recorrido desde los recibos sin Queen.
10. **Repetir sin duplicar.** Volver a formular el mismo encargo devuelve el mismo recibo y deja una sola línea de propuesta y una sola solicitud de pago simulado en el registro capturado.

## Actores, derechos y límites

| Actor | Qué puede hacer o establecer | Qué no puede establecer |
|---|---|---|
| Persona que concede el mandato | Conceder un techo, activo, destino, vencimiento y autoridad de pausa | El permiso no hace que el proyecto responda ni valida sus datos. |
| Proyecto contratante | Definir su encargo y responder dentro de su alcance | Su respuesta no puede elevar el techo de la persona ni responder por otro proyecto. |
| Queen | Abrir la conversación, preguntar, validar alcance y recibos, formular y registrar | No puede consentir por la persona, ampliar un permiso ni forzar una acción bloqueada. |
| Verificador | Recalcular las comprobaciones declaradas usando la evidencia | No prueba verdad, identidad, pago ni liquidación externa. |
| Tercera persona lectora | Revisar el registro y los recibos presentados, o retomar el recorrido documentado desde ellos | La cadena de huellas no prueba quién creó o conservó el registro. Un archivo completo sustituido puede volver a calcularse. |

## Qué pasa cuando se incumple una regla

Un encargo sin conversación abierta vuelve bloqueado con su razón y una salida para que la persona lo resuelva. No basta con que la contraparte no haya leído la conversación. Otro proyecto, una persona observadora cercana o una respuesta fuera de alcance quedan registrados como rechazados. Una respuesta sin recibo válido no hace avanzar la conversación. Un presupuesto que supera el techo concedido por la persona se bloquea antes de solicitar el pago, y la aprobación de otro proyecto no puede levantar el techo. Un mandato vencido no revive por sí solo.

La delegación reduce autoridad: el alcance y presupuesto derivados deben ser subconjuntos de los del permiso padre. El acuerdo también establece que Queen no puede aprobar por la persona su propia acción sujeta a compuerta. Si el recorrido documentado no puede avanzar dentro del permiso, devuelve un bloqueo en vez de inventar consentimiento.

## El registro y qué significa su integridad

El registro JSONL usa un esquema cerrado, así que rechaza campos no declarados. La cadena de huellas permite detectar que una línea cambió en el archivo presentado. Es una comprobación de integridad local, no una firma de una institución externa ni almacenamiento durable por sí sola. Alguien que pueda reemplazar el archivo completo puede recalcular la cadena. También importa la cobertura declarada por el recibo: el anclaje externo permanece en `notCovered` y su estado sigue en `pending`.
