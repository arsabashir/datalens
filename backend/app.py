from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(r"C:\Users\ARSA\datalens\backend\.env")

app = Flask(__name__)
CORS(app)
import os
import psutil

@app.route('/memory')
def memory():
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / 1024 / 1024
    return f"Memory usage: {mem:.2f} MB"

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

@app.route("/api/analyze", methods=["POST"])
def analyze():
    file = request.files["file"]
    df = pd.read_csv(file, nrows=500)
    
    df = df.drop_duplicates()
    df = df.fillna("N/A")
    
    csv_preview = df.head(5).to_string()
    prompt = f"""Give exactly 6 insights about this data as JSON array only.
Data:
{csv_preview}
Format: [{{"insight": "...", "type": "trend/anomaly/pattern"}}]"""
    
    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct",
        messages=[{"role": "user", "content": prompt}]
    )
    insights_text = response.choices[0].message.content.strip().replace("`json", "").replace("```", "")
    
    return jsonify({
        "columns": list(df.columns),
        "rows": df.head(100).to_dict(orient="records"),
        "insights": insights_text,
        "shape": {"rows": df.shape[0], "cols": df.shape[1]}
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    question = data["question"]
    csv_data = data["csvData"]
    
    prompt = f"""You are a data analyst. Answer concisely in 2-3 sentences.
Data: {csv_data}
Question: {question}"""
    
    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct",
        messages=[{"role": "user", "content": prompt}]
    )
    return jsonify({"answer": response.choices[0].message.content})
if __name__ == "__main__":
    app.run(debug=True, port=5000)