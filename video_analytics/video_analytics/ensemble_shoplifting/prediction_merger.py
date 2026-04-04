"""
Prediction Merger Module
========================
Combines predictions from multiple YOLOv8 models using
Weighted Box Fusion (WBF) or NMS-based merging.

Ensures duplicate detections are removed and produces
a single unified set of bounding boxes, confidence scores,
and class labels.

Usage:
    merger = PredictionMerger(num_classes=2)
    fused_boxes, fused_scores, fused_labels = merger.merge(predictions_list)
"""

import numpy as np
from typing import List, Tuple, Dict, Optional
import warnings


class PredictionMerger:
    """
    Merges predictions from multiple object detection models.

    Supports:
        - Weighted Box Fusion (WBF) via ensemble-boxes library
        - NMS-based merging as a fallback

    WBF is preferred because it produces smoother, more accurate
    bounding boxes by taking a weighted average of overlapping
    detections, rather than simply suppressing duplicates.
    """

    def __init__(
        self,
        num_classes: int,
        model_weights: Optional[List[float]] = None,
        iou_threshold: float = 0.55,
        skip_box_threshold: float = 0.01,
        conf_type: str = 'avg',
        nms_iou_threshold: float = 0.50,
    ):
        """
        Initialize the prediction merger.

        Args:
            num_classes: Total number of detection classes.
            model_weights: Weight for each model in the ensemble.
                          Higher weight = more influence. Must sum to > 0.
            iou_threshold: IoU threshold for WBF box matching.
            skip_box_threshold: Minimum confidence for WBF output boxes.
            conf_type: WBF confidence calculation method
                      ('avg', 'max', 'box_and_model_avg', 'absent_model_aware_avg').
            nms_iou_threshold: IoU threshold for NMS fallback merging.
        """
        self.num_classes = num_classes
        self.model_weights = model_weights
        self.iou_threshold = iou_threshold
        self.skip_box_threshold = skip_box_threshold
        self.conf_type = conf_type
        self.nms_iou_threshold = nms_iou_threshold

        # Check if ensemble-boxes is available
        self.use_wbf = False
        try:
            from ensemble_boxes import weighted_boxes_fusion
            self.wbf_func = weighted_boxes_fusion
            self.use_wbf = True
        except ImportError:
            warnings.warn(
                "ensemble-boxes library not found. "
                "Falling back to NMS-based merging.\n"
                "Install with: pip install ensemble-boxes\n"
                "WBF is recommended for better accuracy."
            )

    def _extract_predictions(
        self, results, img_width: int, img_height: int
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Extract normalized boxes, scores, and labels from YOLO results.

        WBF requires boxes to be normalized to [0, 1] range.

        Args:
            results: YOLO prediction results object.
            img_width: Image width in pixels.
            img_height: Image height in pixels.

        Returns:
            Tuple of (boxes_norm, scores, labels) as numpy arrays.
            boxes_norm shape: (N, 4) with values in [0, 1]
            scores shape: (N,)
            labels shape: (N,)
        """
        boxes_list = []
        scores_list = []
        labels_list = []

        for result in results:
            boxes = result.boxes
            if boxes is None or len(boxes) == 0:
                continue

            # Extract xyxy coordinates and normalize to [0, 1]
            xyxy = boxes.xyxy.cpu().numpy()
            confs = boxes.conf.cpu().numpy()
            cls = boxes.cls.cpu().numpy()

            for i in range(len(xyxy)):
                x1, y1, x2, y2 = xyxy[i]

                # Normalize to [0, 1] range (required by WBF)
                x1_norm = np.clip(x1 / img_width, 0.0, 1.0)
                y1_norm = np.clip(y1 / img_height, 0.0, 1.0)
                x2_norm = np.clip(x2 / img_width, 0.0, 1.0)
                y2_norm = np.clip(y2 / img_height, 0.0, 1.0)

                # Ensure valid box (x2 > x1, y2 > y1)
                if x2_norm <= x1_norm or y2_norm <= y1_norm:
                    continue

                boxes_list.append([x1_norm, y1_norm, x2_norm, y2_norm])
                scores_list.append(float(confs[i]))
                labels_list.append(int(cls[i]))

        if len(boxes_list) == 0:
            return np.array([]).reshape(0, 4), np.array([]), np.array([])

        return (
            np.array(boxes_list, dtype=np.float32),
            np.array(scores_list, dtype=np.float32),
            np.array(labels_list, dtype=np.int32),
        )

    def merge_wbf(
        self,
        all_boxes: List[np.ndarray],
        all_scores: List[np.ndarray],
        all_labels: List[np.ndarray],
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Merge predictions using Weighted Box Fusion.

        WBF works by:
        1. Collecting all boxes from all models
        2. Matching overlapping boxes (above IoU threshold)
        3. Computing a weighted average of matched box coordinates
        4. Computing a weighted confidence score

        This produces smoother, more accurate boxes than NMS,
        which simply picks the highest-confidence box and discards others.

        Args:
            all_boxes: List of box arrays, one per model. Each (N, 4) normalized.
            all_scores: List of score arrays, one per model. Each (N,).
            all_labels: List of label arrays, one per model. Each (N,).

        Returns:
            Tuple of (fused_boxes, fused_scores, fused_labels).
        """
        # Handle edge case: all models returned empty predictions
        if all(len(b) == 0 for b in all_boxes):
            return np.array([]).reshape(0, 4), np.array([]), np.array([])

        # Prepare inputs for WBF (list of lists format)
        boxes_for_wbf = [b.tolist() if len(b) > 0 else [] for b in all_boxes]
        scores_for_wbf = [s.tolist() if len(s) > 0 else [] for s in all_scores]
        labels_for_wbf = [l.tolist() if len(l) > 0 else [] for l in all_labels]

        # Set default weights if not provided
        weights = self.model_weights
        if weights is None:
            weights = [1.0] * len(all_boxes)

        # Run Weighted Box Fusion
        fused_boxes, fused_scores, fused_labels = self.wbf_func(
            boxes_for_wbf,
            scores_for_wbf,
            labels_for_wbf,
            weights=weights,
            iou_thr=self.iou_threshold,
            skip_box_thr=self.skip_box_threshold,
            conf_type=self.conf_type,
        )

        return (
            np.array(fused_boxes, dtype=np.float32),
            np.array(fused_scores, dtype=np.float32),
            np.array(fused_labels, dtype=np.int32),
        )

    def merge_nms(
        self,
        all_boxes: List[np.ndarray],
        all_scores: List[np.ndarray],
        all_labels: List[np.ndarray],
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Merge predictions using Non-Maximum Suppression (fallback).

        Simply concatenates all predictions and runs class-aware NMS
        to remove duplicates. Less accurate than WBF but doesn't
        require the ensemble-boxes library.

        Args:
            all_boxes: List of box arrays, one per model.
            all_scores: List of score arrays, one per model.
            all_labels: List of label arrays, one per model.

        Returns:
            Tuple of (merged_boxes, merged_scores, merged_labels).
        """
        import torch

        # Concatenate all predictions
        valid_boxes = [b for b in all_boxes if len(b) > 0]
        valid_scores = [s for s in all_scores if len(s) > 0]
        valid_labels = [l for l in all_labels if len(l) > 0]

        if len(valid_boxes) == 0:
            return np.array([]).reshape(0, 4), np.array([]), np.array([])

        combined_boxes = np.concatenate(valid_boxes, axis=0)
        combined_scores = np.concatenate(valid_scores, axis=0)
        combined_labels = np.concatenate(valid_labels, axis=0)

        # Run class-aware NMS
        keep_indices = []
        unique_labels = np.unique(combined_labels)

        for cls_id in unique_labels:
            cls_mask = combined_labels == cls_id
            cls_boxes = combined_boxes[cls_mask]
            cls_scores = combined_scores[cls_mask]
            cls_indices = np.where(cls_mask)[0]

            # Convert to torch tensors for torchvision NMS
            boxes_tensor = torch.tensor(cls_boxes, dtype=torch.float32)
            scores_tensor = torch.tensor(cls_scores, dtype=torch.float32)

            from torchvision.ops import nms
            keep = nms(boxes_tensor, scores_tensor, self.nms_iou_threshold)
            keep_indices.extend(cls_indices[keep.numpy()].tolist())

        if len(keep_indices) == 0:
            return np.array([]).reshape(0, 4), np.array([]), np.array([])

        keep_indices = sorted(keep_indices)
        return (
            combined_boxes[keep_indices],
            combined_scores[keep_indices],
            combined_labels[keep_indices],
        )

    def merge(
        self,
        results_list: list,
        img_width: int,
        img_height: int,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Main merge interface. Takes raw YOLO results from multiple models
        and returns a single unified set of detections.

        Args:
            results_list: List of YOLO results, one per model.
                         Each element is the output of model.predict().
            img_width: Original image width in pixels.
            img_height: Original image height in pixels.

        Returns:
            Tuple of:
                - boxes: (N, 4) array of [x1, y1, x2, y2] in PIXEL coordinates
                - scores: (N,) array of confidence scores
                - labels: (N,) array of class indices
        """
        # Extract normalized predictions from each model
        all_boxes = []
        all_scores = []
        all_labels = []

        for results in results_list:
            boxes, scores, labels = self._extract_predictions(
                results, img_width, img_height
            )
            all_boxes.append(boxes)
            all_scores.append(scores)
            all_labels.append(labels)

        # Merge using WBF (preferred) or NMS (fallback)
        if self.use_wbf:
            fused_boxes, fused_scores, fused_labels = self.merge_wbf(
                all_boxes, all_scores, all_labels
            )
        else:
            fused_boxes, fused_scores, fused_labels = self.merge_nms(
                all_boxes, all_scores, all_labels
            )

        # Convert normalized boxes back to pixel coordinates
        if len(fused_boxes) > 0:
            fused_boxes[:, 0] *= img_width   # x1
            fused_boxes[:, 1] *= img_height  # y1
            fused_boxes[:, 2] *= img_width   # x2
            fused_boxes[:, 3] *= img_height  # y2

        return fused_boxes, fused_scores, fused_labels

    def get_merge_method(self) -> str:
        """Return the name of the active merge method."""
        return "Weighted Box Fusion (WBF)" if self.use_wbf else "NMS Merging"
