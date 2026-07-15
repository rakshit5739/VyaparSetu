import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, login as loginAPI, register as registerAPI } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Only fetch profile on initial mount if a token exists in localStorage
  // (e.g. page refresh). The login function sets user directly.
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (token && !user) {
        try {
          const data = await getProfile();
          if (!cancelled) setUser(data.user);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          localStorage.removeItem('token');
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        }
      }
      if (!cancelled) setLoading(false);
    };

    loadUser();
    return () => { cancelled = true; };
  }, []); // Run ONCE on mount, not on every token change

  const login = async (email, password) => {
    const data = await loginAPI({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // Use the user data returned by the login API directly — no extra fetch
      if (data.user) {
        setUser(data.user);
      }
    }
    return data;
  };

  const register = async (name, email, password, role, phone, city, address) => {
    const data = await registerAPI({ name, email, password, role, phone, city, address });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
