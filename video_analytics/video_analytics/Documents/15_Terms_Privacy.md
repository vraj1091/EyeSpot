# Terms of Service & Privacy Protocol

## 1. Scope of Service
EyeSpot Video Analytics grants the Client a non-exclusive, non-transferable right to access the web-based monitoring platform and inference engine.

## 2. Data Privacy & Handling (Critical for Security SaaS)
EyeSpot Video Analytics maintains strict compliance with major data privacy jurisdictions. 
- **No Remote Video Storage:** The EyeSpot AI engine processes video on edge hardware or within localized boundaries. Raw video is analyzed in RAM and fundamentally destroyed frame-by-frame. 
- **Alert Metadata:** Only snapshot thumbnails containing detected violations (threats) are stored in the database for auditing protocols (e.g. `alert_image.jpg`).
- **Anonymization:** Faces are strictly utilized for object-matching via the ByteTrack algorithm in the volatile memory space, and biometric profiles (facial recognition databases) are fundamentally *not* matched against out-of-the-box system templates without explicit prior client consent and legal compliance formatting.

## 3. System Uptime Guidelines
Given the mission-critical nature of the software, EyeSpot guarantees a 99.9% uptime for the centralized Web Application dashboard, excepting edge-node failure resulting from power losses, camera degradation, or third-party hardware failures on the client's premises.

## 4. Limitation of Liability
EyeSpot Video Analytics provides security software meant to assist loss prevention personnel and management. Ultimately, EyeSpot does not guarantee the stoppage of a crime, nor does it assume legal liability for uncaptured crimes, unnotified authorities, or physical damages accrued on the client's premise. 
