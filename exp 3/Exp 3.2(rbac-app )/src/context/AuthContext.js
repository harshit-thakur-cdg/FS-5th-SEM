import { createContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const user = {
        name: "Tanisha",
        role: "Admin"
        // Change role to Editor or Viewer
    };

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};