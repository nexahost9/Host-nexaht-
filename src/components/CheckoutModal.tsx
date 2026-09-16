import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  FileText,
  AlertCircle,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Server,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { Plan, Order } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';

interface CheckoutModalProps {
  initialPlan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  initialPlan,
  isOpen,
  onClose,
  onOrderCompleted
}) => {
  const { user, settings, openAuthModal } = useAuth();

  const [step, setStep] = useState<'plan' | 'auth' | 'details' | 'payment' | 'success'>('plan');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan);
  const [serverName, setServerName] = useState('');
  const [desiredOs, setDesiredOs] = useState('Windows Server 2022 Datacenter');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Order state once created
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [pixDetails, setPixDetails] = useState<{
    pixKey: string;
    receiver: string;
    city: string;
    qrCodeUrl: string;
  } | null>(null);

  // Comprovante state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
      if (user) {
        setStep('details');
      } else {
        setStep('plan');
      }
    } else {
      api.getPlans().then(setPlans);
      setStep('plan');
    }
  }, [initialPlan, user, isOpen]);

  if (!isOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setCouponError(null);
    try {
      const res = await api.validateCoupon(couponCode, selectedPlan.price);
      setAppliedCoupon(res);
    } catch (err: any) {
      setCouponError(err.message || 'Cupom inválido.');
      setAppliedCoupon(null);
    }
  };

  const handleCreateOrder = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!selectedPlan) return;

    try {
      const order = await api.createOrder({
        planId: selectedPlan.id,
        serverName: serverName.trim() || undefined,
        desiredOs,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });

      setCreatedOrder(order);

      // Fetch Pix QR code
      const pix = await api.getPixQrCode(order.finalPrice);
      setPixDetails(pix);

      setStep('payment');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar pedido.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert('Formato inválido. Aceito apenas JPG, JPEG, PNG e PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 10MB.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !createdOrder) return;
    try {
      setUploadingReceipt(true);
      const res = await api.uploadReceipt(createdOrder.id, selectedFile);
      setCreatedOrder(res.order);
      setReceiptSuccess(true);
      setStep('success');
      if (onOrderCompleted) onOrderCompleted(res.order);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar comprovante.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const copyPixKey = () => {
    const key = pixDetails?.pixKey || settings?.pixKey || '2cb0664b-d842-440b-a578-872a5f74fa07';
    navigator.clipboard.writeText(key);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const currentPrice = selectedPlan
    ? appliedCoupon
      ? appliedCoupon.finalPrice
      : selectedPlan.price
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto py-8">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Steps */}
        <div className="mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
            <span>Contratação Nexa Host</span>
            {createdOrder && <span className="text-white font-bold">#{createdOrder.id}</span>}
          </div>
          <h2 className="text-2xl font-bold font-['Rajdhani'] text-white mt-1">
            {step === 'plan' && '1. Escolha ou Confirme seu Plano'}
            {step === 'details' && '2. Configurações da sua VPS'}
            {step === 'payment' && '3. Pagamento Pix & Comprovante'}
            {step === 'success' && 'Pedido Concluído com Sucesso!'}
          </h2>
        </div>

        {/* STEP 1: Choose Plan */}
        {step === 'plan' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Selecione o plano ideal para suas necessidades:
            </p>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(plans.length > 0 ? plans : [initialPlan]).filter(Boolean).map(p => {
                const plan = p!;
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold font-['Rajdhani'] text-base text-white">{plan.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {plan.cpu} • {plan.ram} • {plan.storage}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold font-['Rajdhani'] text-cyan-400">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/mês</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedPlan}
                onClick={() => {
                  if (!user) {
                    openAuthModal('login');
                  } else {
                    setStep('details');
                  }
                }}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{!user ? 'Acessar Conta para Continuar' : 'Avançar para Configuração'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Server Details & Coupon */}
        {step === 'details' && selectedPlan && (
          <div className="space-y-5">
            {/* Selected Plan Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Plano Selecionado</span>
                <h4 className="text-lg font-bold text-white font-['Rajdhani']">{selectedPlan.name}</h4>
                <p className="text-xs text-slate-400">{selectedPlan.cpu} | {selectedPlan.ram} | {selectedPlan.storage}</p>
              </div>
              <button
                onClick={() => setStep('plan')}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Trocar plano
              </button>
            </div>

            {/* Server Customization Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Nome do Servidor / Projeto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cidade FiveM Brasil Season 1"
                  value={serverName}
                  onChange={e => setServerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase">
                  Sistema Operacional Desejado
                </label>
                <select
                  value={desiredOs}
                  onChange={e => setDesiredOs(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Windows Server 2022 Datacenter">Windows Server 2022 Datacenter (RDP)</option>
                  <option value="Windows Server 2019 Datacenter">Windows Server 2019 Datacenter (RDP)</option>
                  <option value="Ubuntu 22.04 LTS (Jammy)">Ubuntu 22.04 LTS (SSH Root)</option>
                  <option value="Debian 12 Bookworm">Debian 12 Bookworm (SSH Root)</option>
                </select>
              </div>
            </div>

            {/* Coupon Application */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 font-mono uppercase">
                Cupom de Desconto
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: NEXA10"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm uppercase font-mono focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 uppercase tracking-wider cursor-pointer"
                >
                  Aplicar
                </button>
              </div>

              {couponError && (
                <p className="text-xs text-red-400">{couponError}</p>
              )}

              {appliedCoupon && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cupom {appliedCoupon.code} aplicado com sucesso! Desconto de R$ {appliedCoupon.discountAmount.toFixed(2)}.
                </p>
              )}
            </div>

            {/* Price Total Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Valor Original do Plano:</span>
                <span>R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Desconto ({appliedCoupon.code}):</span>
                  <span>- R$ {appliedCoupon.discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                <span>Total a Pagar via Pix:</span>
                <span className="text-xl font-black font-['Rajdhani'] text-cyan-400">
                  R$ {currentPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-3">
              <button
                onClick={() => setStep('plan')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                <span>Confirmar Pedido & Pagar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pix Payment & Receipt Upload */}
        {step === 'payment' && createdOrder && (
          <div className="space-y-6">
            {/* Order Created Alert */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Número do Pedido:</span>
                <strong className="text-base text-white font-mono">{createdOrder.id}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Valor a Pagar:</span>
                <strong className="text-base text-cyan-400 font-mono">
                  R$ {createdOrder.finalPrice.toFixed(2).replace('.', ',')}
                </strong>
              </div>
            </div>

            {/* Pix Box & Instructions */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Dynamic QR Code */}
                {pixDetails?.qrCodeUrl && (
                  <div className="p-2.5 rounded-xl bg-white shadow-lg flex-shrink-0">
                    <img
                      src={pixDetails.qrCodeUrl}
                      alt="QR Code Pix"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
                  <span className="text-[11px] font-mono uppercase text-cyan-400 font-semibold block">
                    Chave Pix Oficial da Nexa Host
                  </span>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs text-slate-200 break-all select-all flex items-center justify-between gap-2">
                    <span className="truncate">
                      {pixDetails?.pixKey || settings?.pixKey || '2cb0664b-d842-440b-a578-872a5f74fa07'}
                    </span>
                    <button
                      onClick={copyPixKey}
                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors flex-shrink-0 cursor-pointer"
                      title="Copiar chave Pix"
                    >
                      {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={copyPixKey}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Chave Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Chave Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Exact Requested Message */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-cyan-300 mb-1">Instruções:</p>
                “Realize o pagamento via Pix e envie o comprovante abaixo para que nossa equipe possa analisar seu pedido.”
              </div>
            </div>

            {/* Receipt Upload Section */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white font-['Rajdhani'] uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Anexar Comprovante (JPG, JPEG, PNG, PDF)
              </h4>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40"
                >
                  <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Clique para selecionar o comprovante</p>
                  <p className="text-[10px] text-slate-500 mt-1">Formatos aceitos: JPG, JPEG, PNG, PDF (Máx: 10MB)</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-cyan-400" />
                      <div>
                        <p className="text-xs font-semibold text-white truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Documento'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>

                  {filePreview && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 max-h-48 flex justify-center bg-black/40">
                      <img src={filePreview} alt="Preview comprovante" className="object-contain max-h-48" />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleUploadReceipt}
                disabled={!selectedFile || uploadingReceipt}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-40"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingReceipt ? 'Enviando comprovante...' : 'Enviar comprovante'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Message */}
        {step === 'success' && createdOrder && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-semibold text-xs">
                🟠 Comprovante enviado — aguardando análise.
              </span>
              <h3 className="text-2xl font-bold font-['Rajdhani'] text-white">
                Comprovante Registrado com Sucesso!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Nosso time financeiro e técnico já recebeu o comprovante do Pedido <strong>#{createdOrder.id}</strong>.
                Assim que aprovado, sua VPS será configurada e entregue diretamente na sua Área do Cliente.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between text-slate-400">
                <span>Pedido:</span>
                <span className="text-white font-mono">{createdOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Plano:</span>
                <span className="text-white">{createdOrder.planName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status Atual:</span>
                <span className="text-amber-400 font-semibold">Comprovante em análise</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Acompanhar na Área do Cliente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
