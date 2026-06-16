# Module 13.5 — DICOM Interoperability (25 pts)

## Purpose
Provide DICOMweb RESTful services for image management and a DIMSE proxy for legacy modality integration.

## Endpoints (DICOMweb)
### QIDO-RS (Query)
- `GET /dicom/studies` – query studies
- `GET /dicom/studies/:studyUid/series` – query series
- `GET /dicom/studies/:studyUid/series/:seriesUid/instances` – query instances

### STOW-RS (Store)
- `POST /dicom/studies` – store instances
- `POST /dicom/studies/:studyUid` – store to existing study

### WADO-RS (Retrieve)
- `GET /dicom/studies/:studyUid` – retrieve study metadata
- `GET /dicom/studies/:studyUid/series/:seriesUid` – retrieve series metadata
- `GET /dicom/studies/:studyUid/series/:seriesUid/instances/:instanceUid` – retrieve instance
- `GET /dicom/studies/:studyUid/series/:seriesUid/instances/:instanceUid/rendered` – rendered image (JPEG/PNG thumbnail)

### DIMSE Proxy
- `POST /dicom/dimse/echo` – C-ECHO (verification)
- `POST /dicom/dimse/store` – C-STORE proxy
- `POST /dicom/dimse/find` – C-FIND proxy
- `POST /dicom/dimse/move` – C-MOVE proxy

## Files
- `index.ts` – router entry
- `qido.ts` – QIDO-RS handlers
- `stow.ts` – STOW-RS handlers
- `wado.ts` – WADO-RS handlers
- `dimse.ts` – DIMSE proxy
- `store.ts` – in-memory DICOM object store
- `utils.ts` – DICOM tag helpers
