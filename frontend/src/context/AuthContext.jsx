import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Single officer credential for the prototype
const OFFICER_CREDENTIALS = {
  username: 'officer',
  password: 'hypercrop',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hc_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username, password) => {
    if (
      username === OFFICER_CREDENTIALS.username &&
      password === OFFICER_CREDENTIALS.password
    ) {
      const userData = { username, role: 'officer', name: 'Agriculture Officer' };
      localStorage.setItem('hc_user', JSON.stringify(userData));
      setUser(userData);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid username or password.' };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hc_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
