"""
Inference Pipeline Module
=========================
Orchestrates the complete ensemble inference workflow:
    1. Load models
    2. Run dual-model inference on each frame
    3. Merge predictions using WBF
    4. Visualize results
    5. Handle video streams (webcam, RTSP, file)

Usage:
    pipeline = InferencePipeline(config)
    pipeline.run_video("path/to/video.mp4")
    pipeline.run_image("path/to/image.jpg")
"""

import os
import gc
import time
import cv2
import torch
import numpy as np
from typing import List, Dict, Tuple, Optional, Union
from collections import OrderedDict

from .model_loader import ModelLoader
from .prediction_merger import PredictionMerger
from .visualization import Visualizer


class InferencePipeline:
    """
    Production-ready ensemble inference pipeline for shoplifting detection.

    Combines predictions from two YOLO models using Weighted Box Fusion
    and provides real-time video stream processing with GPU optimization.
    """

    def __init__(
        self,
        model_paths: List[str],
        model_names: Optional[Dict[str, str]] = None,
        model_weights: Optional[List[float]] = None,
        confidence: float = 0.20,
        iou_threshold: float = 0.45,
        wbf_iou_threshold: float = 0.55,
        wbf_skip_threshold: float = 0.01,
        wbf_conf_type: str = 'avg',
        img_size: int = 640,
        use_half: bool = False,
        device: Optional[str] = None,
        process_every_n: int = 1,
        gpu_clear_interval: int = 200,
    ):
        """
        Initialize the ensemble inference pipeline.

        Args:
            model_paths: Paths to YOLOv8 .pt weight files.
            model_names: Optional friendly names for each model.
            model_weights: Weights for ensemble fusion.
            confidence: Minimum confidence threshold.
            iou_threshold: IoU threshold for per-model NMS.
            wbf_iou_threshold: IoU threshold for WBF fusion.
            wbf_skip_threshold: Min confidence for WBF output.
            wbf_conf_type: WBF confidence calculation method.
            img_size: Inference image size.
            use_half: Enable FP16 half-precision.
            device: Force device (None=auto-detect).
            process_every_n: Process every Nth frame.
            gpu_clear_interval: Clear GPU memory every N frames.
        """
        self.model_paths = model_paths
        self.model_names = model_names or {}
        self.model_weights = model_weights
        self.confidence = confidence
        self.iou_threshold = iou_threshold
        self.img_size = img_size
        self.use_half = use_half
        self.process_every_n = process_every_n
        self.gpu_clear_interval = gpu_clear_interval

        # Initialize model loader
        self.loader = ModelLoader(
            model_paths=model_paths,
            model_names=model_names,
            device=device,
            half=use_half,
        )

        # Load models
        self.models = self.loader.load_all(warmup=True, img_size=img_size)
        self.device = self.loader.get_device()
        self.class_names = self.loader.get_class_names()

        # Determine number of classes
        self.num_classes = len(self.class_names)

        # Initialize prediction merger
        self.merger = PredictionMerger(
            num_classes=self.num_classes,
            model_weights=model_weights,
            iou_threshold=wbf_iou_threshold,
            skip_box_threshold=wbf_skip_threshold,
            conf_type=wbf_conf_type,
        )

        # Initialize visualizer
        self.visualizer = Visualizer(
            class_names=self.class_names,
        )

        # Statistics tracking
        self._reset_stats()

        print(f"\n🔗 Merge method: {self.merger.get_merge_method()}")
        print(f"🎯 Confidence threshold: {self.confidence}")
        print(f"📐 Inference size: {self.img_size}px")
        print(f"⚖️  Model weights: {self.model_weights}")

    def _reset_stats(self):
        """Reset all tracking statistics."""
        self.stats = {
            "total_frames": 0,
            "processed_frames": 0,
            "shoplifting_frames": 0,
            "normal_frames": 0,
            "shoplifting_detections": 0,
            "normal_detections": 0,
            "total_detections": 0,
            "avg_inference_time": 0.0,
            "inference_times": [],
            "alert_active": False,
            "alert_cooldown": 0,
            "consecutive_shoplifting": 0,
        }

    def _clear_gpu_memory(self):
        """Clear GPU memory cache to prevent fragmentation."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()

    def infer_single_frame(
        self, frame: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Run ensemble inference on a single frame.

        This is the core method that:
        1. Runs both models on the same frame
        2. Fuses predictions using WBF
        3. Returns unified detection results

        Args:
            frame: Input BGR image as numpy array.

        Returns:
            Tuple of:
                - boxes: (N, 4) pixel-coordinate detections [x1,y1,x2,y2]
                - scores: (N,) confidence scores
                - labels: (N,) class indices
                - inference_time: Total inference time in seconds
        """
        h, w = frame.shape[:2]
        start_time = time.time()

        # Run inference on all models
        all_results = []
        for model in self.models:
            with torch.no_grad():
                results = model.predict(
                    frame,
                    conf=self.confidence,
                    iou=self.iou_threshold,
                    verbose=False,
                    device=self.device if self.device == "cpu" else 0,
                    half=self.use_half,
                    imgsz=self.img_size,
                )
            all_results.append(results)

        # Merge predictions using WBF
        boxes, scores, labels = self.merger.merge(
            all_results, img_width=w, img_height=h
        )

        inference_time = time.time() - start_time
        return boxes, scores, labels, inference_time

    def run_image(
        self,
        image_path: str,
        save_path: Optional[str] = None,
        show: bool = True,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Run ensemble inference on a single image.

        Args:
            image_path: Path to input image.
            save_path: Optional path to save annotated output.
            show: Whether to display the result.

        Returns:
            Tuple of (boxes, scores, labels).
        """
        print(f"\n🖼️  Running ensemble inference on: {image_path}")

        # Load image
        frame = cv2.imread(image_path)
        if frame is None:
            raise FileNotFoundError(f"Could not load image: {image_path}")

        h, w = frame.shape[:2]
        print(f"   Image size: {w}x{h}")

        # Run inference
        boxes, scores, labels, inf_time = self.infer_single_frame(frame)

        print(f"   Inference time: {inf_time*1000:.1f} ms")
        print(f"   Detections: {len(boxes)}")

        # Count by class
        for i in range(len(boxes)):
            class_name = self.class_names.get(int(labels[i]), "unknown")
            print(f"     - {class_name}: {scores[i]:.2%} confidence")

        # Visualize
        annotated = self.visualizer.draw_detections(frame, boxes, scores, labels)

        # Check for shoplifting
        shoplifting_count = sum(
            1 for i in range(len(labels))
            if self.class_names.get(int(labels[i]), "").lower() == "shoplifting"
        )
        if shoplifting_count > 0:
            annotated = self.visualizer.draw_alert_banner(annotated)

        # Save if requested
        if save_path:
            cv2.imwrite(save_path, annotated)
            print(f"   💾 Saved to: {save_path}")

        # Show if requested
        if show:
            cv2.imshow("Ensemble Detection", annotated)
            print("   Press any key to close...")
            cv2.waitKey(0)
            cv2.destroyAllWindows()

        return boxes, scores, labels

    def run_video(
        self,
        source: Union[str, int],
        save_path: Optional[str] = None,
        show: bool = True,
        max_frames: Optional[int] = None,
    ) -> Dict:
        """
        Run ensemble inference on a video stream.

        Supports:
            - Video files (MP4, AVI, etc.)
            - Webcam (source=0)
            - RTSP streams (source="rtsp://...")

        Args:
            source: Video file path, webcam index, or RTSP URL.
            save_path: Optional path to save annotated output video.
            show: Whether to display frames in a window.
            max_frames: Optional maximum number of frames to process.

        Returns:
            Dict with detection statistics.
        """
        self._reset_stats()

        # Determine source type
        if isinstance(source, int):
            source_type = "WEBCAM"
            source_name = f"Camera {source}"
        elif str(source).startswith("rtsp://"):
            source_type = "RTSP"
            source_name = source
        else:
            source_type = "FILE"
            source_name = os.path.basename(str(source))
            if not os.path.exists(str(source)):
                raise FileNotFoundError(f"Video file not found: {source}")

        print("\n" + "=" * 70)
        print("ENSEMBLE VIDEO INFERENCE")
        print("=" * 70)
        print(f"\n📹 Source: {source_name} ({source_type})")

        # Open video
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open video source: {source}")

        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps if fps > 0 and total_frames > 0 else 0

        print(f"   Resolution: {width}x{height}")
        print(f"   FPS: {fps}")
        if total_frames > 0:
            print(f"   Total frames: {total_frames}")
            print(f"   Duration: {duration:.1f}s")

        # Setup video writer for saving output
        video_writer = None
        if save_path:
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            effective_fps = fps // self.process_every_n
            video_writer = cv2.VideoWriter(
                save_path, fourcc, effective_fps, (width, height)
            )
            print(f"   💾 Saving output to: {save_path}")

        print(f"\n🎯 Settings:")
        print(f"   Confidence: {self.confidence}")
        print(f"   Process every: {self.process_every_n} frame(s)")
        print(f"   Merge method: {self.merger.get_merge_method()}")
        print(f"   Model weights: {self.model_weights}")

        print("\n" + "=" * 70)
        print("CONTROLS: Q=Quit  SPACE=Pause  S=Screenshot")
        print("=" * 70 + "\n")

        # Alert tracking
        consecutive_shoplifting = 0
        alert_cooldown = 0
        alert_active = False
        ALERT_THRESHOLD = 3       # Frames to trigger alert
        ALERT_COOLDOWN = 30       # Cooldown after alert

        # Processing loop
        frame_count = 0
        processed_count = 0
        paused = False
        detection_log = []

        try:
            while True:
                if paused:
                    key = cv2.waitKey(100) & 0xFF
                    if key == ord(' '):
                        paused = False
                        print("▶️  Resumed")
                    elif key == ord('q'):
                        print("⚠️  Stopped by user")
                        break
                    continue

                ret, frame = cap.read()
                if not ret:
                    if source_type in ["WEBCAM", "RTSP"]:
                        print("⚠️  Stream interrupted, retrying...")
                        time.sleep(1)
                        continue
                    else:
                        print("\n✓ Video finished")
                        break

                frame_count += 1
                self.stats["total_frames"] = frame_count

                # Check max frames
                if max_frames and frame_count > max_frames:
                    print(f"\n✓ Reached max frames ({max_frames})")
                    break

                # Skip frames based on processing interval
                if frame_count % self.process_every_n != 0:
                    continue

                processed_count += 1
                self.stats["processed_frames"] = processed_count

                # Periodic GPU memory cleanup
                if processed_count % self.gpu_clear_interval == 0:
                    self._clear_gpu_memory()

                # ========== ENSEMBLE INFERENCE ==========
                boxes, scores, labels, inf_time = self.infer_single_frame(frame)

                self.stats["inference_times"].append(inf_time)
                self.stats["total_detections"] += len(boxes)

                # Count detections by class
                frame_has_shoplifting = False
                shoplifting_count = 0
                normal_count = 0

                for i in range(len(labels)):
                    class_name = self.class_names.get(int(labels[i]), "unknown")
                    if class_name.lower() == "shoplifting":
                        frame_has_shoplifting = True
                        shoplifting_count += 1
                        self.stats["shoplifting_detections"] += 1
                    else:
                        normal_count += 1
                        self.stats["normal_detections"] += 1

                    # Log detection
                    detection_log.append({
                        "frame": frame_count,
                        "class": class_name,
                        "confidence": float(scores[i]),
                        "bbox": boxes[i].tolist(),
                    })

                if frame_has_shoplifting:
                    self.stats["shoplifting_frames"] += 1
                    consecutive_shoplifting += 1
                else:
                    consecutive_shoplifting = max(0, consecutive_shoplifting - 1)
                    if normal_count > 0:
                        self.stats["normal_frames"] += 1

                # Alert logic
                if alert_cooldown > 0:
                    alert_cooldown -= 1
                    if alert_cooldown == 0:
                        alert_active = False

                if consecutive_shoplifting >= ALERT_THRESHOLD and not alert_active:
                    alert_active = True
                    alert_cooldown = ALERT_COOLDOWN
                    print(f"\n🚨 ALERT: Shoplifting detected! (Frame {frame_count})")

                # ========== VISUALIZATION ==========
                annotated = self.visualizer.draw_detections(frame, boxes, scores, labels)

                # Detection count badges
                annotated = self.visualizer.draw_detection_count(
                    annotated, shoplifting_count, normal_count
                )

                # Alert banner
                if alert_active:
                    flash = (frame_count % 10) < 5  # Flash every 5 frames
                    annotated = self.visualizer.draw_alert_banner(
                        annotated, flash=flash
                    )

                # Info HUD
                avg_inf = (
                    np.mean(self.stats["inference_times"][-30:]) * 1000
                    if self.stats["inference_times"] else 0
                )
                effective_fps = 1000.0 / avg_inf if avg_inf > 0 else 0

                progress_str = ""
                if total_frames > 0:
                    progress = (frame_count / total_frames) * 100
                    progress_str = f" ({progress:.1f}%)"

                hud_info = OrderedDict([
                    ("Frame", f"{frame_count}{progress_str}"),
                    ("Inference", f"{avg_inf:.0f}ms ({effective_fps:.1f} FPS)"),
                    ("Ensemble", self.merger.get_merge_method().split("(")[0].strip()),
                    ("Shoplifting", str(self.stats["shoplifting_detections"])),
                    ("Normal", str(self.stats["normal_detections"])),
                ])
                annotated = self.visualizer.draw_info_hud(annotated, hud_info)

                # Save frame to output video
                if video_writer:
                    video_writer.write(annotated)

                # Display
                if show:
                    cv2.imshow("Ensemble Shoplifting Detection", annotated)

                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("\n⚠️  Stopped by user")
                    break
                elif key == ord(' '):
                    paused = True
                    print("⏸️  Paused")
                elif key == ord('s'):
                    screenshot_path = f"screenshot_frame_{frame_count}.jpg"
                    cv2.imwrite(screenshot_path, annotated)
                    print(f"📸 Screenshot saved: {screenshot_path}")

                # Progress logging
                if processed_count % 100 == 0:
                    progress = (
                        f"{(frame_count/total_frames*100):.1f}%"
                        if total_frames > 0 else f"{frame_count} frames"
                    )
                    print(
                        f"  Progress: {progress} | "
                        f"Shoplifting: {self.stats['shoplifting_frames']} frames | "
                        f"Avg: {avg_inf:.0f}ms/frame"
                    )

        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
        except Exception as e:
            print(f"\n\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            cap.release()
            if video_writer:
                video_writer.release()
            if show:
                cv2.destroyAllWindows()
            self._clear_gpu_memory()

        # ========== FINAL STATISTICS ==========
        self._print_statistics(detection_log)

        return self.stats

    def _print_statistics(self, detection_log: list):
        """Print final detection statistics."""
        stats = self.stats
        processed = max(stats["processed_frames"], 1)

        avg_inf = (
            np.mean(stats["inference_times"]) * 1000
            if stats["inference_times"] else 0
        )

        print("\n" + "=" * 70)
        print("ENSEMBLE DETECTION RESULTS")
        print("=" * 70)

        print(f"\n📊 Processing Summary:")
        print(f"   Total frames: {stats['total_frames']}")
        print(f"   Processed frames: {processed}")
        print(f"   Avg inference time: {avg_inf:.1f} ms/frame")
        if avg_inf > 0:
            print(f"   Effective FPS: {1000/avg_inf:.1f}")

        print(f"\n🔍 Detection Summary:")
        print(f"   Total detections: {stats['total_detections']}")
        print(f"   Shoplifting detections: {stats['shoplifting_detections']}")
        print(f"   Normal detections: {stats['normal_detections']}")

        print(f"\n📹 Frame Analysis:")
        print(
            f"   Frames with shoplifting: {stats['shoplifting_frames']} "
            f"({stats['shoplifting_frames']/processed*100:.1f}%)"
        )
        print(
            f"   Frames with normal: {stats['normal_frames']} "
            f"({stats['normal_frames']/processed*100:.1f}%)"
        )

        print(f"\n⚖️  Ensemble Method: {self.merger.get_merge_method()}")
        print(f"   Model weights: {self.model_weights}")

        if stats["shoplifting_frames"] > 0:
            print(f"\n🚨 SHOPLIFTING WAS DETECTED in {stats['shoplifting_frames']} frames")
        else:
            print(f"\n✅ No shoplifting detected")

        # Save detection log
        if detection_log:
            log_file = "ensemble_detection_log.txt"
            with open(log_file, "w") as f:
                f.write("=" * 70 + "\n")
                f.write("ENSEMBLE SHOPLIFTING DETECTION LOG\n")
                f.write("=" * 70 + "\n\n")
                f.write(f"Models: {len(self.model_paths)}\n")
                f.write(f"Merge method: {self.merger.get_merge_method()}\n")
                f.write(f"Model weights: {self.model_weights}\n")
                f.write(f"Confidence: {self.confidence}\n\n")
                f.write(f"Total frames processed: {processed}\n")
                f.write(f"Total detections: {len(detection_log)}\n\n")
                f.write("-" * 70 + "\n")
                f.write("DETECTIONS:\n")
                f.write("-" * 70 + "\n")
                for det in detection_log:
                    f.write(
                        f"Frame {det['frame']:6d} | "
                        f"{det['class']:15s} | "
                        f"Conf: {det['confidence']:.4f} | "
                        f"Box: [{det['bbox'][0]:.0f}, {det['bbox'][1]:.0f}, "
                        f"{det['bbox'][2]:.0f}, {det['bbox'][3]:.0f}]\n"
                    )
            print(f"\n💾 Detection log saved to: {log_file}")

        print("\n" + "=" * 70 + "\n")

    def run_webcam(self, camera_id: int = 0, **kwargs):
        """Convenience method to run inference on a webcam."""
        return self.run_video(camera_id, **kwargs)

    def run_rtsp(self, rtsp_url: str, **kwargs):
        """Convenience method to run inference on an RTSP stream."""
        return self.run_video(rtsp_url, **kwargs)
