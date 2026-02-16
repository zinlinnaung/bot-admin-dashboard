import React, { useState, useRef } from "react";

const SubtitleTranslator = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [isError, setIsError] = useState(false);

  const fileInputRef = useRef(null);

  // --- Configuration ---
  const GROQ_API_KEY =
    "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";

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTranslatedContent("");
      setIsError(false);
      setStatus(`ဖိုင်ရွေးပြီးပါပြီ: ${e.target.files[0].name}`);
    }
  };

  const translateWithGroq = async (chunk) => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ပိုမိုမြန်ဆန်ပြီး Rate limit သက်သာသော model သို့ ပြောင်းထားသည်
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a specialized SRT translator. Translate to natural, informal Burmese. Keep timestamps and sequence numbers exactly as they are. Return ONLY the raw SRT output.",
            },
            { role: "user", content: chunk },
          ],
          temperature: 0.1, // Accuracy ပိုကောင်းစေရန်
        }),
      },
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.choices[0].message.content;
  };

  const processFile = async () => {
    if (!file) return alert("ဖိုင်အရင်ရွေးပါ");

    setLoading(true);
    setIsError(false);
    setStatus("စတင်နေပါပြီ...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const blocks = text.split(/\r?\n\r?\n/).filter((b) => b.trim() !== "");
      let currentResult = "";

      // Batch size ကို ၄၀ ထားခြင်းဖြင့် Request အကြိမ်ရေကို အများကြီး လျှော့ချနိုင်သည်
      const batchSize = 40;

      try {
        for (let i = 0; i < blocks.length; i += batchSize) {
          const progress = Math.round((i / blocks.length) * 100);
          setStatus(`ဘာသာပြန်နေသည်... ${progress}%`);

          const chunk = blocks.slice(i, i + batchSize).join("\n\n");
          if (!chunk.trim()) continue;

          const translatedChunk = await translateWithGroq(chunk);
          currentResult += translatedChunk + "\n\n";

          // အချိန်နဲ့အမျှ ရလာသမျှကို သိမ်းဆည်းထားမည်
          setTranslatedContent(currentResult);

          if (i + batchSize < blocks.length) {
            // Instant model ဖြစ်၍ ၃ စက္ကန့်သာ စောင့်ရန်လိုအပ်သည်
            await new Promise((r) => setTimeout(r, 3000));
          }
        }
        setStatus("အောင်မြင်စွာ ဘာသာပြန်ပြီးပါပြီ။");
      } catch (error) {
        console.error(error);
        setIsError(true);
        setStatus(
          `Error: ${error.message} (ယခုအထိရသမျှကို ဒေါင်းလုဒ်ဆွဲနိုင်သည်)`,
        );
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const downloadSrt = () => {
    // Unicode စာလုံးများ မကွဲစေရန် UTF-8 ဖြင့် သိမ်းဆည်းသည်
    const blob = new Blob([translatedContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Burmese_${file.name}`;
    link.click();
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "auto",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid #eee",
        }}
      >
        <h1 style={{ color: "#2d3436", fontSize: "24px" }}>
          🇲🇲 Subtitle Translator
        </h1>
        <p style={{ color: "#636e72", marginBottom: "30px" }}>
          Llama-3.1 Instant Model ဖြင့် အမြန်ဆုံး ဘာသာပြန်ပါ
        </p>

        <div
          style={{
            marginBottom: "25px",
            border: "2px dashed #74b9ff",
            padding: "30px",
            borderRadius: "15px",
            backgroundColor: "#f0f7ff",
          }}
        >
          <input
            type="file"
            accept=".srt"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              padding: "10px 25px",
              cursor: "pointer",
              borderRadius: "30px",
              border: "2px solid #0984e3",
              background: "white",
              color: "#0984e3",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            📁 SRT ဖိုင်ရွေးရန်
          </button>
          <p style={{ marginTop: "15px", color: "#2d3436", fontWeight: "500" }}>
            {file ? `Selected: ${file.name}` : "ဖိုင်ရွေးချယ်ထားခြင်းမရှိပါ"}
          </p>
        </div>

        <button
          onClick={processFile}
          disabled={loading || !file}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "15px",
            border: "none",
            backgroundColor: loading ? "#b2bec3" : "#00b894",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 5px 15px rgba(0,184,148,0.3)",
          }}
        >
          {loading ? "ဘာသာပြန်နေပါသည်..." : "မြန်မာလိုပြောင်းမည်"}
        </button>

        {status && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: isError ? "#fff5f5" : "#f1f2f6",
              color: isError ? "#d63031" : "#2f3542",
              fontSize: "14px",
              borderLeft: `5px solid ${isError ? "#d63031" : "#0984e3"}`,
            }}
          >
            {status}
          </div>
        )}

        {translatedContent && (
          <div
            style={{
              marginTop: "30px",
              borderTop: "1px solid #eee",
              paddingTop: "20px",
            }}
          >
            <button
              onClick={downloadSrt}
              style={{
                padding: "12px 30px",
                backgroundColor: "#0984e3",
                color: "white",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              📥 ဘာသာပြန်ပြီးသားဖိုင် သိမ်းဆည်းရန်
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleTranslator;
