function Editor() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "850px",
          background: "white",
          padding: "40px",
          borderRadius: "25px",
          textAlign: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Editor"
          style={{
            width: "120px",
            height: "120px",
            marginBottom: "15px",
          }}
        />

        <h1 style={{ color: "#1565c0" }}>
          Welcome Tanisha_24BAI70015
        </h1>

        <h2 style={{ color: "#666" }}>
          Editor Dashboard
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <div style={cardStyle}>
            📝
            <h3>Edit Content</h3>
            <p>Modify application content.</p>
          </div>

          <div style={cardStyle}>
            📂
            <h3>Manage Files</h3>
            <p>Upload and organize files.</p>
          </div>

          <div style={cardStyle}>
            📊
            <h3>View Reports</h3>
            <p>Access reports and analytics.</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "#e3f2fd",
            padding: "15px",
            borderRadius: "15px",
          }}
        >
          <h3>Access Level : Limited Access</h3>
          <p>
            Editor can edit content, manage files
            and view reports.
          </p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  width: "180px",
  background: "#f5f9ff",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
};

export default Editor;