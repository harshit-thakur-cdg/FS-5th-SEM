import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {

  const [isAuthenticated, setIsAuthenticated] =
    useState(localStorage.getItem("token"));

  return (
    <>
      {isAuthenticated ? (
        <Dashboard
          setIsAuthenticated={setIsAuthenticated}
        />
      ) : (
        <Login
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
    </>
  );
}

export default App;