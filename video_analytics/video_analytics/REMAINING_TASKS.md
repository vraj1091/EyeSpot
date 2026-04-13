# EyeSpot — Remaining Tasks
> Last updated: 2026-04-13
> Based on the Master Execution Plan from the multi-industry expansion session.

---

## ✅ ALREADY DONE (No action needed)

| # | What's Done | Where |
|---|-------------|-------|
| ✅ | `industry_mode` column added to Camera model | `backend/app/models/camera.py` line 50 |
| ✅ | `zone_type` column added to DetectionZone model | `backend/app/models/detection_zone.py` line 22 |
| ✅ | `ppe_detection_service.py` created | `backend/app/services/` |
| ✅ | `zone_intelligence_service.py` created | `backend/app/services/` |
| ✅ | `fall_detection_service.py` created | `backend/app/services/` |
| ✅ | `migrate_multi_industry.py` created | `backend/` |
| ✅ | `industry_mode` field added to frontend `Camera` type | `frontend/src/types/index.ts` line 23 |
| ✅ | `industries` array added to portfolio store | `portfolio_site/src/store/useStore.ts` |
| ✅ | `updateIndustries` action wired in store | `portfolio_site/src/store/useStore.ts` |
| ✅ | 8 industries pre-populated in store | `portfolio_site/src/store/useStore.ts` |

---

## ❌ STILL REMAINING

---

### PHASE 1 — Database Migration

- [ ] **Run the migration script** to add new columns to the live DB:
  ```powershell
  cd backend
  python migrate_multi_industry.py
  ```
  Verify 13 new camera columns + 3 zone columns are added.

- [ ] **Verify 37 alert types** loaded:
  ```powershell
  python -c "from app.models.alert import AlertType; print(len(AlertType.__members__))"
  ```
  Expected output: `37`

---

### PHASE 2 — PPE Model Download

- [ ] Download a **PPE YOLOv8 model** from [Roboflow Universe](https://universe.roboflow.com/search?q=ppe%20detection%20yolov8)
  - Classes needed: `Hardhat`, `NO-Hardhat`, `Safety Vest`, `NO-Safety Vest`, `Person`
- [ ] Place it at: `backend/model/ppe_yolov8.pt`
- [ ] Verify it loads:
  ```powershell
  cd backend
  python -c "from ultralytics import YOLO; m = YOLO('model/ppe_yolov8.pt'); print(m.names)"
  ```
- [ ] Update `PPE_CLASSES` dict in `backend/app/services/ppe_detection_service.py` lines 29–40 to match the class IDs from your downloaded model.

---

### PHASE 4 — Frontend Type Updates

- [ ] **Add new Camera fields** in `frontend/src/types/index.ts` — after `industry_mode` (line 23), add:
  ```typescript
  ppe_detection_enabled: boolean
  ppe_detection_confidence: number
  fall_detection_enabled: boolean
  restricted_zone_enabled: boolean
  forklift_detection_enabled: boolean
  counting_enabled: boolean
  patient_monitoring_enabled: boolean
  aggression_detection_enabled: boolean
  fire_smoke_detection_enabled: boolean
  crowd_density_enabled: boolean
  queue_management_enabled: boolean
  queue_threshold: number
  ```

- [ ] **Add new `DetectionZone` fields** in `frontend/src/types/index.ts`:
  ```typescript
  zone_type: 'detection' | 'queue' | 'restricted' | 'crowd' | 'counting' | 'bed' | 'door'
  area_m2: number
  density_threshold: number
  ```

- [ ] **Add new `DashboardStats` fields** in `frontend/src/types/index.ts`:
  ```typescript
  ppe_detection_enabled: boolean
  fall_detection_enabled: boolean
  queue_management_enabled: boolean
  crowd_density_enabled: boolean
  fire_smoke_detection_enabled: boolean
  ```

- [ ] Verify TypeScript compiles after changes:
  ```powershell
  cd frontend && npx tsc --noEmit
  ```

---

### PHASE 5 — API Route Updates

#### `backend/app/routes/cameras.py`
- [ ] Find the `CameraCreate` or `CameraUpdate` Pydantic class and add:
  ```python
  industry_mode: Optional[str] = "retail"
  ppe_detection_enabled: Optional[bool] = False
  ppe_detection_confidence: Optional[int] = 50
  fall_detection_enabled: Optional[bool] = False
  restricted_zone_enabled: Optional[bool] = False
  forklift_detection_enabled: Optional[bool] = False
  counting_enabled: Optional[bool] = False
  patient_monitoring_enabled: Optional[bool] = False
  aggression_detection_enabled: Optional[bool] = False
  fire_smoke_detection_enabled: Optional[bool] = False
  crowd_density_enabled: Optional[bool] = False
  queue_management_enabled: Optional[bool] = False
  queue_threshold: Optional[int] = 5
  ```
- [ ] Update the camera serialization (`to_dict` / response model) to include new fields in API responses.

#### `backend/app/routes/companies.py`
- [ ] Add new detection features to the features endpoint:
  ```python
  "ppe_detection": {"name": "PPE Compliance", "description": "Hard hat & vest detection"},
  "fall_detection": {"name": "Fall Detection", "description": "Trajectory-based fall detection"},
  "queue_management": {"name": "Queue Management", "description": "Alert on queue overflow"},
  "crowd_density": {"name": "Crowd Density", "description": "Monitor per-zone density"},
  "fire_smoke_detection": {"name": "Fire & Smoke", "description": "Early fire/smoke warning"},
  ```

#### `backend/app/routes/detection_zones.py`
- [ ] Update create/update requests to accept `zone_type`, `area_m2`, and `density_threshold`.

---

### PHASE 6 — Frontend Camera Settings UI

File: `frontend/src/pages/Cameras.tsx`

- [ ] Add an **Industry Mode dropdown** to the camera edit/create form:
  ```tsx
  <select value={camera.industry_mode} onChange={...}>
    <option value="retail">🛒 Retail</option>
    <option value="construction">🏗️ Construction</option>
    <option value="warehouse">📦 Warehouse</option>
    <option value="pharma">💊 Pharmaceutical</option>
    <option value="manufacturing">🏭 Manufacturing</option>
    <option value="healthcare">🏥 Healthcare</option>
    <option value="smart_cities">🏙️ Smart Cities</option>
    <option value="energy">⚡ Energy</option>
  </select>
  ```

- [ ] **Conditionally show detection toggles** based on `industry_mode`:
  - PPE toggle → only for `construction`, `manufacturing`
  - Fall detection toggle → only for `construction`, `healthcare`
  - Queue management toggle → only for `retail`
  - Restricted zone toggle → all industries

- [ ] Add **Zone Type selector** to the detection zones dialog:
  ```tsx
  <select value={zone.zone_type}>
    <option value="detection">Standard Detection</option>
    <option value="queue">Queue Zone</option>
    <option value="restricted">Restricted Zone</option>
    <option value="crowd">Crowd Density Zone</option>
    <option value="counting">Counting Line</option>
    <option value="bed">Bed/Station Zone</option>
    <option value="door">Door/Entry Zone</option>
  </select>
  ```

---

### PHASE 7 — Dashboard Backend Stats

File: `backend/app/routes/dashboard.py`

- [ ] Replace the hardcoded `ppe_violations=0` (line 165) with a **real DB query**:
  ```python
  'ppe_violations': db.query(Alert).filter(
      Alert.alert_type.in_(['hard_hat_violation', 'safety_vest_violation']),
      Alert.created_at >= today_start
  ).count(),
  ```
- [ ] Add new stat counts to the dashboard response:
  - `falls_detected` — alert types: `fall_detected`, `patient_fall`
  - `queue_overflows` — alert type: `queue_overflow`
  - `zone_breaches` — alert type: `restricted_zone_breach`

File: `frontend/src/pages/Dashboard.tsx` (or `CyberDashboard.tsx`)

- [ ] Add **new stat cards** to the dashboard UI:
  - PPE Violations Today
  - Falls Detected Today
  - Queue Overflows Today
  - Zone Breaches Today

File: `frontend/src/pages/Alerts.tsx`

- [ ] Show correct **icons and labels** for new alert types in the alert list.

---

### PHASE 8 — Portfolio Site Sync

File: `portfolio_site/src/store/useStore.ts`

- [ ] Update `industries` array statuses:
  - **Retail** → `live` ✅ (already done)
  - **Construction** → change to `live` once PPE model is downloaded and tested
  - **Warehousing** → change to `pilot` (zone intelligence is ready)
  - Others stay `coming-soon`

File: `portfolio_site/src/pages/Home.tsx`

- [ ] Replace hardcoded industry cards with **dynamic data from store** (`useStore().industries`)
- [ ] Add `Live` / `Pilot` / `Coming Soon` status badges on industry cards

File: `portfolio_site/src/pages/Products.tsx`

- [ ] Add **sticky industry tab bar** at top (Retail, Construction, Warehouse…)
- [ ] Group detections under their parent industry tab
- [ ] Add status badges per detection card

---

### PHASE 9 — Deployment / Docker

- [ ] Update `docker-compose.prod.yml` — add model volume mount:
  ```yaml
  backend:
    volumes:
      - backend_alert_images:/app/alert_images
      - ./backend/model:/app/model
  ```
- [ ] Update `backend/Dockerfile` — copy model directory:
  ```dockerfile
  COPY model/ /app/model/
  ```
- [ ] Create production `.env` with real keys:
  - `SECRET_KEY`, `DATABASE_URL`, `POSTGRES_PASSWORD`
  - `CORS_ORIGINS` = your production domain
  - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`

---

### PHASE 10 — Testing & Validation

- [ ] Test **shoplifting detection** end-to-end (baseline)
- [ ] Test **PPE detection** with a construction video
- [ ] Test **fall detection** with a falling-person test video
- [ ] Test **queue management** with zone_type = "queue" and threshold = 3
- [ ] Test **restricted zone** breach alert
- [ ] Test **crowd density** alert with area_m2 + density_threshold
- [ ] Validate:
  - Dashboard shows all new detection counts
  - Camera list UI shows `industry_mode` column
  - Creating a camera → industry dropdown appears
  - Detection features manager shows 15+ detection types
  - Alerts page filters by new types
  - Portfolio → Industries page → all 8 industries show
  - Portfolio → Book Demo → industry dropdown populated
  - Portfolio → Admin Panel → Industries tab CRUD works

---

### PHASE 11 — Business Readiness

- [ ] Record a **demo video** showing multi-industry capabilities
- [ ] Update `Documents/09_Sales_Pitch_Deck.md` with new industries
- [ ] Update `Documents/06_Product_Overview.md` with full detection list
- [ ] Update `Documents/11_Pricing_Sheet.csv` with industry-specific tiers
- [ ] Prepare **test videos** for each industry:
  - Retail: Shoplifting scenario
  - Construction: Workers without hard hats
  - Warehouse: Forklift near pedestrian
  - Healthcare: Patient fall simulation
- [ ] Set up **Telegram bot** for real-time alert notifications
- [ ] Configure **SMTP** for email alert delivery
- [ ] Create **3 demo company accounts** (Retail, Construction, Healthcare)

---

## Summary: Priority Order

> Start here if you're short on time:

1. **Phase 1** → Run `migrate_multi_industry.py` (10 min)
2. **Phase 2** → Download PPE model from Roboflow (30 min)
3. **Phase 4** → Add missing type fields to `frontend/src/types/index.ts` (15 min)
4. **Phase 5** → Update `cameras.py` API to accept new fields (20 min)
5. **Phase 6** → Add Industry dropdown + detection toggles to `Cameras.tsx` (30 min)
6. **Phase 7** → Wire real alert counts to dashboard (20 min)
7. **Phase 10** → End-to-end testing (60 min)
