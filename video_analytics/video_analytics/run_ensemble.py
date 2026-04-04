"""
=============================================================================
  SHOPLIFTING DETECTION - Best-of-Both-Models Pipeline
=============================================================================
  Runs TWO YOLOv8 models on each frame and keeps the BEST detections.
  
  Strategy:
    - Both models analyze every frame independently
    - For overlapping detections → keep the HIGHEST confidence one
    - If EITHER model detects shoplifting → ALERT is triggered immediately
    - No averaging that dilutes confidence scores
  
  Supports: Video files, Webcam, RTSP CCTV streams
  
  Usage:
    python run_ensemble.py                                          # default video
    python run_ensemble.py --video path/to/video.mp4                # video file
    python run_ensemble.py --webcam                                 # webcam
    python run_ensemble.py --rtsp "rtsp://ip:port/stream"           # CCTV stream
    python run_ensemble.py --video test.mp4 --confidence 0.15       # lower threshold
    python run_ensemble.py --video test.mp4 --save                  # save output
=============================================================================
"""

import os
import sys
import gc
import time
import argparse
import cv2
import torch
import numpy as np
from ultralytics import YOLO
from collections import deque
from datetime import datetime

# Try to import winsound for alert beep on Windows
try:
    import winsound
    HAS_WINSOUND = True
except ImportError:
    HAS_WINSOUND = False


# ============================================================================
# CONFIGURATION
# ============================================================================

# Model paths (absolute)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_1_PATH = os.path.join(BASE_DIR, "detect", "fast_20260312_095328", "weights", "best.pt")
MODEL_1_NAME = "Fast Model"

MODEL_2_PATH = os.path.join(BASE_DIR, "detect", "stable_150epochs", "weights", "best.pt")
MODEL_2_NAME = "Stable Model (150ep)"

# Detection settings
DEFAULT_CONFIDENCE = 0.15       # Lower threshold to catch more shoplifting
DEFAULT_IOU = 0.45
IMG_SIZE = 640

# Alert settings
ALERT_CONFIDENCE = 0.25         # Confidence above this triggers STRONG alert
ALERT_CONSECUTIVE_FRAMES = 2    # Consecutive shoplifting frames to trigger alert
ALERT_COOLDOWN_SECONDS = 5      # Seconds between alert sounds
ALERT_HISTORY_SIZE = 30         # Keep last N frames for alert logic

# NMS settings for merging cross-model detections
CROSS_MODEL_NMS_IOU = 0.50      # If two boxes overlap >50%, keep the best one


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def clear_gpu():
    """Clear GPU memory."""
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        gc.collect()


def play_alert_sound():
    """Play an alert beep sound (Windows only)."""
    if HAS_WINSOUND:
        try:
            winsound.Beep(1000, 300)  # 1000Hz for 300ms
        except Exception:
            pass


def compute_iou(box1, box2):
    """
    Compute IoU between two boxes [x1, y1, x2, y2].
    Used to detect overlapping predictions from different models.
    """
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter

    return inter / union if union > 0 else 0


def merge_best_detections(detections_m1, detections_m2, iou_threshold=0.50):
    """
    Merge detections from two models using BEST-OF-BOTH strategy.
    
    For overlapping boxes (same area, same class):
        → Keep the one with HIGHEST confidence
    
    For non-overlapping boxes:
        → Keep ALL of them (both models contribute unique detections)
    
    Args:
        detections_m1: List of dicts from Model 1
        detections_m2: List of dicts from Model 2
        iou_threshold: IoU threshold to consider two boxes as "same detection"
    
    Returns:
        List of merged detection dicts with 'bbox', 'conf', 'cls', 'cls_name', 'model'
    """
    all_dets = []
    used_m2 = set()

    for d1 in detections_m1:
        best = d1.copy()
        best_matched = False

        for j, d2 in enumerate(detections_m2):
            if j in used_m2:
                continue
            # Same class + overlapping box → keep highest confidence
            if d1['cls'] == d2['cls']:
                iou = compute_iou(d1['bbox'], d2['bbox'])
                if iou > iou_threshold:
                    used_m2.add(j)
                    best_matched = True
                    if d2['conf'] > d1['conf']:
                        best = d2.copy()
                        best['model'] = f"{d2['model']} (best)"
                    else:
                        best['model'] = f"{d1['model']} (best)"
                    break

        if not best_matched:
            best['model'] = d1['model']
        all_dets.append(best)

    # Add unmatched Model 2 detections (unique finds)
    for j, d2 in enumerate(detections_m2):
        if j not in used_m2:
            d2_copy = d2.copy()
            d2_copy['model'] = d2['model']
            all_dets.append(d2_copy)

    return all_dets


def extract_detections(results, model_name):
    """
    Extract detections from YOLO results into a clean list of dicts.
    
    Returns:
        List of dicts: [{bbox, conf, cls, cls_name, model}, ...]
    """
    detections = []
    for result in results:
        boxes = result.boxes
        if boxes is None or len(boxes) == 0:
            continue
        
        for i in range(len(boxes)):
            x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy().astype(int)
            conf = float(boxes.conf[i].cpu().numpy())
            cls = int(boxes.cls[i].cpu().numpy())
            cls_name = result.names[cls]
            
            detections.append({
                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                'conf': conf,
                'cls': cls,
                'cls_name': cls_name,
                'model': model_name,
            })
    
    return detections


# ============================================================================
# VISUALIZATION
# ============================================================================

def draw_detections(frame, detections, frame_count, total_frames, fps_display, 
                    alert_active, shoplifting_total, normal_total):
    """
    Draw all detections and HUD on the frame.
    """
    h, w = frame.shape[:2]
    annotated = frame.copy()

    shoplifting_in_frame = 0
    normal_in_frame = 0

    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        conf = det['conf']
        cls_name = det['cls_name']
        model = det['model']
        is_shoplifting = cls_name.lower() == 'shoplifting'

        if is_shoplifting:
            shoplifting_in_frame += 1
            color = (0, 0, 255)       # Red
            thickness = 3
        else:
            normal_in_frame += 1
            color = (0, 200, 0)       # Green
            thickness = 2

        # Draw bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, thickness)

        # Corner accents for shoplifting
        if is_shoplifting:
            corner_len = min(25, (x2 - x1) // 4, (y2 - y1) // 4)
            cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), (0, 0, 255), 4)
            cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), (0, 0, 255), 4)
            cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), (0, 0, 255), 4)
            cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), (0, 0, 255), 4)
            cv2.line(annotated, (x1, y2), (x1 + corner_len, y2), (0, 0, 255), 4)
            cv2.line(annotated, (x1, y2), (x1, y2 - corner_len), (0, 0, 255), 4)
            cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), (0, 0, 255), 4)
            cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), (0, 0, 255), 4)

        # Label with confidence and model source
        label = f"{cls_name.upper()} {conf:.0%}"
        model_label = f"[{model}]"
        
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
        
        # Label background
        label_y = max(y1 - 8, lh + 8)
        cv2.rectangle(annotated, (x1, label_y - lh - 6), (x1 + lw + 6, label_y + 2), color, -1)
        cv2.putText(annotated, label, (x1 + 3, label_y - 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)

        # Model source (smaller, below the box)
        cv2.putText(annotated, model_label, (x1, y2 + 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1, cv2.LINE_AA)

        # Confidence bar
        bar_w = x2 - x1
        filled = int(bar_w * conf)
        cv2.rectangle(annotated, (x1, y2 + 2), (x2, y2 + 6), (80, 80, 80), -1)
        cv2.rectangle(annotated, (x1, y2 + 2), (x1 + filled, y2 + 6), color, -1)

    # ==================== ALERT BANNER ====================
    if alert_active:
        # Flashing red banner
        flash = (int(time.time() * 4) % 2 == 0)  # Flash 4x per second
        alpha = 0.85 if flash else 0.6
        banner_color = (0, 0, 230) if flash else (0, 0, 180)
        
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (w, 65), banner_color, -1)
        cv2.addWeighted(overlay, alpha, annotated, 1 - alpha, 0, annotated)

        alert_text = "!! SHOPLIFTING DETECTED !!"
        (tw, th), _ = cv2.getTextSize(alert_text, cv2.FONT_HERSHEY_SIMPLEX, 1.3, 3)
        tx = (w - tw) // 2
        ty = 45
        # Shadow
        cv2.putText(annotated, alert_text, (tx + 2, ty + 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 4, cv2.LINE_AA)
        # White text
        cv2.putText(annotated, alert_text, (tx, ty),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.3, (255, 255, 255), 3, cv2.LINE_AA)

        # Red border
        if flash:
            cv2.rectangle(annotated, (0, 0), (w - 1, h - 1), (0, 0, 255), 5)

    # ==================== INFO HUD (top-left) ====================
    hud_lines = []
    
    progress = ""
    if total_frames > 0:
        pct = frame_count / total_frames * 100
        progress = f" ({pct:.0f}%)"
    hud_lines.append(f"Frame: {frame_count}{progress}")
    hud_lines.append(f"FPS: {fps_display:.1f}")
    hud_lines.append(f"Shoplifting: {shoplifting_total} total")
    hud_lines.append(f"This frame: {shoplifting_in_frame} alert / {normal_in_frame} normal")

    # Background
    hud_h = len(hud_lines) * 24 + 16
    hud_w_px = 320
    hud_y_start = 70 if alert_active else 8
    
    overlay = annotated.copy()
    cv2.rectangle(overlay, (8, hud_y_start), (8 + hud_w_px, hud_y_start + hud_h), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.65, annotated, 0.35, 0, annotated)
    cv2.rectangle(annotated, (8, hud_y_start), (8 + hud_w_px, hud_y_start + hud_h), (60, 60, 60), 1)

    for i, line in enumerate(hud_lines):
        y = hud_y_start + 22 + i * 24
        cv2.putText(annotated, line, (16, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1, cv2.LINE_AA)

    # ==================== DETECTION BADGES (top-right) ====================
    if shoplifting_in_frame > 0:
        badge_text = f"SHOPLIFTING: {shoplifting_in_frame}"
        cv2.rectangle(annotated, (w - 210, 8), (w - 10, 35), (0, 0, 200), -1)
        cv2.putText(annotated, badge_text, (w - 205, 28),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)

    return annotated, shoplifting_in_frame


# ============================================================================
# MAIN PIPELINE
# ============================================================================

def run_pipeline(source, confidence, save_output, save_path, show_display, max_frames):
    """
    Main detection pipeline.
    
    Runs BOTH models on each frame, keeps the BEST detection for
    overlapping boxes, and triggers alerts on shoplifting.
    """
    
    print("=" * 70)
    print("  SHOPLIFTING DETECTION - Best-of-Both-Models")
    print("=" * 70)
    
    # ==================== DEVICE SETUP ====================
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        gpu_mem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"\n🖥️  GPU: {gpu_name} ({gpu_mem:.1f} GB)")
    else:
        print("\n⚠️  Running on CPU (slower)")
    
    # ==================== LOAD MODELS ====================
    print(f"\n📦 Loading models...")
    
    # Validate paths
    for name, path in [(MODEL_1_NAME, MODEL_1_PATH), (MODEL_2_NAME, MODEL_2_PATH)]:
        if not os.path.exists(path):
            print(f"❌ {name} not found: {path}")
            sys.exit(1)
        size_mb = os.path.getsize(path) / (1024**2)
        print(f"   ✓ {name}: {size_mb:.1f} MB")
    
    t0 = time.time()
    model1 = YOLO(MODEL_1_PATH)
    model1.to(device)
    print(f"   ✓ {MODEL_1_NAME} loaded ({time.time()-t0:.1f}s)")
    
    t0 = time.time()
    model2 = YOLO(MODEL_2_PATH)
    model2.to(device)
    print(f"   ✓ {MODEL_2_NAME} loaded ({time.time()-t0:.1f}s)")
    
    # Print class names
    print(f"\n🏷️  Classes (Model 1): {model1.names}")
    print(f"🏷️  Classes (Model 2): {model2.names}")
    
    # Warmup
    print(f"\n🔥 Warming up models...")
    dummy = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
    device_arg = 0 if device == "cuda" else "cpu"
    model1.predict(dummy, conf=0.5, verbose=False, device=device_arg)
    model2.predict(dummy, conf=0.5, verbose=False, device=device_arg)
    print(f"   ✓ Both models warmed up")
    clear_gpu()
    
    # ==================== OPEN VIDEO SOURCE ====================
    is_webcam = isinstance(source, int)
    is_rtsp = isinstance(source, str) and source.startswith("rtsp://")
    is_file = not is_webcam and not is_rtsp
    
    if is_file and not os.path.exists(source):
        print(f"\n❌ Video not found: {source}")
        sys.exit(1)
    
    print(f"\n📹 Opening: {source}")
    cap = cv2.VideoCapture(source)
    
    if not cap.isOpened():
        print(f"❌ Cannot open video source: {source}")
        sys.exit(1)
    
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) if is_file else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"   Resolution: {width}x{height} @ {fps} FPS")
    if total_frames > 0:
        duration = total_frames / fps
        print(f"   Duration: {duration:.1f}s ({total_frames} frames)")
    
    # Video writer
    writer = None
    if save_output:
        if not save_path:
            if is_file:
                base = os.path.splitext(os.path.basename(source))[0]
            else:
                base = "stream"
            save_path = f"shoplifting_output_{base}.mp4"
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(save_path, fourcc, fps, (width, height))
        print(f"   💾 Saving output to: {save_path}")
    
    print(f"\n🎯 Settings:")
    print(f"   Confidence: {confidence}")
    print(f"   Strategy: Best-of-Both-Models (highest confidence wins)")
    print(f"   Alert threshold: {ALERT_CONFIDENCE:.0%} confidence")
    
    print("\n" + "=" * 70)
    print("  CONTROLS: Q=Quit  SPACE=Pause  S=Screenshot")
    print("=" * 70)
    
    if is_file:
        input("\n  Press Enter to start...\n")
    
    # ==================== PROCESSING LOOP ====================
    frame_count = 0
    processed_count = 0
    shoplifting_total = 0
    normal_total = 0
    paused = False
    
    # Alert state
    alert_active = False
    alert_history = deque(maxlen=ALERT_HISTORY_SIZE)
    last_alert_sound = 0
    
    # FPS tracking
    fps_times = deque(maxlen=30)
    
    # Detection log
    detection_log = []
    
    try:
        while True:
            # Pause handling
            if paused:
                key = cv2.waitKey(100) & 0xFF
                if key == ord(' '):
                    paused = False
                    print("▶️  Resumed")
                elif key == ord('q'):
                    print("⚠️  Quit")
                    break
                continue
            
            # Read frame
            ret, frame = cap.read()
            if not ret:
                if is_file:
                    print("\n✓ Video finished")
                    break
                else:
                    time.sleep(0.1)
                    continue
            
            frame_count += 1
            
            if max_frames and frame_count > max_frames:
                print(f"\n✓ Reached {max_frames} frames")
                break
            
            # Periodic GPU cleanup
            if frame_count % 300 == 0:
                clear_gpu()
            
            processed_count += 1
            frame_start = time.time()
            
            # ========== RUN BOTH MODELS ==========
            with torch.no_grad():
                results1 = model1.predict(
                    frame, conf=confidence, iou=DEFAULT_IOU,
                    verbose=False, device=device_arg,
                    imgsz=IMG_SIZE, half=False,
                )
                results2 = model2.predict(
                    frame, conf=confidence, iou=DEFAULT_IOU,
                    verbose=False, device=device_arg,
                    imgsz=IMG_SIZE, half=False,
                )
            
            # Extract detections from each model
            dets_m1 = extract_detections(results1, MODEL_1_NAME)
            dets_m2 = extract_detections(results2, MODEL_2_NAME)
            
            # ========== MERGE: KEEP BEST ==========
            merged = merge_best_detections(dets_m1, dets_m2, CROSS_MODEL_NMS_IOU)
            
            # ========== ALERT LOGIC ==========
            frame_has_shoplifting = any(
                d['cls_name'].lower() == 'shoplifting' for d in merged
            )
            max_shoplifting_conf = max(
                (d['conf'] for d in merged if d['cls_name'].lower() == 'shoplifting'),
                default=0.0
            )
            
            alert_history.append(frame_has_shoplifting)
            
            # Count recent consecutive shoplifting frames
            consecutive = 0
            for val in reversed(alert_history):
                if val:
                    consecutive += 1
                else:
                    break
            
            # Activate alert if enough consecutive frames with shoplifting
            if consecutive >= ALERT_CONSECUTIVE_FRAMES and max_shoplifting_conf >= ALERT_CONFIDENCE:
                alert_active = True
                
                # Play sound (with cooldown)
                now = time.time()
                if now - last_alert_sound > ALERT_COOLDOWN_SECONDS:
                    last_alert_sound = now
                    play_alert_sound()
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    print(f"\n  🚨 ALERT [{timestamp}] Frame {frame_count}: "
                          f"Shoplifting detected! (conf: {max_shoplifting_conf:.0%})")
            elif consecutive == 0:
                alert_active = False
            
            # Update totals
            for d in merged:
                if d['cls_name'].lower() == 'shoplifting':
                    shoplifting_total += 1
                else:
                    normal_total += 1
                
                detection_log.append({
                    'frame': frame_count,
                    'class': d['cls_name'],
                    'conf': d['conf'],
                    'model': d['model'],
                    'bbox': d['bbox'],
                })
            
            # ========== DRAW ==========
            frame_time = time.time() - frame_start
            fps_times.append(frame_time)
            current_fps = 1.0 / np.mean(fps_times) if fps_times else 0
            
            annotated, _ = draw_detections(
                frame, merged, frame_count, total_frames,
                current_fps, alert_active, shoplifting_total, normal_total,
            )
            
            # Save frame
            if writer:
                writer.write(annotated)
            
            # Display
            if show_display:
                cv2.imshow("Shoplifting Detection (Best-of-Both)", annotated)
            
            # Keyboard
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("\n⚠️  Stopped by user")
                break
            elif key == ord(' '):
                paused = True
                print("⏸️  Paused - press SPACE to resume")
            elif key == ord('s'):
                ss_path = f"screenshot_{frame_count}.jpg"
                cv2.imwrite(ss_path, annotated)
                print(f"  📸 Screenshot: {ss_path}")
            
            # Progress
            if processed_count % 100 == 0:
                if total_frames > 0:
                    pct = frame_count / total_frames * 100
                    print(f"  Progress: {pct:.0f}% | "
                          f"Shoplifting: {shoplifting_total} | "
                          f"FPS: {current_fps:.1f}")
                else:
                    print(f"  Frames: {frame_count} | "
                          f"Shoplifting: {shoplifting_total} | "
                          f"FPS: {current_fps:.1f}")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cap.release()
        if writer:
            writer.release()
        if show_display:
            cv2.destroyAllWindows()
        clear_gpu()
    
    # ==================== FINAL REPORT ====================
    print("\n" + "=" * 70)
    print("  DETECTION REPORT")
    print("=" * 70)
    
    processed = max(processed_count, 1)
    avg_time = np.mean(list(fps_times)) * 1000 if fps_times else 0
    
    print(f"\n  📊 Frames processed: {processed_count}")
    print(f"  ⏱️  Avg inference: {avg_time:.0f}ms ({1000/avg_time:.1f} FPS)" if avg_time > 0 else "")
    print(f"\n  🔍 Total detections:")
    print(f"     Shoplifting: {shoplifting_total}")
    print(f"     Normal:      {normal_total}")
    
    if shoplifting_total > 0:
        # Find best shoplifting detection
        shoplifting_dets = [d for d in detection_log if d['class'].lower() == 'shoplifting']
        if shoplifting_dets:
            best = max(shoplifting_dets, key=lambda d: d['conf'])
            print(f"\n  🚨 SHOPLIFTING WAS DETECTED!")
            print(f"     Strongest detection: {best['conf']:.0%} confidence")
            print(f"     From: {best['model']}")
            print(f"     At frame: {best['frame']}")
    else:
        print(f"\n  ✅ No shoplifting detected")
    
    # Save log
    if detection_log:
        log_file = "shoplifting_detection_log.txt"
        with open(log_file, 'w') as f:
            f.write("=" * 70 + "\n")
            f.write("SHOPLIFTING DETECTION LOG\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Source: {source}\n")
            f.write(f"Confidence: {confidence}\n")
            f.write(f"Strategy: Best-of-Both-Models\n")
            f.write("=" * 70 + "\n\n")
            
            for det in detection_log:
                f.write(
                    f"Frame {det['frame']:6d} | "
                    f"{det['class']:15s} | "
                    f"Conf: {det['conf']:.4f} | "
                    f"Model: {det['model']:30s} | "
                    f"Box: {det['bbox']}\n"
                )
        print(f"\n  💾 Log saved: {log_file}")
    
    if save_output and save_path:
        print(f"  💾 Video saved: {save_path}")
    
    print("\n" + "=" * 70 + "\n")
    
    return detection_log


# ============================================================================
# CLI ENTRY POINT
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Shoplifting Detection - Best-of-Both-Models Pipeline",
    )
    
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--video", type=str, help="Video file path")
    source.add_argument("--webcam", action="store_true", help="Use webcam")
    source.add_argument("--rtsp", type=str, help="RTSP stream URL")
    source.add_argument("--image", type=str, help="Single image path")
    
    parser.add_argument("--confidence", type=float, default=DEFAULT_CONFIDENCE,
                        help=f"Confidence threshold (default: {DEFAULT_CONFIDENCE})")
    parser.add_argument("--save", action="store_true", help="Save output video")
    parser.add_argument("--save-path", type=str, help="Output path")
    parser.add_argument("--no-display", action="store_true", help="Headless mode")
    parser.add_argument("--max-frames", type=int, help="Max frames to process")
    
    args = parser.parse_args()
    
    # Determine source
    if args.webcam:
        input_source = 0
    elif args.rtsp:
        input_source = args.rtsp
    elif args.video:
        input_source = args.video
    elif args.image:
        # Single image mode
        print("\n🖼️  Single image mode")
        frame = cv2.imread(args.image)
        if frame is None:
            print(f"❌ Cannot load: {args.image}")
            sys.exit(1)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        device_arg = 0 if device == "cuda" else "cpu"
        
        m1 = YOLO(MODEL_1_PATH)
        m1.to(device)
        m2 = YOLO(MODEL_2_PATH)
        m2.to(device)
        
        with torch.no_grad():
            r1 = m1.predict(frame, conf=args.confidence, verbose=False, device=device_arg, imgsz=IMG_SIZE)
            r2 = m2.predict(frame, conf=args.confidence, verbose=False, device=device_arg, imgsz=IMG_SIZE)
        
        d1 = extract_detections(r1, MODEL_1_NAME)
        d2 = extract_detections(r2, MODEL_2_NAME)
        merged = merge_best_detections(d1, d2)
        
        for d in merged:
            print(f"  {d['cls_name']}: {d['conf']:.0%} [{d['model']}]")
        
        annotated, _ = draw_detections(frame, merged, 1, 1, 0, 
                                        any(d['cls_name'].lower()=='shoplifting' for d in merged),
                                        0, 0)
        
        out_path = args.save_path or f"output_{os.path.basename(args.image)}"
        cv2.imwrite(out_path, annotated)
        print(f"  💾 Saved: {out_path}")
        
        if not args.no_display:
            cv2.imshow("Detection", annotated)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        return
    else:
        # Default video
        default_videos = [
            "C:/Users/vrajr/Downloads/New folder (7)/shoplifting3.mp4",
            "C:/Users/vrajr/Downloads/WhatsApp Video 2026-03-10 at 00.45.09.mp4",
        ]
        input_source = None
        for v in default_videos:
            if os.path.exists(v):
                input_source = v
                break
        
        if not input_source:
            print("❌ No source specified. Use --video, --webcam, or --rtsp")
            sys.exit(1)
        print(f"📹 Using default: {os.path.basename(input_source)}")
    
    run_pipeline(
        source=input_source,
        confidence=args.confidence,
        save_output=args.save,
        save_path=args.save_path,
        show_display=not args.no_display,
        max_frames=args.max_frames,
    )


if __name__ == "__main__":
    main()
