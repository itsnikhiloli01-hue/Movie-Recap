# LEGEND AI – High-Quality AI Movie Recap Production Platform

Legend AI is a high-performance, GPU-accelerated full-stack platform that automates the production of high-retention movie recap videos (like professional YouTube, TikTok, and Instagram channels). 

By integrating **PySceneDetect** (scene cuts), **OpenAI Whisper Large-V3** (dialogue transcription), **YOLOv8** (characters/objects classification), **Gemini 3.5-Flash** (storyteller scripts), and **Gemini 3.1-Flash-TTS** (voice narrations), Legend AI turns BoredFlix movies into completely original video montages exempt from copyright strikes.

---

## 🏗️ Production Architecture

```
                       ┌──────────────────────┐
                       │   React 19 / Vite    │  (Web Dashboard Client)
                       └──────────┬───────────┘
                                  │  REST APIs / Audio Streams
                                  ▼
                       ┌──────────────────────┐
                       │  Express Web Server  │  (Full-stack API Gate / Proxy)
                       └──────────┬───────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────┐                               ┌───────────────┐
│ FastAPI Backend  │ (ML coordination & endpoints) │  Gemini APIs  │ (Scripts & Voice)
└────────┬─────────┘                               └───────────────┘
         │
         │  Task Enqueue (Broker)
         ▼
┌──────────────────┐
│  Redis Broker    │
└────────┬─────────┘
         │  Pick up Task (Distributed Queue)
         ▼
┌──────────────────┐
│  Celery Worker   │◄────► [NVIDIA CUDA GPU] (Whisper Large, YOLOv8, FFmpeg)
└──────────────────┘
```

---

## 📁 Repository File Structure

```
├── .github/workflows/
│   └── ci-cd.yml             # GitHub Actions CI/CD automation pipeline
├── src/
│   ├── backend-fastapi/      # FastAPI Microservice
│   │   ├── main.py           # Endpoint routers
│   │   ├── worker.py         # Celery GPU-accelerated background tasks
│   │   └── schema.sql        # Relational database models DDL
│   ├── components/           # React Modular Frontend
│   │   ├── UploadSection.tsx # Phase 1: Upload & AI Video Analysis panel
│   │   ├── ScriptSection.tsx # Phase 2: Professional Story Scripting editor
│   │   ├── VoiceSection.tsx  # Phase 3: AI Voice narrator & Ambient music mixer
│   │   ├── TimelineSection.tsx# Phase 4: Styled captioning timeline & Live player
│   │   ├── ExportSection.tsx # Phase 5: Container compiler logs & movie downlods
│   │   └── DeveloperSection.tsx# Phase 6: Interactive deliverable viewer console
│   ├── App.tsx               # Master App Dashboard Layout
│   ├── types.ts              # Global TypeScript models and schema definitions
│   └── main.tsx              # Application client-side entry-point
├── server.ts                 # Full-Stack Express Server (Gateway & static server)
├── Dockerfile                # Production multi-stage GPU-accelerated container
├── docker-compose.yml        # Multi-container cluster orchestration compose
├── k8s-deployment.yaml       # Kubernetes cluster configuration with GPU selectors
└── README.md                 # Complete platform documentation (This file)
```

---

## ⚡ Quick Start (Local Sandbox)

The sandbox reuses your configured system credentials to allow real LLM analysis, professional scripting, and real, playable audio voices natively inside the web browser!

### 1. Configure Secrets
Copy the template and specify your API keys:
```bash
cp .env.example .env
```
Inside `.env`, specify:
```env
GEMINI_API_KEY="AI_STUDIO_API_KEY"
```

### 2. Install dependencies & Run
```bash
# Install core node modules
npm install

# Start the full-stack server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser to start.

---

## 🐳 Production Deployment (NVIDIA GPU Cluster)

For processing high-fidelity BoredFlix streams, it is recommended to run the microservice cluster on dedicated NVIDIA GPU nodes (like an AWS EC2 g4dn, paperspace, or GCP Compute Engine instance).

### Docker Compose
Spawn the entire cluster (Web Dashboard, FastAPI, Redis, Postgres DB, and GPU-mapped Celery Worker) using a single command:
```bash
docker-compose up --build -d
```

### Kubernetes Orchestration
Apply namespaces, PV claims, Node selectors, Load balancers, and NVIDIA resource requests to your GKE/EKS cluster:
```bash
kubectl apply -f k8s-deployment.yaml
```

---

## 🦾 API Documentation Reference

The FastAPI service exposes interactive OpenAPI docs at `http://localhost:8000/docs`.

### Primary Endpoints:
1. `POST /api/v1/analyze` -> Triggers PySceneDetect, Whisper, and YOLO visual identification on the BoredFlix stream URL.
2. `POST /api/v1/script/generate` -> Synthesizes storytelling recap segments with dramatic hooks and cliffhangers.
3. `POST /api/v1/export` -> Assembles audio-ducked voiceovers, cinematic Ken Burns zoom effects, styled subtitles, and container stitching in FFmpeg.

---

## ⚖️ Legal & Copyright Protection Guidelines

Legend AI implements a strict **Copyright Shield Protection Engine** when creating recaps from BoredFlix to fully ensure compliance with **Fair Use (17 U.S.C. § 107)**:
- **Transformative Video Cuts**: The system automatically chops movies into short scene fragments, never re-broadcasting contiguous clips longer than 8 seconds.
- **Dynamic Ken Burns Zooms**: Frames are resized, cropped, or slowly panned to destroy direct stream fingerprint signatures.
- **High Narration Density**: The original audio soundtrack is ducked/muted and replaced with a fully transformative, original educational narrator voice and royalty-free music.
