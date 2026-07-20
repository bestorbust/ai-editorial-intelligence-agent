# AI Editorial Intelligence & Discovery Agent

An AI-powered intelligence and trend discovery agent designed to continuously collect, analyze, cluster, score, and transform real-time information into actionable editorial opportunities.


---

## Overview

The Intelligence & Discovery Agent automatically collects information from multiple sources, processes the collected content through an AI-powered intelligence pipeline, identifies emerging stories, and generates ranked editorial opportunities.

The system separates **heavy AI intelligence processing** from the **production API serving layer**.

This allows computationally expensive NLP and machine-learning workloads to run independently while keeping the deployed API lightweight and responsive.

---

## Architecture

```text
                        ┌───────────────────────────────┐
                        │       GitHub Actions          │
                        │                               │
                        │   Scheduled Intelligence Run  │
                        │       Every 15 Minutes        │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   Intelligence & Discovery    │
                        │           Agent               │
                        │                               │
                        │  Collectors                   │
                        │      ↓                        │
                        │  Normalization                │
                        │      ↓                        │
                        │  Deduplication                │
                        │      ↓                        │
                        │  Keyword Extraction           │
                        │      ↓                        │
                        │  Entity Extraction            │
                        │      ↓                        │
                        │  Story Clustering             │
                        │      ↓                        │
                        │  Representative Selection     │
                        │      ↓                        │
                        │  Editorial Scoring            │
                        │      ↓                        │
                        │  Opportunity Generation       │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │      Neon PostgreSQL          │
                        │                               │
                        │  Topics                       │
                        │  Snapshots                    │
                        │  Stories                      │
                        │  Opportunities                │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │      Render Read API          │
                        │                               │
                        │      Lightweight FastAPI      │
                        │      Read-Only Service        │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │          Frontend             │
                        │                               │
                        │ Dashboard                     │
                        │ Topics                        │
                        │ Stories                       │
                        │ Opportunities                 │
                        │ Snapshot History              │
                        └───────────────────────────────┘
```

---

# Core Pipeline

The Intelligence & Discovery Agent processes information through the following stages.

## 1. Data Collection

The system collects information from multiple sources.

Current collectors include:

* GNews
* RSS feeds
* Hacker News
* GitHub
* YouTube

Each collector produces normalized topic objects that can be processed by the intelligence pipeline.

---

## 2. Merge Processing

Topics collected from all available sources are combined into a unified collection.

```text
GNews ───────────┐
RSS ─────────────┤
Hacker News ─────┤
GitHub ──────────┼──► Merge Processor
YouTube ─────────┘
```

---

## 3. Normalization

Collected content is normalized into a consistent structure before downstream processing.

Normalization ensures that topics collected from different sources can be processed uniformly.

---

## 4. Semantic Deduplication

The Deduplication Processor identifies semantically similar topics and removes duplicate content.

This helps prevent the same story reported by multiple sources from unnecessarily appearing as independent topics.

---

## 5. Keyword Extraction

Important keywords and keyphrases are extracted from each topic.

The keyword extraction system combines NLP-based phrase extraction with semantic keyword identification.

---

## 6. Entity Extraction

The system identifies important entities such as:

* Companies
* People
* Technologies
* Programming languages
* Frameworks
* Libraries
* Products
* Organizations
* Research papers

These entities provide additional semantic context for downstream story analysis.

---

## 7. Story Clustering

Semantically related topics are grouped into larger stories.

Instead of treating every article or source as an independent item, the system identifies groups of content discussing the same underlying event or trend.

```text
Topic
Topic
Topic
   │
   ▼
Story Cluster
```

---

## 8. Story Representative Selection

Each story cluster is analyzed to select the most representative topic.

The representative provides the primary:

* Title
* Summary
* Keywords
* Entities

for the story.

---

## 9. Editorial Scoring

Each story receives an editorial score based on multiple signals.

Current scoring dimensions include:

* Trend strength
* Source authority
* Recency
* Source diversity
* Keyword strength
* Entity strength

These signals are combined into an overall editorial score.

---

## 10. Opportunity Generation

High-value stories are transformed into editorial opportunities.

Each opportunity can contain:

* Headline
* Editorial score
* Summary
* Strengths
* Weaknesses
* Recommended content formats
* Source information
* Keywords
* Entities
* Individual scoring dimensions

The opportunities are ranked by editorial relevance.

---

# Technology Stack

## Backend Intelligence Pipeline

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* spaCy
* KeyBERT
* Sentence Transformers
* GLiNER
* BERTopic

## Data Sources

* GNews
* RSS
* Hacker News
* GitHub
* YouTube

## Database

* Neon PostgreSQL

## Production API

* FastAPI
* SQLAlchemy
* Psycopg2
* Uvicorn

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React

## Automation

* GitHub Actions

## Deployment

* Render — Lightweight read-only backend API
* Frontend deployment — configured separately

---

# Repository Structure

```text
ai-editorial-intelligence-agent/
│
├── backend/
│   ├── api/
│   ├── core/
│   ├── intelligence/
│   ├── services/
│   └── ...
│
├── frontend/
│   ├── src/
│   └── ...
│
├── render_api/
│   ├── __init__.py
│   ├── app.py
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── intelligence-refresh.yml
│
└── README.md
```

---

# Production Architecture

The production architecture intentionally separates intelligence processing from API serving.

## Intelligence Processing

The heavy AI pipeline performs:

```text
Collection
    ↓
Semantic Processing
    ↓
Keyword Extraction
    ↓
Entity Extraction
    ↓
Story Clustering
    ↓
Editorial Scoring
    ↓
Opportunity Generation
    ↓
Database Persistence
```

This process can require significant CPU and memory because of the NLP and machine-learning models used by the pipeline.

Therefore, the heavy intelligence pipeline is not loaded by the Render production API.

---

## Lightweight Render API

Render hosts only the lightweight read-only FastAPI application.

The API:

```text
Frontend
    ↓
Render FastAPI
    ↓
Neon PostgreSQL
```

The Render service does not execute:

* BERTopic
* GLiNER
* KeyBERT
* Sentence Transformers
* Heavy AI collectors
* Intelligence refresh pipeline

This keeps production memory usage significantly lower.

---

# Live API

Backend API:

```text
https://ai-editorial-intelligence-agent-1.onrender.com
```

Interactive API documentation:

```text
https://ai-editorial-intelligence-agent-1.onrender.com/docs
```

Frontend:

```text
https://ai-editorial-intelligence-agent.vercel.app
```

---

# API Endpoints

## Root

```text
GET /
```

Returns basic API information.

---

## Health

```text
GET /health
```

Checks API and database availability.

---

## Dashboard

```text
GET /dashboard
```

Returns statistics for the latest intelligence snapshot.

Example metrics include:

* Raw articles collected
* Semantic unique topics
* Story count
* Opportunity count
* Pipeline execution time

---

## Topics

```text
GET /topics
```

Returns topics belonging to the latest intelligence snapshot.

---

## Stories

```text
GET /stories
```

Returns story clusters generated from the latest intelligence snapshot.

---

## Opportunities

```text
GET /opportunities
```

Returns ranked editorial opportunities generated from the latest snapshot.

---

## History

```text
GET /history?date=YYYY-MM-DD
```

Returns intelligence snapshots generated for the selected date.

---

## Status

```text
GET /status
```

Returns the current API and latest snapshot status.

---

# Snapshot System

Every successful intelligence pipeline run creates a new snapshot.

A snapshot stores metrics including:

* Raw articles collected
* Semantic unique topics
* Number of stories
* Number of opportunities
* Pipeline execution time
* Creation timestamp

Snapshots make it possible to track intelligence generation over time.

The frontend displays snapshot numbers relative to the selected calendar date.

For example:

```text
July 19

Snapshot #1
Snapshot #2
Snapshot #3
```

The underlying database IDs remain globally unique.

---

# Automated Intelligence Refresh

The intelligence pipeline is designed to run automatically using GitHub Actions.

The scheduled workflow will:

```text
GitHub Actions
      ↓
Install Backend Dependencies
      ↓
Load Intelligence Models
      ↓
Run Collectors
      ↓
Execute Intelligence Pipeline
      ↓
Generate Stories
      ↓
Generate Opportunities
      ↓
Create Snapshot
      ↓
Persist Results to Neon PostgreSQL
```

The production Render API automatically reads the latest persisted snapshot from Neon.

No Render restart or redeployment is required when a new snapshot is generated.

---

# Environment Variables

The application requires environment variables for database access and external APIs.

Example:

```text
DATABASE_URL=<neon-postgresql-connection-string>

GNEWS_API_KEY=<gnews-api-key>

GITHUB_TOKEN=<github-token>
```

Never commit real API keys or database credentials to the repository.

For local development, store them in:

```text
.env
```

For GitHub Actions, configure them using:

```text
Repository
→ Settings
→ Secrets and variables
→ Actions
```

For Render, configure the required production variables through the Render environment settings.

---

# Local Development

## Clone the Repository

```bash
git clone <repository-url>
cd ai-editorial-intelligence-agent
```

## Run the Intelligence Backend

Install the backend dependencies and configure the required environment variables.

Then start the development backend according to the backend configuration.

---

## Run the Lightweight Render API Locally

From the repository root:

```bash
pip install -r render_api/requirements.txt
```

Start the API:

```bash
uvicorn render_api.app:app --reload
```

The API will be available locally at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Run the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# Current Development Status

Implemented:

* Multi-source intelligence collection
* GNews integration
* RSS collection
* Hacker News collection
* GitHub collection
* YouTube collection
* Topic normalization
* Semantic deduplication
* Keyword extraction
* Entity extraction
* Story clustering
* Story representative selection
* Editorial scoring
* Opportunity generation
* PostgreSQL persistence
* Snapshot history
* Lightweight production API
* React intelligence dashboard

In Progress:

* Automated scheduled intelligence refresh
* GitHub Actions pipeline
* Opportunity dashboard improvements
* Snapshot history improvements
* Performance optimization
* Production frontend deployment

---

# Future Improvements

Potential future improvements include:

* Incremental intelligence processing
* Intelligent collector caching
* Better semantic deduplication
* Improved entity normalization
* Cross-source story linking
* Story evolution tracking
* Trend velocity scoring
* Automated editorial content generation
* Multi-platform content generation
* Human editorial approval workflows
* Publishing integrations

---

# Project Vision

The Intelligence & Discovery Agent is the first stage of a larger AI Editorial OS.

The long-term architecture is designed around specialized agents:

```text
Intelligence & Discovery Agent
              ↓
Editorial Planning Agent
              ↓
Research Agent
              ↓
Content Generation Agent
              ↓
Review & Quality Agent
              ↓
Publishing Agent
              ↓
Analytics & Feedback Agent
```

The goal is to create an intelligent editorial system capable of continuously discovering relevant information, identifying high-value opportunities, generating content, and improving through feedback.

---

## License

This project is currently under active development.
