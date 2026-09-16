import React, { useState } from 'react';
import {
  Server,
  Shield,
  Zap,
  HelpCircle,
  Handshake,
  Headphones,
  User,
  LogIn,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  HardDrive
} from 'lucide-react';
import { NexaLogo } from './NexaLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenCheckout: (planId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, onOpenCheckout }) => {
  const { user, logout, openAuthModal, notifications, unreadNotifsCount, markNotificationAsRead } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Início', view: 'home' },
    { label: 'Planos VPS', view: 'plans' },
    { label: 'Benefícios', view: 'benefits' },
    { label: 'Sobre Nós', view: 'about' },
    { label: 'Parcerias', view: 'partnerships' },
    { label: 'FAQ', view: 'faq' },
    { label: 'Suporte', view: 'support' },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/30 bg-[#07090e]/85 backdrop-blur-md">
      {/* Top microbar with live server status */}
      <div className="hidden sm:flex items-center justify-between px-6 py-1.5 text-xs text-slate-400 border-b border-slate-800/40 bg-[#05070a]/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3.5 inline-block" />
            Anti-DDoS Game 2.5 Tbps Ativo
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">
            Datacenter: <strong className="text-slate-200">São Paulo, BR</strong> (Latência média: 8ms)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Suporte 24/7 para FiveM & Games</span>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            Comunidade Discord <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="focus:outline-none flex items-center text-left cursor-pointer"
        >
          <NexaLogo size="md" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map(link => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons & User Menu */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setNotifsOpen(!notifsOpen)}
                  className="relative p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
                  title="Notificações"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0d131f] border border-cyan-500/30 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                      <span>Notificações</span>
                      <span className="text-cyan-400">{unreadNotifsCount} não lidas</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">Nenhuma notificação no momento.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-2.5 text-xs rounded-lg transition-colors cursor-pointer ${
                              !n.read ? 'bg-cyan-950/30 text-slate-200' : 'text-slate-400 hover:bg-slate-800/40'
                            }`}
                          >
                            <p className="font-semibold text-cyan-300">{n.title}</p>
                            <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown / Area buttons */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all text-sm font-medium text-slate-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-slate-100 leading-none truncate max-w-[120px]">
                      {user.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0d131f] border border-cyan-500/30 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 text-xs">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('client');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/20 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        Área do Cliente
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('client-vps');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/20 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <HardDrive className="w-4 h-4 text-cyan-400" />
                        Minhas VPS
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-950/30 rounded-lg transition-colors cursor-pointer text-left font-semibold"
                        >
                          <Shield className="w-4 h-4 text-purple-400" />
                          Painel Administrativo
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onOpenCheckout()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
              >
                Contratar agora
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                Área do Cliente
              </button>

              <button
                onClick={() => onOpenCheckout()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
              >
                Contratar agora
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => onNavigate('client')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
            >
              <User className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-[#07090e]/95 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.view}
              onClick={() => handleNavClick(link.view)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                currentView === link.view ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-300'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('client')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-cyan-400 border border-cyan-500/30 text-sm font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Área do Cliente
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-950/40 text-purple-300 border border-purple-500/30 text-sm font-semibold"
                  >
                    <Shield className="w-4 h-4" />
                    Painel Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs text-red-400"
                >
                  Sair da Conta
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm font-semibold"
                >
                  Entrar / Login
                </button>
                <button
                  onClick={() => {
                    onOpenCheckout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm"
                >
                  Contratar agora
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
