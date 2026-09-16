export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  category: 'fivem' | 'games' | 'bots' | 'apps';
  cpu: string;
  ram: string;
  storage: string;
  location: string;
  protection: string;
  price: number;
  popular?: boolean;
  active: boolean;
  order: number;
  features: string[];
}

export type OrderStatus =
  | 'Aguardando pagamento'
  | 'Comprovante em análise'
  | 'Pagamento aprovado'
  | 'Pagamento recusado'
  | 'VPS entregue'
  | 'Cancelado';

export interface Order {
  id: string; // e.g. "NEXA-1024"
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  planSpecs: {
    cpu: string;
    ram: string;
    storage: string;
    location: string;
    protection: string;
  };
  serverName?: string;
  desiredOs?: string;
  couponCode?: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: OrderStatus;
  refusalReason?: string;
  receiptUrl?: string;
  receiptName?: string;
  receiptType?: string;
  receiptUploadedAt?: string;
  vpsId?: string;
  createdAt: string;
  updatedAt: string;
}

export type VpsStatus =
  | 'Aguardando configuração'
  | 'VPS entregue'
  | 'Suspensa'
  | 'Cancelada';

export interface VPS {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  name: string;
  planName: string;
  status: VpsStatus;
  ip: string;
  port: string;
  username: string;
  password?: string;
  os: string;
  activationDate: string;
  expirationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketCategory =
  | 'Suporte VPS'
  | 'Pagamento'
  | 'Financeiro'
  | 'Parceria'
  | 'Outros';

export type TicketStatus = 'Aberto' | 'Em atendimento' | 'Fechado';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "TICK-8041"
  userId: string;
  userName: string;
  userEmail: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface Partnership {
  id: string;
  cityName: string;
  responsibleName: string;
  discord: string;
  serverLink: string;
  memberCount: number;
  description: string;
  status: 'Pendente' | 'Aprovada' | 'Recusada';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content?: string;
  message?: string;
  type: 'info' | 'warning' | 'maintenance' | 'promo';
  active: boolean;
  createdAt: string;
}

export interface SiteSettings {
  companyName: string;
  logoUrl?: string;
  pixKey: string;
  pixQrCodeUrl?: string;
  pixReceiverName: string;
  pixCity: string;
  discordUrl: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
}

export type SystemSettings = SiteSettings;

export interface ClientNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
}
