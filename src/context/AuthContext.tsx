import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SiteSettings, ClientNotification } from '../types/index.ts';
import { api, getStoredToken, setStoredToken } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  settings: SiteSettings | null;
  notifications: ClientNotification[];
  unreadNotifsCount: number;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const refreshUser = async () => {
    const stored = getStoredToken();
    if (!stored) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
      setToken(stored);
      refreshNotifications();
    } catch (err) {
      console.error('Auth verification failed', err);
      setStoredToken(null);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!getStoredToken()) return;
    try {
      const notifs = await api.getMyNotifications();
      setNotifications(notifs);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    closeAuthModal();
    refreshNotifications();
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setUser(res.user);
    setToken(res.token);
    closeAuthModal();
    refreshNotifications();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
    setNotifications([]);
  };

  const markNotificationAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        settings,
        notifications,
        unreadNotifsCount,
        login,
        register,
        logout,
        refreshUser,
        refreshSettings,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
        setAuthModalMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
