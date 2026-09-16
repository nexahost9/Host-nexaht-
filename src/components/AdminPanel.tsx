import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  HardDrive,
  Layers,
  Tag,
  Headphones,
  Handshake,
  Bell,
  Settings,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Plus,
  Trash2,
  Edit,
  Save,
  Send,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Order,
  VPS,
  Plan,
  Ticket,
  Coupon,
  Partnership,
  Announcement,
  SystemSettings,
  OrderStatus
} from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AdminPanelProps {
  onNavigateHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateHome }) => {
  const { user, settings, updateSettings } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'clients'
    | 'orders'
    | 'payments'
    | 'vps'
    | 'plans'
    | 'coupons'
    | 'tickets'
    | 'partnerships'
    | 'announcements'
    | 'settings'
  >('dashboard');

  // Datasets
  const [stats, setStats] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [config, setConfig] = useState<SystemSettings | null>(settings);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Action States
  // 1. Deliver VPS Modal
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [vpsFormData, setVpsFormData] = useState({
    name: '',
    ip: '',
    port: '3389',
    username: 'Administrator',
    password: '',
    os: 'Windows Server 2022 Datacenter',
    activationDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Acesso liberado. Recomendamos trocar a senha no primeiro logon.'
  });

  // 2. Refusal Modal
  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const [refusalOrderId, setRefusalOrderId] = useState<string | null>(null);
  const [refusalReason, setRefusalReason] = useState('Comprovante ilegível ou valor divergente.');

  // 3. Receipt Preview Modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // 4. Plan Edit/Create Modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);

  // 5. Coupon Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    active: true
  });

  // 6. Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'promo',
    active: true
  });

  // 7. Ticket Reply State
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<Ticket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const loadAllAdminData = async () => {
    try {
      setIsLoading(true);
      const [
        statsData,
        clientsData,
        ordersData,
        vpsData,
        plansData,
        couponsData,
        ticketsData,
        partnershipsData,
        announcementsData
      ] = await Promise.all([
        api.getAdminStats(),
        api.getAdminClients(),
        api.getAdminOrders(),
        api.getAdminVps(),
        api.getAdminPlans(),
        api.getAdminCoupons(),
        api.getAdminTickets(),
        api.getAdminPartnerships(),
        api.getAdminAnnouncements()
      ]);

      setStats(statsData);
      setClients(clientsData);
      setOrders(ordersData);
      setVpsList(vpsData);
      setPlans(plansData);
      setCoupons(couponsData);
      setTickets(ticketsData);
      setPartnerships(partnershipsData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  useEffect(() => {
    if (settings) setConfig(settings);
  }, [settings]);

  // Order Actions
  const handleApprovePayment = async (orderId: string) => {
    if (!confirm(`Deseja aprovar o pagamento do Pedido #${orderId}?`)) return;
    try {
      await api.updateOrderStatus(orderId, 'Pagamento aprovado');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar pedido.');
    }
  };

  const handleOpenRefusalModal = (orderId: string) => {
    setRefusalOrderId(orderId);
    setRefusalModalOpen(true);
  };

  const handleConfirmRefusal = async () => {
    if (!refusalOrderId) return;
    try {
      await api.updateOrderStatus(refusalOrderId, 'Pagamento recusado', refusalReason);
      setRefusalModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao recusar pedido.');
    }
  };

  // Open Deliver VPS Modal
  const handleOpenDeliverModal = (order: Order) => {
    setSelectedOrderForDelivery(order);
    setVpsFormData({
      name: order.serverName || `VPS ${order.planName}`,
      ip: '177.54.148.' + Math.floor(Math.random() * 200 + 20),
      port: order.desiredOs?.toLowerCase().includes('windows') ? '3389' : '22',
      username: order.desiredOs?.toLowerCase().includes('windows') ? 'Administrator' : 'root',
      password: 'Nx' + Math.random().toString(36).slice(-8) + '!',
      os: order.desiredOs || 'Windows Server 2022 Datacenter',
      activationDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'VPS entregue com Anti-DDoS ativo. Conexão via RDP/SSH.'
    });
    setDeliverModalOpen(true);
  };

  const handleSubmitVpsDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;

    try {
      await api.deliverVps(selectedOrderForDelivery.id, vpsFormData);
      setDeliverModalOpen(false);
      setSelectedOrderForDelivery(null);
      await loadAllAdminData();
      alert('VPS entregue com sucesso! O cliente foi notificado e o status do pedido foi atualizado para "VPS entregue".');
    } catch (err: any) {
      alert(err.message || 'Erro ao entregar VPS.');
    }
  };

  // Plan Management
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      if (editingPlan.id) {
        await api.updatePlan(editingPlan.id, editingPlan);
      } else {
        await api.createPlan(editingPlan);
      }
      setPlanModalOpen(false);
      setEditingPlan(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar plano.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await api.deletePlan(planId);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir plano.');
    }
  };

  // Coupon Management
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon(newCouponData);
      setCouponModalOpen(false);
      setNewCouponData({ code: '', type: 'percent', value: 10, active: true });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar cupom.');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Deseja excluir este cupom?')) return;
    try {
      await api.deleteCoupon(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cupom.');
    }
  };

  // Ticket Management
  const handleAdminTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminTicket || !adminReplyText.trim()) return;
    try {
      const updated = await api.sendTicketMessage(selectedAdminTicket.id, adminReplyText.trim());
      setSelectedAdminTicket(updated);
      setAdminReplyText('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao responder chamado.');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      const updated = await api.updateTicketStatus(ticketId, status);
      if (selectedAdminTicket?.id === ticketId) setSelectedAdminTicket(updated);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  // Partnership Status
  const handleUpdatePartnership = async (id: string, status: 'Aprovada' | 'Recusada') => {
    try {
      await api.updatePartnershipStatus(id, status);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar parceria.');
    }
  };

  // Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement(announcementData);
      setAnnouncementModalOpen(false);
      setAnnouncementData({ title: '', message: '', type: 'info', active: true });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar aviso.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover aviso.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      await updateSettings(config);
      alert('Configurações salvas com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Site</span>
          </button>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 border border-purple-500/40 text-purple-300 uppercase">
              Admin Master
            </span>
            <span className="font-bold text-white text-sm font-['Rajdhani']">
              Painel de Gestão Nexa Host
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 cursor-pointer"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Admin Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-[#080c16] border-r border-slate-800/80 p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-500">Módulos Administrativos</div>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'clients', label: 'Clientes', icon: Users, badge: clients.length },
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: stats?.pendingOrders || 0, badgeColor: 'bg-amber-500 text-slate-950' },
            { id: 'payments', label: 'Pagamentos Pix', icon: CreditCard },
            { id: 'vps', label: 'VPS Entregues', icon: HardDrive, badge: vpsList.length },
            { id: 'plans', label: 'Planos VPS', icon: Layers },
            { id: 'coupons', label: 'Cupons de Desconto', icon: Tag },
            { id: 'tickets', label: 'Tickets Suporte', icon: Headphones, badge: stats?.openTickets || 0, badgeColor: 'bg-indigo-500 text-white' },
            { id: 'partnerships', label: 'Parcerias', icon: Handshake, badge: partnerships.filter(p => p.status === 'Pendente').length },
            { id: 'announcements', label: 'Avisos no Site', icon: Bell },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Admin Content View */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-x-hidden">
          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  Painel de Controle Geral
                </h2>
                <p className="text-xs text-slate-400">
                  Visão consolidada da operação, faturamento e solicitações pendentes.
                </p>
              </div>

              {/* 6 requested metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-[#0e1422] border border-cyan-500/30">
                  <div className="flex justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                    <span>Total de Clientes</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-white">{stats.totalClients}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Usuários registrados na base</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40">
                  <div className="flex justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                    <span>Pedidos Pendentes</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-amber-400">{stats.pendingOrders}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Aguardando análise ou pagamento</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1422] border border-emerald-500/40">
                  <div className="flex justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                    <span>Pedidos Aprovados</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-emerald-400">{stats.approvedOrders}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Pagamentos Pix validados</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1422] border border-cyan-500/40">
                  <div className="flex justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                    <span>Faturamento Total</span>
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-cyan-400">
                    R$ {stats.totalRevenue?.toFixed(2).replace('.', ',')}
                  </p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Recebido via Pix</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1422] border border-blue-500/40">
                  <div className="flex justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                    <span>VPS Ativas</span>
                    <HardDrive className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-blue-400">{stats.activeVps}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Instâncias online entregues</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1422] border border-indigo-500/40">
                  <div className="flex justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                    <span>Tickets Abertos</span>
                    <Headphones className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-3xl font-black font-['Rajdhani'] text-indigo-400">{stats.openTickets}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Aguardando atendimento</span>
                </div>
              </div>

              {/* Quick Pending Orders Table */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-['Rajdhani'] text-white uppercase">
                    Pedidos que Precisam de Atenção Imediata
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    Ver todos os pedidos →
                  </button>
                </div>

                {orders.filter(o => o.status === 'Comprovante em análise' || o.status === 'Pagamento aprovado').length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">Nenhum pedido pendente de aprovação ou entrega no momento.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-mono uppercase">
                          <th className="py-2.5">Pedido</th>
                          <th className="py-2.5">Cliente</th>
                          <th className="py-2.5">Plano</th>
                          <th className="py-2.5">Valor</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {orders
                          .filter(o => o.status === 'Comprovante em análise' || o.status === 'Pagamento aprovado')
                          .map(o => (
                            <tr key={o.id} className="hover:bg-slate-800/30">
                              <td className="py-3 font-mono font-bold text-white">#{o.id}</td>
                              <td className="py-3">
                                <p className="font-semibold text-white">{o.userName}</p>
                                <p className="text-[10px] text-slate-500">{o.userEmail}</p>
                              </td>
                              <td className="py-3">{o.planName}</td>
                              <td className="py-3 font-mono text-cyan-400 font-bold">
                                R$ {o.finalPrice.toFixed(2)}
                              </td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-950/60 text-orange-300 border border-orange-500/30">
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {o.status === 'Comprovante em análise' && (
                                  <div className="flex items-center justify-end gap-2">
                                    {o.receiptUrl && (
                                      <a
                                        href={o.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700"
                                        title="Ver comprovante"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleApprovePayment(o.id)}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                                    >
                                      Aprovar
                                    </button>
                                  </div>
                                )}
                                {o.status === 'Pagamento aprovado' && (
                                  <button
                                    onClick={() => handleOpenDeliverModal(o)}
                                    className="px-3 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-[11px] uppercase tracking-wider"
                                  >
                                    Entregar VPS
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GERENCIAMENTO DE CLIENTES */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  Clientes Cadastrados ({clients.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Visualize os usuários registrados, seus pedidos e VPS entregues.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(c => (
                  <div key={c.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{c.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{c.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${c.role === 'admin' ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-300'}`}>
                        {c.role}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Telefone: <span className="text-slate-200">{c.phone || 'Não informado'}</span></p>
                      <p>Cadastrado em: <span className="text-slate-300 font-mono">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Pedidos</span>
                        <span className="text-lg font-bold text-white font-['Rajdhani']">{c.orders?.length || 0}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">VPS Ativas</span>
                        <span className="text-lg font-bold text-cyan-400 font-['Rajdhani']">{c.vpsList?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GERENCIAMENTO DE PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                    Gerenciamento de Pedidos ({filteredOrders.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Acompanhe pagamentos, aprove comprovantes e realize a entrega manual das VPS.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, nome ou e-mail do cliente..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="Aguardando pagamento">🟡 Aguardando pagamento</option>
                    <option value="Comprovante em análise">🟠 Comprovante em análise</option>
                    <option value="Pagamento aprovado">🟢 Pagamento aprovado</option>
                    <option value="Pagamento recusado">🔴 Pagamento recusado</option>
                    <option value="VPS entregue">🔵 VPS entregue</option>
                    <option value="Cancelado">⚫ Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
                    Nenhum pedido encontrado com os filtros selecionados.
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-white">#{order.id}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">
                            {order.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white">{order.planName}</h4>
                          <p className="text-xs text-slate-400">
                            Cliente: <strong className="text-slate-200">{order.userName}</strong> ({order.userEmail})
                          </p>
                          <p className="text-xs text-slate-400">
                            Servidor: {order.serverName || 'Padrão'} • SO Desejado: {order.desiredOs}
                          </p>
                        </div>

                        <div className="text-xs text-slate-500 font-mono">
                          Criado em: {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </div>

                        {order.refusalReason && (
                          <p className="text-xs text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-900/40">
                            Motivo de recusa: {order.refusalReason}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Valor Total</span>
                          <span className="text-2xl font-black font-['Rajdhani'] text-cyan-400">
                            R$ {order.finalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Comprovante Link */}
                        {order.receiptUrl && (
                          <a
                            href={order.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Comprovante Anexado ({order.receiptName})</span>
                          </a>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Botão: Aprovar pagamento */}
                          {order.status === 'Comprovante em análise' && (
                            <button
                              onClick={() => handleApprovePayment(order.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                              Aprovar Pagamento
                            </button>
                          )}

                          {/* Botão: Recusar pagamento */}
                          {(order.status === 'Comprovante em análise' || order.status === 'Aguardando pagamento') && (
                            <button
                              onClick={() => handleOpenRefusalModal(order.id)}
                              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                              Recusar Pagamento
                            </button>
                          )}

                          {/* Botão: Entregar VPS */}
                          {(order.status === 'Pagamento aprovado' || order.status === 'Comprovante em análise') && (
                            <button
                              onClick={() => handleOpenDeliverModal(order)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 cursor-pointer flex items-center gap-1.5"
                            >
                              <HardDrive className="w-3.5 h-3.5" />
                              <span>Entregar VPS</span>
                            </button>
                          )}

                          {order.status === 'VPS entregue' && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              VPS Entregue ao Cliente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GERENCIAMENTO DE PAGAMENTOS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  Histórico de Pagamentos Pix
                </h2>
                <p className="text-xs text-slate-400">
                  Todos os comprovantes recebidos e validações financeiras.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-slate-900/60 border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono uppercase bg-slate-950/60">
                      <th className="p-4">Pedido</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Comprovante</th>
                      <th className="p-4">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-white">#{o.id}</td>
                        <td className="p-4">
                          <p className="font-semibold text-white">{o.userName}</p>
                          <p className="text-[10px] text-slate-500">{o.userEmail}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-cyan-400">
                          R$ {o.finalPrice.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {o.receiptUrl ? (
                            <a
                              href={o.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Visualizar
                            </a>
                          ) : (
                            <span className="text-slate-600">Não anexado</span>
                          )}
                        </td>
                        <td className="p-4 text-[11px] text-slate-500 font-mono">
                          {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: GERENCIAMENTO DE VPS */}
          {activeTab === 'vps' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  VPS Entregues aos Clientes ({vpsList.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Visualize credenciais, altere status (Ativa, Suspensa, Cancelada) e adicione observações.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vpsList.map(vps => (
                  <div key={vps.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white font-['Rajdhani']">{vps.name}</h4>
                        <p className="text-xs text-slate-400">Plano: {vps.planName} • Pedido #{vps.orderId}</p>
                      </div>
                      <select
                        value={vps.status}
                        onChange={async e => {
                          await api.updateVps(vps.id, { status: e.target.value as any });
                          loadAllAdminData();
                        }}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300"
                      >
                        <option value="VPS entregue">VPS entregue</option>
                        <option value="Suspensa">Suspensa</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] block">IP / Porta:</span>
                        <span className="text-white">{vps.ip}:{vps.port}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Usuário:</span>
                        <span className="text-white">{vps.username}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Senha:</span>
                        <span className="text-cyan-400">{vps.password}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Vencimento:</span>
                        <span className="text-slate-300">{vps.expirationDate}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Observações:</span>
                      <p className="mt-0.5">{vps.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GERENCIAMENTO DE PLANOS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                    Planos VPS ({plans.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Crie, edite, altere preços e configure os recursos de cada plano sem tocar no código.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan({
                      name: '',
                      cpu: 'AMD Ryzen 9 (4 vCPU)',
                      ram: '16 GB DDR5',
                      storage: '120 GB NVMe Gen4',
                      location: 'São Paulo, BR',
                      protection: 'Anti-DDoS Game 2.5 Tbps',
                      price: 199.90,
                      features: ['Acesso RDP/SSH', 'FiveM Pronto', 'Uptime 99.9%'],
                      popular: false,
                      category: 'fivem',
                      active: true
                    });
                    setPlanModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Plano</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold font-['Rajdhani'] text-white">{plan.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${plan.active ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                          {plan.active ? 'Ativo' : 'Desativado'}
                        </span>
                      </div>

                      <div className="text-2xl font-black font-['Rajdhani'] text-cyan-400 mb-4">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                        <span className="text-xs text-slate-500 font-normal">/mês</span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                        <p>CPU: {plan.cpu}</p>
                        <p>RAM: {plan.ram}</p>
                        <p>Disco: {plan.storage}</p>
                        <p>Localização: {plan.location}</p>
                        <p>Proteção: {plan.protection}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setPlanModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/40 cursor-pointer"
                        title="Excluir Plano"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: GERENCIAMENTO DE CUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                    Cupons de Desconto ({coupons.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Crie códigos promocionais para campanhas de marketing e parcerias.
                  </p>
                </div>
                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Cupom</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-base font-bold text-cyan-400 tracking-wider">
                        {coupon.code}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {coupon.type === 'percent' ? `${coupon.value}% de desconto` : `R$ ${coupon.value.toFixed(2)} OFF`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: SUPORTE & TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  Atendimento & Chamados ({tickets.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Responda chamados de clientes em tempo real.
                </p>
              </div>

              {selectedAdminTicket ? (
                <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <button
                        onClick={() => setSelectedAdminTicket(null)}
                        className="text-xs text-cyan-400 hover:underline mb-2 cursor-pointer block"
                      >
                        ← Voltar para lista
                      </button>
                      <h4 className="text-xl font-bold font-['Rajdhani'] text-white">
                        Ticket #{selectedAdminTicket.ticketNumber}: {selectedAdminTicket.subject}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cliente: {selectedAdminTicket.userName} ({selectedAdminTicket.userEmail})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAdminTicket.status}
                        onChange={e => handleUpdateTicketStatus(selectedAdminTicket.id, e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300"
                      >
                        <option value="Aberto">Aberto</option>
                        <option value="Em atendimento">Em atendimento</option>
                        <option value="Fechado">Fechado</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedAdminTicket.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border max-w-2xl ${
                          msg.senderRole === 'admin'
                            ? 'bg-purple-950/20 border-purple-500/40 ml-auto text-right'
                            : 'bg-slate-950 border-slate-800 mr-auto text-left'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs mb-1.5 justify-between">
                          <span className="font-bold text-cyan-300">{msg.senderName} ({msg.senderRole})</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Admin Reply */}
                  <form onSubmit={handleAdminTicketReply} className="pt-4 border-t border-slate-800 space-y-3">
                    <textarea
                      rows={3}
                      required
                      placeholder="Escreva a resposta oficial da Nexa Host para o cliente..."
                      value={adminReplyText}
                      onChange={e => setAdminReplyText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                      >
                        Enviar Resposta ao Cliente
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedAdminTicket(t)}
                      className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-cyan-400">#{t.ticketNumber}</span>
                          <span className="text-slate-400">• {t.userName}</span>
                          <span className="text-slate-500">• {t.category}</span>
                        </div>
                        <h4 className="text-base font-bold text-white font-['Rajdhani'] mt-1">{t.subject}</h4>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-semibold bg-slate-800 text-slate-300">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: PARCERIAS */}
          {activeTab === 'partnerships' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  Solicitações de Parceria ({partnerships.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Cidades e comunidades que solicitaram aliança com a Nexa Host.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partnerships.map(p => (
                  <div key={p.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white font-['Rajdhani']">{p.cityName}</h4>
                        <p className="text-xs text-slate-400">Responsável: {p.responsibleName}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'Aprovada' ? 'bg-emerald-950 text-emerald-300' :
                        p.status === 'Recusada' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-300">
                      <p><strong>Discord:</strong> <span className="font-mono text-cyan-300">{p.discord}</span></p>
                      {p.serverLink && (
                        <p>
                          <strong>Link do Servidor:</strong>{' '}
                          <a href={p.serverLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                            {p.serverLink}
                          </a>
                        </p>
                      )}
                      <p><strong>Membros / Players:</strong> {p.memberCount || 'Não informado'}</p>
                      <p className="text-slate-400 mt-2"><strong>Descrição:</strong> {p.description}</p>
                    </div>

                    {p.status === 'Pendente' && (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => handleUpdatePartnership(p.id, 'Aprovada')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase"
                        >
                          Aprovar Parceria
                        </button>
                        <button
                          onClick={() => handleUpdatePartnership(p.id, 'Recusada')}
                          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 font-bold text-xs uppercase"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: AVISOS NO SITE */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                    Avisos no Topo do Site
                  </h2>
                  <p className="text-xs text-slate-400">
                    Notificações globais e alertas exibidos na barra superior para todos os visitantes.
                  </p>
                </div>
                <button
                  onClick={() => setAnnouncementModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Aviso</span>
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{a.title}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {a.type}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${a.active ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                          {a.active ? 'Visível' : 'Oculto'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{a.message}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: CONFIGURAÇÕES GERAIS */}
          {activeTab === 'settings' && config && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-3xl font-black font-['Rajdhani'] text-white uppercase tracking-tight">
                  Configurações do Sistema
                </h2>
                <p className="text-xs text-slate-400">
                  Edite a chave Pix manual, dados da empresa e links de redes sociais.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Chave Pix Manual Oficial (Edição Dinâmica)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.pixKey}
                    onChange={e => setConfig({ ...config, pixKey: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    Chave inicial cadastrada: 2cb0664b-d842-440b-a578-872a5f74fa07
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      value={config.companyName}
                      onChange={e => setConfig({ ...config, companyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={config.email}
                      onChange={e => setConfig({ ...config, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                      Link do Discord Oficial
                    </label>
                    <input
                      type="url"
                      value={config.discordUrl}
                      onChange={e => setConfig({ ...config, discordUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                      WhatsApp Oficial
                    </label>
                    <input
                      type="text"
                      value={config.whatsappNumber}
                      onChange={e => setConfig({ ...config, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ENTREGA MANUAL DA VPS (MUITO IMPORTANTE) */}
      {deliverModalOpen && selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d131f] border-2 border-cyan-500/60 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Módulo de Entrega Manual
                </span>
                <h3 className="text-2xl font-black font-['Rajdhani'] text-white">
                  Cadastrar Dados da VPS para Entrega
                </h3>
                <p className="text-xs text-slate-400">
                  Pedido #{selectedOrderForDelivery.id} • Cliente: {selectedOrderForDelivery.userName}
                </p>
              </div>
              <button
                onClick={() => setDeliverModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitVpsDelivery} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Nome da VPS *
                  </label>
                  <input
                    type="text"
                    required
                    value={vpsFormData.name}
                    onChange={e => setVpsFormData({ ...vpsFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Sistema Operacional *
                  </label>
                  <input
                    type="text"
                    required
                    value={vpsFormData.os}
                    onChange={e => setVpsFormData({ ...vpsFormData, os: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Endereço IP *
                  </label>
                  <input
                    type="text"
                    required
                    value={vpsFormData.ip}
                    onChange={e => setVpsFormData({ ...vpsFormData, ip: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Porta de Acesso (RDP/SSH) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vpsFormData.port}
                    onChange={e => setVpsFormData({ ...vpsFormData, port: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    required
                    value={vpsFormData.username}
                    onChange={e => setVpsFormData({ ...vpsFormData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Senha de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    value={vpsFormData.password}
                    onChange={e => setVpsFormData({ ...vpsFormData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Data de Ativação *
                  </label>
                  <input
                    type="date"
                    required
                    value={vpsFormData.activationDate}
                    onChange={e => setVpsFormData({ ...vpsFormData, activationDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={vpsFormData.expirationDate}
                    onChange={e => setVpsFormData({ ...vpsFormData, expirationDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Observações & Instruções para o Cliente
                </label>
                <textarea
                  rows={2}
                  value={vpsFormData.notes}
                  onChange={e => setVpsFormData({ ...vpsFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
                Ao salvar: o status do pedido mudará para <strong>VPS entregue</strong>, os dados aparecerão na Área do Cliente e uma notificação de entrega será emitida.
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeliverModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  Confirmar e Entregar VPS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Refuse Payment with Reason */}
      {refusalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0d131f] border border-red-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-['Rajdhani'] text-white">Recusar Pagamento</h3>
            <p className="text-xs text-slate-400">
              Informe o motivo da recusa para que o cliente saiba como corrigir o pagamento.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                Motivo da Recusa
              </label>
              <textarea
                rows={3}
                value={refusalReason}
                onChange={e => setRefusalReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefusalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRefusal}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Plan Create/Edit */}
      {planModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold font-['Rajdhani'] text-white">
                {editingPlan.id ? 'Editar Plano VPS' : 'Criar Novo Plano VPS'}
              </h3>
              <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name || ''}
                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Preço Mensal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPlan.price || 0}
                    onChange={e => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Processador (CPU)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.cpu || ''}
                    onChange={e => setEditingPlan({ ...editingPlan, cpu: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Memória RAM
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.ram || ''}
                    onChange={e => setEditingPlan({ ...editingPlan, ram: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Disco (NVMe)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.storage || ''}
                    onChange={e => setEditingPlan({ ...editingPlan, storage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={editingPlan.location || 'São Paulo, BR'}
                    onChange={e => setEditingPlan({ ...editingPlan, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Proteção Anti-DDoS
                  </label>
                  <input
                    type="text"
                    value={editingPlan.protection || 'Anti-DDoS Game 2.5 Tbps'}
                    onChange={e => setEditingPlan({ ...editingPlan, protection: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.popular || false}
                    onChange={e => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500"
                  />
                  <span>Destaque "Mais Escolhido"</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.active !== false}
                    onChange={e => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500"
                  />
                  <span>Plano Ativo no Site</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Coupon */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-['Rajdhani'] text-white">Criar Cupom de Desconto</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PROMOFIVEM"
                  value={newCouponData.code}
                  onChange={e => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase text-sm focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Tipo de Desconto
                  </label>
                  <select
                    value={newCouponData.type}
                    onChange={e => setNewCouponData({ ...newCouponData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                    Valor do Desconto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCouponData.value}
                    onChange={e => setNewCouponData({ ...newCouponData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Announcement */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-['Rajdhani'] text-white">Criar Aviso Superior</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Título do Aviso
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manutenção Preventiva Programada"
                  value={announcementData.title}
                  onChange={e => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Texto do Aviso
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mensagem exibida na barra de topo..."
                  value={announcementData.message}
                  onChange={e => setAnnouncementData({ ...announcementData, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Tipo de Notificação
                </label>
                <select
                  value={announcementData.type}
                  onChange={e => setAnnouncementData({ ...announcementData, type: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="info">Informativo (Ciano)</option>
                  <option value="warning">Aviso / Manutenção (Amarelo)</option>
                  <option value="promo">Promoção (Roxo)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Publicar Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
