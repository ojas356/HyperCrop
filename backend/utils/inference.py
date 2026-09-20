"""
HyperCrop — CNN Inference Utility (ONNX Runtime)
==================================================
Loads the trained MobileNetV2 model in ONNX format and runs predictions.
Uses onnxruntime — works on Python 3.14+, no TensorFlow required locally.

The model must be exported from Colab first (Cell 10 in HyperCrop_Train.ipynb).
Place plant_disease_model.onnx in backend/model/ and restart Flask.

Falls back to prototype scores if the model file isn't present.
"""

import os
import json
import io
import logging

logger = logging.getLogger(__name__)

_BASE = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_BASE, "..", "model", "plant_disease_model.onnx")
INDEX_PATH = os.path.join(_BASE, "..", "model", "class_indices.json")

IMG_SIZE = (224, 224)

# Module-level cache
_session     = None   # onnxruntime.InferenceSession
_class_index = None   # {"0": "Tomato___Early_blight", ...}
_model_ready = False


# ── PlantVillage label → human-readable ──────────────────────────────────────

# Matches the exact class names from class_indices.json
LABEL_MAP = {
    # Pepper
    "Pepper__bell___Bacterial_spot":                     ("Pepper",  "Bacterial Spot"),
    "Pepper__bell___healthy":                            ("Pepper",  "Healthy"),
    # Potato
    "Potato___Early_blight":                             ("Potato",  "Early Blight"),
    "Potato___Late_blight":                              ("Potato",  "Late Blight"),
    "Potato___healthy":                                  ("Potato",  "Healthy"),
    # Tomato
    "Tomato_Bacterial_spot":                             ("Tomato",  "Bacterial Spot"),
    "Tomato_Early_blight":                               ("Tomato",  "Early Blight"),
    "Tomato_Late_blight":                                ("Tomato",  "Late Blight"),
    "Tomato_Leaf_Mold":                                  ("Tomato",  "Leaf Mold"),
    "Tomato_Septoria_leaf_spot":                         ("Tomato",  "Septoria Leaf Spot"),
    "Tomato_Spider_mites_Two_spotted_spider_mite":       ("Tomato",  "Spider Mites"),
    "Tomato__Target_Spot":                               ("Tomato",  "Target Spot"),
    "Tomato__Tomato_YellowLeaf__Curl_Virus":             ("Tomato",  "Leaf Curl Virus"),
    "Tomato__Tomato_mosaic_virus":                       ("Tomato",  "Mosaic Virus"),
    "Tomato_healthy":                                    ("Tomato",  "Healthy"),
}


def _load_model():
    global _session, _class_index, _model_ready

    model_path = os.path.abspath(MODEL_PATH)
    index_path = os.path.abspath(INDEX_PATH)

    print(f"[inference] model path : {model_path}", flush=True)
    print(f"[inference] model exists: {os.path.exists(model_path)}", flush=True)

    if not os.path.exists(model_path):
        print("[inference] ONNX model not found — using prototype fallback.", flush=True)
        return

    if not os.path.exists(index_path):
        print(f"[inference] class_indices.json not found at {index_path}", flush=True)
        return

    try:
        import onnxruntime as ort
        print("[inference] Loading ONNX model…", flush=True)
        _session = ort.InferenceSession(
            model_path,
            providers=["CPUExecutionProvider"],
        )
        with open(index_path) as f:
            _class_index = json.load(f)
        _model_ready = True
        print(f"[inference] ✓ Model ready — {len(_class_index)} classes", flush=True)
    except Exception as exc:
        print(f"[inference] Failed to load model: {exc}", flush=True)
        _model_ready = False


def is_model_ready() -> bool:
    if not _model_ready:
        _load_model()
    return _model_ready


def predict_from_bytes(image_bytes: bytes) -> dict:
    """
    Run inference on raw image bytes.

    Returns:
    {
        "model_used":  True | False,
        "raw_label":   "Tomato___Early_blight",
        "crop":        "Tomato",
        "issue":       "Early Blight",
        "confidence":  0.91,
        "is_healthy":  False,
        "top5": [ {"label":..., "crop":..., "issue":..., "confidence":...}, ... ]
    }
    """
    if not is_model_ready():
        return _prototype_fallback(has_image=True)

    try:
        import numpy as np
        from PIL import Image

        # Preprocess — send raw [0,255] uint8 values.
        # The ONNX model already contains MobileNetV2's preprocess_input
        # layer (scaling to [-1,1]) baked in from the .h5 export.
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize(IMG_SIZE)
        arr = np.array(img, dtype=np.float32)  # [0, 255] — no manual scaling
        arr = np.expand_dims(arr, axis=0)      # (1, 224, 224, 3)

        input_name = _session.get_inputs()[0].name
        preds = _session.run(None, {input_name: arr})[0][0]  # (n_classes,)

        top5_idx = preds.argsort()[-5:][::-1]
        top5 = []
        for i in top5_idx:
            raw = _class_index.get(str(i), f"class_{i}")
            crop, issue = LABEL_MAP.get(raw, _parse_raw_label(raw))
            top5.append({
                "label":      raw,
                "crop":       crop,
                "issue":      issue,
                "confidence": float(round(float(preds[i]), 4)),
            })

        best = top5[0]
        return {
            "model_used": True,
            "raw_label":  best["label"],
            "crop":       best["crop"],
            "issue":      best["issue"],
            "confidence": best["confidence"],
            "is_healthy": "healthy" in best["label"].lower(),
            "top5":       top5,
        }

    except Exception as exc:
        print(f"[inference] Prediction error: {exc}", flush=True)
        return _prototype_fallback(has_image=True, error=str(exc))


def _parse_raw_label(raw: str):
    parts = raw.replace("___", "|").replace("_", " ").split("|")
    crop  = parts[0].strip().title() if parts else "Unknown"
    issue = parts[1].strip().title() if len(parts) > 1 else "Unknown"
    return crop, issue


def _prototype_fallback(has_image: bool = False, error: str = "") -> dict:
    return {
        "model_used":      False,
        "raw_label":       None,
        "crop":            None,
        "issue":           None,
        "confidence":      0.75 if has_image else 0.15,
        "is_healthy":      None,
        "top5":            [],
        "fallback_reason": error or "ONNX model not found — run Cell 10 in HyperCrop_Train.ipynb",
    }
