import React, { useState } from "react";

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "Harshit" && password === "23BAI70435") {
      localStorage.setItem("token", "jwt-token");
      setIsAuthenticated(true);
    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0px 8px 25px rgba(0,0,0,0.25)",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="user"
          width="110"
        />

        <h1 style={{ color: "#1565c0" }}>
          JWT Authentication
        </h1>

        <p style={{ color: "gray" }}>
          Secure Login Portal
        </p>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "90%",
            padding: "12px",
            margin: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "90%",
            padding: "12px",
            margin: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "95%",
            padding: "12px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <p style={{ marginTop: "15px", color: "#777" }}>
  Please enter your credentials
</p>
      </div>
    </div>
  );
}

export default Login;