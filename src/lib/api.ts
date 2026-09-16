import {
  User,
  Plan,
  Order,
  OrderStatus,
  VPS,
  Ticket,
  Coupon,
  Partnership,
  Announcement,
  SiteSettings,
  ClientNotification
} from '../types/index.ts';

const TOKEN_KEY = 'nexa_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Ocorreu um erro na requisição.');
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(res.token);
    return res;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    return request<SiteSettings>('/settings');
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    return request<SiteSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getPixQrCode(amount: number): Promise<{
    pixKey: string;
    receiver: string;
    city: string;
    amount: number;
    qrCodeUrl: string;
  }> {
    return request(`/pix/qrcode?amount=${amount}`);
  },

  // Plans
  async getPlans(all = false): Promise<Plan[]> {
    return request<Plan[]>(`/plans${all ? '?all=true' : ''}`);
  },

  async createPlan(data: Partial<Plan>): Promise<Plan> {
    return request<Plan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    return request<Plan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deletePlan(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/plans/${id}`, {
      method: 'DELETE'
    });
  },

  // Coupons
  async validateCoupon(code: string, amount: number): Promise<{
    valid: boolean;
    code: string;
    discountType: string;
    value: number;
    discountAmount: number;
    finalPrice: number;
  }> {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount })
    });
  },

  async getCoupons(): Promise<Coupon[]> {
    return request<Coupon[]>('/coupons');
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    return request<Coupon>('/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    return request<Coupon>(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteCoupon(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/coupons/${id}`, {
      method: 'DELETE'
    });
  },

  // Orders
  async createOrder(data: {
    planId: string;
    serverName?: string;
    desiredOs?: string;
    couponCode?: string;
  }): Promise<Order> {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return request<Order[]>('/orders/my');
  },

  async getAllOrders(): Promise<Order[]> {
    return request<Order[]>('/orders');
  },

  async getOrder(id: string): Promise<Order> {
    return request<Order>(`/orders/${id}`);
  },

  async uploadReceipt(orderId: string, file: File): Promise<{ message: string; order: Order }> {
    const formData = new FormData();
    formData.append('receipt', file);
    return request<{ message: string; order: Order }>(`/orders/${orderId}/receipt`, {
      method: 'POST',
      body: formData
    });
  },

  async approvePayment(orderId: string): Promise<{ success: boolean; order: Order }> {
    return request<{ success: boolean; order: Order }>(`/orders/${orderId}/approve-payment`, {
      method: 'POST'
    });
  },

  async refusePayment(orderId: string, reason: string): Promise<{ success: boolean; order: Order }> {
    return request<{ success: boolean; order: Order }>(`/orders/${orderId}/refuse-payment`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // VPS Delivery & Management
  async deliverVps(orderId: string, data: {
    name?: string;
    ip: string;
    port?: string;
    username: string;
    password: string;
    os?: string;
    planName?: string;
    activationDate?: string;
    expirationDate?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; vps: VPS; order: Order }> {
    return request(`/orders/${orderId}/deliver-vps`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMyVps(): Promise<VPS[]> {
    return request<VPS[]>('/vps/my');
  },

  async getAllVps(): Promise<VPS[]> {
    return request<VPS[]>('/vps');
  },

  async updateVps(id: string, data: Partial<VPS>): Promise<VPS> {
    return request<VPS>(`/vps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Tickets
  async getMyTickets(): Promise<Ticket[]> {
    return request<Ticket[]>('/tickets/my');
  },

  async getAllTickets(): Promise<Ticket[]> {
    return request<Ticket[]>('/tickets');
  },

  async getTicket(id: string): Promise<Ticket> {
    return request<Ticket>(`/tickets/${id}`);
  },

  async createTicket(data: {
    category: string;
    subject: string;
    message: string;
    priority?: string;
  }): Promise<Ticket> {
    return request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async sendTicketMessage(ticketId: string, message: string): Promise<Ticket> {
    return request<Ticket>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  async closeTicket(ticketId: string): Promise<Ticket> {
    return request<Ticket>(`/tickets/${ticketId}/close`, {
      method: 'PATCH'
    });
  },

  // Partnerships
  async submitPartnership(data: {
    cityName: string;
    responsibleName: string;
    discord: string;
    serverLink?: string;
    memberCount?: number;
    description?: string;
  }): Promise<{ message: string; partnership: Partnership }> {
    return request('/partnerships', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getPartnerships(): Promise<Partnership[]> {
    return request<Partnership[]>('/partnerships');
  },

  async updatePartnershipStatus(id: string, status: 'Aprovada' | 'Recusada'): Promise<Partnership> {
    return request<Partnership>(`/partnerships/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return request<Announcement[]>('/announcements');
  },

  async getAdminAnnouncements(): Promise<Announcement[]> {
    return request<Announcement[]>('/admin/announcements');
  },

  async createAnnouncement(data: { title: string; content?: string; message?: string; type?: string; active?: boolean }): Promise<Announcement> {
    return request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        content: data.content || data.message || '',
        message: data.message || data.content || '',
        type: data.type || 'info',
        active: data.active !== false
      })
    });
  },

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    return request<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/announcements/${id}`, {
      method: 'DELETE'
    });
  },

  // Notifications
  async getMyNotifications(): Promise<ClientNotification[]> {
    return request<ClientNotification[]>('/notifications/my');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/notifications/read-all', { method: 'POST' });
  },

  // Admin Stats & Clients
  async getAdminStats(): Promise<{
    totalClients: number;
    totalOrders: number;
    ordersAwaitingPayment: number;
    receiptsInAnalysis: number;
    paymentsApproved: number;
    vpsDelivered: number;
    openTickets: number;
    pendingPartnerships: number;
    totalRevenue: number;
  }> {
    return request('/admin/stats');
  },

  async getAdminClients(): Promise<any[]> {
    return request<any[]>('/admin/clients');
  },

  async getAdminOrders(): Promise<Order[]> {
    return request<Order[]>('/orders');
  },

  async getAdminVps(): Promise<VPS[]> {
    return request<VPS[]>('/vps');
  },

  async getAdminPlans(): Promise<Plan[]> {
    return request<Plan[]>('/plans?all=true');
  },

  async getAdminCoupons(): Promise<Coupon[]> {
    return request<Coupon[]>('/coupons');
  },

  async getAdminTickets(): Promise<Ticket[]> {
    return request<Ticket[]>('/tickets');
  },

  async getAdminPartnerships(): Promise<Partnership[]> {
    return request<Partnership[]>('/partnerships');
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, reason?: string): Promise<{ success: boolean; order: Order }> {
    if (status === 'Pagamento aprovado') {
      return request<{ success: boolean; order: Order }>(`/orders/${orderId}/approve-payment`, {
        method: 'POST'
      });
    } else if (status === 'Pagamento recusado') {
      return request<{ success: boolean; order: Order }>(`/orders/${orderId}/refuse-payment`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    } else {
      return request<{ success: boolean; order: Order }>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  },

  async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<Ticket> {
    return request<Ticket>(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
