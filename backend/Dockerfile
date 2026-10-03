FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for OpenCV and video codecs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir opencv-python-headless ultralytics torch torchvision

COPY backend/ backend/
COPY ai/ ai/
COPY edge/ edge/
COPY datasets/ datasets/

ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:////app/training_centre.db

EXPOSE 8001

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8001"]
