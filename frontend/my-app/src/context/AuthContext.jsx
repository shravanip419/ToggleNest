import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Load auth from localStorage on refresh
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (
        storedUser &&
        storedUser !== "undefined" &&
        storedToken
        ) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        }
    } catch (err) {
        console.error("Auth load failed, clearing storage", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    } finally {
        setLoading(false);
    }
    }, []);

  // ✅ CORRECT LOGIN
  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
