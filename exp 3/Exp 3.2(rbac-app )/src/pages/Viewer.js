function Viewer() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
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
          src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
          alt="Viewer"
          style={{
            width: "120px",
            height: "120px",
            marginBottom: "15px",
          }}
        />

        <h1 style={{ color: "#2e7d32" }}>
          Welcome Tanisha_24BAI70015
        </h1>

        <h2 style={{ color: "#666" }}>
          Viewer Dashboard
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
            📖
            <h3>View Information</h3>
            <p>Access and read information.</p>
          </div>

          <div style={cardStyle}>
            📊
            <h3>View Reports</h3>
            <p>Read available reports.</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "#e8f5e9",
            padding: "15px",
            borderRadius: "15px",
          }}
        >
          <h3>Access Level : Read Only</h3>
          <p>
            Viewer can only view information
            and reports.
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

export default Viewer;