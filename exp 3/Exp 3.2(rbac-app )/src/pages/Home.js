import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        textAlign: "center",
        paddingTop: "50px",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "45px",
          marginBottom: "10px",
        }}
      >
        Role Based Access Control Portal
      </h1>

      <p
        style={{
          color: "white",
          fontSize: "18px",
          marginBottom: "50px",
        }}
      >
        Select your role to access the system
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
        }}
      >
        {/* Admin */}
        <div style={cardStyle}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
            alt="Admin"
            style={imgStyle}
          />

          <h2>Admin</h2>
          <p>Full System Access</p>

          <Link to="/admin">
            <button style={buttonStyle}>
              Login
            </button>
          </Link>
        </div>

        {/* Editor */}
        <div style={cardStyle}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Editor"
            style={imgStyle}
          />

          <h2>Editor</h2>
          <p>Edit and Manage Content</p>

          <Link to="/editor">
            <button style={buttonStyle}>
              Login
            </button>
          </Link>
        </div>

        {/* Viewer */}
        <div style={cardStyle}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            alt="Viewer"
            style={imgStyle}
          />

          <h2>Viewer</h2>
          <p>Read Only Access</p>

          <Link to="/viewer">
            <button style={buttonStyle}>
              Login
            </button>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <Link to="/unauthorized">
          <button
            style={{
              background: "#e53935",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Unauthorized Demo
          </button>
        </Link>
      </div>
    </div>
  );
}

const cardStyle = {
  width: "280px",
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
};

const imgStyle = {
  width: "100px",
  height: "100px",
};

const buttonStyle = {
  background: "#1976d2",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Home;