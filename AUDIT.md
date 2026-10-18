# Project Audit - Plant Disease Classifier

## Current Technical State
- **Models**: 
  - Custom CNN (`best_custom_cnn.keras`)
  - MobileNetV2 (`mobilenetv2.keras`)
- **Input Shape**: (224, 224, 3)
- **Preprocessing**: 
  - Conversion to RGB
  - Resize to 224x224
  - Float32 conversion
- **Classes**: 38 classes from PlantVillage dataset.
- **Current UI**: Streamlit (`app.py`) providing a comparison view.
- **Performance**: 
  - Custom CNN: ~93.4% accuracy
  - MobileNetV2: ~96.2% accuracy

## Risks & Mitigations
- **Model Size**: Keras models can be large. 
  - *Mitigation*: Keep models in a dedicated `models/` directory; explore Git LFS or external storage if they exceed GitHub's 100MB limit.
- **Version Mismatch**: TensorFlow versions can cause `load_model` to fail.
  - *Mitigation*: Pin Python and TensorFlow versions strictly in `backend/requirements.txt`.
- **Label Duplication**: Labels are currently hardcoded in `app.py`.
  - *Mitigation*: Move labels to `labels.json` for a single source of truth.

## Proposed Model Storage
The models will stay in the root `models/` folder for now to be shared between the legacy Streamlit app and the new FastAPI backend.
