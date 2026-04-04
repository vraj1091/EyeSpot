"""
Ensemble Shoplifting Detection Pipeline
=======================================
Production-ready dual-model YOLOv8 ensemble inference system
for shoplifting detection using Weighted Box Fusion.

Modules:
    - model_loader: Loads and manages multiple YOLOv8 models
    - inference_pipeline: Runs inference on images/video frames
    - prediction_merger: Combines predictions using WBF/NMS
    - visualization: Draws detection results on frames
"""

__version__ = "1.0.0"
__author__ = "Video Analytics Team"
