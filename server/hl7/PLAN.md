# Module 13.4 — HL7 v2 Full Integration (30 pts)

## Purpose
Provide full HL7 v2.x message handling for interoperability with legacy HIS/EMR systems.

## Message types supported
### ADT (Admit, Discharge, Transfer)
- `ADT^A01` – Admit
- `ADT^A02` – Transfer
- `ADT^A03` – Discharge
- `ADT^A04` – Register
- `ADT^A05` – Pre-Admit
- `ADT^A08` – Update
- `ADT^A40` – Merge

### ORM (Order)
- `ORM^O01` – General Order
- `ORM^O02` – Order Update

### ORU (Observation Result)
- `ORU^R01` – Observation Result (Unsolicited)

### Acknowledgement
- `ACK` – General acknowledgement
- `NACK` – Error acknowledgement

## Endpoints
- `POST /hl7/v2/message` – Receive HL7 message, parse, route
- `POST /hl7/v2/upload` – Batch file upload
- `GET /hl7/v2/log` – Message log

## Implementation
- `index.ts` – router, message receiver
- `parser.ts` – HL7 pipe-delimited string parser (segments/fields/components)
- `builder.ts` – HL7 message builder
- `router.ts` – routes parsed message to internal handlers
- `log.ts` – in-memory message log
- `messages/` – one file per message type with handlers
