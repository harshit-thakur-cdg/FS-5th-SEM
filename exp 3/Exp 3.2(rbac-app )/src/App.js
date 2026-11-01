import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Editor from "./pages/Editor";
import Viewer from "./pages/Viewer";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    return (

        <BrowserRouter>

            <nav>
                <Link to="/">Home</Link> |
                <Link to="/admin">Admin</Link> |
                <Link to="/editor">Editor</Link> |
                <Link to="/viewer">Viewer</Link>
            </nav>

            <Routes>

                <Route path="/" element={<Home />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/editor"
                    element={
                        <ProtectedRoute allowedRoles={["Admin","Editor"]}>
                            <Editor />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/viewer"
                    element={
                        <ProtectedRoute allowedRoles={["Admin","Editor","Viewer"]}>
                            <Viewer />
                        </ProtectedRoute>
                    }
                />

                <Route path="/unauthorized" element={<Unauthorized />} />

            </Routes>

        </BrowserRouter>

    );
}

export default App;