# Trained model files

These are the original model artifacts from the supplied PhytoScan project.
Do not rename or retrain them as part of the application rebuild.

- `best_custom_cnn.keras` — custom CNN model, 38 output classes.
- `mobilenetv2.keras` — MobileNetV2 transfer-learning model, 38 output classes.

Both models accept RGB images at 224 × 224. The saved models include their own
rescaling layers, so the backend only resizes the image and converts it to RGB.
The class-index mapping is stored in the root `labels.json` file.
