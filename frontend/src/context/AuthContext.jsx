import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("podclub_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("podclub_token"))
      .finally(() => setLoading(false));
  }, []);

  const loginWithToken = (token, userData) => {
    localStorage.setItem("podclub_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("podclub_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
