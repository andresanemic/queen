<p align="center">
  <a href="./assets/cover.png"><img src="./assets/cover.png" alt="Queen: campaign proposals within granted authority" width="100%"></a>
</p>

<h1 align="center">Queen</h1>

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/status-first_version-D7B698?style=for-the-badge&labelColor=07111A" alt="Status: first version"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-review--only-D7B698?style=for-the-badge&labelColor=07111A" alt="License: review only"></a>
  <a href="./docs/EVIDENCE.md"><img src="https://img.shields.io/badge/suite-45_of_45-D7B698?style=for-the-badge&labelColor=07111A" alt="Suite: 45 pass"></a>
  <a href="#english"><img src="https://img.shields.io/badge/agreement-written_before_code-E0C170?style=for-the-badge&labelColor=07111A" alt="Agreement written before code"></a>
  <a href="https://github.com/andresanemic/vespi"><img src="https://img.shields.io/badge/built_with-Vespi_and_Lore_Plugin-E0C170?style=for-the-badge&labelColor=07111A" alt="Built with Vespi and Lore Plugin"></a>
  <a href="https://github.com/andresanemic/vespi/tree/ed559e83c976dd6e6a379a5510db776206f670b4"><img src="https://img.shields.io/badge/kernel-0.1.5_release-ed559e8?style=for-the-badge&labelColor=07111A&color=E0C170" alt="Kernel: 0.1.5 release (commit ed559e8)"></a>
</p>

<p align="center"><b>A proposal should be answerable to the conversation and authority that produced it.</b></p>

<p align="center">English and Spanish versions follow. Queen is a documented project agreement, walkthrough and evidence record. This public repository does not contain source code.</p>

<p align="center"><b>Queen</b> — a budget proposal is often unclear: who asked, who could answer, what the price covers.<br>
The brief and the approved limits travel with the proposal. Evidence: 45/45 tests. Fictional clients and campaigns.</p>

<p align="center"><b>We’re applying to the Find Your Way hackathon and plan to participate in Meridian.</b></p>
<p align="center"><b>For judges:</b> <a href="./docs/HOW_IT_WORKS.md">How it works</a> · <a href="./docs/EVIDENCE.md">Evidence</a> · <a href="./docs/LEGAL_AND_LIMITS.md">Limits</a> · <a href="./CODE_NOT_INCLUDED.md">Source and review terms</a>.<br>This public snapshot contains documentation and evidence, not runnable source.</p>

---

<details>
<summary><b>Read in English</b></summary>

<a id="english"></a>

**Queen makes a budget proposal only after the commissioning project has answered through a receipted conversation, and only within the authority a person granted.**

> **The unit is the receipted conversation: without an open, read conversation with the project that made the request, there is no proposal.**

Queen is a fictional marketing-agency scenario for a narrower coordination problem. A project asks for a proposal, but an agent cannot safely fill the gaps from memory or accept whichever nearby voice replies. Queen opens a conversation with the commissioning project through Vespi, asks for what is missing, checks that the answer has a valid receipt and belongs to the right project and scope, and then formulates within a human-granted spending ceiling. The marketing agency is the setting. What the project demonstrates is coordination within authority. Its x402 payment layer checks and records a simulated payment request; settlement is not real.

### Why

A request for a budget can arrive with missing detail and no durable trail. If an agent guesses, the proposal may describe work nobody asked for. If a neighboring project or observer answers, their words may be mistaken for the commissioning project's authority. If the same request is formulated twice, a second price can appear beside the first. These are small handoffs with consequential ambiguity: who asked, who was allowed to answer, what the price covers, and who set the ceiling can disappear between a conversation and a quote.

Queen makes that handoff readable. A third party can follow the request, the conversation, a rejected answer, the accepted answer, the ceiling check, and the receipt in a local record. The point is not to make a marketing decision for anyone. It is to leave enough context around a proposal for another person to see why it exists and where the authority ends.

### In one minute

The example follows `proyecto-corcheta`, a fictional project that asks Queen for a launch campaign budget for three pieces. A person gives Queen an example mandate capped at 80,000 USD, with a destination and a named pause authority. Queen opens and confirms the conversation, asks what pieces are needed and when, and records an interjection from `observador-externo` as a rejection because that observer is not the commissioning project. `proyecto-corcheta` then answers with a verifiable receipt. The recorded proposal totals 70,000 USD, below the example ceiling. Queen shows the cost before the payment step, labels settlement simulated, verifies the receipt separately, and leaves one proposal line even when the same request is formulated again. The record says the external anchor is pending. There is no real payment, network settlement or public transaction hash.

### What it looks like in practice

The following is a faithful excerpt from the recorded walkthrough. Identifiers, destination and amounts are fictional or synthetic examples. The event labels and reported amounts are copied from the captured terminal screen; the excerpt does not describe a live payment.

```text
encargo_recibido       proyecto-corcheta: presupuesto para una campana de lanzamiento de tres piezas
conversacion_abierta   con proyecto-corcheta
lectura_confirmada     lee el encargo
pregunta               a proyecto-corcheta: que piezas necesita y cuantas
pregunta               a proyecto-corcheta: para cuando las necesita y con que destino de cobro
mensaje_de_tercero     observador-externo: habla en la conversacion pero no es la contraparte
respuesta_rechazada    observador-externo: observador-externo no es la contraparte del encargo enc-corcheta-001
respuesta_aceptada     proyecto-corcheta firma b1f10aaeeadd...
propuesta_formulada    70000 USD
pago_simulado          70000 USD -> billetera-de-ejemplo (simulado)
verificacion           por verificador-externo: 4 ok, 3 no
recibo                 7246db9a5d6c...
cierre                 completa
```

The receipt separates the checks that passed from the claims it cannot cover:

```text
Estado:       verified
Capacidad:    pago-x402-simulado
Firma:        7246db9a5d6ca7654dedb6f2479d3a41...
Anclaje:      pending (stellar:testnet)
Verifico:     el verificador externo, sobre la evidencia
Cubierto:     el gasto declarado cabe en el techo del mandato | el efecto quedo en el destino que declara el mandato | quien pago es la contraparte del encargo | el pago se declaro simulado y no como pago real
NO cubierto:  x402 settlement on a live network | tx hash on-chain in a public explorer | pago real a un tercero real | external anchor
```

Those excerpts show a local software walkthrough, not a production transcript. The same recorded run reports that the receipt chain has 13 lines, a repeated formulation returns the same receipt, and only one proposal line and one simulated payment request were recorded. The project sources do not include a real service response or market validation.

### Why Queen

| You need | What it gives you | Where it lives |
|---|---|---|
| A proposal grounded in a request | A conversation opened and read with the commissioning project before formulation | [How it works](./docs/HOW_IT_WORKS.md) |
| The right project to answer | A receipted reply is checked against the counterparty and the request's scope; the observer's message remains a rejection | [How it works](./docs/HOW_IT_WORKS.md) |
| A budget bounded by a person's mandate | A hard ceiling; an amount above it returns blocked before the payment request | [How it works](./docs/HOW_IT_WORKS.md) |
| One result when the same request is formulated again | The second formulation returns the same receipt and does not add another proposal line | [Evidence](./docs/EVIDENCE.md) |
| A record a reviewer can inspect | A local hash-linked log and receipts that include rejected input and declared coverage | [Evidence](./docs/EVIDENCE.md) |

### What Queen is, and is not

Queen is a project walkthrough about an agent asking, checking, formulating and recording within granted authority. Its unit is the conversation that has been opened, read and answered with a receipt. It is not a marketing service, CRM, sales funnel, payment product or blockchain application. It does not decide whether a proposal is good, promise acceptance, consent for the person who granted authority or settle a real payment.

### How it works

Two sources of authority meet, but do not replace one another. The person's mandate gives Queen a hard ceiling, asset, destination, expiry and pause authority. The commissioning project's request defines the work and the only project whose in-scope answer counts.

```text
Person's mandate                          Commissioning project's request
ceiling · asset · destination             scope · conversation · answer
          \                                      /
           v                                    v
              Queen opens and reads the conversation
                 asks · checks scope and receipt
                  rejects an out-of-scope speaker
                              |
                              v
                 proposal within the hard ceiling
                              |
                              v
             simulated payment request · sealed receipt
                              |
                              v
             local linked record · separate verifier
                              |
                              v
                    third-party reader
```

| Actor | Rights and role | Boundary |
|---|---|---|
| Person granting the mandate | Sets the ceiling, asset, destination, expiry and who may pause | Queen cannot enlarge the grant. An expired mandate does not revive by itself. |
| Commissioning project | Opens the request and is the only project whose in-scope answer counts | A nearby speaker or a reply outside the request's scope is rejected. |
| Queen | Asks, checks receipts, formulates, requests simulated payment and records the route | It cannot consent for the person or exceed the ceiling. |
| Separate verifier | Recalculates checks from evidence instead of relying on the executor's report | It does not establish factual truth or external settlement. |
| Third reader | Reads the local record and receipts without Queen | Hash links reveal edits to the presented file; they do not identify who authored or preserved it. |

### Evidence you can open

The supplied run of 2026-10-09 reports 45 tests, pass 45, fail 0, skipped 0, on Node v24.15.0, run in a clean clone with empty HOME and no network. Passing cases cover the complete request-to-proposal route, receipts and their declared coverage, simulated-payment disclosure, the pending external anchor, separate verification, local-chain auditing, reconstruction from receipts, rejection of an unauthorized speaker, the hard ceiling and idempotent formulation. The five adversarial RED cases and one control case were written and observed before implementation. Their names and scope are listed in [Evidence](./docs/EVIDENCE.md). The 2026-10-03 capture was red because the project was pinned to an old kernel cut (0.1.3); that re-pin to Vespi 0.1.5 (commit `ed559e8`) is done and verified in the new capture.

The kernel checks pass in the new capture: the suite verifies the copy vendored in `vendor/vespi-kernel` against its SOURCE.md (per-module digest and commit) for Vespi 0.1.5 (`ed559e83c976dd6e6a379a5510db776206f670b4`).

### Queen, Vespi and Lore Plugin

Lore Plugin supplies the project-routing and coordination setting described by Queen's agreement. Queen uses Vespi's kernel for bounded authority, operations, receipts, a human gate that shows the cost before the payment request, separate verification and continuation from receipts. Its conversation is implemented as a delegation, so a reply needs the right scope and a verifiable receipt. The agreement says Queen loads a vendored copy and fixes the kernel modules by digest. The earlier digest mismatches are recorded in [Evidence](./docs/EVIDENCE.md); the new capture shows the re-pinned kernel verifying.

**What this relationship means.** The project was built with Lore Plugin's method (its agreement and criterion live in the project, in `acuerdo.md` and `lore/`), and its operations, authority and receipts run on the Vespi kernel 0.1.5, in the pinned copy that Lore Plugin 2.5.1 distributes (`skills/vespi/core/kernel`). That copy sits in the project as `vendor/vespi-kernel` and the suite verifies it against its `SOURCE.md`. Lore Plugin does not run inside the project. This project does not use the kernel's newer capabilities (Stellar pubnet anchors, live x402 settlement, the ZK verifier, emergency access); it exercises the core of operations, authority and receipts.

### What it does not do, and what is not verified

The payment settlement is simulated. There is no network call, real x402 settlement, blockchain write, Stellar testnet transaction, public transaction hash or completed external anchor; the receipt says `pending`. The project's agreement says the primary x402 specification was not read, so Queen makes no conformance claim. The names, destination and amounts in the walkthrough are fictional or synthetic. The hash-linked file can be replaced and its chain recomputed by someone who can rewrite the whole file. A verified receipt describes checks against supplied evidence; it does not prove a real-world payment, authorship or factual truth. The green suite accredits only what those tests cover; it does not establish production readiness, adoption or acceptance. [Legal and limits](./docs/LEGAL_AND_LIMITS.md) records the rest of the boundary.

### How to review this project

Read the walkthrough, then compare the test record and limits with the project agreement when the source becomes available. This repository currently contains the agreement, documentation and evidence, not source code. The source is scheduled to open during the judges' review period under the review-only license, which permits reading and cloning for evaluation. At that point, run the documented `npm test` from the project directory and compare its output with [Evidence](./docs/EVIDENCE.md). The re-pin is done, so a reviewer can expect a clean run against the vendored kernel and compare it with the reference `docs/suite-2026-10-09.txt`.

### Author

**Andrés Peña**, repository authority: `andresanemic`.

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[How it works](./docs/HOW_IT_WORKS.md) · [Evidence](./docs/EVIDENCE.md) · [Legal and limits](./docs/LEGAL_AND_LIMITS.md) · [Code not included](./CODE_NOT_INCLUDED.md) · [Review-only license](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>

<details>
<summary><b>Leer en español</b></summary>

<a id="espanol"></a>

**Queen formula un presupuesto solo después de que el proyecto contratante haya respondido en una conversación con recibo, y únicamente dentro de la autoridad que concedió una persona.**

> **La unidad es la conversación con recibo: sin una conversación abierta y leída con el proyecto que hizo el encargo, no hay propuesta.**

Queen es un escenario ficticio de agencia de marketing para un problema más acotado de coordinación. Un proyecto pide una propuesta, pero un agente no puede completar con seguridad los vacíos de memoria ni aceptar la respuesta de cualquier voz cercana. Queen abre una conversación con el proyecto contratante a través de Vespi, pregunta lo que falta, comprueba que la respuesta tenga un recibo válido y corresponda al proyecto y al alcance correctos, y después formula dentro de un techo de gasto concedido por una persona. La agencia de marketing es el escenario. Lo que el proyecto muestra es coordinación dentro de la autoridad. Su capa de pago x402 comprueba y registra una solicitud de pago simulada; la liquidación no es real.

### Por qué

Una solicitud de presupuesto puede llegar con datos incompletos y sin un rastro duradero. Si el agente adivina, la propuesta puede describir un trabajo que nadie pidió. Si responde un proyecto vecino o una persona observadora, sus palabras pueden confundirse con la autoridad del proyecto contratante. Si el mismo encargo se formula dos veces, puede aparecer un segundo precio junto al primero. Son ambigüedades pequeñas en un traspaso con consecuencias: entre la conversación y la cotización pueden perderse quién pidió, quién podía responder, qué cubre el precio y quién fijó el techo.

Queen deja ese traspaso legible. Una tercera persona puede seguir el encargo, la conversación, una respuesta rechazada, la respuesta aceptada, la comprobación del techo y el recibo en un registro local. El objetivo no es decidir por nadie si una campaña conviene. Es conservar contexto suficiente alrededor de una propuesta para que otra persona pueda entender por qué existe y dónde termina la autoridad.

### Si estás evaluando Find Your Way o Meridian, empieza aquí

- Lee la base del proyecto y su recorrido. Empieza por [Cómo funciona](./docs/HOW_IT_WORKS.md).
- Abre el registro de pruebas. Consulta [Evidencia](./docs/EVIDENCE.md).
- Lee los límites jurídicos y de verificación. Consulta [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md).
- Revisa las condiciones de publicación. Consulta [Código no incluido](./CODE_NOT_INCLUDED.md) y la [licencia de solo revisión](./LICENSE).

### En un minuto

El ejemplo sigue a `proyecto-corcheta`, un proyecto ficticio que pide a Queen un presupuesto para una campaña de lanzamiento de tres piezas. Una persona entrega a Queen un mandato de ejemplo con un techo de 80.000 USD, un destino y una autoridad de pausa. Queen abre y confirma la conversación, pregunta qué piezas hacen falta y para cuándo, y registra la intervención de `observador-externo` como rechazo porque esa persona no es el proyecto contratante. Después, `proyecto-corcheta` responde con un recibo verificable. La propuesta registrada suma 70.000 USD, por debajo del techo de ejemplo. Queen muestra el costo antes del paso de pago, etiqueta la liquidación como simulada, verifica el recibo por separado y deja una sola línea de propuesta aunque el mismo encargo se vuelva a formular. El registro deja el anclaje externo en pending. No hay pago real, liquidación en red ni hash público de transacción.

<a id="como-se-ve-en-la-practica"></a>

### Cómo se ve en la práctica

El siguiente bloque es un extracto fiel del recorrido registrado. Los identificadores, el destino y los montos son ficticios o sintéticos. Las etiquetas de eventos y los montos informados se copian de la pantalla de terminal capturada; el extracto no describe un pago en vivo.

```text
encargo_recibido       proyecto-corcheta: presupuesto para una campana de lanzamiento de tres piezas
conversacion_abierta   con proyecto-corcheta
lectura_confirmada     lee el encargo
pregunta               a proyecto-corcheta: que piezas necesita y cuantas
pregunta               a proyecto-corcheta: para cuando las necesita y con que destino de cobro
mensaje_de_tercero     observador-externo: habla en la conversacion pero no es la contraparte
respuesta_rechazada    observador-externo: observador-externo no es la contraparte del encargo enc-corcheta-001
respuesta_aceptada     proyecto-corcheta firma b1f10aaeeadd...
propuesta_formulada    70000 USD
pago_simulado          70000 USD -> billetera-de-ejemplo (simulado)
verificacion           por verificador-externo: 4 ok, 3 no
recibo                 7246db9a5d6c...
cierre                 completa
```

El recibo separa las comprobaciones que pasaron de las afirmaciones que no puede cubrir:

```text
Estado:       verified
Capacidad:    pago-x402-simulado
Firma:        7246db9a5d6ca7654dedb6f2479d3a41...
Anclaje:      pending (stellar:testnet)
Verifico:     el verificador externo, sobre la evidencia
Cubierto:     el gasto declarado cabe en el techo del mandato | el efecto quedo en el destino que declara el mandato | quien pago es la contraparte del encargo | el pago se declaro simulado y no como pago real
NO cubierto:  x402 settlement on a live network | tx hash on-chain in a public explorer | pago real a un tercero real | external anchor
```

Esos extractos muestran un recorrido local de software, no una transcripción de producción. La misma corrida registrada informa que la cadena del recibo tiene 13 líneas, que una formulación repetida devuelve el mismo recibo y que quedó registrada una sola propuesta y una sola solicitud de pago simulado. Las fuentes del proyecto no contienen respuestas de un servicio real ni validación de mercado.

### Por qué Queen

| Necesitas | Qué te da | Dónde está |
|---|---|---|
| Una propuesta fundada en un encargo | Una conversación abierta y leída con el proyecto contratante antes de formular | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Que responda el proyecto correcto | La respuesta con recibo se contrasta con la contraparte y el alcance; el mensaje del observador queda rechazado | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Un presupuesto limitado por el mandato de una persona | Un techo duro; si lo supera, vuelve bloqueado antes de solicitar el pago | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Un solo resultado al volver a formular el mismo encargo | La segunda formulación devuelve el mismo recibo y no agrega otra línea de propuesta | [Evidencia](./docs/EVIDENCE.md) |
| Un registro que pueda revisar otra persona | Un registro local de huellas encadenadas y recibos que incluye entradas rechazadas y cobertura declarada | [Evidencia](./docs/EVIDENCE.md) |

### Qué es Queen y qué no es

Queen es un recorrido de proyecto sobre un agente que pregunta, comprueba, formula y registra dentro de una autoridad concedida. Su unidad es la conversación abierta, leída y respondida con recibo. No es un servicio de marketing, CRM, embudo de ventas, producto de pagos ni aplicación de blockchain. No decide si una propuesta es buena, no promete que la aceptarán, no consiente por la persona que concedió la autoridad ni liquida pagos reales.

### Cómo funciona

Se encuentran dos fuentes de autoridad, pero ninguna reemplaza a la otra. El mandato de la persona da a Queen un techo duro, un activo, un destino, un vencimiento y una autoridad de pausa. El encargo del proyecto contratante define el trabajo y cuál es el único proyecto cuya respuesta dentro del alcance cuenta.

```text
Mandato de la persona                      Encargo del proyecto contratante
techo · activo · destino                   alcance · conversación · respuesta
          \                                      /
           v                                    v
               Queen abre y lee la conversación
                pregunta · revisa alcance y recibo
                   rechaza voces fuera de alcance
                              |
                              v
                  propuesta bajo el techo duro
                              |
                              v
            solicitud de pago simulada · recibo sellado
                              |
                              v
           registro local encadenado · verificador separado
                              |
                              v
                      tercera persona lectora
```

| Actor | Derechos y función | Límite |
|---|---|---|
| Persona que concede el mandato | Fija el techo, activo, destino, vencimiento y quién puede pausar | Queen no puede ampliar el permiso. Un mandato vencido no revive por sí solo. |
| Proyecto contratante | Abre el encargo y es el único proyecto cuya respuesta dentro del alcance cuenta | Se rechaza a una voz cercana o una respuesta fuera del alcance del encargo. |
| Queen | Pregunta, comprueba recibos, formula, solicita el pago simulado y registra el recorrido | No puede consentir por la persona ni superar el techo. |
| Verificador separado | Recalcula las comprobaciones desde la evidencia en lugar de confiar en el informe del ejecutor | No establece la verdad factual ni una liquidación externa. |
| Tercera persona lectora | Lee el registro local y los recibos sin Queen | Las huellas revelan ediciones del archivo presentado; no identifican quién lo creó o conservó. |

### Evidencia que puedes abrir

La ejecución suministrada del 2026-10-09 informa 45 pruebas, 45 aprobadas, 0 fallan, 0 omitidas, en Node v24.15.0, corrida en un clon limpio con HOME vacío y sin red. Los casos aprobados cubren el recorrido completo desde el encargo hasta la propuesta, los recibos y su cobertura declarada, la declaración del pago simulado, el anclaje externo en pending, la verificación separada, la auditoría de la cadena local, la reconstrucción desde recibos, el rechazo de una voz no autorizada, el techo duro y la formulación idempotente. Los cinco casos adversariales RED y un caso de control se escribieron y observaron antes de la implementación. [Evidencia](./docs/EVIDENCE.md) enumera sus nombres y alcance. La captura del 2026-10-03 estaba en rojo porque el proyecto apuntaba a un corte viejo del kernel (0.1.3); esa nueva fijación a Vespi 0.1.5 (commit `ed559e8`) ya está hecha y verificada en la captura nueva.

Los controles del kernel pasan en la captura nueva: la suite verifica la copia vendorizada en `vendor/vespi-kernel` contra su SOURCE.md (digest por módulo y commit) para Vespi 0.1.5 (`ed559e83c976dd6e6a379a5510db776206f670b4`).

### Queen, Vespi y Lore Plugin

Lore Plugin aporta el marco de enrutamiento entre proyectos y coordinación que describe el acuerdo de Queen. Queen usa el kernel de Vespi para la autoridad acotada, las operaciones, los recibos, una compuerta humana que muestra el costo antes de solicitar el pago, la verificación separada y la continuación desde recibos. La conversación de Queen se implementa como una delegación, por lo que la respuesta necesita el alcance correcto y un recibo verificable. El acuerdo dice que Queen carga una copia vendorizada y fija por digest los módulos del kernel. Los desajustes anteriores de digest quedaron registrados en [Evidencia](./docs/EVIDENCE.md); la captura nueva muestra el kernel con la fijación nueva verificado.

**Qué significa esta relación.** El proyecto se construyó con el método de Lore Plugin (su acuerdo y su criterio viven en el proyecto, en `acuerdo.md` y `lore/`), y sus operaciones, autoridad y recibos corren sobre el kernel de Vespi 0.1.5, en la copia fijada que distribuye Lore Plugin 2.5.1 (`skills/vespi/core/kernel`). Esa copia está en el proyecto como `vendor/vespi-kernel` y la suite la verifica contra su `SOURCE.md`. Lore Plugin no corre dentro del proyecto. Este proyecto no usa las capacidades nuevas del kernel (anclas Stellar pubnet, liquidación x402 en vivo, el verificador ZK, el acceso de emergencia); ejerce el núcleo de operaciones, autoridad y recibos.

### Lo que no hace y lo que no está verificado

La liquidación del pago es simulada. No hay llamada de red, liquidación x402 real, escritura en blockchain, transacción en Stellar testnet, hash público de transacción ni anclaje externo completado; el recibo dice `pending`. El acuerdo del proyecto dice que no se leyó la especificación primaria de x402, así que Queen no afirma conformidad. Los nombres, el destino y los montos del recorrido son ficticios o sintéticos. Una persona que pueda reemplazar el archivo completo puede recalcular la cadena de huellas. Un recibo verificado describe comprobaciones sobre la evidencia suministrada; no prueba un pago real, autoría ni verdad factual. La suite en verde acredita solo lo que esas pruebas cubren; no demuestra que el proyecto esté listo para producción, que tenga adopción ni que haya sido aceptado. [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) registra las demás fronteras.

### Cómo revisar este proyecto

Lee el recorrido y compara después el registro de pruebas y los límites con el acuerdo cuando el código esté disponible. Este repositorio contiene por ahora el acuerdo, la documentación y la evidencia, no el código fuente. Está previsto que el código se abra durante el periodo de revisión de los jueces bajo la licencia de solo revisión, que permite leerlo y clonarlo para evaluarlo. Entonces ejecuta el `npm test` documentado desde el directorio del proyecto y compara su salida con [Evidencia](./docs/EVIDENCE.md). La nueva fijación ya está hecha, así que quien revise puede esperar una ejecución limpia frente al kernel vendorizado y compararla con la referencia `docs/suite-2026-10-09.txt`.

### Autor

**Andrés Peña**, autoridad del repositorio: `andresanemic`.

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[Cómo funciona](./docs/HOW_IT_WORKS.md) · [Evidencia](./docs/EVIDENCE.md) · [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) · [Código no incluido](./CODE_NOT_INCLUDED.md) · [Licencia de solo revisión](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>
