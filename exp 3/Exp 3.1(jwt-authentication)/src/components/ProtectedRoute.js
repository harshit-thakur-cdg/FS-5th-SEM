import React from "react";
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <h2 style={{ textAlign: "center" }}>Access Denied</h2>;
  }
  return children;
}
export default ProtectedRoute;
