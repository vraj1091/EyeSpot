"""
Model Loader Module
===================
Handles loading, validation, and GPU placement of multiple
YOLOv8 models for ensemble inference.

Usage:
    loader = ModelLoader()
    models = loader.load_all()
"""

import os
import time
import torch
from ultralytics import YOLO
from typing import List, Dict, Optional, Tuple


class ModelLoader:
    """
    Loads and manages multiple YOLOv8 models for ensemble inference.
    
    Handles:
        - Model file validation
        - GPU/CPU device selection
        - Model warmup for consistent inference times
        - Memory-efficient loading
    """

    def __init__(
        self,
        model_paths: List[str],
        model_names: Optional[Dict[str, str]] = None,
        device: Optional[str] = None,
        half: bool = False,
    ):
        """
        Initialize the model loader.

        Args:
            model_paths: List of paths to YOLOv8 .pt weight files.
            model_names: Optional dict mapping path -> friendly name.
            device: Force device ('cuda', 'cpu', or None for auto-detect).
            half: Enable FP16 half-precision inference.
        """
        self.model_paths = model_paths
        self.model_names = model_names or {}
        self.half = half
        self.models: List[YOLO] = []
        self.class_names: Dict[int, str] = {}
        
        # Auto-detect device
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

    def _get_model_name(self, path: str) -> str:
        """Get a friendly name for a model."""
        return self.model_names.get(path, os.path.basename(path))

    def _validate_paths(self) -> None:
        """Validate that all model weight files exist."""
        for path in self.model_paths:
            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"Model weights not found: {path}\n"
                    f"Please check the path and ensure the file exists."
                )
            
            file_size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"  ✓ Found: {self._get_model_name(path)} ({file_size_mb:.1f} MB)")

    def _load_single_model(self, path: str) -> YOLO:
        """
        Load a single YOLOv8 model and move it to the target device.

        Args:
            path: Path to the .pt weight file.

        Returns:
            Loaded YOLO model instance.
        """
        name = self._get_model_name(path)
        print(f"  Loading {name}...")
        
        start_time = time.time()
        model = YOLO(path)
        
        # Move model to target device
        model.to(self.device)
        
        load_time = time.time() - start_time
        print(f"  ✓ {name} loaded in {load_time:.2f}s")
        
        return model

    def _warmup_models(self, img_size: int = 640) -> None:
        """
        Run a dummy inference pass to warm up models.
        
        This ensures CUDA kernels are compiled and cached,
        so the first real inference doesn't have startup latency.

        Args:
            img_size: Image size for the warmup pass.
        """
        import numpy as np
        
        print("\n  🔥 Warming up models...")
        dummy_frame = np.zeros((img_size, img_size, 3), dtype=np.uint8)
        
        for i, model in enumerate(self.models):
            name = self._get_model_name(self.model_paths[i])
            try:
                model.predict(
                    dummy_frame,
                    conf=0.5,
                    verbose=False,
                    device=self.device,
                    half=self.half,
                )
                print(f"  ✓ {name} warmed up")
            except Exception as e:
                print(f"  ⚠️  Warmup failed for {name}: {e}")
                print(f"      (This is usually fine, inference will still work)")

    def _extract_class_names(self) -> None:
        """
        Extract and validate class names across all models.
        
        Ensures all models share the same class mapping.
        Logs a warning if class names differ between models.
        """
        all_names = []
        for i, model in enumerate(self.models):
            names = model.names
            all_names.append(names)
            name = self._get_model_name(self.model_paths[i])
            print(f"  {name} classes: {names}")

        # Use the first model's class names as the reference
        self.class_names = all_names[0]

        # Warn if class mappings differ
        if len(all_names) > 1:
            for i in range(1, len(all_names)):
                if all_names[i] != all_names[0]:
                    print(
                        f"\n  ⚠️  WARNING: Class names differ between models!"
                        f"\n      Model 0: {all_names[0]}"
                        f"\n      Model {i}: {all_names[i]}"
                        f"\n      Using Model 0's class names as reference."
                    )

    def load_all(self, warmup: bool = True, img_size: int = 640) -> List[YOLO]:
        """
        Load all models, validate, warmup, and return them.

        Args:
            warmup: Run a warmup inference pass after loading.
            img_size: Image size for warmup pass.

        Returns:
            List of loaded YOLO model instances.
        """
        print("=" * 70)
        print("MODEL LOADER")
        print("=" * 70)
        
        # Device info
        print(f"\n📱 Device: {self.device.upper()}")
        if self.device == "cuda":
            gpu_name = torch.cuda.get_device_name(0)
            gpu_mem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            print(f"   GPU: {gpu_name} ({gpu_mem:.1f} GB)")
        
        print(f"   Half precision: {'Enabled' if self.half else 'Disabled'}")
        print(f"   Models to load: {len(self.model_paths)}\n")

        # Validate paths
        print("📂 Validating model files:")
        self._validate_paths()

        # Load models
        print("\n🔄 Loading models:")
        self.models = []
        total_start = time.time()
        
        for path in self.model_paths:
            model = self._load_single_model(path)
            self.models.append(model)

        total_time = time.time() - total_start
        print(f"\n  ✓ All {len(self.models)} models loaded in {total_time:.2f}s")

        # Extract class names
        print("\n🏷️  Class names:")
        self._extract_class_names()

        # Warmup
        if warmup:
            self._warmup_models(img_size)

        print("\n" + "=" * 70)
        print(f"✅ MODEL LOADER COMPLETE - {len(self.models)} models ready")
        print("=" * 70 + "\n")

        return self.models

    def get_device(self) -> str:
        """Return the device string."""
        return self.device

    def get_class_names(self) -> Dict[int, str]:
        """Return the unified class name mapping."""
        return self.class_names

    def get_models(self) -> List[YOLO]:
        """Return the loaded models."""
        return self.models

    def get_gpu_memory_info(self) -> Tuple[float, float]:
        """
        Get current GPU memory usage.

        Returns:
            Tuple of (allocated_mb, reserved_mb).
        """
        if self.device == "cuda" and torch.cuda.is_available():
            allocated = torch.cuda.memory_allocated(0) / (1024**2)
            reserved = torch.cuda.memory_reserved(0) / (1024**2)
            return allocated, reserved
        return 0.0, 0.0
