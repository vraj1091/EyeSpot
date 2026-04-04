# 🐧 VPS (Linux) Deployment Guide

This project is now fully optimized for deployment on a Linux VPS (Ubuntu/Debian recommended) using **CPU-only** libraries to minimize resource usage and installation headaches.

## 📋 Prerequisites
*   A Linux VPS (e.g., DigitalOcean, AWS EC2, Linode).
*   **Docker** and **Docker Compose** installed.
*   Your trained model (`best.pt`) ready to be uploaded.

## 🚀 Deployment Steps (The "Perfect" Way)

### 1. Upload Code & Model
Zip your project folder and upload it to your VPS. **Crucially**, ensure your trained `best.pt` model is placed in the `video_analytics/backend/` root directory.

### 2. Configure Environment
Update the `docker-compose.yml` file on your VPS:
*   Change `VITE_API_URL` in the frontend section to `http://YOUR_VPS_IP:8000`.
*   (Optional) Set a strong `SECRET_KEY`.

### 3. Run with Docker Compose
From the project root:
```bash
docker-compose up -d --build
```
This will:
*   Build the Backend with CPU-only PyTorch.
*   Pre-download standard YOLO models so the app starts instantly.
*   Build the Frontend using Nginx for high performance.
*   Set up data persistence for your database and alert images.

## 🛡️ Firewall & Ports
Ensure the following ports are open in your VPS firewall (e.g., `ufw`):
*   `80`: Public Frontend access.
*   `8000`: Backend API access (required for the frontend to communicate).

```bash
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
```

## 🧠 Memory Considerations
The YOLO models consume significant RAM (~2-3GB total across all active modules).
*   If your VPS has < 4GB RAM, we recommend adding a **Swap File** to prevent crashes.
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🛠️ Optimizations Applied
*   **CPU-Only PyTorch**: Used `--extra-index-url https://download.pytorch.org/whl/cpu` in `requirements.txt`.
*   **OpenCV Headless**: Used `opencv-python-headless` to avoid GUI dependency errors on Linux.
*   **Healthchecks**: Docker will now automatically monitor the health of your Backend.
*   **Absolute Paths**: Database and Image paths are automatically resolved regardless of where the app is called from.
