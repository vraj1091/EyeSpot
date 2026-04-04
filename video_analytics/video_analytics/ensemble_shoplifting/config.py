"""
Configuration for Ensemble Shoplifting Detection Pipeline
=========================================================
Central config file for model paths, detection parameters,
ensemble weights, and video processing settings.
"""

import os

# ============================================================================
# MODEL CONFIGURATION
# ============================================================================

# Absolute paths to the two trained YOLOv8 model weights
MODEL_1_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "detect", "fast_20260312_095328", "weights", "best.pt"
)

MODEL_2_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "detect", "stable_150epochs", "weights", "best.pt"
)

# Model display names (for logging and visualization)
MODEL_NAMES = {
    MODEL_1_PATH: "Fast Model (fast_20260312)",
    MODEL_2_PATH: "Stable Model (150 epochs)",
}

# ============================================================================
# DETECTION PARAMETERS
# ============================================================================

# Minimum confidence threshold for individual model predictions
# Lower = more detections (higher recall, more false positives)
# Higher = fewer detections (higher precision, more misses)
CONFIDENCE_THRESHOLD = 0.20

# IoU threshold for NMS within each model's predictions
IOU_THRESHOLD = 0.45

# Input image size for inference (pixels)
# Both models should use the same size for consistent results
INFERENCE_IMG_SIZE = 640

# Enable half-precision (FP16) for faster GPU inference
# Set to False if you experience numerical instability
USE_HALF_PRECISION = False

# ============================================================================
# ENSEMBLE CONFIGURATION (Weighted Box Fusion)
# ============================================================================

# Weights for each model in the ensemble
# Higher weight = more influence on final predictions
# Model 1 (fast) gets slightly less weight, Model 2 (stable) gets more
MODEL_WEIGHTS = [0.45, 0.55]

# IoU threshold for WBF to decide if two boxes should be fused
WBF_IOU_THRESHOLD = 0.55

# Minimum confidence for a fused box to be kept in final output
WBF_SKIP_BOX_THRESHOLD = 0.01

# Confidence type for WBF:
#   'avg'        - Average of matched box confidences
#   'max'        - Maximum of matched box confidences
#   'box_and_model_avg' - Average considering both box and model weights
#   'absent_model_aware_avg' - Accounts for models that didn't detect the box
WBF_CONF_TYPE = 'avg'

# ============================================================================
# NMS FALLBACK CONFIGURATION
# (Used if ensemble-boxes library is not available)
# ============================================================================

# IoU threshold for NMS-based merging of cross-model predictions
NMS_IOU_THRESHOLD = 0.50

# ============================================================================
# VIDEO PROCESSING
# ============================================================================

# Process every Nth frame (1 = every frame, 2 = every other, etc.)
# Increase to improve throughput at the cost of temporal resolution
PROCESS_EVERY_N_FRAMES = 1

# Clear GPU memory cache every N processed frames
# Prevents GPU memory fragmentation on long videos
GPU_MEMORY_CLEAR_INTERVAL = 200

# Maximum display resolution (frames are resized for display only)
MAX_DISPLAY_WIDTH = 1280
MAX_DISPLAY_HEIGHT = 720

# ============================================================================
# VISUALIZATION
# ============================================================================

# Color scheme for detections (BGR format for OpenCV)
COLORS = {
    "shoplifting": (0, 0, 255),      # Red - HIGH ALERT
    "normal": (0, 255, 0),           # Green - Normal behavior
    "default": (255, 165, 0),        # Orange - Unknown class
    "alert_bg": (0, 0, 200),         # Dark red - Alert banner
    "info_bg": (50, 50, 50),         # Dark gray - Info overlay
    "text": (255, 255, 255),         # White - Text color
}

# Font settings
FONT_SCALE_LABEL = 0.6
FONT_SCALE_INFO = 0.7
FONT_SCALE_ALERT = 1.2
FONT_THICKNESS = 2

# ============================================================================
# OUTPUT / LOGGING
# ============================================================================

# Save annotated output video
SAVE_OUTPUT_VIDEO = True
OUTPUT_VIDEO_CODEC = "mp4v"

# Save detection log to text file
SAVE_DETECTION_LOG = True
DETECTION_LOG_FILE = "ensemble_detection_log.txt"

# Print per-frame detection details to console
VERBOSE_LOGGING = False

# ============================================================================
# ALERT SYSTEM
# ============================================================================

# Consecutive frames with shoplifting to trigger a persistent alert
ALERT_FRAME_THRESHOLD = 3

# Cooldown frames after an alert before a new one can be triggered
ALERT_COOLDOWN_FRAMES = 30
