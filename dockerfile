FROM python:3.11-slim

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Ensure logs appear immediately
ENV PYTHONUNBUFFERED=1

# Hugging Face cache location
ENV HF_HOME=/home/user/.cache/huggingface

# Create non-root user required/recommended for HF Spaces
RUN useradd -m -u 1000 user

ENV HOME=/home/user
ENV PATH=/home/user/.local/bin:$PATH

# Repository root inside container
WORKDIR /home/user/app

# Install system dependencies
USER root

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Give ownership to HF user
RUN chown -R user:user /home/user

USER user

# Install Python dependencies first for Docker caching
COPY --chown=user backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy backend only
COPY --chown=user backend ./backend

EXPOSE 7860

CMD ["uvicorn", "backend.api.app:app", "--host", "0.0.0.0", "--port", "7860"]