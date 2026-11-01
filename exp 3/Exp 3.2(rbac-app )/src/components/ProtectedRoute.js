import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole, userRole }) {
  if (allowedRole !== userRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default ProtectedRoute;