import React from "react";
import PostComposer from "./components/PostComposer";
import DraftList from "./components/DraftList";

function App() {
  return (
    <div
      style={{
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "700px",
          margin: "auto",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <PostComposer />

        <hr style={{ margin: "30px 0" }} />

        <DraftList />
      </div>
    </div>
  );
}

export default App;