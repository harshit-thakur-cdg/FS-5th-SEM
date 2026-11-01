import { useState } from "react";

// --- Experiment 1.1: Basic Post Composer ---
function Exp11() {
  const [platform, setPlatform] = useState("Twitter");
  const [post, setPost] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const limits = {
    Twitter: 280,
    LinkedIn: 3000,
    Instagram: 2200,
  };

  const limit = limits[platform];
  const isExceeded = post.length > limit;

  const handleSaveDraft = () => {
    if (post.trim() === "") {
      alert("Please write something first!");
      return;
    }
    if (isExceeded) {
      alert("Cannot save draft: Character limit exceeded!");
      return;
    }
    setStatusMessage("Draft saved successfully!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Post Composer</h1>

      <label>
        <b>Select Platform:</b>
      </label>

      <br />
      <br />

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option>Twitter</option>
        <option>LinkedIn</option>
        <option>Instagram</option>
      </select>

      <br />
      <br />

      <label>
        <b>Write Your Post:</b>
      </label>

      <br />
      <br />

      <textarea
        rows="6"
        cols="60"
        placeholder="Type your post here..."
        value={post}
        onChange={(e) => setPost(e.target.value)}
      ></textarea>

      <br />
      <br />

      <p>
        Characters: {post.length} / {limit}
      </p>

      {isExceeded ? (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ❌ Character limit exceeded!
        </p>
      ) : (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ Ready to post
        </p>
      )}

      <br />

      <button onClick={handleSaveDraft}>Save Draft</button>
      {statusMessage && (
        <span style={{ marginLeft: "15px", color: "green", fontWeight: "bold" }}>
          {statusMessage}
        </span>
      )}
    </div>
  );
}

// --- Experiment 1.2: Advanced Social Media Post Composer with Drafts ---
function Exp12() {
  const [platform, setPlatform] = useState("Twitter");
  const [post, setPost] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const limits = {
    Twitter: 280,
    LinkedIn: 3000,
    Instagram: 2200,
  };

  const limit = limits[platform];
  const isExceeded = post.length > limit;

  const saveDraft = () => {
    if (post.trim() === "") {
      alert("Please write something first!");
      return;
    }

    if (isExceeded) {
      alert("Cannot save draft: Character limit exceeded for " + platform + "!");
      return;
    }

    const draftItem = {
      id: Date.now(),
      text: post,
      platform: platform,
    };

    if (editingIndex !== null) {
      const updatedDrafts = [...drafts];
      updatedDrafts[editingIndex] = draftItem;
      setDrafts(updatedDrafts);
      setEditingIndex(null);
    } else {
      setDrafts([...drafts, draftItem]);
    }
    setPost("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setPost("");
  };

  const editDraft = (index) => {
    const draft = drafts[index];
    if (typeof draft === "string") {
      setPost(draft);
    } else {
      setPost(draft.text);
      if (draft.platform && limits[draft.platform]) {
        setPlatform(draft.platform);
      }
    }
    setEditingIndex(index);
  };

  const deleteDraft = (index) => {
    const updatedDrafts = drafts.filter((_, i) => i !== index);
    setDrafts(updatedDrafts);
    if (editingIndex === index) {
      setEditingIndex(null);
      setPost("");
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          maxWidth: "650px",
          margin: "auto",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "30px",
          }}
        >
          📱 Social Media Post Composer
        </h1>

        <label>
          <b>Select Platform</b>
        </label>

        <br />
        <br />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "16px",
            border: "1px solid #ced4da",
            boxSizing: "border-box",
          }}
        >
          <option>Twitter</option>
          <option>LinkedIn</option>
          <option>Instagram</option>
        </select>

        <br />
        <br />

        <label>
          <b>Write Your Post</b>
        </label>

        <br />
        <br />

        <textarea
          rows="6"
          placeholder="Type your post here..."
          value={post}
          onChange={(e) => setPost(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: isExceeded ? "2px solid red" : "2px solid #ccc",
            fontSize: "16px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        ></textarea>

        <br />
        <br />

        <p
          style={{
            fontWeight: "bold",
            color: isExceeded ? "red" : "#2c3e50",
          }}
        >
          Characters: {post.length} / {limit}
        </p>

        {isExceeded ? (
          <p
            style={{
              color: "red",
              fontWeight: "bold",
            }}
          >
            ❌ Character limit exceeded!
          </p>
        ) : (
          <p
            style={{
              color: "green",
              fontWeight: "bold",
            }}
          >
            ✅ Ready to post
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            onClick={saveDraft}
            style={{
              backgroundColor: isExceeded ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: isExceeded ? "not-allowed" : "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            💾 {editingIndex !== null ? "Update Draft" : "Save Draft"}
          </button>

          {editingIndex !== null && (
            <button
              onClick={cancelEdit}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <hr style={{ margin: "30px 0", borderColor: "#eee" }} />

        <h2>📂 Saved Drafts</h2>

        {drafts.length === 0 ? (
          <p style={{ color: "#6c757d" }}>No drafts available.</p>
        ) : (
          drafts.map((draft, index) => {
            const draftText = typeof draft === "string" ? draft : draft.text;
            const draftPlatform = typeof draft === "object" ? draft.platform : null;

            return (
              <div
                key={typeof draft === "object" && draft.id ? draft.id : index}
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
                  border: editingIndex === index ? "2px solid #007bff" : "1px solid #e9ecef",
                }}
              >
                {draftPlatform && (
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#e2e8f0",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    {draftPlatform}
                  </span>
                )}
                <p style={{ whiteSpace: "pre-wrap", margin: "8px 0" }}>{draftText}</p>

                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => editDraft(index)}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    ✏ Edit
                  </button>

                  <button
                    onClick={() => deleteDraft(index)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Main App Container with toggle between Exp 1.1 and Exp 1.2
function App() {
  const [activeTab, setActiveTab] = useState("exp1.2");

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          padding: "12px 20px",
          backgroundColor: "#212529",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <span
          style={{
            color: "#adb5bd",
            fontWeight: "bold",
            alignSelf: "center",
            marginRight: "15px",
          }}
        >
          Lab Experiments:
        </span>
        <button
          onClick={() => setActiveTab("exp1.1")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "exp1.1" ? "#007bff" : "#495057",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: activeTab === "exp1.1" ? "bold" : "normal",
            transition: "background 0.2s",
          }}
        >
          Exp 1.1 (Basic Composer)
        </button>
        <button
          onClick={() => setActiveTab("exp1.2")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "exp1.2" ? "#007bff" : "#495057",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: activeTab === "exp1.2" ? "bold" : "normal",
            transition: "background 0.2s",
          }}
        >
          Exp 1.2 (Social Media Composer & Drafts)
        </button>
      </nav>

      {activeTab === "exp1.1" ? <Exp11 /> : <Exp12 />}
    </div>
  );
}

export default App;
