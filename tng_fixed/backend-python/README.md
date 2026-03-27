# backend-python

Serviço de IA em Flask para deploy no Railway ou Google Cloud Run.

## Local
```bash
cd backend-python
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

## Endpoints
- `GET /health`
- `POST /ai`
