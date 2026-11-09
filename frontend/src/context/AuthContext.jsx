import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services';
import { responseData } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    authService.getMe()
      .then((result) => {
        const me = responseData(result);
        const currentUser = me?.user || me;
        if (currentUser && typeof currentUser === 'object') {
          localStorage.setItem('user', JSON.stringify(currentUser));
          setUser(currentUser);
        } else {
          throw new Error('Respons akun tidak valid');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    try {
      const result = await authService.login(credentials);
      const payload = responseData(result) || {};
      const token = payload.token || payload.accessToken;
      const nextUser = payload.user || payload.customer;
      if (!token || !nextUser) return { success: false, message: 'Respons login tidak lengkap.' };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
      return { success: true, user: nextUser };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Tidak dapat masuk. Periksa email dan kata sandi.' };
    }
  }

  async function register(data) {
    try {
      const result = await authService.register(data);
      const payload = responseData(result) || {};
      if (payload.token && (payload.user || payload.customer)) {
        const nextUser = payload.user || payload.customer;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setUser(nextUser);
      }
      return { success: true, data: payload };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Pendaftaran gagal.' };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
