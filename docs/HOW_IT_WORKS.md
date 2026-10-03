# How Queen works

## Scope

Queen is the agency scenario used to demonstrate that an agent can converse with a commissioning project and formulate within authority. It is a first-version path, not a finished service. The walkthrough and project record are local and use synthetic example data. The x402 payment layer checks a declared spend against authority and simulates settlement; there is no network payment or Stellar anchor.

## Participants and boundaries

| Actor | What the actor can do | Boundary |
|---|---|---|
| Person granting the mandate | Give Queen a ceiling, asset, destination, expiry and a list of people allowed to pause | The grant cannot be enlarged by Queen; an expired mandate does not revive by itself |
| Commissioning project | Open an assignment and answer questions about it | It is the only project whose answer counts, and only for the assignment and scope it opened |
| Queen | Open the conversation, ask for missing details, check receipts and scope, formulate a proposal, request simulated payment and record the route | Queen cannot approve for the person, exceed the ceiling or turn an out-of-scope answer into an accepted one |
| Separate verifier | Recalculate declared checks from evidence | It is not the executor and does not prove claims beyond the supplied evidence |
| Third reader | Read the local record and receipts without Queen | The reader sees the recorded sequence, not proof of civil identity, authorship, or an external payment |

The authority of the person and the authority of the commissioning project are separate. The person's mandate says how much Queen may spend, in which asset and destination, until when, and who may pause. The project's assignment says what Queen is being asked to do and what scope the answer must cover. One cannot replace the other.

## Walkthrough: a fictional launch campaign

The project's example uses `proyecto-corcheta`, a fictional cooperative from the ecosystem. All names and amounts below are examples, not a real client, project, budget, wallet destination or transaction.

1. **A project makes a request.** `proyecto-corcheta` asks for a budget for a three-piece launch campaign.
2. **A person grants bounded authority.** The example mandate sets a ceiling of 80,000 USD, a destination called `billetera-de-ejemplo`, an expiry and `persona-que-otorga` as the person who may pause.
3. **Queen opens the conversation.** It asks the commissioning project what pieces it needs, how many, when they are needed and the payment destination, then confirms that the project has read the request.
4. **An unrelated voice is rejected.** `observador-externo` speaks in the conversation but is not the commissioning project. Queen records a rejection and does not use that message to formulate.
5. **The proper project answers.** The answer must come from the commissioned project, cover the assignment's scope and carry a receipt whose digest verifies. A message without a verifying receipt does not count as an answer.
6. **Queen formulates from that answer.** The example prices for one concept and one production piece total 70,000 USD. The amount is below the mandate's 80,000 USD ceiling.
7. **The payment gate shows the cost.** The person can see the amount and destination before payment is requested. The x402 layer records the request as simulated; it does not settle a payment.
8. **The route is recorded and checked.** Queen writes the request, conversation, rejection, accepted response, proposal and receipt to a local JSONL record. Each line refers to the prior line's hash. A separate verifier recalculates declared checks from evidence and reports both covered and not-covered items.
9. **A repeat does not create another proposal.** Formulating the same request again returns the same receipt and leaves one proposal line in the record.

## Rules the agreement makes enforceable

- **No open, read conversation, no proposal.** A request without an opened conversation with the project that commissioned it returns blocked, with a reason and a route for the person to resolve it.
- **A message needs a receipt.** Queen recalculates the receipt digest. An absent or altered receipt does not advance the conversation.
- **Only the commissioned project answers.** A different project, a nearby observer, or the right project answering outside the assignment's scope is recorded as rejected.
- **The mandate ceiling is hard.** An amount above the ceiling returns blocked before a payment request. The commissioning project's approval cannot override the person's ceiling.
- **An expired mandate stays expired.** It does not revive without a new grant.
- **A repeated formulation is idempotent.** The second call returns the same receipt and does not add another proposal line or payment request.
- **Delegation cannot grow authority.** A delegated child scope and budget must remain within the parent's scope and budget.
- **Execution and verification are separate.** The verifier recomputes checks from the evidence, and each receipt says what is covered and what is not.
- **Simulated payment is labeled where it happens.** The output and receipt say settlement is simulated and the anchor remains pending.

The log's hash links make edits within the presented file detectable if the chain is checked. They do not prove who authored the file or prevent someone who can replace the entire file from recomputing it.

## What the walkthrough and evidence establish

The recorded example establishes a bounded software path: a conversation is required before formulation; the commissioned project's receipted answer is used; an unrelated speaker is rejected; the example amount is compared with the human-granted ceiling; the payment is labeled simulated; verification is separate from execution; and the same proposal is not added twice. The local record can be read and resumed from its receipts without Queen.

## What they do not establish

The example does not establish a real payment, live x402 settlement, network connection, blockchain write, Stellar testnet anchor, public transaction hash, real identity, adoption, production readiness or legal effect. It does not prove that the synthetic project or prices describe a real market. The project's supplied suite currently has three failures in kernel digest pin checks, so the tests do not show a clean run against the installed kernel. See [Evidence](EVIDENCE.md) and [Legal and limits](LEGAL_AND_LIMITS.md).

## Español

## Alcance

Queen es el escenario de agencia que demuestra que un agente puede conversar con el proyecto contratante y formular dentro de su autoridad. Es un recorrido de primera versión, no un servicio terminado. El recorrido y el registro son locales y usan datos sintéticos de ejemplo. La capa de pago x402 comprueba el gasto declarado frente a la autoridad y simula la liquidación; no hay pago en red ni anclaje en Stellar.

## Participantes y límites

| Actor | Qué puede hacer | Límite |
|---|---|---|
| Persona que concede el mandato | Dar a Queen un techo, activo, destino, vencimiento y una lista de personas autorizadas para pausar | Queen no puede ampliar el permiso; un mandato vencido no revive solo |
| Proyecto contratante | Abrir un encargo y responder preguntas sobre él | Es el único proyecto cuya respuesta cuenta, y solo para el encargo y alcance que abrió |
| Queen | Abrir la conversación, preguntar lo que falta, comprobar recibos y alcance, formular una propuesta, solicitar un pago simulado y registrar el recorrido | No puede aprobar por la persona, superar el techo ni convertir una respuesta fuera de alcance en aceptada |
| Verificador separado | Recalcular las comprobaciones declaradas a partir de evidencia | No es quien ejecuta ni demuestra afirmaciones que exceden la evidencia entregada |
| Tercer lector | Leer el registro local y los recibos sin Queen | Ve la secuencia registrada, no prueba de identidad civil, autoría ni pago externo |

La autoridad de la persona y la del proyecto contratante son distintas. El mandato de la persona indica cuánto puede gastar Queen, en qué activo y destino, hasta cuándo y quién puede pausar. El encargo del proyecto indica qué debe hacer Queen y qué alcance debe cubrir la respuesta. Una autoridad no sustituye a la otra.

## Recorrido: campaña de lanzamiento ficticia

El ejemplo usa `proyecto-corcheta`, una cooperativa ficticia del ecosistema. Todos los nombres y montos siguientes son de ejemplo, no son un cliente, proyecto, presupuesto, destino de billetera ni transacción reales.

1. **Un proyecto hace un encargo.** `proyecto-corcheta` pide un presupuesto para una campaña de lanzamiento de tres piezas.
2. **Una persona concede autoridad acotada.** El mandato de ejemplo fija un techo de 80.000 USD, un destino llamado `billetera-de-ejemplo`, un vencimiento y a `persona-que-otorga` como quien puede pausar.
3. **Queen abre la conversación.** Pregunta al proyecto contratante qué piezas necesita, cuántas, para cuándo y con qué destino de cobro, y luego confirma que el proyecto leyó el encargo.
4. **Se rechaza una voz ajena.** `observador-externo` habla en la conversación, pero no es el proyecto contratante. Queen registra el rechazo y no usa ese mensaje para formular.
5. **Responde el proyecto correcto.** La respuesta debe venir del proyecto contratado, cubrir el alcance del encargo y llevar un recibo cuyo digest se verifique. Un mensaje sin recibo válido no cuenta como respuesta.
6. **Queen formula desde esa respuesta.** Los precios de ejemplo para una pieza de concepto y una de producción suman 70.000 USD. El monto está bajo el techo de 80.000 USD del mandato.
7. **La compuerta de pago muestra el costo.** La persona puede ver el monto y el destino antes de solicitar el pago. La capa x402 registra la solicitud como simulada; no liquida el pago.
8. **Se registra y comprueba el recorrido.** Queen escribe el encargo, la conversación, el rechazo, la respuesta aceptada, la propuesta y el recibo en un registro JSONL local. Cada línea refiere el hash de la anterior. Un verificador separado recalcula las comprobaciones declaradas desde la evidencia e informa lo cubierto y lo no cubierto.
9. **Repetir no crea otra propuesta.** Volver a formular el mismo encargo devuelve el mismo recibo y deja una sola línea de propuesta en el registro.

## Reglas que el acuerdo hace cumplir

- **Sin conversación abierta y leída, no hay propuesta.** Un encargo sin conversación abierta con el proyecto que lo contrató vuelve bloqueado, con un motivo y una salida para que la persona lo resuelva.
- **Un mensaje necesita recibo.** Queen recalcula el digest del recibo. Si falta o fue alterado, no hace avanzar la conversación.
- **Solo responde el proyecto contratante.** Otro proyecto, un observador cercano o el proyecto correcto con una respuesta fuera del alcance del encargo se registra como rechazado.
- **El techo del mandato es duro.** Un monto superior vuelve bloqueado antes de solicitar el pago. La aprobación del proyecto contratante no puede reemplazar el techo de la persona.
- **Un mandato vencido sigue vencido.** No revive sin un nuevo permiso.
- **La formulación repetida es idempotente.** La segunda llamada devuelve el mismo recibo y no agrega otra línea de propuesta ni solicitud de pago.
- **Delegar no amplía la autoridad.** El alcance y el presupuesto del hijo delegado deben permanecer dentro del alcance y presupuesto del mandato padre.
- **Ejecución y verificación van por separado.** El verificador recalcula desde la evidencia, y cada recibo dice qué cubre y qué no.
- **El pago simulado se etiqueta donde ocurre.** La salida y el recibo dicen que la liquidación es simulada y que el anclaje sigue pendiente.

Los hashes encadenados del registro permiten detectar ediciones en el archivo presentado si se comprueba la cadena. No demuestran quién creó el archivo ni impiden que alguien que pueda reemplazarlo entero vuelva a calcular todos sus hashes.

## Qué establecen el recorrido y la evidencia

El ejemplo registrado establece un recorrido de software acotado: se exige una conversación antes de formular; se usa la respuesta con recibo del proyecto contratante; se rechaza a una voz ajena; se compara el monto de ejemplo con el techo concedido por una persona; el pago se etiqueta como simulado; la verificación se separa de la ejecución; y no se agrega dos veces la misma propuesta. El registro local se puede leer y reponer desde sus recibos sin Queen.

## Qué no establecen

El ejemplo no establece un pago real, liquidación x402 en vivo, conexión de red, escritura en blockchain, anclaje de Stellar testnet, hash público de transacción, identidad real, adopción, preparación para producción ni efecto legal. Tampoco prueba que el proyecto sintético o sus precios representen un mercado real. La suite suministrada tiene actualmente tres fallas en los controles de digest del kernel, así que las pruebas no muestran una ejecución limpia frente al kernel instalado. Consulta [Evidencia](EVIDENCE.md) y [Marco legal y límites](LEGAL_AND_LIMITS.md).
