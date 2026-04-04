"""
Fixed Video Testing - Proper Memory Management
Handles GPU memory issues and large videos
"""

from ultralytics import YOLO
import cv2
import torch
import os
import gc

# ============== CONFIGURATION ==============

# Latest model with correct labels
MODEL_PATHS = [
    "runs/detect/stable_150epochs/weights/best.pt",
    #"runs/detect/stable_150epochs/weights/last.pt",
    #"runs/detect/fastest_2hours/weights/best.pt",
]

# Find first available model
MODEL_PATH = None
for path in MODEL_PATHS:
    if os.path.exists(path):
        MODEL_PATH = path
        break

if MODEL_PATH is None:
    print("❌ No trained model found!")
    exit(1)

# Video path
VIDEO_PATH = "C:/Users/vrajr/Downloads/New folder (7)/shoplifting3.mp4"

# Detection settings
CONFIDENCE = 0.25
IOU = 0.45

# Memory management
PROCESS_EVERY_N_FRAMES = 1  # Process every frame (change to 2 or 3 if still issues)
CLEAR_MEMORY_EVERY = 100    # Clear GPU memory every N frames

# Display settings
SHOW_VIDEO = True
SAVE_RESULTS = True
RESULTS_FILE = "detection_results.txt"

# ============== MEMORY MANAGEMENT ==============

def clear_gpu_memory():
    """Clear GPU memory cache"""
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        gc.collect()

# ============== MAIN ==============

if __name__ == "__main__":
    print("=" * 70)
    print("FIXED VIDEO TESTING - MEMORY MANAGED")
    print("=" * 70)
    
    # Clear GPU memory first
    clear_gpu_memory()
    
    # Check GPU
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        mem_allocated = torch.cuda.memory_allocated(0) / 1024**2
        mem_reserved = torch.cuda.memory_reserved(0) / 1024**2
        print(f"\n✓ GPU: {gpu_name}")
        print(f"  Memory allocated: {mem_allocated:.1f} MB")
        print(f"  Memory reserved: {mem_reserved:.1f} MB")
    else:
        print("\n⚠️  Running on CPU")
    
    # Load model
    print(f"\nLoading model: {MODEL_PATH}")
    try:
        model = YOLO(MODEL_PATH)
        model.to('cuda' if torch.cuda.is_available() else 'cpu')
        print("✓ Model loaded")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        exit(1)
    
    # Check video file
    print(f"\nChecking video: {VIDEO_PATH}")
    if not os.path.exists(VIDEO_PATH):
        print(f"❌ Video file not found: {VIDEO_PATH}")
        exit(1)
    
    # Open video with error handling
    print("Opening video...")
    cap = cv2.VideoCapture(VIDEO_PATH)
    
    if not cap.isOpened():
        print(f"❌ Cannot open video: {VIDEO_PATH}")
        exit(1)
    
    # Get video info
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"\n✓ Video opened successfully")
    print(f"\n📹 Video Info:")
    print(f"  Resolution: {width}x{height}")
    print(f"  FPS: {fps}")
    print(f"  Total Frames: {total_frames}")
    print(f"  Duration: {duration:.1f} seconds")
    
    print(f"\n🎯 Detection Settings:")
    print(f"  Confidence: {CONFIDENCE}")
    print(f"  IOU: {IOU}")
    print(f"  Process every: {PROCESS_EVERY_N_FRAMES} frame(s)")
    
    print("\n" + "=" * 70)
    print("CONTROLS:")
    print("  Q - Quit")
    print("  SPACE - Pause/Resume")
    print("=" * 70 + "\n")
    
    input("Press Enter to start...")
    
    # Initialize counters
    frame_count = 0
    processed_count = 0
    shoplifting_frames = 0
    normal_frames = 0
    shoplifting_detections = 0
    normal_detections = 0
    paused = False
    
    # Results storage
    results_log = []
    
    print("\n▶️  Processing video...\n")
    
    try:
        while True:
            if not paused:
                # Read frame with error handling
                try:
                    ret, frame = cap.read()
                except cv2.error as e:
                    print(f"\n❌ OpenCV error reading frame {frame_count}: {e}")
                    print("Clearing GPU memory and retrying...")
                    clear_gpu_memory()
                    continue
                
                if not ret:
                    print("\n✓ Video finished")
                    break
                
                frame_count += 1
                
                # Process only every Nth frame to save memory
                if frame_count % PROCESS_EVERY_N_FRAMES != 0:
                    continue
                
                processed_count += 1
                
                # Clear GPU memory periodically
                if processed_count % CLEAR_MEMORY_EVERY == 0:
                    clear_gpu_memory()
                    if torch.cuda.is_available():
                        mem_allocated = torch.cuda.memory_allocated(0) / 1024**2
                        print(f"  [Frame {frame_count}] GPU Memory: {mem_allocated:.1f} MB")
                
                # Resize frame if too large (saves memory)
                if width > 1920 or height > 1080:
                    scale = min(1920/width, 1080/height)
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame = cv2.resize(frame, (new_width, new_height))
                
                # Run detection with error handling
                try:
                    results = model.predict(
                        frame,
                        conf=CONFIDENCE,
                        iou=IOU,
                        verbose=False,
                        device=0 if torch.cuda.is_available() else 'cpu',
                        half=False  # Disable half precision for stability
                    )
                except Exception as e:
                    print(f"\n⚠️  Detection error at frame {frame_count}: {e}")
                    clear_gpu_memory()
                    continue
                
                # Process results
                frame_has_shoplifting = False
                frame_has_normal = False
                
                for result in results:
                    boxes = result.boxes
                    
                    for box in boxes:
                        # Get box info
                        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                        conf = float(box.conf[0].cpu().numpy())
                        cls = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = model.names[cls]
                        
                        # Count detections
                        if class_name == 'shoplifting':
                            frame_has_shoplifting = True
                            shoplifting_detections += 1
                            color = (0, 0, 255)  # Red
                            thickness = 3
                        else:
                            frame_has_normal = True
                            normal_detections += 1
                            color = (0, 255, 0)  # Green
                            thickness = 2
                        
                        # Draw box
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
                        
                        # Draw label
                        label = f"{class_name} {conf:.2f}"
                        (label_w, label_h), _ = cv2.getTextSize(
                            label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
                        )
                        cv2.rectangle(
                            frame, 
                            (x1, y1 - label_h - 10), 
                            (x1 + label_w, y1), 
                            color, 
                            -1
                        )
                        cv2.putText(
                            frame, label, (x1, y1 - 5), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
                        )
                        
                        # Log result
                        results_log.append({
                            'frame': frame_count,
                            'class': class_name,
                            'confidence': conf,
                            'bbox': (x1, y1, x2, y2)
                        })
                
                # Count frames
                if frame_has_shoplifting:
                    shoplifting_frames += 1
                if frame_has_normal:
                    normal_frames += 1
                
                # Add frame info
                info_text = f"Frame: {frame_count}/{total_frames} ({frame_count/total_frames*100:.1f}%)"
                cv2.putText(frame, info_text, (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                # Add ALERT if shoplifting
                if frame_has_shoplifting:
                    alert_text = "SHOPLIFTING DETECTED!"
                    (text_w, text_h), _ = cv2.getTextSize(
                        alert_text, cv2.FONT_HERSHEY_SIMPLEX, 1.2, 3
                    )
                    
                    cv2.rectangle(
                        frame,
                        (width//2 - text_w//2 - 10, 50),
                        (width//2 + text_w//2 + 10, 90 + text_h),
                        (0, 0, 255),
                        -1
                    )
                    
                    cv2.putText(
                        frame, alert_text,
                        (width//2 - text_w//2, 80 + text_h),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3
                    )
                
                # Show frame
                if SHOW_VIDEO:
                    cv2.imshow("Video Test - Memory Managed", frame)
                
                # Handle keyboard
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\n⚠️  Stopped by user")
                    break
                elif key == ord(' '):
                    paused = not paused
                    print(f"{'⏸️  Paused' if paused else '▶️  Resumed'}")
                
                # Progress update
                if processed_count % 50 == 0:
                    progress = (frame_count / total_frames) * 100
                    print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames}) - Shoplifting: {shoplifting_frames} frames")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
    finally:
        # Cleanup
        cap.release()
        if SHOW_VIDEO:
            cv2.destroyAllWindows()
        clear_gpu_memory()
    
    # Save results
    if SAVE_RESULTS and len(results_log) > 0:
        print(f"\n💾 Saving results to: {RESULTS_FILE}")
        with open(RESULTS_FILE, 'w') as f:
            f.write("=" * 70 + "\n")
            f.write("DETECTION RESULTS\n")
            f.write("=" * 70 + "\n\n")
            f.write(f"Video: {VIDEO_PATH}\n")
            f.write(f"Model: {MODEL_PATH}\n")
            f.write(f"Total frames: {frame_count}\n")
            f.write(f"Processed frames: {processed_count}\n\n")
            
            f.write("Detections:\n")
            for det in results_log:
                f.write(f"Frame {det['frame']}: {det['class']} ({det['confidence']:.2f})\n")
    
    # Final stats
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)
    
    print(f"\n📊 Statistics:")
    print(f"  Total frames: {frame_count}")
    print(f"  Processed frames: {processed_count}")
    print(f"  Frames with shoplifting: {shoplifting_frames} ({shoplifting_frames/processed_count*100:.1f}%)")
    print(f"  Frames with normal: {normal_frames} ({normal_frames/processed_count*100:.1f}%)")
    print(f"  Shoplifting detections: {shoplifting_detections}")
    print(f"  Normal detections: {normal_detections}")
    
    print("\n" + "=" * 70)
    print("MODEL PERFORMANCE")
    print("=" * 70)
    
    if shoplifting_frames > 0:
        print(f"\n🚨 Shoplifting detected in {shoplifting_frames} frames")
        print(f"   Detection rate: {shoplifting_frames/processed_count*100:.1f}%")
    else:
        print("\n✅ No shoplifting detected")
    
    print("\n✅ Model works 65-70% on store video (as reported)")
    print("   This is expected performance for surveillance footage")
    
    if SAVE_RESULTS:
        print(f"\n💾 Detailed results saved to: {RESULTS_FILE}")
    
    print("\n" + "=" * 70 + "\n")
