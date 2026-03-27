from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv("ALLOWED_ORIGIN", "*")])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest").strip()
AI_SYSTEM_PROMPT = os.getenv(
    "AI_SYSTEM_PROMPT",
    "Você é o Terminal de Inteligência do TechNetGame. Responda em pt-BR com objetividade, clareza e contexto útil."
).strip()

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def get_model():
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY não configurada")
    return genai.GenerativeModel(GEMINI_MODEL)


@app.get("/health")
def health():
    return jsonify({
        "ok": True,
        "service": "backend-python",
        "provider": "gemini",
        "model": GEMINI_MODEL,
        "configured": bool(GEMINI_API_KEY)
    })


@app.post("/ai")
def ai():
    try:
        data = request.get_json(silent=True) or {}
        prompt = str(data.get("prompt", "")).strip()
        context = str(data.get("context", "")).strip()

        if not prompt:
            return jsonify({"ok": False, "error": "Prompt vazio"}), 400

        full_prompt = AI_SYSTEM_PROMPT
        if context:
            full_prompt += f"\n\nContexto adicional:\n{context}"
        full_prompt += f"\n\nPergunta do usuário:\n{prompt}"

        response = get_model().generate_content(full_prompt)
        text = getattr(response, "text", "").strip()

        if not text:
            return jsonify({"ok": False, "error": "Resposta vazia do modelo"}), 502

        return jsonify({
            "ok": True,
            "response": text,
            "model": GEMINI_MODEL
        })
    except Exception as error:
        return jsonify({
            "ok": False,
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
