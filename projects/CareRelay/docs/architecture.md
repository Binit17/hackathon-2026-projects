# CareRelay Architecture

```mermaid
flowchart TD
    patient[Patient carries<br/>CareRelay Medical ID Card]
    qr[QR code<br/>links to patient snapshot]
    doctor[Doctor scans QR<br/>in browser]
    frontend[React + Vite Frontend<br/>projects/CareRelay/src/frontend]

    patient --> qr --> doctor --> frontend

    frontend -->|GET /api/patient/default| patientApi[Flask API<br/>/api/patient/default]
    frontend -->|POST /api/brief| briefApi[Flask API<br/>/api/brief]
    frontend -->|GET /api/drugs/interactions?meds=...| drugApi[Flask API<br/>/api/drugs/interactions]
    frontend -->|GET /api/qr/default| qrApi[Flask API<br/>/api/qr/default]

    subgraph backend[Python Flask Backend<br/>projects/CareRelay/src/backend]
        patientApi --> fhirParser[fhir_utils.py<br/>FHIR parser]
        briefApi --> aiBrief[ai_brief.py<br/>First visit brief service]
        drugApi --> drugCheck[drug_check.py<br/>Drug warning service]
        qrApi --> qrGenerator["qrcode[pil]<br/>QR PNG generator"]
    end

    fhirParser --> patientJson[(patient.json<br/>projects/CareRelay/src/data/patient.json)]
    patientJson --> synthea[Synthea FHIR R4 sample data<br/>original download:<br/>/Users/sanskriti/Downloads/synthea_sample_data_fhir_latest]

    aiBrief --> hf[Hugging Face Router API<br/>current: meta-llama/Llama-3.1-8B-Instruct<br/>evaluated preferred: aaditya/Llama3-OpenBioLLM-70B]
    aiBrief --> fallback[Deterministic fallback brief<br/>if Hugging Face fails]

    drugCheck --> openfda[OpenFDA Drug Label API<br/>https://api.fda.gov/drug/label.json]

    qrGenerator --> qrPng[Base64 PNG QR image<br/>data:image/png;base64,...]
    qrPng --> frontend

    classDef user fill:#f0fdfa,stroke:#00baa7,color:#0f172b;
    classDef app fill:#ffffff,stroke:#2f4f4f,color:#0f172b;
    classDef backend fill:#e6fffa,stroke:#0b4f4a,color:#0f172b;
    classDef external fill:#fff7ed,stroke:#f97316,color:#0f172b;
    classDef data fill:#eff6ff,stroke:#2563eb,color:#0f172b;

    class patient,qr,doctor user;
    class frontend app;
    class patientApi,briefApi,drugApi,qrApi,fhirParser,aiBrief,drugCheck,qrGenerator backend;
    class hf,openfda,synthea external;
    class patientJson,qrPng,fallback data;
```

## Data Sources

| Source | Used For | Location / Endpoint |
|---|---|---|
| Synthea FHIR R4 | Synthetic patient demographics, conditions, medications, labs, encounters, timeline | `projects/CareRelay/src/data/patient.json` |
| OpenFDA Drug Label API | Medication warning and interaction label text | `https://api.fda.gov/drug/label.json` |
| Hugging Face Router API | First-visit brief generation | `meta-llama/Llama-3.1-8B-Instruct` |
| Local QR generator | Patient ID card QR image | Flask `qrcode[pil]`, returned as base64 PNG |

## Notes

- No real patient data or PHI is used.
- OpenBioLLM (`aaditya/Llama3-OpenBioLLM-70B`) was evaluated as the preferred clinical model, but provider availability varied during testing.
- Drug warnings use OpenFDA label data instead of LLM-only reasoning.
- The QR code points to the frontend patient snapshot URL for the demo.
