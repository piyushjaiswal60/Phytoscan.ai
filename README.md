# 🌿 Phytoscan.ai - Plant Disease Classification

A professional full-stack deep learning application for classifying plant leaf diseases using the PlantVillage dataset.

## 🚀 Features
- **High Accuracy Classification:** 38 plant disease classes using a custom CNN (93.4%) and MobileNetV2 (96.2%).
- **Production Architecture:** 
  - **Backend:** FastAPI (High-performance Python API)
  - **Frontend:** React + Vite + TypeScript (Modern, type-safe UI)
  - **Orchestration:** Docker & Docker Compose for seamless deployment.
- **Interactive UI:** Upload leaf images and get real-time predictions with confidence scores and top-3 results.
- **CI/CD Integration:** Automated testing and validation via GitHub Actions.

---

## 🛠️ Tech Stack
- **ML:** TensorFlow, Keras, MobileNetV2
- **Backend:** FastAPI, Uvicorn, Pydantic
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **DevOps:** Docker, GitHub Actions, Git
- **Testing:** Pytest (Backend), Vitest (Frontend)

---

## 🏃 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)
- OR Python 3.10+ and Node.js 18+

### Quick Start (Using Docker)
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Phytoscan.ai
   ```
2. Start the application:
   ```bash
   docker-compose up --build
   ```
3. Access the app:
   - **Frontend:** `http://localhost:3000`
   - **API Docs:** `http://localhost:8000/docs`

### Manual Setup (For Development)
**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Model Performance
| Model | Test Accuracy | Params | Size |
|---|---:|---:|---:|
| Custom CNN | 93.40% | 115k | 1.4 MB |
| **MobileNetV2** | **96.18%** | 2.3M | 9.7 MB |

---

## 📂 Project Structure
```
backend/    FastAPI app (API, model inference, tests)
frontend/   React + Vite + TS (UI, components)
models/     Trained .keras model files
notebooks/   Training pipelines and analysis
docker-compose.yml  Service orchestration
```
