# Module 13.7 — Integration Engine & Config (25 pts)

## Purpose
Provide a configurable integration engine that routes, transforms, and manages messages between internal modules and external systems.

## Components

### Channel Configuration
- `GET /integration/channels` – list all channels
- `POST /integration/channels` – create channel
- `PUT /integration/channels/:id` – update channel
- `DELETE /integration/channels/:id` – delete channel
- `POST /integration/channels/:id/start` – start channel
- `POST /integration/channels/:id/stop` – stop channel

### Message Routing
- `POST /integration/messages` – send message through engine
- `GET /integration/messages` – browse messages
- `GET /integration/messages/:id` – get message detail

### Transform Pipelines
- `POST /integration/transform` – test transform
- `GET /integration/transforms` – list transforms
- `POST /integration/transforms` – create transform
- `PUT /integration/transforms/:id` – update transform

### Engine Status
- `GET /integration/status` – overall engine health

## Transform types
- `hl7-to-fhir` – Convert HL7 to FHIR resource
- `fhir-to-hl7` – Convert FHIR to HL7 message
- `dicom-to-fhir` – DICOM metadata to FHIR ImagingStudy
- `json-transform` – JSON mapping transform
- `custom-script` – JS script transform

## Files
- `index.ts` – router entry
- `engine.ts` – core engine with pipeline executor
- `channels.ts` – channel CRUD + lifecycle
- `transforms.ts` – transform pipeline definitions
- `messages.ts` – message store
- `routes/` – channel message routing logic
