import React from 'react';
import { X, Shield, FileText, AlertCircle } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'refund' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const content = {
    terms: {
      title: 'Termos de Serviço',
      icon: FileText,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p><strong>1. Objeto do Serviço:</strong> A Nexa Host fornece servidores virtuais privados (VPS) voltados para jogos, FiveM, bots de Discord e aplicações de internet de acordo com os recursos do plano contratado.</p>
          <p><strong>2. Uso Aceitável:</strong> É estritamente proibido o uso da infraestrutura para práticas ilícitas, incluindo ataques cibernéticos (DDoS de saída), envio de SPAM, mineração abusiva ou hospedagem de conteúdo que viole a legislação brasileira vigente.</p>
          <p><strong>3. Pagamento e Entrega:</strong> Os pagamentos são processados via chave Pix oficial. A VPS é entregue manualmente pela equipe após validação do comprovante na Área do Cliente.</p>
          <p><strong>4. Disponibilidade (SLA):</strong> Garantimos disponibilidade média mensal de 99.9% para a rede e hardware, excluindo manutenções preventivas devidamente anunciadas com antecedência.</p>
        </div>
      )
    },
    privacy: {
      title: 'Política de Privacidade',
      icon: Shield,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p><strong>1. Dados Coletados:</strong> Coletamos apenas informações essenciais para a prestação do serviço: nome, e-mail, telefone de contato e registros dos comprovantes de pagamento enviados.</p>
          <p><strong>2. Sigilo e Proteção:</strong> Os comprovantes de pagamento e as credenciais de acesso às VPS são estritamente sigilosos e acessíveis exclusivamente pelo cliente autenticado e pela administração autorizada.</p>
          <p><strong>3. Compartilhamento:</strong> A Nexa Host não comercializa nem compartilha dados cadastrais de seus clientes com terceiros para fins de marketing ou publicidade.</p>
        </div>
      )
    },
    refund: {
      title: 'Política de Cancelamento e Reembolso',
      icon: AlertCircle,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p><strong>1. Cancelamento a Pedido do Cliente:</strong> O cliente pode solicitar o cancelamento a qualquer momento através do painel de controle ou abrindo um ticket na Área do Cliente.</p>
          <p><strong>2. Garantia de Satisfação:</strong> Em caso de problemas técnicos comprovados imputáveis à nossa infraestrutura no prazo de até 7 (sete) dias após a primeira contratação, realizaremos a devolução integral do valor pago via Pix.</p>
          <p><strong>3. Suspensão por Inadimplência:</strong> Planos com vencimento ultrapassado serão suspensos temporariamente e excluídos definitivamente após 5 dias de tolerância se não houver renovação.</p>
        </div>
      )
    }
  }[type];

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d131f] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Rajdhani'] text-white">
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-6 pr-2">
          {content.body}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
