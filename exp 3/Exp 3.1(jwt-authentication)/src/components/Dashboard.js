import React from "react";

function Dashboard({ setIsAuthenticated }) {

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

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
          width: "500px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0px 8px 25px rgba(0,0,0,0.25)",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
          alt="profile"
          width="130"
        />

        <h1 style={{ color: "#2e7d32" }}>
          Welcome Harshit 🎉
        </h1>

        <h3>Role : Student</h3>

        <p>
          JWT Authentication Successful
        </p>

        <button
          onClick={logout}
          style={{
            background: "#e53935",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;