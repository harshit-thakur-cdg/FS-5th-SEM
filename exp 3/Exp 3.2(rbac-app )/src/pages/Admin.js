function Admin() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "750px",
          background: "white",
          padding: "30px",
          borderRadius: "25px",
          textAlign: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
          alt="Admin"
          style={{
            width: "100px",
            height: "100px",
            marginBottom: "15px",
          }}
        />

        <h1 style={{ color: "#1565c0" }}>
          Welcome Tanisha_24BAI70015 👑
        </h1>

        <h2 style={{ color: "#666" }}>
          Administrator Dashboard
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "25px",
          }}
        >
          <div style={cardStyle}>
            👥
            <h3>Manage Users</h3>
            <p>Create, update and remove users.</p>
          </div>

          <div style={cardStyle}>
            📝
            <h3>Edit Data</h3>
            <p>Modify application records.</p>
          </div>

          <div style={cardStyle}>
            📊
            <h3>View Reports</h3>
            <p>Analyze system reports.</p>
          </div>

          <div style={cardStyle}>
            ⚙️
            <h3>Settings</h3>
            <p>Configure system settings.</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "25px",
            background: "#e3f2fd",
            padding: "15px",
            borderRadius: "15px",
          }}
        >
          <h3>Access Level : Full Access</h3>
          <p>
            Admin can manage users, edit data,
            view reports and configure settings.
          </p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  width: "160px",
  background: "#f5f9ff",
  padding: "15px",
  borderRadius: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
};

export default Admin;