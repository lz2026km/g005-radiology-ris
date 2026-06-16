# HL7 Message Handlers

Each message type has a dedicated handler file:
- `adt.ts` – ADT^A01–A40 (Admission, Discharge, Transfer, Update, Merge)
- `orm.ts` – ORM^O01 (Order messages)
- `oru.ts` – ORU^R01 (Observation results)
- `ack.ts` – ACK building utilities

All handlers are invoked via `router.ts` which dispatches based on MSH-9 (Message Type ^ Trigger Event).
