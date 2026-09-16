import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Plan,
  Order,
  VPS,
  Ticket,
  Coupon,
  Partnership,
  Announcement,
  SiteSettings,
  ClientNotification,
} from '../src/types/index.ts';

export interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  plans: Plan[];
  orders: Order[];
  vps: VPS[];
  tickets: Ticket[];
  coupons: Coupon[];
  partnerships: Partnership[];
  announcements: Announcement[];
  notifications: ClientNotification[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return result === hash;
}

const defaultAdmin = hashPassword('admin123');
const defaultClient = hashPassword('cliente123');

const initialPlans: Plan[] = [
  {
    id: 'plan-fivem-start',
    name: 'VPS FiveM Start',
    category: 'fivem',
    cpu: '2 vCPU AMD Ryzen 9 5950X (4.9 GHz)',
    ram: '4 GB DDR4 ECC',
    storage: '50 GB NVMe Gen4',
    location: 'São Paulo, Brasil 🇧🇷',
    protection: 'Anti-DDoS Game 2.5 Tbps',
    price: 49.90,
    active: true,
    order: 1,
    features: [
      'Ideal para servidores FiveM até 32 slots',
      'Painel txAdmin pré-instalável',
      'Porta 10 Gbps Redundante',
      'Tráfego Ilimitado',
      'Uptime garantido 99.9%'
    ]
  },
  {
    id: 'plan-fivem-pro',
    name: 'VPS FiveM Pro',
    category: 'fivem',
    cpu: '4 vCPU AMD Ryzen 9 7950X3D (5.7 GHz)',
    ram: '8 GB DDR5 5600MHz',
    storage: '90 GB NVMe Gen4',
    location: 'São Paulo, Brasil 🇧🇷',
    protection: 'Anti-DDoS Game 2.5 Tbps',
    price: 89.90,
    popular: true,
    active: true,
    order: 2,
    features: [
      'Ideal para servidores FiveM até 64 slots',
      'Cache Otimizado para Bases Pesadas',
      'Suporte a Scripts C++ / Lua / C#',
      'Backup semanal incluso',
      'Prioridade na fila de Suporte'
    ]
  },
  {
    id: 'plan-fivem-master',
    name: 'VPS FiveM Master Ultra',
    category: 'fivem',
    cpu: '8 vCPU AMD Ryzen 9 7950X3D (5.7 GHz)',
    ram: '16 GB DDR5 5600MHz',
    storage: '180 GB NVMe Gen4',
    location: 'São Paulo, Brasil 🇧🇷',
    protection: 'Anti-DDoS Game Dedicado',
    price: 159.90,
    active: true,
    order: 3,
    features: [
      'Para Grandes Cidades FiveM (128+ slots)',
      'Desempenho Extremo sem quedas de FPS',
      'MySQL / MariaDB Otimizado em memória',
      'Anti-DDoS com regras customizadas para FiveM',
      'Atendimento VIP via Discord'
    ]
  },
  {
    id: 'plan-bots-web',
    name: 'VPS Apps & Bots Starter',
    category: 'bots',
    cpu: '2 vCPU Intel Xeon Gold',
    ram: '2 GB DDR4 ECC',
    storage: '35 GB SSD Enterprise',
    location: 'São Paulo, Brasil 🇧🇷',
    protection: 'Anti-DDoS Standard 1.5 Tbps',
    price: 29.90,
    active: true,
    order: 4,
    features: [
      'Perfeito para Bots Discord (Node.js/Python)',
      'Hospedagem de Web Sites e APIs',
      'Acesso Root Completo (SSH)',
      'Ubuntu, Debian ou CentOS',
      'Reinício rápido via painel'
    ]
  },
  {
    id: 'plan-games-heavy',
    name: 'VPS Games Dedicated Elite',
    category: 'games',
    cpu: '6 vCPU AMD Ryzen 9',
    ram: '12 GB DDR4 ECC',
    storage: '120 GB NVMe Gen4',
    location: 'São Paulo, Brasil 🇧🇷',
    protection: 'Anti-DDoS Game Avançado',
    price: 129.90,
    active: true,
    order: 5,
    features: [
      'Minecraft, CS2, Palworld, Rust',
      'Baixo Ping nacional (5ms - 18ms SP)',
      'Painel de Controle e Backup',
      'Proteção contra ataques UDP flood'
    ]
  }
];

const initialSettings: SiteSettings = {
  companyName: 'Nexa Host',
  logoUrl: '',
  pixKey: '2cb0664b-d842-440b-a578-872a5f74fa07',
  pixQrCodeUrl: '',
  pixReceiverName: 'Nexa Host Solucoes Digitais',
  pixCity: 'Sao Paulo',
  discordUrl: 'https://discord.gg/nexahost',
  email: 'contato@nexahost.com.br',
  phone: '+55 11 99999-0000',
  instagramUrl: 'https://instagram.com/nexahost',
  heroBadge: 'Hospedagem Gamer de Alta Performance',
  heroTitle: 'Sua infraestrutura. Seu servidor. Sua Nexa.',
  heroSubtitle: 'VPS de alto desempenho para hospedar seu projeto com estabilidade, segurança e suporte.'
};

const initialCoupons: Coupon[] = [
  {
    id: 'c-1',
    code: 'NEXA10',
    discountType: 'percent',
    value: 10,
    validUntil: '2027-12-31',
    usageLimit: 500,
    usedCount: 12,
    active: true
  },
  {
    id: 'c-2',
    code: 'FIVEMVIP',
    discountType: 'fixed',
    value: 15.00,
    validUntil: '2027-12-31',
    usageLimit: 100,
    usedCount: 4,
    active: true
  }
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: '🚀 Nova rota de baixa latência em São Paulo!',
    content: 'Finalizamos o upgrade de rotas de fibra óptica direta com a B3 e IX.br em SP. Todos os servidores FiveM agora contam com latência média inferior a 12ms na região sudeste.',
    type: 'info',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ann-2',
    title: '🛡️ Mitigação Anti-DDoS Layer 7 Atualizada',
    content: 'Implementamos novos filtros avançados contra ataques direcionados a portas de servidores FiveM (30120) e bots Discord. Estabilidade 100% garantida.',
    type: 'info',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

function createInitialData(): DatabaseSchema {
  return {
    users: [
      {
        id: 'user-admin-1',
        name: 'Administrador Nexa',
        email: 'admin@nexahost.com.br',
        role: 'admin',
        phone: '+55 (11) 98888-7777',
        passwordHash: defaultAdmin.hash,
        salt: defaultAdmin.salt,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-client-1',
        name: 'Carlos Oliveira (Cliente Teste)',
        email: 'cliente@exemplo.com',
        role: 'client',
        phone: '+55 (11) 97777-6666',
        passwordHash: defaultClient.hash,
        salt: defaultClient.salt,
        createdAt: new Date().toISOString()
      }
    ],
    plans: initialPlans,
    orders: [
      {
        id: 'NEXA-1024',
        userId: 'user-client-1',
        userName: 'Carlos Oliveira (Cliente Teste)',
        userEmail: 'cliente@exemplo.com',
        planId: 'plan-fivem-pro',
        planName: 'VPS FiveM Pro',
        planSpecs: {
          cpu: '4 vCPU AMD Ryzen 9 7950X3D (5.7 GHz)',
          ram: '8 GB DDR5 5600MHz',
          storage: '90 GB NVMe Gen4',
          location: 'São Paulo, Brasil 🇧🇷',
          protection: 'Anti-DDoS Game 2.5 Tbps'
        },
        serverName: 'Cidade Alta RP Season 2',
        desiredOs: 'Windows Server 2022 Datacenter',
        originalPrice: 89.90,
        discountAmount: 0,
        finalPrice: 89.90,
        status: 'VPS entregue',
        vpsId: 'vps-1024',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    vps: [
      {
        id: 'vps-1024',
        orderId: 'NEXA-1024',
        userId: 'user-client-1',
        userName: 'Carlos Oliveira (Cliente Teste)',
        userEmail: 'cliente@exemplo.com',
        name: 'VPS FiveM - Cidade Alta RP',
        planName: 'VPS FiveM Pro',
        status: 'VPS entregue',
        ip: '189.127.165.42',
        port: '30120',
        username: 'Administrator',
        password: 'Nexa@FiveM#9821',
        os: 'Windows Server 2022 Datacenter',
        activationDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('pt-BR'),
        expirationDate: new Date(Date.now() + 86400000 * 28).toLocaleDateString('pt-BR'),
        notes: 'txAdmin pré-configurado na porta 40120. Acesso remoto RDP liberado. Anti-DDoS ativo.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    tickets: [
      {
        id: 'tick-1',
        ticketNumber: 'TICK-8041',
        userId: 'user-client-1',
        userName: 'Carlos Oliveira (Cliente Teste)',
        userEmail: 'cliente@exemplo.com',
        category: 'Suporte VPS',
        subject: 'Dúvida sobre portas no Firewall para o txAdmin',
        status: 'Em atendimento',
        priority: 'Média',
        messages: [
          {
            id: 'm-1',
            ticketId: 'tick-1',
            senderId: 'user-client-1',
            senderName: 'Carlos Oliveira (Cliente Teste)',
            senderRole: 'client',
            message: 'Boa tarde! Gostaria de saber se a porta 40120 do txAdmin já vem liberada no firewall do Windows da VPS entregue.',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 'm-2',
            ticketId: 'tick-1',
            senderId: 'user-admin-1',
            senderName: 'Suporte Nexa Host',
            senderRole: 'admin',
            message: 'Olá Carlos! Sim, a porta 40120 TCP/UDP e 30120 já estão totalmente liberadas no firewall do Windows e nas regras do nosso Anti-DDoS Game. Qualquer dúvida estamos à disposição!',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    coupons: initialCoupons,
    partnerships: [
      {
        id: 'part-1',
        cityName: 'Nova York Roleplay',
        responsibleName: 'Felipe Santos',
        discord: 'felipesantos#9921',
        serverLink: 'https://discord.gg/nyrp',
        memberCount: 2400,
        description: 'Cidade com 2 anos de história buscando migrar de hospedagem para a Nexa Host para melhor estabilidade e parceria mútua.',
        status: 'Pendente',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    announcements: initialAnnouncements,
    notifications: [
      {
        id: 'notif-1',
        userId: 'user-client-1',
        title: 'VPS Entregue com Sucesso!',
        message: 'Sua VPS foi configurada e os dados de acesso já estão disponíveis na sua área do cliente.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    settings: initialSettings
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // ensure required arrays exist
        return {
          ...createInitialData(),
          ...parsed,
          settings: { ...initialSettings, ...(parsed.settings || {}) }
        };
      }
    } catch (err) {
      console.error('Error loading db.json, generating default data', err);
    }
    const initial = createInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  // Next unique order number, e.g. NEXA-1025
  public generateOrderId(): string {
    const numbers = this.data.orders
      .map(o => {
        const match = o.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 1024;
    return `NEXA-${max + 1}`;
  }

  public generateTicketNumber(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TICK-${random}`;
  }
}

export const db = new Database();
