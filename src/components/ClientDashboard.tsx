import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  HardDrive,
  ShoppingBag,
  CreditCard,
  Headphones,
  User,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Plus,
  Send,
  MessageSquare,
  Shield,
  FileText,
  Upload,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Order, VPS, Ticket, OrderStatus } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface ClientDashboardProps {
  initialTab?: 'dashboard' | 'orders' | 'vps' | 'payments' | 'tickets' | 'profile';
  onNavigateHome: () => void;
  onOpenCheckout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  initialTab = 'dashboard',
  onNavigateHome,
  onOpenCheckout
}) => {
  const { user, logout, notifications, markNotificationAsRead } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'vps' | 'payments' | 'tickets' | 'profile'>(initialTab);

  const [orders, setOrders] = useState<Order[]>([]);
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // VPS copy password feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  // Ticket creation modal
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [newTicketCategory, setNewTicketCategory] = useState('Suporte VPS');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Selected ticket view
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Order payment modal for pending order
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [pixModalData, setPixModalData] = useState<any | null>(null);
  const [copiedPixKey, setCopiedPixKey] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, vpsData, ticketsData] = await Promise.all([
        api.getMyOrders(),
        api.getMyVps(),
        api.getMyTickets()
      ]);
      setOrders(ordersData);
      setVpsList(vpsData);
      setTickets(ticketsData);
    } catch (err) {
      console.error('Failed to load client data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllVpsDetails = (vps: VPS) => {
    const text = `=== NEXA HOST - DADOS DA VPS ===
Nome: ${vps.name}
Plano: ${vps.planName}
IP: ${vps.ip}
Porta: ${vps.port}
Usuário: ${vps.username}
Senha: ${vps.password || '••••••••'}
Sistema Operacional: ${vps.os}
Vencimento: ${vps.expirationDate}
=================================`;
    navigator.clipboard.writeText(text);
    setCopiedId(`all-${vps.id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenPaymentModal = async (order: Order) => {
    setSelectedOrderForPayment(order);
    const pix = await api.getPixQrCode(order.finalPrice);
    setPixModalData(pix);
  };

  const handleUploadReceiptModal = async () => {
    if (!receiptFile || !selectedOrderForPayment) return;
    try {
      setUploadingReceipt(true);
      const res = await api.uploadReceipt(selectedOrderForPayment.id, receiptFile);
      setSelectedOrderForPayment(null);
      setReceiptFile(null);
      loadData();
      alert('Comprovante enviado com sucesso! Status atualizado para "Comprovante em análise".');
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar comprovante.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;
    try {
      setCreatingTicket(true);
      const t = await api.createTicket({
        category: newTicketCategory,
        subject: newTicketSubject,
        message: newTicketMessage
      });
      setTickets([t, ...tickets]);
      setNewTicketModal(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
      setSelectedTicket(t);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar ticket.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      setSendingReply(true);
      const updated = await api.sendTicketMessage(selectedTicket.id, replyMessage.trim());
      setSelectedTicket(updated);
      setReplyMessage('');
      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar resposta.');
    } finally {
      setSendingReply(false);
    }
  };

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Aguardando pagamento':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 w-fit">
            <span>🟡</span> Aguardando pagamento
          </span>
        );
      case 'Comprovante em análise':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-950/60 border border-orange-500/40 text-orange-300 flex items-center gap-1.5 w-fit">
            <span>🟠</span> Comprovante em análise
          </span>
        );
      case 'Pagamento aprovado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 w-fit">
            <span>🟢</span> Pagamento aprovado
          </span>
        );
      case 'Pagamento recusado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/60 border border-red-500/40 text-red-300 flex items-center gap-1.5 w-fit">
            <span>🔴</span> Pagamento recusado
          </span>
        );
      case 'VPS entregue':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-500/40 text-blue-300 flex items-center gap-1.5 w-fit">
            <span>🔵</span> VPS entregue
          </span>
        );
      case 'Cancelado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-400 flex items-center gap-1.5 w-fit">
            <span>⚫</span> Cancelado
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  // Metrics for dashboard
  const activeVpsCount = vpsList.filter(v => v.status === 'VPS entregue').length;
  const pendingPaymentsCount = orders.filter(
    o => o.status === 'Aguardando pagamento' || o.status === 'Pagamento recusado'
  ).length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Fechado').length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Painel do Cliente</span>
            <h1 className="text-3xl font-black font-['Rajdhani'] text-white">
              Olá, {user?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gerencie seus servidores, faturas Pix e tickets de atendimento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors cursor-pointer"
              title="Atualizar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onOpenCheckout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Contratar Nova VPS</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 py-6 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('vps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'vps'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Minhas VPS</span>
            {activeVpsCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeTab === 'vps' ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {activeVpsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Meus Pedidos</span>
            {orders.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeTab === 'orders' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-300'}`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagamentos</span>
            {pendingPaymentsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500 text-slate-950 font-bold animate-pulse">
                {pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Suporte (Tickets)</span>
            {openTicketsCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeTab === 'tickets' ? 'bg-slate-950 text-cyan-400' : 'bg-indigo-500/30 text-indigo-300'}`}>
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>
        </div>

        {/* CONTENT TABS */}
        <div className="py-8">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Notifications Banner if unread */}
              {notifications.filter(n => !n.read).length > 0 && (
                <div className="space-y-2">
                  {notifications.filter(n => !n.read).map(n => (
                    <div
                      key={n.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/40 border border-cyan-500/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{n.title}</p>
                          <p className="text-xs text-slate-300">{n.message}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => markNotificationAsRead(n.id)}
                        className="text-xs text-cyan-400 hover:underline flex-shrink-0 cursor-pointer"
                      >
                        Marcar como lida
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase font-mono">Total de Pedidos</span>
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-white">{orders.length}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Registrados na sua conta</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase font-mono">VPS Ativas</span>
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-emerald-400">{activeVpsCount}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Prontas e online</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase font-mono">Pagamentos Pendentes</span>
                    <CreditCard className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-amber-400">{pendingPaymentsCount}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Aguardando Pix ou comprovante</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase font-mono">Tickets Abertos</span>
                    <Headphones className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-indigo-400">{openTicketsCount}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Em atendimento técnico</span>
                </div>
              </div>

              {/* Quick VPS status overview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-['Rajdhani'] text-white uppercase tracking-wider">
                    Suas VPS Entregues
                  </h3>
                  <button
                    onClick={() => setActiveTab('vps')}
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    Ver todas as VPS →
                  </button>
                </div>

                {vpsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                    <HardDrive className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-slate-300 font-semibold text-sm">Você ainda não possui VPS ativas.</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Assim que seu pedido for confirmado e o administrador entregar a VPS, os dados de acesso aparecerão aqui.
                    </p>
                    <button
                      onClick={onOpenCheckout}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                    >
                      Contratar Plano VPS
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {vpsList.slice(0, 2).map(vps => (
                      <div key={vps.id} className="p-5 rounded-2xl bg-[#0e1422] border border-cyan-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-base">{vps.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                            {vps.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-slate-500 block text-[10px]">IP:</span>
                            <span className="text-cyan-300 font-bold">{vps.ip}:{vps.port}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Usuário:</span>
                            <span className="text-white">{vps.username}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('vps')}
                          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                        >
                          Ver Detalhes e Copiar Senha
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. MINHAS VPS (PAGE COMPLETA) */}
          {activeTab === 'vps' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold font-['Rajdhani'] text-white uppercase">
                    Minhas Instâncias VPS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acesso seguro e exclusivo às suas credenciais de servidor entregues.
                  </p>
                </div>
              </div>

              {vpsList.length === 0 ? (
                <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
                  <HardDrive className="w-12 h-12 mx-auto text-slate-600" />
                  <h4 className="text-lg font-bold text-white font-['Rajdhani']">Nenhuma VPS Entregue no Momento</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Se você já realizou um pedido e enviou o comprovante Pix, nossa equipe está configurando a máquina. A entrega manual é feita assim que o pagamento é aprovado!
                  </p>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-bold uppercase"
                  >
                    Ver Status dos Meus Pedidos
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {vpsList.map(vps => {
                    const isPasswordVisible = visiblePasswordId === vps.id;
                    const isAllCopied = copiedId === `all-${vps.id}`;
                    return (
                      <div
                        key={vps.id}
                        className="rounded-2xl bg-gradient-to-b from-[#0d1424] to-[#07090e] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6"
                      >
                        {/* Header of VPS Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-xl font-bold font-['Rajdhani'] text-white">
                                {vps.name}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                                {vps.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Plano: <strong className="text-slate-200">{vps.planName}</strong> • SO: <strong className="text-cyan-300">{vps.os}</strong>
                            </p>
                          </div>

                          {/* Copy All Data Button */}
                          <button
                            onClick={() => copyAllVpsDetails(vps)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                          >
                            {isAllCopied ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Dados Copiados!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-cyan-400" />
                                <span>📋 Copiar todos os dados</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Connection Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* IP Address */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase block">Endereço IP</span>
                              <span className="font-mono text-sm font-bold text-cyan-400">{vps.ip}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(vps.ip, `ip-${vps.id}`)}
                              className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white"
                              title="Copiar IP"
                            >
                              {copiedId === `ip-${vps.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Port */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase block">Porta</span>
                              <span className="font-mono text-sm font-bold text-white">{vps.port}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(vps.port, `port-${vps.id}`)}
                              className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white"
                              title="Copiar Porta"
                            >
                              {copiedId === `port-${vps.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Username */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase block">Usuário</span>
                              <span className="font-mono text-sm font-bold text-white">{vps.username}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(vps.username, `user-${vps.id}`)}
                              className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white"
                              title="Copiar Usuário"
                            >
                              {copiedId === `user-${vps.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Password */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div className="overflow-hidden">
                              <span className="text-[10px] font-mono text-slate-500 uppercase block">Senha</span>
                              <span className="font-mono text-sm font-bold text-white truncate block">
                                {isPasswordVisible ? (vps.password || '••••••••') : '••••••••'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setVisiblePasswordId(isPasswordVisible ? null : vps.id)}
                                className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white"
                                title="Mostrar / Ocultar"
                              >
                                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(vps.password || '', `pass-${vps.id}`)}
                                className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white"
                                title="Copiar Senha"
                              >
                                {copiedId === `pass-${vps.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Dates & Notes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-slate-400">
                              <span>Data de Ativação:</span>
                              <strong className="text-white font-mono">{vps.activationDate}</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Data de Vencimento:</span>
                              <strong className="text-cyan-400 font-mono">{vps.expirationDate}</strong>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs">
                            <span className="text-slate-500 font-mono block text-[10px] uppercase">Observações da Entrega:</span>
                            <p className="mt-1">{vps.notes || 'Sem observações adicionais.'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. MEUS PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-['Rajdhani'] text-white uppercase">
                  Histórico de Pedidos
                </h3>
                <p className="text-xs text-slate-400">
                  Acompanhe a evolução de cada pedido realizado.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
                  <p className="text-slate-400 text-sm">Nenhum pedido encontrado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-white">#{order.id}</span>
                          {renderStatusBadge(order.status)}
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-white font-['Rajdhani']">{order.planName}</h4>
                          <p className="text-xs text-slate-400">
                            Servidor: <strong className="text-slate-200">{order.serverName || 'Padrão'}</strong> • SO: {order.desiredOs}
                          </p>
                        </div>

                        <div className="text-xs text-slate-500 font-mono">
                          Criado em: {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </div>

                        {order.refusalReason && order.status === 'Pagamento recusado' && (
                          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                            <strong>Motivo da recusa:</strong> {order.refusalReason}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Valor Total</span>
                          <span className="text-2xl font-black font-['Rajdhani'] text-cyan-400">
                            R$ {order.finalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Actions according to status */}
                        {(order.status === 'Aguardando pagamento' || order.status === 'Pagamento recusado') && (
                          <button
                            onClick={() => handleOpenPaymentModal(order)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pagar / Enviar Comprovante</span>
                          </button>
                        )}

                        {order.status === 'Comprovante em análise' && (
                          <span className="text-xs text-amber-400 font-medium">
                            Aguardando validação da equipe...
                          </span>
                        )}

                        {order.status === 'VPS entregue' && (
                          <button
                            onClick={() => setActiveTab('vps')}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase cursor-pointer"
                          >
                            Acessar Minha VPS
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. PAGAMENTOS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-['Rajdhani'] text-white uppercase">
                  Central de Pagamentos Pix
                </h3>
                <p className="text-xs text-slate-400">
                  Histórico financeiro e pagamentos pendentes de aprovação.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-white">Pedido #{order.id}</span>
                      {renderStatusBadge(order.status)}
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-slate-400">{order.planName}</span>
                      <strong className="text-lg font-mono text-cyan-400">
                        R$ {order.finalPrice.toFixed(2).replace('.', ',')}
                      </strong>
                    </div>

                    {order.receiptName && (
                      <div className="text-xs text-slate-400 flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span className="truncate">{order.receiptName}</span>
                      </div>
                    )}

                    {(order.status === 'Aguardando pagamento' || order.status === 'Pagamento recusado') && (
                      <button
                        onClick={() => handleOpenPaymentModal(order)}
                        className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                      >
                        Realizar Pagamento Pix
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SUPORTE (TICKETS) */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-['Rajdhani'] text-white uppercase">
                    Central de Suporte (Tickets)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Abra chamados para dúvidas de configuração, portas ou financeiro.
                  </p>
                </div>
                <button
                  onClick={() => setNewTicketModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Abrir Novo Ticket</span>
                </button>
              </div>

              {/* View single ticket conversation */}
              {selectedTicket ? (
                <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="text-xs text-cyan-400 hover:underline mb-2 cursor-pointer block"
                      >
                        ← Voltar para lista de tickets
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">#{selectedTicket.ticketNumber}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
                          {selectedTicket.category}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                          {selectedTicket.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold font-['Rajdhani'] text-white mt-1">
                        {selectedTicket.subject}
                      </h4>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedTicket.messages.map(msg => {
                      const isAdmin = msg.senderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl border max-w-2xl ${
                            isAdmin
                              ? 'bg-purple-950/20 border-purple-500/40 ml-auto text-right'
                              : 'bg-slate-950/80 border-slate-800 mr-auto text-left'
                          }`}
                        >
                          <div className={`flex items-center gap-2 text-xs mb-1.5 ${isAdmin ? 'justify-end text-purple-300' : 'text-cyan-300'}`}>
                            <span className="font-bold">{msg.senderName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(msg.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Box */}
                  {selectedTicket.status !== 'Fechado' ? (
                    <form onSubmit={handleSendTicketReply} className="pt-4 border-t border-slate-800 space-y-3">
                      <textarea
                        rows={3}
                        required
                        placeholder="Escreva sua resposta para nossa equipe de suporte..."
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={sendingReply}
                          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingReply ? 'Enviando...' : 'Enviar Resposta'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      Este chamado foi finalizado e fechado.
                    </div>
                  )}
                </div>
              ) : (
                /* Ticket List */
                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                      <Headphones className="w-10 h-10 mx-auto text-slate-600" />
                      <p className="text-sm text-slate-400">Você não possui tickets abertos.</p>
                    </div>
                  ) : (
                    tickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-cyan-400">#{t.ticketNumber}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">{t.category}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-[10px] font-mono">
                              {new Date(t.updatedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white font-['Rajdhani'] mt-1">{t.subject}</h4>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          t.status === 'Aberto' ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30' :
                          t.status === 'Em atendimento' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' :
                          'bg-slate-900 text-slate-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* 6. PERFIL */}
          {activeTab === 'profile' && (
            <div className="max-w-xl rounded-2xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
              <h3 className="text-2xl font-bold font-['Rajdhani'] text-white uppercase">
                Meu Perfil
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1">E-mail Cadastrado</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    disabled
                    value={user?.phone || 'Não informado'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1">Tipo de Acesso</label>
                  <span className="font-mono text-cyan-400 font-bold uppercase">{user?.role}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    onNavigateHome();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/50 text-xs font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Minha Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Open New Support Ticket */}
      {newTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold font-['Rajdhani'] text-white">Abrir Novo Ticket</h3>
              <button onClick={() => setNewTicketModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Categoria
                </label>
                <select
                  value={newTicketCategory}
                  onChange={e => setNewTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500"
                >
                  <option value="Suporte VPS">Suporte VPS</option>
                  <option value="Pagamento">Pagamento</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Parceria">Parceria</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Assunto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre liberação de porta FiveM"
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Mensagem Detalhada
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva detalhadamente sua solicitação..."
                  value={newTicketMessage}
                  onChange={e => setNewTicketMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase"
                >
                  {creatingTicket ? 'Enviando...' : 'Criar Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Payment / Re-upload receipt for pending order */}
      {selectedOrderForPayment && pixModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold font-['Rajdhani'] text-white">
                Pagamento Pedido #{selectedOrderForPayment.id}
              </h3>
              <button onClick={() => setSelectedOrderForPayment(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">{selectedOrderForPayment.planName}</span>
              <strong className="text-xl font-mono text-cyan-400">
                R$ {selectedOrderForPayment.finalPrice.toFixed(2).replace('.', ',')}
              </strong>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              {pixModalData.qrCodeUrl && (
                <img src={pixModalData.qrCodeUrl} alt="Pix QR" className="w-40 h-40 bg-white p-2 rounded-lg" />
              )}
              <div className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all flex items-center justify-between gap-2">
                <span className="truncate">{pixModalData.pixKey}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixModalData.pixKey);
                    setCopiedPixKey(true);
                    setTimeout(() => setCopiedPixKey(false), 2000);
                  }}
                  className="text-cyan-400"
                >
                  {copiedPixKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 font-mono uppercase">
                Anexar Comprovante (JPG, PNG, PDF)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-cyan-400 file:font-semibold hover:file:bg-slate-700"
              />

              <button
                onClick={handleUploadReceiptModal}
                disabled={!receiptFile || uploadingReceipt}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingReceipt ? 'Enviando...' : 'Enviar Comprovante'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
