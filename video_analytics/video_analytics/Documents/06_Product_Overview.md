# EyeSpot AI Product Overview & Architecture

## **1. Product Core Description**
EyeSpot Video Analytics is an enterprise-grade video inference platform that connects directly to existing IP/CCTV cameras via RTSP. It actively analyzes video streams frame-by-frame and applies sequential logic to issue real-time alerts for policy violations or security threats.

## **2. Modular Intelligence Domains**
The product is structured into specific detection modules, which can be toggled per camera depending on the environment:
- **Shoplifting & Theft:** Analyzes complex arm and body interactions to detect concealment movements.
- **Weapon Detection:** Immediate critical alerts for exposed firearms.
- **Retail Behavioral Intelligence:** Tracks zone occupancy (who is where, and for how long), monitoring the flow of people for operational insights.
- **Staff Compliance:** Detects phone usage (distraction), missing personnel (absence from register), and mask mandate compliance.

## **3. Architecture Stack**
### **3.1 Inference Engine (Backend)**
- **Language / Framework:** Python, FastAPI, PyTorch
- **Vision Models:** YOLOv8 (specifically optimized nano/pose variants for high FPS execution)
- **Tracker:** ByteTrack (Provides high-level persistence ID matching frame-to-frame).
- **Concurrency / Scaling:** Employs parallel ThreadPoolExecution and a Node Sharding strategy for distributing inference loads across multiple GPUs.

### **3.2 Database & Persistence**
- **System:** SQLite/PostgreSQL through SQLAlchemy async engine.
- **Data Logged:** Alerts, Person ID metadata, Timestamps, Severity levels, and associated camera metadata. No raw video is redundantly archived to protect privacy, only alert frames.

### **3.3 UI / Dashboard (Frontend)**
- **Framework:** React + Vite + TypeScript + Tailwind CSS
- **Features:** Dark mode optimized command center, live stream viewing (HLS/MJPEG bridged), WebSocket event history, zoning UI tool to draw "hotzones".

## **4. Data Flow**
Camera (RTSP) -> OpenCV Frame Streamer -> YOLO Inference -> Tracker Mapping -> Behavior Rule Engine -> SQLite Check & Alert Trigger -> WebSocket Push -> React Dashboard Component Update -> Mobile/Sound Notification.
