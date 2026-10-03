[![Queen: agency proposals within granted authority](./assets/cover.png)](./assets/cover.png)

# Queen

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/status-first_version-D7B698?style=for-the-badge&labelColor=07111A" alt="Status: first version"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-review--only-D7B698?style=for-the-badge&labelColor=07111A" alt="License: review only"></a>
  <a href="./docs/EVIDENCE.md"><img src="https://img.shields.io/badge/suite-42_of_45-D7B698?style=for-the-badge&labelColor=07111A" alt="Suite: 42 of 45 pass today"></a>
  <a href="#english"><img src="https://img.shields.io/badge/agreement-before_code-E0C170?style=for-the-badge&labelColor=07111A" alt="Agreement before code"></a>
  <a href="https://github.com/andresanemic/vespi"><img src="https://img.shields.io/badge/built_with-Vespi_%C2%B7_Lore_Plugin-E0C170?style=for-the-badge&labelColor=07111A" alt="Built with Vespi and Lore Plugin"></a>
</p>

<p align="center"><b>Queen turns a project's request into a budget proposal only after a receipted conversation, and only within the authority it was granted.</b></p>

<p align="center">If you build on Stellar, or are judging Find Your Way or Meridian, this is a concrete look at authority-bound coordination built on Vespi.</p>

<p align="center">This repository contains the project agreement, walkthroughs and evidence, not source code. The code will open during the judges' review period under a review-only license for reading and cloning to evaluate.</p>

---

<details>
<summary><b>Read in English</b></summary>

<a id="english"></a>

**Queen makes a proposal answerable to the conversation and authority that produced it.**

> **The unit is the receipted conversation: without an open, read conversation with the project that made the request, there is no proposal.**

Queen is a fictional marketing-agency scenario used to show how an agent can speak with the project that hired it through Vespi, require a receipted answer, and formulate a budget within a human-granted ceiling. The marketing work is the setting; the capability being demonstrated is coordination within authority. The payment layer is x402-simulated: spending is checked against the mandate, while settlement is not real.

### Why

A project can ask for a budget or proposal, but an agent may lack the context to answer. A nearby project could be mistaken for the proper counterparty, an unreceipted message could be treated as an answer, or a second formulation could create a competing price. Queen makes the request, the answering project's authority, and the granted spending ceiling visible in a local record that a third party can read.

### If you are judging Find Your Way or Meridian, start here

1. Read [How it works](./docs/HOW_IT_WORKS.md) for the actors, authority and example walkthrough.
2. Read [Evidence](./docs/EVIDENCE.md) for the 45-test suite, today's result and its limits.
3. Read [Legal and limits](./docs/LEGAL_AND_LIMITS.md) for the agreement's boundaries and open questions.
4. Read [Code not included](./CODE_NOT_INCLUDED.md) and the [review-only license](./LICENSE) for what this public repository permits.
5. When the source opens during the judges' review period, compare the implementation with the agreement and rerun the documented suite.

### In one minute

In the fictional walkthrough, `proyecto-corcheta` asks Queen for a launch campaign budget covering three pieces. A person grants a mandate with an 80,000 USD ceiling, a destination and a pause authority. Queen opens and confirms the conversation, asks for missing details, and rejects a message from `observador-externo` because that speaker is not the project that commissioned the request. The proper project replies with a verifiable receipt; the example prices produce a 70,000 USD proposal. Queen checks the amount against the ceiling and records one simulated payment request and a receipt. The log shows the route and what remains unverified; there is no network settlement or public transaction hash.

### Why Queen

| You need | What it gives you | Where it lives |
|---|---|---|
| A proposal grounded in a request | Conversation opened and read with the commissioning project before formulation | [How it works](./docs/HOW_IT_WORKS.md) |
| The right project to answer | A receipted answer is checked against the counterparty and the request's scope | [How it works](./docs/HOW_IT_WORKS.md) |
| A budget that cannot overrun its mandate | A hard ceiling; an over-ceiling amount returns blocked for the person to resolve | [How it works](./docs/HOW_IT_WORKS.md) |
| One result when the same request is formulated again | Idempotent formulation returns the same receipt and does not add a second proposal line | [Evidence](./docs/EVIDENCE.md) |
| A record a reviewer can inspect | A local hash-linked log and receipts, including rejected input and declared coverage | [Evidence](./docs/EVIDENCE.md) |

**What Queen is not.** It is not a marketing service, CRM, sales funnel, payment product, or blockchain application. It does not settle a real x402 payment, submit a Stellar transaction, promise a proposal will be accepted, or decide for the person who granted authority.

### How it works

```text
Person grants mandate                Commissioning project sends request
 ceiling · asset · destination       and answers through Vespi
             \                              /
              v                            v
                 Queen opens conversation
                    asks · checks receipt
                    rejects wrong scope
                           |
                           v
               proposal within hard ceiling
                           |
                           v
              x402 payment layer simulated
                           |
                           v
          local hash-linked record + receipt
                           |
              separate verifier / third reader
```

| Actor | Rights and role | Boundary |
|---|---|---|
| Person granting the mandate | Sets the ceiling, asset, destination, expiry and who may pause | Queen cannot enlarge the grant; an expired mandate does not revive by itself |
| Commissioning project | Opens the request and is the only project whose in-scope answer counts | A nearby speaker or unrelated project's message is rejected |
| Queen | Asks, checks, formulates, requests the simulated payment and records receipts | Cannot consent for the person or exceed the ceiling |
| Separate verifier | Recalculates checks from evidence rather than relying on the executor's report | Does not prove external settlement or factual truth |
| Third reader | Reads the local record and receipts without Queen | A hash chain detects edits within the presented file; it does not establish who authored or preserved that file |

### Evidence you can open

The supplied suite reports 42 passing tests out of 45, rechecked on 2026-10-03. The passing cases cover the complete request-to-proposal route, receipt verification, simulated payment disclosure, a pending external anchor, separation of execution and verification, local-chain auditing, reconstruction from receipts, rejecting an unauthorized speaker, enforcing the ceiling, and idempotent formulation. The three failures are kernel pin checks: `continuity.js` differs from the digest fixed by Queen and declared by the kit, and the installed `opencode` copy is not the pinned `continuity.js`. The nine coded projects were built on the 2026-09-29 kernel cut `54c20c7`; their records report green against that cut. Each project intentionally fails when the installed kernel changes until its digest is pinned again. The kernel installed today is 0.1.3, and Queen's re-pinning is pending. See [Evidence](./docs/EVIDENCE.md) for the source test names and the adversarial RED phase. No Stellar testnet transaction is claimed.

### Queen, Vespi and Lore Plugin

Lore Plugin provides the project-routing and coordination setting described by the agreement. Vespi supplies the authority and operation model Queen uses: a person grants a bounded mandate; operations leave receipts; a human gate makes the cost visible before payment; verification is separate from execution; and a later reader can continue the documented route from receipts. The project loads a vendored kernel copy and fixes its modules by digest. Those digest pins are precisely where part of today's suite fails after the installed kernel moved.

### What it does not do, and what is not verified

There is no real payment, network connection, blockchain write, Stellar testnet anchor, transaction hash, or live x402 settlement. The receipt anchor remains `pending`. The x402 primary specification was not read for this project, so Queen makes no claim of x402 conformance. The project uses fictional names and synthetic example data only; it includes no real project, budget, wallet destination, account identifier or ecosystem organization data. The hash-linked file can be rewritten by someone able to replace the file and recompute its chain. Today's 42/45 result is not a clean suite against the currently installed kernel: the re-pin is pending. The recorded working path and test results do not establish production readiness, real-world adoption, or a finished product. See [Legal and limits](./docs/LEGAL_AND_LIMITS.md).

### How to review this project

Start with the agreement's public explanation in this repository, then check the evidence and limits. Today there is no source code here. During the judges' review period, the code will open under the review-only license, which permits reading and cloning to evaluate, not modification. At that point, use the documented test command `npm test` from the project directory and compare the reported outcomes with [Evidence](./docs/EVIDENCE.md); the kernel pin needs to be updated as part of the pending re-pin before claiming the suite passes against the installed kernel.

### Author

**Andrés Peña**, repository authority: `andresanemic`.

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[How it works](./docs/HOW_IT_WORKS.md) · [Evidence](./docs/EVIDENCE.md) · [Legal and limits](./docs/LEGAL_AND_LIMITS.md) · [Code not included](./CODE_NOT_INCLUDED.md) · [Review-only license](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>

<details>
<summary><b>Leer en español</b></summary>

<a id="espanol"></a>

**Queen hace que una propuesta pueda revisarse junto con la conversación y la autoridad que la originaron.**

> **La unidad es la conversación con recibo: sin una conversación abierta y leída con el proyecto que hizo el encargo, no hay propuesta.**

Queen es un escenario ficticio de agencia de marketing que muestra cómo un agente puede conversar con el proyecto que lo contrató a través de Vespi, exigir una respuesta con recibo y formular un presupuesto dentro del techo concedido por una persona. El trabajo de marketing es el escenario; la capacidad que se demuestra es la coordinación dentro de la autoridad. La capa de pago x402 está simulada: el gasto se contrasta con el mandato, pero la liquidación no es real.

### Por qué

Un proyecto puede pedir un presupuesto o una propuesta, pero el agente quizá no tenga el contexto para responder. Podría confundirse un proyecto cercano con la contraparte correcta, tomarse un mensaje sin recibo como respuesta o producirse un precio competidor al formular dos veces. Queen hace visible el encargo, la autoridad del proyecto que responde y el techo de gasto concedido en un registro local que una tercera persona puede leer.

### Si estás evaluando Find Your Way o Meridian, empieza aquí

1. Lee [Cómo funciona](./docs/HOW_IT_WORKS.md) para conocer a los actores, la autoridad y el recorrido de ejemplo.
2. Lee [Evidencia](./docs/EVIDENCE.md) para conocer la suite de 45 pruebas, el resultado de hoy y sus límites.
3. Lee [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) para conocer las fronteras del acuerdo y las preguntas abiertas.
4. Lee [Código no incluido](./CODE_NOT_INCLUDED.md) y la [licencia de solo revisión](./LICENSE) para saber qué permite este repositorio público.
5. Cuando se abra el código durante el periodo de los jueces, compara la implementación con el acuerdo y vuelve a ejecutar la suite documentada.

### En un minuto

En el recorrido ficticio, `proyecto-corcheta` le pide a Queen un presupuesto para una campaña de lanzamiento de tres piezas. Una persona concede un mandato con un techo de 80.000 USD, un destino y una autoridad para pausar. Queen abre y confirma la conversación, pregunta lo que falta y rechaza un mensaje de `observador-externo` porque esa persona no es el proyecto que hizo el encargo. El proyecto correcto responde con un recibo verificable; los precios de ejemplo producen una propuesta de 70.000 USD. Queen compara el monto con el techo y registra una sola solicitud de pago simulado y un recibo. El registro muestra el recorrido y lo que sigue sin verificar; no hay liquidación en red ni hash público de transacción.

### Por qué Queen

| Necesitas | Qué te da | Dónde está |
|---|---|---|
| Una propuesta fundada en un encargo | Conversación abierta y leída con el proyecto que contrató antes de formular | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Que responda el proyecto correcto | La respuesta con recibo se contrasta con la contraparte y el alcance del encargo | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Un presupuesto que no exceda el mandato | Un techo duro; si lo supera, vuelve bloqueado para que la persona lo resuelva | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Un solo resultado al volver a formular el encargo | La formulación idempotente devuelve el mismo recibo y no agrega otra línea de propuesta | [Evidencia](./docs/EVIDENCE.md) |
| Un registro que se pueda inspeccionar | Un registro local con huellas encadenadas y recibos, incluso de entradas rechazadas y cobertura declarada | [Evidencia](./docs/EVIDENCE.md) |

**Qué no es Queen.** No es un servicio de marketing, CRM, embudo de ventas, producto de pagos ni aplicación de blockchain. No liquida un pago x402 real, no envía una transacción a Stellar, no promete que aceptarán una propuesta ni decide por la persona que concedió la autoridad.

### Cómo funciona

```text
La persona concede mandato              El proyecto contratante envía
 techo · activo · destino                el encargo y responde por Vespi
             \                              /
              v                            v
                Queen abre la conversación
                   pregunta · revisa recibo
                   rechaza alcance ajeno
                           |
                           v
                propuesta bajo techo duro
                           |
                           v
              capa de pago x402 simulada
                           |
                           v
         registro local con huellas + recibo
                           |
            verificador separado / tercer lector
```

| Actor | Derechos y función | Límite |
|---|---|---|
| Persona que concede el mandato | Fija el techo, activo, destino, vencimiento y quién puede pausar | Queen no puede ampliar el permiso; el mandato vencido no revive solo |
| Proyecto contratante | Abre el encargo y es el único proyecto cuya respuesta dentro del alcance cuenta | Se rechaza el mensaje de un observador o de otro proyecto |
| Queen | Pregunta, comprueba, formula, solicita el pago simulado y registra recibos | No puede consentir por la persona ni superar el techo |
| Verificador separado | Recalcula comprobaciones desde la evidencia, sin confiar en el informe de quien ejecutó | No demuestra liquidación externa ni verdad factual |
| Tercer lector | Lee el registro local y los recibos sin Queen | La cadena de huellas detecta ediciones en el archivo presentado; no identifica a quien lo creó o conservó |

### Evidencia que puedes abrir

La suite suministrada informa que pasan 42 de 45 pruebas, cifra revisada nuevamente el 2026-10-03. Los casos que pasan cubren el recorrido completo desde el encargo hasta la propuesta, la verificación de recibos, la declaración del pago simulado, un anclaje externo pendiente, la separación entre ejecución y verificación, la auditoría de la cadena local, la reconstrucción desde recibos, el rechazo de una voz no autorizada, el cumplimiento del techo y la formulación idempotente. Las tres fallas son controles de fijación del kernel: `continuity.js` difiere del digest fijado por Queen y declarado por el kit, y la copia instalada de `opencode` no tiene el `continuity.js` fijado. Los nueve proyectos con código se construyeron contra el corte del kernel `54c20c7` del 29 de septiembre de 2026; sus registros informan que pasaban contra ese corte. Cada proyecto falla deliberadamente cuando cambia el kernel hasta volver a fijar el digest. El kernel instalado hoy es 0.1.3 y la nueva fijación de Queen está pendiente. Consulta [Evidencia](./docs/EVIDENCE.md) para ver los nombres de pruebas de las fuentes y la fase RED adversarial. No se afirma ninguna transacción de Stellar testnet.

### Queen, Vespi y Lore Plugin

Lore Plugin aporta el marco de rutas de proyecto y coordinación que describe el acuerdo. Vespi aporta el modelo de autoridad y operaciones que Queen usa: una persona concede un mandato acotado; las operaciones dejan recibos; una compuerta humana muestra el costo antes del pago; la verificación ocurre aparte de la ejecución; y una persona que llegue después puede continuar el recorrido documentado desde los recibos. El proyecto carga una copia vendorizada del kernel y fija sus módulos por digest. Esas fijaciones son precisamente donde hoy falla parte de la suite, tras el cambio del kernel instalado.

### Lo que no hace y lo que no está verificado

No hay pago real, conexión de red, escritura en blockchain, anclaje en Stellar testnet, hash de transacción ni liquidación x402 en vivo. El anclaje del recibo permanece en `pending`. La especificación primaria de x402 no se leyó para este proyecto, así que Queen no afirma conformidad con x402. El proyecto usa solo nombres ficticios y datos sintéticos de ejemplo; no incluye proyectos, presupuestos, destinos de billetera, identificadores de cuenta ni datos de organizaciones reales del ecosistema. Alguien que pueda reemplazar el archivo y recalcular toda la cadena puede reescribir el registro con huellas coherentes. El resultado de hoy, 42/45, no es una suite limpia frente al kernel instalado actualmente: la nueva fijación está pendiente. El recorrido que funciona y sus pruebas no demuestran que sea un producto terminado, que esté listo para producción o que tenga adopción real. Consulta [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md).

### Cómo revisar este proyecto

Empieza por la explicación pública del acuerdo en este repositorio y luego revisa la evidencia y los límites. Hoy no hay código fuente aquí. Durante el periodo de revisión de los jueces, el código se abrirá bajo la licencia de solo revisión, que permite leerlo y clonarlo para evaluarlo, no modificarlo. Entonces, ejecuta el comando documentado `npm test` desde el directorio del proyecto y compara los resultados con [Evidencia](./docs/EVIDENCE.md); antes de afirmar que la suite pasa frente al kernel instalado, debe completarse la nueva fijación pendiente.

### Autor

**Andrés Peña**, autoridad del repositorio: `andresanemic`.

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[Cómo funciona](./docs/HOW_IT_WORKS.md) · [Evidencia](./docs/EVIDENCE.md) · [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) · [Código no incluido](./CODE_NOT_INCLUDED.md) · [Licencia de solo revisión](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>
