import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, login as loginAPI, register as registerAPI } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Only fetch profile on initial mount if a token exists in localStorage
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (token && !user) {
        try {
          const data = await getProfile();
          if (!cancelled && data?.user) {
            setUser({
              ...data.user,
              role: data.user.roles?.[0] || 'customer',
            });
          }
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
  }, []);

  const login = async (email, password) => {
    const data = await loginAPI({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      if (data.user) {
        setUser({
          ...data.user,
          role: data.user.roles?.[0] || 'customer',
        });
      }
    }
    return data;
  };

  const register = async (nameOrObj, email, password, role, phone, city, address, businessCategories) => {
    let payload;
    if (typeof nameOrObj === 'object') {
      payload = nameOrObj;
    } else {
      payload = {
        name: nameOrObj,
        email,
        password,
        role: role || 'customer',
        roles: [role || 'customer'],
        phone,
        city,
        address,
        businessCategories: businessCategories || [],
      };
    }
    const data = await registerAPI(payload);
    return data;
  };

  const refreshUser = async () => {
    try {
      const data = await getProfile();
      if (data?.user) {
        setUser({
          ...data.user,
          role: data.user.roles?.[0] || 'customer',
        });
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isShopkeeper = user?.roles?.includes('shopkeeper') || user?.role === 'shopkeeper';
  const isCustomer = user?.roles?.includes('customer') || user?.role === 'customer';
  const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        refreshUser,
        logout,
        isAuthenticated,
        isShopkeeper,
        isCustomer,
        isAdmin,
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
