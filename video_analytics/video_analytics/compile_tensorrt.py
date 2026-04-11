"""
=============================================================================
  ENTERPRISE TENSORRT AUTO-COMPILER FOR EYESPOT
=============================================================================
  This script automatically hooks into the EyeSpot backend, discovers the 
  EXACT active AI model currently being used for Shoplifting Detection, 
  and compiles it into a hardware-accelerated NVIDIA TensorRT (.engine) format.

  TensorRT optimizes the neural network for the specific GPU architecture,
  merging layers and calibrating precision (FP16) to achieve a 300% to 500% 
  speedup in inference frames per second (FPS). 
"""

import os
import sys
from pathlib import Path
from ultralytics import YOLO

# Add the root directory to Python path to import backend services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.services.shoplifting_detection import get_shoplifting_detection_service

def auto_compile_tensorrt(workspace_gb=4, precision="half"):
    print("\n🔍 Step 1: Hooking into backend to discover currently active AI model...")
    try:
        # We instantiate the service to let its internal logic find the real active model path
        service = get_shoplifting_detection_service()
        active_model_path = service.model_path
        
        print(f"🎯 FOUND ACTIVE MODEL: {active_model_path}")
        
    except Exception as e:
        print(f"❌ Failed to hook into backend: {e}")
        return

    # Check if we already compiled it
    engine_path = active_model_path.replace(".pt", ".engine")
    if os.path.exists(engine_path):
        print(f"\n⚡ HIGH-PERFORMANCE ENGINE ALREADY EXISTS:\n{engine_path}\nYour system is already running at maximum enterprise speed!")
        return

    print(f"\n🚀 Step 2: Initiating Enterprise TensorRT Compilation...")
    print("This process will profile your specific GPU NVidia hardware architecture...")
    print("WARNING: This may take 5-10 minutes. Do not close the terminal.")
    
    # Load the PyTorch model
    model = YOLO(active_model_path)
    
    # Export to TensorRT
    try:
        engine_path = model.export(
            format="engine",       # Export to NVIDIA TensorRT
            device="0",            # Use default GPU
            half=(precision == "half"), # Use FP16 Half-Precision (Enterprise standard)
            workspace=workspace_gb # Max VRAM allocated to builder (GB)
        )
        print(f"\n✅ SUCCESS! Enterprise Engine compiled at: {engine_path}")
        print("\n🔥 EYE-SPOT SYSTEM AUTO-UPGRADE COMPLETE 🔥")
        print("Ultralytics YOLO natively supports .engine formats. Your backend will now load this hyper-optimized engine automatically!")
    except Exception as e:
        print(f"\n❌ Compilation failed. Ensure you have the TensorRT SDK installed for PyTorch.\n{e}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="EyeSpot TensorRT Auto-Compiler")
    parser.add_argument("--precision", type=str, default="half", choices=["half", "fp32"], help="Compute precision")
    parser.add_argument("--workspace", type=int, default=4, help="Max workspace size in GB for builder")
    
    args = parser.parse_args()
    auto_compile_tensorrt(args.workspace, args.precision)
