"""
Visualization Module
====================
Draws detection results on frames with professional-quality
overlays, alert banners, and informational HUD elements.

Usage:
    visualizer = Visualizer(class_names={0: 'shoplifting', 1: 'normal'})
    annotated_frame = visualizer.draw_detections(frame, boxes, scores, labels)
"""

import cv2
import numpy as np
from typing import Dict, Tuple, Optional


class Visualizer:
    """
    Draws detection results on video frames with production-quality
    visual elements including bounding boxes, class labels, confidence
    bars, alert banners, and an informational HUD overlay.
    """

    # Default color scheme (BGR for OpenCV)
    DEFAULT_COLORS = {
        "shoplifting": (0, 0, 255),      # Red
        "normal": (0, 255, 0),           # Green
        "default": (255, 165, 0),        # Orange
        "alert_bg": (0, 0, 200),         # Dark red
        "info_bg": (50, 50, 50),         # Dark gray
        "text": (255, 255, 255),         # White
    }

    def __init__(
        self,
        class_names: Dict[int, str],
        colors: Optional[Dict[str, Tuple[int, int, int]]] = None,
        font_scale_label: float = 0.6,
        font_scale_info: float = 0.7,
        font_scale_alert: float = 1.2,
        font_thickness: int = 2,
    ):
        """
        Initialize the visualizer.

        Args:
            class_names: Mapping of class index -> class name string.
            colors: Optional custom color dict. Falls back to DEFAULT_COLORS.
            font_scale_label: Font scale for detection labels.
            font_scale_info: Font scale for info HUD.
            font_scale_alert: Font scale for alert banner.
            font_thickness: Font thickness for text rendering.
        """
        self.class_names = class_names
        self.colors = colors or self.DEFAULT_COLORS
        self.font_scale_label = font_scale_label
        self.font_scale_info = font_scale_info
        self.font_scale_alert = font_scale_alert
        self.font_thickness = font_thickness
        self.font = cv2.FONT_HERSHEY_SIMPLEX

    def _get_class_color(self, class_name: str) -> Tuple[int, int, int]:
        """Get the color for a class name, with fallback to default."""
        return self.colors.get(class_name.lower(), self.colors.get("default", (255, 165, 0)))

    def _draw_rounded_rect(
        self,
        img: np.ndarray,
        pt1: Tuple[int, int],
        pt2: Tuple[int, int],
        color: Tuple[int, int, int],
        thickness: int = -1,
        radius: int = 8,
    ) -> np.ndarray:
        """Draw a rectangle with rounded corners."""
        x1, y1 = pt1
        x2, y2 = pt2

        # Clamp radius
        max_radius = min(abs(x2 - x1), abs(y2 - y1)) // 2
        radius = min(radius, max_radius)

        if thickness == -1:
            # Filled rounded rectangle
            overlay = img.copy()
            # Main body
            cv2.rectangle(overlay, (x1 + radius, y1), (x2 - radius, y2), color, -1)
            cv2.rectangle(overlay, (x1, y1 + radius), (x2, y2 - radius), color, -1)
            # Corners
            cv2.circle(overlay, (x1 + radius, y1 + radius), radius, color, -1)
            cv2.circle(overlay, (x2 - radius, y1 + radius), radius, color, -1)
            cv2.circle(overlay, (x1 + radius, y2 - radius), radius, color, -1)
            cv2.circle(overlay, (x2 - radius, y2 - radius), radius, color, -1)
            # Blend for slight transparency
            cv2.addWeighted(overlay, 0.85, img, 0.15, 0, img)
        else:
            cv2.rectangle(img, pt1, pt2, color, thickness)

        return img

    def draw_bbox(
        self,
        frame: np.ndarray,
        x1: int, y1: int, x2: int, y2: int,
        class_name: str,
        confidence: float,
    ) -> np.ndarray:
        """
        Draw a single detection bounding box with label.

        Args:
            frame: Input image (BGR).
            x1, y1, x2, y2: Box coordinates in pixels.
            class_name: Detection class name.
            confidence: Detection confidence score.

        Returns:
            Annotated frame.
        """
        color = self._get_class_color(class_name)
        is_alert = class_name.lower() == "shoplifting"
        thickness = 3 if is_alert else 2

        # Draw main bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

        # Draw corner accents for shoplifting detections
        if is_alert:
            corner_len = min(30, (x2 - x1) // 4, (y2 - y1) // 4)
            corner_thickness = 4
            # Top-left
            cv2.line(frame, (x1, y1), (x1 + corner_len, y1), color, corner_thickness)
            cv2.line(frame, (x1, y1), (x1, y1 + corner_len), color, corner_thickness)
            # Top-right
            cv2.line(frame, (x2, y1), (x2 - corner_len, y1), color, corner_thickness)
            cv2.line(frame, (x2, y1), (x2, y1 + corner_len), color, corner_thickness)
            # Bottom-left
            cv2.line(frame, (x1, y2), (x1 + corner_len, y2), color, corner_thickness)
            cv2.line(frame, (x1, y2), (x1, y2 - corner_len), color, corner_thickness)
            # Bottom-right
            cv2.line(frame, (x2, y2), (x2 - corner_len, y2), color, corner_thickness)
            cv2.line(frame, (x2, y2), (x2, y2 - corner_len), color, corner_thickness)

        # Label background
        label = f"{class_name.upper()} {confidence:.0%}"
        (label_w, label_h), baseline = cv2.getTextSize(
            label, self.font, self.font_scale_label, self.font_thickness
        )

        label_y_start = max(y1 - label_h - 12, 0)
        label_y_end = max(y1, label_h + 12)

        # Draw label background with slight transparency
        frame = self._draw_rounded_rect(
            frame,
            (x1, label_y_start),
            (x1 + label_w + 10, label_y_end),
            color,
            thickness=-1,
            radius=4,
        )

        # Draw label text
        cv2.putText(
            frame, label,
            (x1 + 5, label_y_end - 4),
            self.font, self.font_scale_label,
            self.colors.get("text", (255, 255, 255)),
            self.font_thickness,
            cv2.LINE_AA,
        )

        # Draw confidence bar below the box
        bar_width = x2 - x1
        bar_height = 4
        bar_y = y2 + 4
        filled_width = int(bar_width * confidence)

        cv2.rectangle(frame, (x1, bar_y), (x2, bar_y + bar_height), (100, 100, 100), -1)
        cv2.rectangle(frame, (x1, bar_y), (x1 + filled_width, bar_y + bar_height), color, -1)

        return frame

    def draw_detections(
        self,
        frame: np.ndarray,
        boxes: np.ndarray,
        scores: np.ndarray,
        labels: np.ndarray,
    ) -> np.ndarray:
        """
        Draw all detections on a frame.

        Args:
            frame: Input image (BGR).
            boxes: (N, 4) array of [x1, y1, x2, y2] pixel coordinates.
            scores: (N,) array of confidence scores.
            labels: (N,) array of class indices.

        Returns:
            Annotated frame with all detections drawn.
        """
        if len(boxes) == 0:
            return frame

        annotated = frame.copy()

        for i in range(len(boxes)):
            x1, y1, x2, y2 = map(int, boxes[i])
            confidence = float(scores[i])
            class_idx = int(labels[i])
            class_name = self.class_names.get(class_idx, f"class_{class_idx}")

            annotated = self.draw_bbox(
                annotated, x1, y1, x2, y2, class_name, confidence
            )

        return annotated

    def draw_alert_banner(
        self,
        frame: np.ndarray,
        message: str = "⚠ SHOPLIFTING DETECTED!",
        flash: bool = False,
    ) -> np.ndarray:
        """
        Draw a prominent alert banner at the top of the frame.

        Args:
            frame: Input image (BGR).
            message: Alert message text.
            flash: If True, makes the banner more prominent (for animation).

        Returns:
            Frame with alert banner.
        """
        h, w = frame.shape[:2]
        banner_height = 60

        # Create semi-transparent red banner
        overlay = frame.copy()
        alpha = 0.9 if flash else 0.75

        cv2.rectangle(overlay, (0, 0), (w, banner_height), (0, 0, 220), -1)
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

        # Draw alert text centered
        (text_w, text_h), _ = cv2.getTextSize(
            message, self.font, self.font_scale_alert, 3
        )
        text_x = (w - text_w) // 2
        text_y = (banner_height + text_h) // 2

        # Shadow
        cv2.putText(
            frame, message, (text_x + 2, text_y + 2),
            self.font, self.font_scale_alert, (0, 0, 0), 3, cv2.LINE_AA,
        )
        # Main text
        cv2.putText(
            frame, message, (text_x, text_y),
            self.font, self.font_scale_alert,
            (255, 255, 255), 3, cv2.LINE_AA,
        )

        # Red border flash effect
        if flash:
            cv2.rectangle(frame, (0, 0), (w - 1, h - 1), (0, 0, 255), 4)

        return frame

    def draw_info_hud(
        self,
        frame: np.ndarray,
        info: Dict[str, str],
        position: str = "top-left",
    ) -> np.ndarray:
        """
        Draw an informational HUD overlay on the frame.

        Args:
            frame: Input image (BGR).
            info: Dict of label -> value pairs to display.
            position: Where to place the HUD ('top-left', 'bottom-left').

        Returns:
            Frame with info HUD overlay.
        """
        if not info:
            return frame

        h, w = frame.shape[:2]
        line_height = 25
        padding = 10
        max_text_width = 0

        # Calculate HUD dimensions
        lines = []
        for key, value in info.items():
            text = f"{key}: {value}"
            (tw, th), _ = cv2.getTextSize(text, self.font, 0.5, 1)
            max_text_width = max(max_text_width, tw)
            lines.append(text)

        hud_width = max_text_width + 2 * padding + 10
        hud_height = len(lines) * line_height + 2 * padding

        # Position
        if position == "top-left":
            hud_x, hud_y = 10, 10
        elif position == "bottom-left":
            hud_x, hud_y = 10, h - hud_height - 10
        else:
            hud_x, hud_y = 10, 10

        # Draw semi-transparent background
        overlay = frame.copy()
        cv2.rectangle(
            overlay,
            (hud_x, hud_y),
            (hud_x + hud_width, hud_y + hud_height),
            (30, 30, 30), -1,
        )
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

        # Draw border
        cv2.rectangle(
            frame,
            (hud_x, hud_y),
            (hud_x + hud_width, hud_y + hud_height),
            (80, 80, 80), 1,
        )

        # Draw text lines
        for i, text in enumerate(lines):
            text_y = hud_y + padding + (i + 1) * line_height - 5
            cv2.putText(
                frame, text, (hud_x + padding, text_y),
                self.font, 0.5, (200, 200, 200), 1, cv2.LINE_AA,
            )

        return frame

    def draw_detection_count(
        self,
        frame: np.ndarray,
        shoplifting_count: int,
        normal_count: int,
    ) -> np.ndarray:
        """
        Draw detection count badges on the frame.

        Args:
            frame: Input image (BGR).
            shoplifting_count: Number of shoplifting detections.
            normal_count: Number of normal detections.

        Returns:
            Frame with count badges.
        """
        h, w = frame.shape[:2]
        badge_x = w - 200
        badge_y = 15

        if shoplifting_count > 0:
            text = f"SHOPLIFTING: {shoplifting_count}"
            cv2.rectangle(
                frame, (badge_x - 5, badge_y - 5),
                (w - 10, badge_y + 22), (0, 0, 180), -1,
            )
            cv2.putText(
                frame, text, (badge_x, badge_y + 15),
                self.font, 0.55, (255, 255, 255), 2, cv2.LINE_AA,
            )
            badge_y += 30

        if normal_count > 0:
            text = f"NORMAL: {normal_count}"
            cv2.rectangle(
                frame, (badge_x - 5, badge_y - 5),
                (w - 10, badge_y + 22), (0, 140, 0), -1,
            )
            cv2.putText(
                frame, text, (badge_x, badge_y + 15),
                self.font, 0.55, (255, 255, 255), 2, cv2.LINE_AA,
            )

        return frame
