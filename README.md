# PhytoScan.ai

Plant disease classification using two existing trained Keras models: a Custom CNN and MobileNetV2. The application provides a React interface, a FastAPI inference service, Docker Compose, automated tests, and GitHub Actions workflows.

## 1. Project structure

```text
Phytoscan.ai/
├── .github/workflows/
│   ├── ci.yml                 # Tests, frontend build and Docker validation
│   └── deploy.yml             # Publish images and deploy to EC2 through SSM
├── backend/
│   ├── app/
│   │   ├── config.py          # Paths and environment settings
│   │   ├── main.py            # FastAPI routes and image validation
│   │   ├── model_service.py   # Load models once and run predictions
│   │   └── schemas.py         # Pydantic request/response schemas
│   ├── tests/test_api.py
│   ├── requirements.txt
│   ├── requirements-test.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/        # Upload and prediction cards
│   │   ├── test/
│   │   ├── api.ts             # Calls the FastAPI backend
│   │   ├── App.tsx             # Main page and UI state
│   │   └── index.css           # Application styling
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── models/
│   ├── best_custom_cnn.keras
│   └── mobilenetv2.keras
├── notebooks/pipeline.ipynb   # Original training and evaluation notebook
├── labels.json                # Original 38-class order
└── docker-compose.yml
```

The original model files, notebook and label mapping are retained. Dataset copies, `node_modules`, build output, Python caches and pytest caches are not included.

## 2. Requirements

Recommended local setup:

- Docker Desktop with Docker Compose
- Git
- Node.js 24+ and npm (only for frontend development outside Docker)
- Python 3.11 (only for backend development outside Docker)

## 3. Run the complete application with Docker

Open PowerShell in the project root (the folder containing `docker-compose.yml`):

```powershell
docker compose up --build -d
```

The first backend image build downloads TensorFlow CPU and can take longer than later builds. Model loading also takes a little time when the backend container starts.

Open:

- Frontend: http://localhost:3000
- FastAPI documentation: http://localhost:8000/docs
- Backend health: http://localhost:8000/health

Check container status and logs:

```powershell
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Stop the application:

```powershell
docker compose down
```

Rebuild after changing source code:

```powershell
docker compose down
docker compose up --build -d
```

## 4. Run without Docker (development)

### Backend terminal

From the repository root, create and activate a virtual environment:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

### Frontend terminal

Open another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173). The Vite proxy forwards `/api` requests to the local FastAPI server.

## 5. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Reports whether both models are loaded |
| GET | `/models` | Lists model names, image size and class count |
| POST | `/predict?model=custom_cnn` | Runs Custom CNN inference |
| POST | `/predict?model=mobilenetv2` | Runs MobileNetV2 inference |
| POST | `/predict/compare` | Runs both models and reports whether their top classes agree |

Prediction endpoints accept one multipart field named `file`. JPEG and PNG images up to 5 MB are accepted. The API returns the three highest probabilities for each selected model.

## 6. Run tests

Backend API tests use a fake prediction service. They test endpoints and validation without repeatedly loading TensorFlow weights:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements-test.txt
python -m pytest backend/tests -q
```

Frontend tests and production build:

```powershell
cd frontend
npm ci
npm test -- --run
npm run build
```

The Docker validation job in GitHub Actions builds both production images after the tests pass.

## 7. Push the rebuilt project to your existing GitHub repository

First make a backup of your current project folder. Open PowerShell in the existing repository root and check its state:

```powershell
git status
git remote -v
git branch --show-current
Test-Path .git
```

Confirm that the remote is your intended repository, the branch is `main`, and `Test-Path .git` returns `True`. Commit or stash any changes you still need. Do not delete the `.git` directory.

After backing up, remove the old working-tree files while keeping `.git`. Replace the example ZIP path with the location where you saved this rebuilt project archive:

```powershell
Get-ChildItem -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
Expand-Archive -Path "$HOME\Downloads\Phytoscan.ai_rebuilt.zip" -DestinationPath "." -Force
```

This removes stale files from the old version, including tracked build output and cache folders, while preserving the existing GitHub connection and commit history. Then stage and review the changes:

```powershell
git status
git add -A
git status
git diff --cached --stat
git diff --cached --name-status
```

Check that these original assets are included:

```text
models/best_custom_cnn.keras
models/mobilenetv2.keras
notebooks/pipeline.ipynb
labels.json
```

Commit and push:

```powershell
git commit -m "Rebuild PhytoScan AI application"
git push origin main
```

Do not delete the `.git` directory. Do not run `git init` again in the existing repository. This is an ordinary update to your current repository, not a new repository.

If Git reports that a model file exceeds a repository file-size limit, stop and resolve that separately (for example, with Git LFS); do not remove the model assets from the Docker build context.

## 8. GitHub Actions and CI/CD setup

### Step A — CI workflow

The included `ci.yml` runs on pushes and pull requests targeting `main`. It:

1. Installs backend test dependencies and runs pytest.
2. Installs frontend dependencies, runs Vitest and builds the React app.
3. Builds both Docker images and validates `docker-compose.yml`.

No AWS credentials are required for this CI workflow.

### Step B — GitHub Container Registry

The deployment workflow publishes these images:

```text
ghcr.io/<your-github-owner>/phytoscan-backend:<commit-sha>
ghcr.io/<your-github-owner>/phytoscan-frontend:<commit-sha>
```

The workflow derives the owner from the repository automatically. It does not use the previous account name hard-coded in your old workflow.

GHCR packages are private by default. This deployment example uses public images so the EC2 machine can pull them without storing a registry password. On the first run, the image-publish job will create the two packages; the EC2 pull may fail until you change their visibility. After the images have been published:

1. Open your GitHub profile or organization.
2. Open Packages.
3. Open `phytoscan-backend`, then Package settings.
4. Change package visibility to Public.
5. Repeat for `phytoscan-frontend`.
6. Re-run **Build, Publish and Deploy Phytoscan** from Actions.

After both packages are public, later pushes to `main` can deploy automatically. If you prefer private packages, configure a read-only GHCR login on the EC2 instance before deployment instead. Do not put a personal access token directly in this repository or workflow file.

### Step C — AWS prerequisites

The EC2 instance must:

- Have Docker Engine and the Docker Compose plugin installed.
- Have the AWS Systems Manager (SSM) agent connected and online.
- Have an instance IAM role with `AmazonSSMManagedInstanceCore` attached.
- Allow inbound HTTP traffic on port 80 in its security group.
- Have enough memory and disk space to run TensorFlow and both containers.

Create an IAM role for GitHub Actions using OIDC. Its trust policy should restrict access to this repository and the `main` branch. GitHub changed the OIDC `sub` claim format for repositories created on or after 15 July 2026 (and some older repositories that were renamed or opted in): the claim includes numeric owner and repository IDs. Check the format for your repository before saving the trust policy. See the [GitHub OIDC in AWS guide](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws) and the [AWS credentials action guide](https://github.com/aws-actions/configure-aws-credentials#oidc).

For this public repository, retrieve the IDs in PowerShell:

```powershell
$repo = Invoke-RestMethod "https://api.github.com/repos/piyushjaiswal60/Phytoscan.ai"
$repo.created_at # check whether the repository was created on/after 2026-07-15
$repo.owner.id   # numeric owner ID
$repo.id         # numeric repository ID
```

Use the matching `sub` value in the IAM role trust relationship. Replace `<AWS_ACCOUNT_ID>`, `<OWNER_ID>` and `<REPO_ID>` with your actual values. The JSON below uses the newer immutable-ID format. If your repository still uses the legacy format, replace only the `sub` value with `repo:piyushjaiswal60/Phytoscan.ai:ref:refs/heads/main`.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:piyushjaiswal60@<OWNER_ID>/Phytoscan.ai@<REPO_ID>:ref:refs/heads/main"
      }
    }
  }]
}
```

Attach a least-privilege permissions policy to that role. Replace the region, account and instance placeholders. The first statement allows the workflow to run only the AWS shell command document on the intended instance; the second lets it read the command result (the SSM status API requires `Resource: "*"`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ssm:<AWS_REGION>::document/AWS-RunShellScript",
        "arn:aws:ec2:<AWS_REGION>:<AWS_ACCOUNT_ID>:instance/<EC2_INSTANCE_ID>"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "ssm:GetCommandInvocation",
      "Resource": "*"
    }
  ]
}
```

On the EC2 instance, attach an instance profile with `AmazonSSMManagedInstanceCore`, confirm the SSM Agent is online, and install Docker Engine plus the Docker Compose plugin. AWS documents the managed-instance prerequisites in [Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/fleet-manager-troubleshooting-managed-nodes.html) and the command execution flow in [Run Command](https://docs.aws.amazon.com/systems-manager/latest/userguide/run-command.html). Do not grant the GitHub role broad administrator permissions.

### Step D — Configure GitHub repository settings

Open your repository → Settings → Secrets and variables → Actions.

Create this **repository secret**:

| Secret | Value |
|---|---|
| `AWS_ROLE_TO_ASSUME` | ARN of the IAM role trusted by GitHub OIDC |

Create these **repository variables**:

| Variable | Example | Meaning |
|---|---|---|
| `AWS_REGION` | `ap-southeast-1` | Region containing your EC2 instance |
| `EC2_INSTANCE_ID` | `i-xxxxxxxxxxxxxxxxx` | Your own EC2 instance ID |
| `EC2_APP_DIR` | `/opt/phytoscan` | Directory on EC2 for the Compose file |

Use your real AWS values; the examples above are not credentials or confirmed deployment details.

### Step E — Run deployment

After a successful push to `main`, the deploy workflow:

1. Checks that the CI workflow succeeded for a push to `main`.
2. Builds and publishes the backend and frontend images to GHCR.
3. Assumes your AWS role using GitHub OIDC.
4. Sends a deployment command to EC2 through AWS Systems Manager.
5. Pulls the new images and recreates the containers.

You can also run it manually from GitHub → Actions → **Build, Publish and Deploy Phytoscan** → Run workflow. Check the workflow run and SSM command output if deployment fails.

## 9. How to explain the architecture in an interview

**Frontend:** React and TypeScript handle image upload, preview, model selection, loading and result display. The browser sends the image as multipart form data to the API.

**Backend:** FastAPI validates the file type and size. Pydantic validates upload metadata and response structures. During application startup, the two trained Keras models and the class-label list are loaded once into memory. Each request reuses those loaded models rather than loading weights again.

**Inference:** The uploaded image is verified, converted to RGB and resized to 224 × 224. The backend passes the image to the selected model. The trained models already contain their image-rescaling layers. The API returns the top three class probabilities.

**Docker:** Docker packages the API and frontend separately. Nginx serves the React build and forwards `/api` requests to FastAPI over the internal Docker network. Docker Compose starts the services in the correct order and checks backend health.

**CI/CD:** GitHub Actions runs backend and frontend tests, builds the production images, publishes them to GHCR, and can deploy the images to EC2 through AWS Systems Manager using GitHub OIDC.

## 10. Important notes

- The original trained models, notebook and class order are retained; this rebuild does not retrain them.
- The notebook's reported MobileNetV2 accuracy is 96.18%, which rounds to 96.2% in a resume.
- The UI's confidence percentage is the model's predicted class probability, not a verified clinical or agricultural certainty score.
- Do not commit `.env` files, AWS access keys, passwords or personal access tokens.
- The deployment workflow is parameterized. It does not assume that the AWS account, EC2 instance or old GitHub owner shown in the previous workflow still belongs to this repository.
