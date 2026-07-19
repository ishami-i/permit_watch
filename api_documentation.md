# PermitWatch Simulation API

Since, this is project directly based on the KUBAKA System which is the used system in every contraction related permits, where the engineers, project owners, and architects apply for contraction permits and Rwanda Housing Authority, which controls it and manage it, approves the contraction permits. This is Simulation to allow the whole PermitWatch to work with realistic contraction simulation.

## Base URL

```
http://localhost:5000
```

Host and port are configurable via environment variables (see
[Running the server](#running-the-server)).

## Authentication

None. This is a local simulation API with no auth layer.

---

## Endpoints

### `GET /`

Health check.

**Response `200 OK`**

```json
{
  "message": "PermitWatch Simulation API is running",
  "status": "success"
}
```

---

### `GET /api/permits`

Generates and returns a batch of simulated permit records.

**Query Parameters**

| Name    | Type | Required | Default | Notes                                                                       |
| ------- | ---- | -------- | ------- | --------------------------------------------------------------------------- |
| `count` | int  | No       | `10`    | Number of permits to generate. Must be a positive integer, capped at `500`. |

**Example requests**

```
GET /api/permits
GET /api/permits?count=25
```

**Response `200 OK`** — a JSON array of permit objects (see [Permit object](#permit-object)).

**Error responses**

| Status | Condition                   | Body                                                     |
| ------ | --------------------------- | -------------------------------------------------------- |
| `400`  | `count` is not an integer   | `{"error": "'count' must be an integer, got '<value>'"}` |
| `400`  | `count` is zero or negative | `{"error": "'count' must be a positive integer"}`        |
| `400`  | `count` exceeds `500`       | `{"error": "'count' cannot exceed 500"}`                 |

---

## Permit object

Each element of the array returned by `/api/permits` has this shape:

```json
{
  "permit_id": "PERMIT-00001",
  "timeline": {
    "submission_date": "2026-06-16",
    "resubmission_date": null,
    "response_date": "2026-06-26",
    "permit_issuance_date": "2026-06-26",
    "permit_expiration_date": "2028-06-25",
    "status": "Approved",
    "review_duration": 10
  },
  "applicant": {
    "full_name": "Mediatrice Mukarukundo",
    "national_id": "1200179841724867",
    "contact_info": {
      "phone_number": "+250358901291",
      "email_address": "mediatrice.mukarukundo16@gmail.com"
    }
  },
  "professional": {
    "engineer": {
      "name": "Florence Mukandinda",
      "license_number": "A5957/EC/IER/2001"
    },
    "architect": {
      "name": "Immaculée Nyirankundwa",
      "license_number": "A294/RIA/2014"
    },
    "surveyor": {
      "name": "Osée Rugabira",
      "certification_number": "LS98356"
    }
  },
  "property": {
    "property_id": "PROP-00001",
    "upi": "3/04/09/2195",
    "physical_address": "WN 623 St, Plot 2195, Kirimbi, Nyamasheke, Western",
    "administrative_location": {
      "province": "Western",
      "district": "Nyamasheke",
      "sector": "Kirimbi"
    },
    "gis_coordinates": {
      "latitude": -1.701053,
      "longitude": 29.512227
    },
    "zoning": {
      "land_use_classification": "mixed-use",
      "permitted_building_rights": "offices and apartments",
      "environmental_protection_boundaries": "protected area",
      "urban_planning_restrictions": "heritage zone"
    }
  },
  "project": {
    "project_id": "PRJ-00001",
    "building_characteristics": {
      "building_purpose": "institutional",
      "number_of_floors": 16,
      "building_height": 64.0,
      "gross_floor_area": 1239.96
    },
    "financial_data": {
      "estimated_construction_cost": 1246159800.0,
      "permit_fee": 500669,
      "inspection_fee": 209495,
      "design_fee": 2961228,
      "survey_fee": 615757,
      "contingency_10_percent": 125044694.9,
      "total_estimated_cost": 1375491643.9,
      "currency": "RWF"
    }
  },
  "supervisor": {
    "full_name": "Beatha Nyiransabimana",
    "district": "Nyamasheke",
    "phone_number": "+250787123018"
  }
}
```

### Field reference

**`timeline`**
| Field | Type | Notes |
|---|---|---|
| `submission_date` | string (`YYYY-MM-DD`) | 1–60 days before "now" |
| `resubmission_date` | string or `null` | only set if `status` passed through "Resubmitted" |
| `response_date` | string or `null` | date the reviewing body responded |
| `permit_issuance_date` | string or `null` | only set if ultimately `"Approved"` |
| `permit_expiration_date` | string or `null` | issuance date + 730 days |
| `status` | `"Under review"` \| `"Approved"` \| `"Rejected"` | final status; `"Resubmitted"` always resolves to Approved/Rejected |
| `review_duration` | int | days between submission (or resubmission) and response |

**`applicant`** — synthetic identity: name, a 16-digit national-ID-style number, phone, email.

**`professional`** — engineer, architect, and surveyor, each with a name and a license/certification number in the following formats:

- Engineer: `[SerialBlock][Sequence]/[Discipline]/[Board]/[Year]` → `A2121/EC/IER/2024`
- Architect: `[SerialBlock][Sequence]/[Board]/[Year]` → `A034/RIA/2023`
- Surveyor: `[ProfessionCode][5-digit Sequence]` → `LS00377`

**`property`** — land parcel data: UPI, address, GPS coordinates within the correct bounding box for the property's province, and zoning rules.

**`project`** — building characteristics (purpose, floors, height, floor area) and a derived financial breakdown in RWF.

**`supervisor`** — the government supervisor assigned to the property's district, or `null` if no supervisor record covers that district.

---

## Running the server

```bash
pip install -r requirements.txt
python api_simulation/api_server.py
```

Environment variables (all optional):

| Variable      | Default   | Purpose                                  |
| ------------- | --------- | ---------------------------------------- |
| `FLASK_DEBUG` | `false`   | set to `true` to enable Flask debug mode |
| `HOST`        | `0.0.0.0` | interface to bind to                     |
| `PORT`        | `5000`    | port to listen on                        |

## Project layout

```
api_simulation
├── __pycache__
│   └── routes.cpython-314.pyc
├── api_server.py
├── data_generator
│   ├── __init__.py
│   ├── __pycache__
│   │   ├── __init__.cpython-314.pyc
│   │   ├── applicant.cpython-314.pyc
│   │   ├── permit.cpython-314.pyc
│   │   ├── professional.cpython-314.pyc
│   │   ├── project.cpython-314.pyc
│   │   ├── property.cpython-314.pyc
│   │   └── supervisor.cpython-314.pyc
│   ├── applicant.py
│   ├── permit.py
│   ├── professional.py
│   ├── project.py
│   ├── property.py
│   └── supervisor.py
├── requirement.txt
├── routes.py
└── sample_data
    ├── location.json
    ├── names.json
    └── supervisors.json

5 directories, 21 files
```
