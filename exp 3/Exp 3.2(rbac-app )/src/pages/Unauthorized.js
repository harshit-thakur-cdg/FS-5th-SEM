function Unauthorized() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "600px",
          background: "white",
          padding: "40px",
          borderRadius: "25px",
          textAlign: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/753/753345.png"
          alt="Access Denied"
          style={{
            width: "120px",
            marginBottom: "15px",
          }}
        />

        <h1 style={{ color: "#d32f2f" }}>
          Access Denied ❌
        </h1>

        <h2>You are not authorized</h2>

        <p>
          You do not have permission to access
          this page.
        </p>
      </div>
    </div>
  );
}

export default Unauthorized;