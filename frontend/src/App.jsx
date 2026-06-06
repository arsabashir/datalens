import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://localhost:5000/api/analyze", formData);
      setData(res.data);
      setInsights(JSON.parse(res.data.insights));
    } catch (err) {
      alert("Error analyzing file!");
    }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!question || !data) return;
    setChatLoading(true);
    const csvData = JSON.stringify(data.rows.slice(0, 5));
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        question,
        csvData,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      alert("Error getting answer!");
    }
    setChatLoading(false);
  };

  const iconMap = { trend: "📈", anomaly: "⚠️", pattern: "🔍" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", padding: "48px 24px 24px" }}>
  <div style={{ fontSize: 48 }}>🔍</div>
  <h1 style={{ fontSize: 36, margin: "8px 0 0", whiteSpace: "nowrap", paddingBottom: "8px", background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    DataLens
  </h1>
  <p style={{ color: "#a0aec0", fontSize: 18, marginTop: 8 }}>Upload messy data. Get instant AI insights. Ask anything.</p>
</div>

      {/* Upload */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "2px dashed rgba(167,139,250,0.4)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#a0aec0", marginBottom: 16 }}>📂 Drop your CSV file here</p>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ color: "white" }} />
          {file && <p style={{ color: "#a78bfa", marginTop: 8 }}>✓ {file.name}</p>}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            style={{ marginTop: 16, background: "linear-gradient(90deg, #7c3aed, #2563eb)", color: "white", padding: "12px 32px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: "bold", opacity: loading || !file ? 0.6 : 1 }}
          >
            {loading ? "⚡ Analyzing..." : "✨ Analyze"}
          </button>
        </div>

        {/* Dataset Info */}
        {data && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, marginTop: 24, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div>
              <p style={{ color: "#a78bfa", fontSize: 28, fontWeight: "bold", margin: 0 }}>{data.shape.rows.toLocaleString()}</p>
              <p style={{ color: "#a0aec0", margin: 0 }}>Rows</p>
            </div>
            <div>
              <p style={{ color: "#60a5fa", fontSize: 28, fontWeight: "bold", margin: 0 }}>{data.shape.cols}</p>
              <p style={{ color: "#a0aec0", margin: 0 }}>Columns</p>
            </div>
            <div>
              <p style={{ color: "#34d399", fontSize: 28, fontWeight: "bold", margin: 0 }}>{insights.length}</p>
              <p style={{ color: "#a0aec0", margin: 0 }}>Insights</p>
            </div>
          </div>
        )}
        {/* Insights */}
        {insights.length > 0 && (
          <>
            <h2 style={{ color: "white", marginTop: 32 }}>💡 AI Insights</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {insights.map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, borderLeft: "3px solid #7c3aed" }}>
                  <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: "bold", textTransform: "uppercase" }}>
                    {iconMap[item.type?.toLowerCase()] || "💡"} {item.type}
                  </span>
                  <p style={{ margin: "10px 0 0", color: "#e2e8f0", lineHeight: 1.5 }}>{item.insight}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {/* Chart */}
{data && data.rows.length > 0 && (
  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginTop: 24 }}>
    <h2 style={{ color: "white", marginTop: 0 }}>📊 Data Preview</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.rows.slice(0, 15)}>
        <XAxis dataKey={data.columns[0]} stroke="#a0aec0" tick={{ fontSize: 10 }} />
        <YAxis stroke="#a0aec0" />
        <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", color: "white" }} />
        <Bar dataKey={data.columns[1]} fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}
        {/* Chat */}
        {data && (
          <>
            <h2 style={{ color: "white", marginTop: 32 }}>💬 Chat with your Data</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ask anything about your data..."
                style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(167,139,250,0.3)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 15 }}
              />
              <button
                onClick={handleChat}
                disabled={chatLoading}
                style={{ background: "linear-gradient(90deg, #7c3aed, #2563eb)", color: "white", padding: "12px 24px", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}
              >
                {chatLoading ? "..." : "Ask"}
              </button>
            </div>
            {answer && (
              <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: 20, marginTop: 16 }}>
                <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.6 }}>{answer}</p>
              </div>
            )}
          </>
        )}
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}

