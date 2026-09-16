import React, { useState } from 'react';
import { X, LogIn, UserPlus, Lock, Mail, User, Phone, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, setAuthModalMode, closeAuthModal, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleResetState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsForgotPassword(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      setLoading(true);
      await login(email, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    try {
      setLoading(true);
      await register({ name, email, password, confirmPassword, phone });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      setLoading(true);
      const res = await api.forgotPassword(email);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill test credentials
  const fillCredentials = (type: 'admin' | 'client') => {
    if (type === 'admin') {
      setEmail('admin@nexahost.com.br');
      setPassword('admin123');
    } else {
      setEmail('cliente@exemplo.com');
      setPassword('cliente123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switchers if not in forgot password */}
        {!isForgotPassword && (
          <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              onClick={() => {
                setAuthModalMode('login');
                handleResetState();
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fazer Login
            </button>
            <button
              onClick={() => {
                setAuthModalMode('register');
                handleResetState();
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold font-['Rajdhani'] text-white">
            {isForgotPassword
              ? 'Recuperar Senha'
              : authModalMode === 'login'
              ? 'Acessar Área do Cliente'
              : 'Criar Nova Conta na Nexa Host'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isForgotPassword
              ? 'Informe seu e-mail para receber as instruções'
              : authModalMode === 'login'
              ? 'Gerencie seus pedidos, comprovantes e credenciais de VPS'
              : 'Cadastre-se para contratar suas VPS com segurança'}
          </p>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORMS */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Instruções'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Voltar para o login
              </button>
            </div>
          </form>
        ) : authModalMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Acessando...' : 'Entrar na Conta'}</span>
            </button>

            {/* Quick test credentials buttons */}
            <div className="pt-4 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-500 text-center mb-2 font-mono">
                Acesso de Teste Rápido:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="py-1.5 px-2 rounded-lg bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/50 text-[11px] font-semibold text-purple-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('client')}
                  className="py-1.5 px-2 rounded-lg bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/50 text-[11px] font-semibold text-cyan-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3" />
                  Cliente
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 dígitos"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                Telefone / WhatsApp (Opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Cadastrando...' : 'Finalizar Cadastro'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
