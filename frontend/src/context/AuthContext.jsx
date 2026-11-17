import { createContext, useContext, useState } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = {
  id: 1,
  nama: 'Admin',
  email: 'admin@penjualan.com',
  role: 'admin',
};

const DEFAULT_CUSTOMER = {
  id: 2,
  nama: 'Raka Pradipta',
  perusahaan: 'PT Nusantara Geospasial',
  email: 'customer@damaco.com',
  role: 'customer',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Bersihkan residu akun & cart di localStorage agar saat pertama kali membuka web selalu berstatus katalog tamu (tanpa akun) dan keranjang kosong bersih
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('damaco_cart_guest');
      localStorage.removeItem('damaco_cart_v3');
    } catch (e) {}
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const { token: newToken, user: newUser } = res.data.data;
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true, role: newUser.role, user: newUser };
    } catch (error) {
      // Demo credentials handling
      if (
        credentials.email === 'admin@penjualan.com' ||
        credentials.email === 'rina.kusuma@damaco.com'
      ) {
        const adminUser = { ...DEFAULT_ADMIN, email: credentials.email };
        sessionStorage.setItem('token', 'damaco-session-token-admin');
        sessionStorage.setItem('user', JSON.stringify(adminUser));
        setToken('damaco-session-token-admin');
        setUser(adminUser);
        return { success: true, role: 'admin', user: adminUser };
      }

      if (
        credentials.email === 'customer@damaco.com' ||
        credentials.email === 'raka@nusantarageo.co.id'
      ) {
        const custUser = { ...DEFAULT_CUSTOMER, email: credentials.email };
        sessionStorage.setItem('token', 'damaco-session-token-customer');
        sessionStorage.setItem('user', JSON.stringify(custUser));
        setToken('damaco-session-token-customer');
        setUser(custUser);
        return { success: true, role: 'customer', user: custUser };
      }

      // Check registered customer accounts in LocalStorage
      const registered = JSON.parse(localStorage.getItem('damaco_registered_users_v1') || '[]');
      const matched = registered.find(
        (u) =>
          u.email.toLowerCase() === credentials.email.toLowerCase() &&
          u.password === credentials.password
      );
      if (matched) {
        sessionStorage.setItem('token', 'damaco-session-token-' + matched.id);
        sessionStorage.setItem('user', JSON.stringify(matched));
        setToken('damaco-session-token-' + matched.id);
        setUser(matched);
        return { success: true, role: 'customer', user: matched };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Email atau kata sandi salah. Gunakan akun demo di bawah.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, autoLogin = false) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      nama: userData.namaPic || userData.nama || 'Customer B2B',
      perusahaan: userData.namaPerusahaan || 'Perusahaan B2B',
      email: userData.email,
      telepon: userData.telepon || '0812-3456-7890',
      role: 'customer',
      password: userData.password || 'password',
    };

    // 1. Sinkronisasi ke backend database penjualan_db
    try {
      const res = await authService.register({
        nama: newUser.nama,
        email: newUser.email,
        password: newUser.password,
        telepon: newUser.telepon,
        perusahaan: newUser.perusahaan,
      });
      if (res?.data?.data?.user) {
        newUser.id = res.data.data.user.id;
      }
    } catch (err) {
      console.warn('Backend sync warning on register (falling back to local):', err?.message);
    }

    // 2. Save to registered accounts list in LocalStorage
    const registered = JSON.parse(localStorage.getItem('damaco_registered_users_v1') || '[]');
    const updated = [newUser, ...registered.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase())];
    localStorage.setItem('damaco_registered_users_v1', JSON.stringify(updated));

    // Save user profile for ProfilPerusahaanPage
    const profileData = {
      nama: newUser.perusahaan,
      npwp: '01.234.567.8-012.000',
      alamat: '',
      pic: newUser.nama,
      telepon: newUser.telepon,
      email: newUser.email,
      terdaftarSejak: new Date()
        .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        .toUpperCase(),
    };
    localStorage.setItem('damaco_user_profile_v1', JSON.stringify(profileData));
    localStorage.setItem(`damaco_profile_user_${newUser.email.toLowerCase().trim()}`, JSON.stringify(profileData));

    // Only log in if autoLogin is true; otherwise user must explicitly log in
    if (autoLogin) {
      sessionStorage.setItem('token', 'damaco-session-token-' + newUser.id);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      setToken('damaco-session-token-' + newUser.id);
      setUser(newUser);
    }
    return newUser;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const loginAsAdmin = () => {
    sessionStorage.setItem('token', 'damaco-session-token-admin');
    sessionStorage.setItem('user', JSON.stringify(DEFAULT_ADMIN));
    setToken('damaco-session-token-admin');
    setUser(DEFAULT_ADMIN);
  };

  const loginAsCustomer = () => {
    sessionStorage.setItem('token', 'damaco-session-token-customer');
    sessionStorage.setItem('user', JSON.stringify(DEFAULT_CUSTOMER));
    setToken('damaco-session-token-customer');
    setUser(DEFAULT_CUSTOMER);
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const isKasir = user?.role === 'kasir' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        loginAsAdmin,
        loginAsCustomer,
        isAdmin,
        isCustomer,
        isKasir,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
};
