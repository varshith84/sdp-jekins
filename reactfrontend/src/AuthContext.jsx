import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authSession = localStorage.getItem('authSession');
    if (authSession) {
      const parsedSession = JSON.parse(authSession);
      const storedUser = parsedSession?.user;
      if (storedUser) {
        setUser({
          id: storedUser.id,
          username: storedUser.username,
          email: storedUser.email,
          isAdmin: storedUser.isAdmin || false,
        });
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('authSession', JSON.stringify({ user: userData }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authSession');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
