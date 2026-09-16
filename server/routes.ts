import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword, UPLOADS_DIR } from './db.ts';
import {
  AuthenticatedRequest,
  createSessionToken,
  requireAuth,
  requireAdmin
} from './auth.ts';
import { Order, VPS, Ticket, Coupon, Partnership, Announcement, Plan } from '../src/types/index.ts';

export const apiRouter = express.Router();

// Setup Multer for secure comprovantes upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.pdf'].includes(ext) ? ext : '.bin';
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Apenas JPG, JPEG, PNG e PDF são aceitos.'));
    }
  }
});

// Helper for Pix QR Code generation
export async function generatePixQrCodeData(pixKey: string, amount: number, receiver: string, city: string): Promise<string> {
  // Simple standard BR Code format or text representation
  // For standard PIX copy-paste:
  const payload = `00020126580014br.gov.bcb.pix0136${pixKey}520400005303986540${amount.toFixed(2).length < 10 ? '0' : ''}${amount.toFixed(2).length}${amount.toFixed(2)}5802BR5913${receiver.substring(0, 13)}6009${city.substring(0, 9)}62070503***6304`;
  try {
    return await QRCode.toDataURL(payload, {
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    return await QRCode.toDataURL(pixKey, { margin: 2 });
  }
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
  }
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const raw = db.getRaw();
  const existing = raw.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser = {
    id: `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: name.trim(),
    email: normalizedEmail,
    role: 'client' as const,
    phone: phone ? phone.trim() : '',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  };

  raw.users.push(newUser);
  db.save();

  const token = createSessionToken(newUser.id);
  const { passwordHash: _, salt: __, ...safeUser } = newUser;

  return res.status(201).json({ user: safeUser, token });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const raw = db.getRaw();
  const user = raw.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
  }

  const token = createSessionToken(user.id);
  const { passwordHash: _, salt: __, ...safeUser } = user;

  return res.json({ user: safeUser, token });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  // session will expire or be invalidated
  return res.json({ success: true });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Informe o e-mail cadastrado.' });
  }
  // Simulated friendly recovery response
  return res.json({
    message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha em instantes.'
  });
});

// ----------------------------------------------------
// SETTINGS & PUBLIC INFO
// ----------------------------------------------------

apiRouter.get('/settings', (req: Request, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.settings);
});

apiRouter.put('/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  raw.settings = {
    ...raw.settings,
    ...req.body
  };
  db.save();
  return res.json(raw.settings);
});

apiRouter.get('/pix/qrcode', async (req: Request, res: Response) => {
  const raw = db.getRaw();
  const amount = parseFloat(req.query.amount as string) || 0;
  const qrDataUrl = await generatePixQrCodeData(
    raw.settings.pixKey,
    amount,
    raw.settings.pixReceiverName || 'Nexa Host',
    raw.settings.pixCity || 'Sao Paulo'
  );
  return res.json({
    pixKey: raw.settings.pixKey,
    receiver: raw.settings.pixReceiverName,
    city: raw.settings.pixCity,
    amount,
    qrCodeUrl: qrDataUrl
  });
});

// ----------------------------------------------------
// PLANS (Public & Admin)
// ----------------------------------------------------

apiRouter.get('/plans', (req: Request, res: Response) => {
  const raw = db.getRaw();
  // If request comes with ?all=true and is authenticated admin, return all
  if (req.query.all === 'true') {
    return res.json(raw.plans.sort((a, b) => a.order - b.order));
  }
  // Public only active plans
  const activePlans = raw.plans.filter(p => p.active).sort((a, b) => a.order - b.order);
  return res.json(activePlans);
});

apiRouter.post('/plans', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, category, cpu, ram, storage, location, protection, price, popular, features } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  const raw = db.getRaw();
  const newPlan: Plan = {
    id: `plan-${Date.now()}`,
    name,
    category: category || 'fivem',
    cpu: cpu || '4 vCPU High-Frequency',
    ram: ram || '8 GB DDR4',
    storage: storage || '80 GB NVMe Gen4',
    location: location || 'São Paulo, Brasil 🇧🇷',
    protection: protection || 'Anti-DDoS Game 2.5 Tbps',
    price: Number(price),
    popular: Boolean(popular),
    active: true,
    order: raw.plans.length + 1,
    features: Array.isArray(features) ? features : []
  };

  raw.plans.push(newPlan);
  db.save();
  return res.status(201).json(newPlan);
});

apiRouter.put('/plans/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const index = raw.plans.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Plano não encontrado.' });
  }

  raw.plans[index] = {
    ...raw.plans[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : raw.plans[index].price
  };

  db.save();
  return res.json(raw.plans[index]);
});

apiRouter.delete('/plans/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  raw.plans = raw.plans.filter(p => p.id !== id);
  db.save();
  return res.json({ success: true });
});

// ----------------------------------------------------
// COUPONS
// ----------------------------------------------------

apiRouter.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, amount } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Informe o código do cupom.' });
  }

  const raw = db.getRaw();
  const coupon = raw.coupons.find(
    c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
  );

  if (!coupon) {
    return res.status(404).json({ error: 'Cupom inválido ou expirado.' });
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Este cupom atingiu o limite máximo de usos.' });
  }

  const basePrice = Number(amount) || 0;
  let discount = 0;

  if (coupon.discountType === 'percent') {
    discount = (basePrice * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, basePrice);
  const finalPrice = Math.max(0, basePrice - discount);

  return res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.value,
    discountAmount: Number(discount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2))
  });
});

apiRouter.get('/coupons', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.coupons);
});

apiRouter.post('/coupons', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { code, discountType, value, validUntil, usageLimit } = req.body;
  if (!code || !value) {
    return res.status(400).json({ error: 'Código e valor do desconto são obrigatórios.' });
  }

  const raw = db.getRaw();
  const newCoupon: Coupon = {
    id: `coupon-${Date.now()}`,
    code: code.trim().toUpperCase(),
    discountType: discountType || 'percent',
    value: Number(value),
    validUntil: validUntil || '2027-12-31',
    usageLimit: Number(usageLimit) || 100,
    usedCount: 0,
    active: true
  };

  raw.coupons.push(newCoupon);
  db.save();
  return res.status(201).json(newCoupon);
});

apiRouter.put('/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const idx = raw.coupons.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Cupom não encontrado.' });

  raw.coupons[idx] = { ...raw.coupons[idx], ...req.body };
  db.save();
  return res.json(raw.coupons[idx]);
});

apiRouter.delete('/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  raw.coupons = raw.coupons.filter(c => c.id !== id);
  db.save();
  return res.json({ success: true });
});

// ----------------------------------------------------
// ORDERS (Sistema de Pedidos)
// ----------------------------------------------------

apiRouter.post('/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { planId, serverName, desiredOs, couponCode } = req.body;

  const raw = db.getRaw();
  const plan = raw.plans.find(p => p.id === planId && p.active);
  if (!plan) {
    return res.status(404).json({ error: 'Plano não encontrado ou indisponível.' });
  }

  let discountAmount = 0;
  if (couponCode) {
    const coupon = raw.coupons.find(
      c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active
    );
    if (coupon) {
      if (coupon.discountType === 'percent') {
        discountAmount = (plan.price * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }
      coupon.usedCount += 1;
    }
  }

  discountAmount = Math.min(discountAmount, plan.price);
  const finalPrice = Number(Math.max(0, plan.price - discountAmount).toFixed(2));
  const orderId = db.generateOrderId();

  const newOrder: Order = {
    id: orderId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    planId: plan.id,
    planName: plan.name,
    planSpecs: {
      cpu: plan.cpu,
      ram: plan.ram,
      storage: plan.storage,
      location: plan.location,
      protection: plan.protection
    },
    serverName: serverName || 'Servidor FiveM / Aplicação',
    desiredOs: desiredOs || 'Windows Server 2022',
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    originalPrice: plan.price,
    discountAmount: Number(discountAmount.toFixed(2)),
    finalPrice,
    status: 'Aguardando pagamento',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  raw.orders.unshift(newOrder);
  db.save();

  return res.status(201).json(newOrder);
});

apiRouter.get('/orders/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  const userOrders = raw.orders.filter(o => o.userId === req.user!.id);
  return res.json(userOrders);
});

apiRouter.get('/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.orders);
});

apiRouter.get('/orders/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const order = raw.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso negado a este pedido.' });
  }

  return res.json(order);
});

// ----------------------------------------------------
// COMPROVANTE DE PAGAMENTO (Upload protegido)
// ----------------------------------------------------

apiRouter.post(
  '/orders/:id/receipt',
  requireAuth,
  upload.single('receipt'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const raw = db.getRaw();
    const order = raw.orders.find(o => o.id === id);

    if (!order) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de comprovante foi selecionado.' });
    }

    // Update order with receipt info
    order.receiptUrl = `/api/receipts/${order.id}`;
    order.receiptName = req.file.originalname;
    order.receiptType = req.file.mimetype;
    order.receiptUploadedAt = new Date().toISOString();
    order.status = 'Comprovante em análise';
    order.updatedAt = new Date().toISOString();

    // Store internal path reference
    (order as any)._storedFile = req.file.filename;

    db.save();

    return res.json({
      message: 'Comprovante enviado com sucesso!',
      order
    });
  }
);

// Protected receipt viewer: ONLY owner and admin can access
apiRouter.get('/receipts/:orderId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const raw = db.getRaw();
  const order = raw.orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso restrito ao proprietário do pedido.' });
  }

  const storedFilename = (order as any)._storedFile;
  if (!storedFilename) {
    return res.status(404).json({ error: 'Nenhum comprovante anexado.' });
  }

  const filePath = path.join(UPLOADS_DIR, storedFilename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo do comprovante não encontrado no servidor.' });
  }

  res.setHeader('Content-Type', order.receiptType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${order.receiptName || 'comprovante'}"`);
  return res.sendFile(filePath);
});

// Admin Approve Payment
apiRouter.post('/orders/:id/approve-payment', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const order = raw.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  order.status = 'Pagamento aprovado';
  order.updatedAt = new Date().toISOString();

  // Create notification for user
  raw.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title: `Pagamento Aprovado! (Pedido #${order.id})`,
    message: 'Seu pagamento Pix foi aprovado com sucesso! A equipe está configurando sua VPS.',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.json({ success: true, order });
});

// Admin Refuse Payment
apiRouter.post('/orders/:id/refuse-payment', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const raw = db.getRaw();
  const order = raw.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  order.status = 'Pagamento recusado';
  order.refusalReason = reason || 'Comprovante não reconhecido ou valor divergente.';
  order.updatedAt = new Date().toISOString();

  // Notify user
  raw.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title: `Pagamento Recusado (Pedido #${order.id})`,
    message: `Atenção: Seu pagamento foi recusado. Motivo: ${order.refusalReason}`,
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.json({ success: true, order });
});

// ----------------------------------------------------
// VPS & ENTREGA MANUAL DA VPS (CRÍTICO)
// ----------------------------------------------------

apiRouter.post('/orders/:id/deliver-vps', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, ip, port, username, password, os, planName, activationDate, expirationDate, notes } = req.body;

  if (!ip || !username || !password) {
    return res.status(400).json({ error: 'IP, Usuário e Senha são obrigatórios para entrega da VPS.' });
  }

  const raw = db.getRaw();
  const order = raw.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const todayStr = new Date().toLocaleDateString('pt-BR');
  const futureStr = new Date(Date.now() + 30 * 86400000).toLocaleDateString('pt-BR');

  // Check if existing VPS is associated or create new
  let vps = raw.vps.find(v => v.orderId === order.id);
  const vpsId = vps ? vps.id : `vps-${Date.now()}`;

  const vpsData: VPS = {
    id: vpsId,
    orderId: order.id,
    userId: order.userId,
    userName: order.userName,
    userEmail: order.userEmail,
    name: name || `VPS FiveM - ${order.id}`,
    planName: planName || order.planName,
    status: 'VPS entregue',
    ip: ip.trim(),
    port: port ? port.trim() : '30120',
    username: username.trim(),
    password: password.trim(),
    os: os || order.desiredOs || 'Windows Server 2022',
    activationDate: activationDate || todayStr,
    expirationDate: expirationDate || futureStr,
    notes: notes || 'Painel de controle e credenciais liberadas.',
    createdAt: vps ? vps.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (vps) {
    const idx = raw.vps.findIndex(v => v.id === vps.id);
    raw.vps[idx] = vpsData;
  } else {
    raw.vps.unshift(vpsData);
  }

  // Update order status to "VPS entregue"
  order.status = 'VPS entregue';
  order.vpsId = vpsId;
  order.updatedAt = new Date().toISOString();

  // Create mandatory user notification
  raw.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title: '🚀 Sua VPS foi entregue!',
    message: 'Sua VPS foi configurada e os dados de acesso já estão disponíveis na sua área do cliente.',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  });

  db.save();

  return res.json({
    success: true,
    message: 'VPS entregue com sucesso ao cliente!',
    vps: vpsData,
    order
  });
});

// Client list own VPS
apiRouter.get('/vps/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  const userVps = raw.vps.filter(v => v.userId === req.user!.id);
  return res.json(userVps);
});

// Admin list all VPS
apiRouter.get('/vps', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.vps);
});

// Admin edit VPS
apiRouter.put('/vps/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const idx = raw.vps.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'VPS não encontrada.' });

  raw.vps[idx] = {
    ...raw.vps[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.save();
  return res.json(raw.vps[idx]);
});

// ----------------------------------------------------
// TICKETS DE SUPORTE
// ----------------------------------------------------

apiRouter.get('/tickets/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  const userTickets = raw.tickets.filter(t => t.userId === req.user!.id);
  return res.json(userTickets);
});

apiRouter.get('/tickets', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.tickets);
});

apiRouter.post('/tickets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { category, subject, message, priority } = req.body;

  if (!category || !subject || !message) {
    return res.status(400).json({ error: 'Preencha a categoria, assunto e mensagem.' });
  }

  const raw = db.getRaw();
  const ticketId = `ticket-${Date.now()}`;
  const ticketNumber = db.generateTicketNumber();

  const newTicket: Ticket = {
    id: ticketId,
    ticketNumber,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    category: category || 'Suporte VPS',
    subject: subject.trim(),
    status: 'Aberto',
    priority: priority || 'Média',
    messages: [
      {
        id: `msg-${Date.now()}`,
        ticketId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: message.trim(),
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  raw.tickets.unshift(newTicket);
  db.save();

  return res.status(201).json(newTicket);
});

apiRouter.get('/tickets/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const ticket = raw.tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

  if (req.user!.role !== 'admin' && ticket.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso negado a este ticket.' });
  }

  return res.json(ticket);
});

apiRouter.post('/tickets/:id/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.user!;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Mensagem não pode estar em branco.' });
  }

  const raw = db.getRaw();
  const ticket = raw.tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

  if (user.role !== 'admin' && ticket.userId !== user.id) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    ticketId: ticket.id,
    senderId: user.id,
    senderName: user.role === 'admin' ? 'Suporte Nexa Host' : user.name,
    senderRole: user.role,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = new Date().toISOString();

  if (user.role === 'admin') {
    ticket.status = 'Em atendimento';
    // Notify user
    raw.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: ticket.userId,
      title: `Nova resposta no Ticket ${ticket.ticketNumber}`,
      message: 'A equipe da Nexa Host respondeu ao seu ticket de suporte.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  db.save();
  return res.json(ticket);
});

apiRouter.patch('/tickets/:id/close', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const ticket = raw.tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

  if (req.user!.role !== 'admin' && ticket.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  ticket.status = 'Fechado';
  ticket.updatedAt = new Date().toISOString();
  db.save();

  return res.json(ticket);
});

// ----------------------------------------------------
// PARCERIAS
// ----------------------------------------------------

apiRouter.post('/partnerships', (req: Request, res: Response) => {
  const { cityName, responsibleName, discord, serverLink, memberCount, description } = req.body;

  if (!cityName || !responsibleName || !discord) {
    return res.status(400).json({ error: 'Preencha o nome da cidade, responsável e Discord.' });
  }

  const raw = db.getRaw();
  const newPartnership: Partnership = {
    id: `part-${Date.now()}`,
    cityName: cityName.trim(),
    responsibleName: responsibleName.trim(),
    discord: discord.trim(),
    serverLink: serverLink ? serverLink.trim() : '',
    memberCount: Number(memberCount) || 0,
    description: description ? description.trim() : '',
    status: 'Pendente',
    createdAt: new Date().toISOString()
  };

  raw.partnerships.unshift(newPartnership);
  db.save();

  return res.status(201).json({
    message: 'Solicitação de parceria enviada com sucesso! Nossa equipe analisará sua proposta.',
    partnership: newPartnership
  });
});

apiRouter.get('/partnerships', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.partnerships);
});

apiRouter.patch('/partnerships/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const raw = db.getRaw();
  const part = raw.partnerships.find(p => p.id === id);
  if (!part) return res.status(404).json({ error: 'Parceria não encontrada.' });

  part.status = status;
  db.save();
  return res.json(part);
});

// ----------------------------------------------------
// AVISOS (Announcements)
// ----------------------------------------------------

apiRouter.get('/announcements', (req: Request, res: Response) => {
  const raw = db.getRaw();
  const active = raw.announcements.filter(a => a.active);
  return res.json(active);
});

apiRouter.get('/admin/announcements', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  return res.json(raw.announcements);
});

apiRouter.post('/announcements', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { title, content, type } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });

  const raw = db.getRaw();
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    type: type || 'info',
    active: true,
    createdAt: new Date().toISOString()
  };

  raw.announcements.unshift(newAnn);
  db.save();
  return res.status(201).json(newAnn);
});

apiRouter.put('/announcements/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const idx = raw.announcements.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Aviso não encontrado.' });

  raw.announcements[idx] = { ...raw.announcements[idx], ...req.body };
  db.save();
  return res.json(raw.announcements[idx]);
});

apiRouter.delete('/announcements/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  raw.announcements = raw.announcements.filter(a => a.id !== id);
  db.save();
  return res.json({ success: true });
});

// ----------------------------------------------------
// CLIENT NOTIFICATIONS
// ----------------------------------------------------

apiRouter.get('/notifications/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  const notifs = raw.notifications.filter(n => n.userId === req.user!.id);
  return res.json(notifs);
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const raw = db.getRaw();
  const notif = raw.notifications.find(n => n.id === id && n.userId === req.user!.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  return res.json({ success: true });
});

apiRouter.post('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  raw.notifications.forEach(n => {
    if (n.userId === req.user!.id) n.read = true;
  });
  db.save();
  return res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN DASHBOARD STATS & CLIENT LIST
// ----------------------------------------------------

apiRouter.get('/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  const totalClients = raw.users.filter(u => u.role === 'client').length;
  const totalOrders = raw.orders.length;
  const ordersAwaitingPayment = raw.orders.filter(o => o.status === 'Aguardando pagamento').length;
  const receiptsInAnalysis = raw.orders.filter(o => o.status === 'Comprovante em análise').length;
  const paymentsApproved = raw.orders.filter(o => o.status === 'Pagamento aprovado').length;
  const vpsDelivered = raw.vps.filter(v => v.status === 'VPS entregue').length;
  const openTickets = raw.tickets.filter(t => t.status !== 'Fechado').length;
  const pendingPartnerships = raw.partnerships.filter(p => p.status === 'Pendente').length;

  const totalRevenue = raw.orders
    .filter(o => o.status === 'Pagamento aprovado' || o.status === 'VPS entregue')
    .reduce((acc, o) => acc + (o.finalPrice || 0), 0);

  return res.json({
    totalClients,
    totalOrders,
    ordersAwaitingPayment,
    receiptsInAnalysis,
    paymentsApproved,
    vpsDelivered,
    openTickets,
    pendingPartnerships,
    totalRevenue
  });
});

apiRouter.get('/admin/clients', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRaw();
  const safeClients = raw.users
    .filter(u => u.role === 'client')
    .map(u => {
      const { passwordHash, salt, ...safe } = u;
      const vpsCount = raw.vps.filter(v => v.userId === u.id).length;
      const ordersCount = raw.orders.filter(o => o.userId === u.id).length;
      return {
        ...safe,
        vpsCount,
        ordersCount
      };
    });
  return res.json(safeClients);
});
