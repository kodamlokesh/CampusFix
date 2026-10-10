import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchMe, getToken, login as apiLogin, register as apiRegister, setToken, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  useEffect(() => {
    if (!getToken()) return;
    fetchMe()
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (promise) => {
    const data = await promise;
    setToken(data.token);
    setUser(data.user);
  };
  const login = (email, password) => authenticate(apiLogin({ email, password }));
  const register = (form) => authenticate(apiRegister(form));

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
