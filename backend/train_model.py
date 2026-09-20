"""
HyperCrop — CNN Training Script
================================
Downloads the PlantVillage dataset from Kaggle, trains a MobileNetV2
classifier with transfer learning, and saves the model + class index.

Prerequisites
-------------
1. Install dependencies:
       pip install tensorflow pillow kaggle

2. Set up Kaggle API credentials:
   - Go to https://www.kaggle.com/settings  →  API  →  "Create New Token"
   - This downloads kaggle.json
   - Place it at:
       Windows : C:\\Users\\<you>\\.kaggle\\kaggle.json
       Linux/Mac: ~/.kaggle/kaggle.json
   - Or set environment variables:
       set KAGGLE_USERNAME=your_username
       set KAGGLE_KEY=your_api_key

3. Run:
       cd backend
       python train_model.py

Output
------
  backend/model/plant_disease_model.h5   — saved Keras model
  backend/model/class_indices.json       — label index mapping
  backend/model/training_history.json    — loss/accuracy per epoch

Training time
-------------
  GPU (CUDA)  : ~15–25 minutes
  CPU only    : ~3–5 hours (not recommended; use Google Colab instead)

Google Colab alternative
------------------------
If you don't have a GPU locally, open Google Colab (free T4 GPU):
  1. Upload this file or paste the code
  2. pip install kaggle tensorflow
  3. Upload kaggle.json when prompted
  4. Run — download the output model/ folder when done
"""

import os
import json
import zipfile
import shutil
import pathlib

import numpy as np

# ─── Configuration ────────────────────────────────────────────────────────────

DATASET_SLUG   = "emmarex/plantdisease"         # Kaggle dataset identifier
DOWNLOAD_DIR   = "./data/plantvillage_raw"       # Where the zip lands
DATASET_DIR    = "./data/plantvillage"           # Extracted images
MODEL_DIR      = "./model"                       # Output directory
MODEL_PATH     = f"{MODEL_DIR}/plant_disease_model.h5"
INDEX_PATH     = f"{MODEL_DIR}/class_indices.json"
HISTORY_PATH   = f"{MODEL_DIR}/training_history.json"

IMG_SIZE       = (224, 224)   # MobileNetV2 default input size
BATCH_SIZE     = 32
EPOCHS_FROZEN  = 5            # Train only the new head first
EPOCHS_FINE    = 10           # Then unfreeze and fine-tune
LEARNING_RATE  = 1e-4
FINE_LR        = 1e-5
VALIDATION_SPLIT = 0.15
TEST_SPLIT       = 0.10
SEED             = 42

# ─── Step 1: Download dataset ─────────────────────────────────────────────────

def download_dataset():
    try:
        import kaggle
    except ImportError:
        raise SystemExit("kaggle package not found. Run: pip install kaggle")

    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    if os.path.exists(DATASET_DIR) and any(pathlib.Path(DATASET_DIR).iterdir()):
        print(f"[1/5] Dataset already extracted at {DATASET_DIR} — skipping download.")
        return

    print(f"[1/5] Downloading PlantVillage from Kaggle ({DATASET_SLUG})…")
    kaggle.api.authenticate()
    kaggle.api.dataset_download_files(
        DATASET_SLUG,
        path=DOWNLOAD_DIR,
        unzip=False,
    )

    zip_files = list(pathlib.Path(DOWNLOAD_DIR).glob("*.zip"))
    if not zip_files:
        raise FileNotFoundError("Download failed — no zip found in download directory.")

    print(f"[1/5] Extracting {zip_files[0].name}…")
    with zipfile.ZipFile(zip_files[0], "r") as z:
        z.extractall(DOWNLOAD_DIR)

    # Find the directory that contains the class folders
    # PlantVillage zip usually extracts to a subfolder like "PlantVillage/"
    candidates = [
        p for p in pathlib.Path(DOWNLOAD_DIR).rglob("*")
        if p.is_dir() and any(p.iterdir())
        and not p.name.startswith(".")
    ]
    # Pick the deepest folder that contains class subdirectories
    dataset_root = None
    for c in sorted(candidates, key=lambda p: len(p.parts), reverse=True):
        subdirs = [x for x in c.iterdir() if x.is_dir()]
        if len(subdirs) > 5:   # class folders should be many
            dataset_root = c
            break

    if dataset_root is None:
        raise FileNotFoundError(
            "Could not locate class folders inside the extracted zip. "
            "Check the contents of " + DOWNLOAD_DIR
        )

    shutil.copytree(str(dataset_root), DATASET_DIR)
    print(f"[1/5] Dataset ready at {DATASET_DIR}")
    print(f"      Classes found: {len(list(pathlib.Path(DATASET_DIR).iterdir()))}")


# ─── Step 2: Build data pipelines ─────────────────────────────────────────────

def build_datasets():
    import tensorflow as tf

    print("[2/5] Building data pipelines…")

    full_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        image_size=IMG_SIZE,
        batch_size=None,          # unbatched so we can split manually
        label_mode="categorical",
        shuffle=True,
        seed=SEED,
    )

    class_names = full_ds.class_names
    n_classes   = len(class_names)
    total       = sum(1 for _ in full_ds)

    n_val  = int(total * VALIDATION_SPLIT)
    n_test = int(total * TEST_SPLIT)
    n_train = total - n_val - n_test

    print(f"      Total images : {total}")
    print(f"      Classes      : {n_classes}")
    print(f"      Train/Val/Test: {n_train}/{n_val}/{n_test}")

    train_ds = full_ds.take(n_train)
    val_ds   = full_ds.skip(n_train).take(n_val)
    test_ds  = full_ds.skip(n_train + n_val)

    # Augmentation for training
    augment = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.1),
        tf.keras.layers.RandomBrightness(0.1),
    ], name="augmentation")

    AUTOTUNE = tf.data.AUTOTUNE

    def augment_and_batch(ds, augment_fn=None):
        if augment_fn:
            ds = ds.map(lambda x, y: (augment_fn(x, training=True), y),
                        num_parallel_calls=AUTOTUNE)
        return ds.batch(BATCH_SIZE).prefetch(AUTOTUNE)

    train_ds = augment_and_batch(train_ds, augment)
    val_ds   = augment_and_batch(val_ds)
    test_ds  = augment_and_batch(test_ds)

    return train_ds, val_ds, test_ds, class_names, n_classes


# ─── Step 3: Build model ──────────────────────────────────────────────────────

def build_model(n_classes: int):
    import tensorflow as tf

    print("[3/5] Building MobileNetV2 transfer learning model…")

    # MobileNetV2 pretrained on ImageNet — freeze the base initially
    base = tf.keras.applications.MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False

    # Preprocessing built into the model so inference is self-contained
    inputs  = tf.keras.Input(shape=(*IMG_SIZE, 3), name="image_input")
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(n_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    print(f"      Parameters   : {model.count_params():,}")
    return model, base


# ─── Step 4: Train ────────────────────────────────────────────────────────────

def train(model, base, train_ds, val_ds):
    import tensorflow as tf

    print(f"[4/5] Phase 1 — training head ({EPOCHS_FROZEN} epochs, base frozen)…")

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            patience=3, restore_best_weights=True, monitor="val_accuracy"
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            factor=0.5, patience=2, monitor="val_loss", verbose=1
        ),
    ]

    h1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_FROZEN,
        callbacks=callbacks,
        verbose=1,
    )

    # Phase 2: unfreeze the top 30 layers of MobileNetV2 and fine-tune
    print(f"[4/5] Phase 2 — fine-tuning top 30 layers ({EPOCHS_FINE} epochs)…")
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(FINE_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    h2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_FINE,
        callbacks=callbacks,
        verbose=1,
    )

    # Merge histories
    history = {}
    for k in h1.history:
        history[k] = h1.history[k] + h2.history[k]

    return history


# ─── Step 5: Save ─────────────────────────────────────────────────────────────

def save_outputs(model, class_names, history, test_ds):
    import tensorflow as tf

    os.makedirs(MODEL_DIR, exist_ok=True)

    print("[5/5] Evaluating on test set…")
    loss, acc = model.evaluate(test_ds, verbose=0)
    print(f"      Test accuracy: {acc * 100:.2f}%")
    print(f"      Test loss    : {loss:.4f}")

    print(f"[5/5] Saving model to {MODEL_PATH}…")
    model.save(MODEL_PATH)

    # Save class index: {index: "Tomato___Early_blight", ...}
    idx = {str(i): name for i, name in enumerate(class_names)}
    with open(INDEX_PATH, "w") as f:
        json.dump(idx, f, indent=2)
    print(f"[5/5] Class index saved to {INDEX_PATH}")

    # Save training history
    serializable = {k: [float(v) for v in vals] for k, vals in history.items()}
    serializable["test_accuracy"] = float(acc)
    serializable["test_loss"]     = float(loss)
    with open(HISTORY_PATH, "w") as f:
        json.dump(serializable, f, indent=2)
    print(f"[5/5] Training history saved to {HISTORY_PATH}")

    print("\n✓ Done. Model is ready.")
    print(f"  Model   : {MODEL_PATH}")
    print(f"  Classes : {INDEX_PATH}  ({len(class_names)} classes)")
    print(f"  Test acc: {acc * 100:.2f}%")


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import tensorflow as tf

    # Show available devices
    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        print(f"GPU detected: {[g.name for g in gpus]}")
        # Allow memory growth to avoid OOM
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    else:
        print("⚠  No GPU detected — training will be slow on CPU.")
        print("   Consider using Google Colab: https://colab.research.google.com")
        print("   (Runtime → Change runtime type → T4 GPU)")
        print()

    download_dataset()
    train_ds, val_ds, test_ds, class_names, n_classes = build_datasets()
    model, base = build_model(n_classes)
    history = train(model, base, train_ds, val_ds)
    save_outputs(model, class_names, history, test_ds)
