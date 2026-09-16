import React from 'react';
import { NexaLogo } from './NexaLogo.tsx';
import { Shield, Zap, Heart, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'refund') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const { settings } = useAuth();

  return (
    <footer className="bg-[#05070b] border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <NexaLogo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Hospedagem de alto desempenho especializada em FiveM, servidores de jogos, bots de Discord, web e aplicações corporativas no Brasil.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Infraestrutura 100% Operacional
            </div>
          </div>

          {/* Col 2: Serviços & Planos */}
          <div>
            <h4 className="text-sm font-bold text-white font-['Rajdhani'] uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('plans')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Planos VPS FiveM
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('benefits')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Benefícios & Anti-DDoS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('partnerships')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Programa de Parcerias
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Sobre a Nexa Host
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Suporte & Clientes */}
          <div>
            <h4 className="text-sm font-bold text-white font-['Rajdhani'] uppercase tracking-wider mb-4">
              Área do Cliente
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('client')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Minha Conta & Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('client-vps')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Minhas VPS Entregues
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('client-tickets')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Abrir Chamado / Suporte
                </button>
              </li>
              <li>
                <a
                  href={settings?.discordUrl || 'https://discord.gg'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  Discord da Comunidade <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Termos Legais & Pagamento */}
          <div>
            <h4 className="text-sm font-bold text-white font-['Rajdhani'] uppercase tracking-wider mb-4">
              Termos & Segurança
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Termos de Serviço
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Política de Cancelamento
                </button>
              </li>
            </ul>

            <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-tight">
              <span className="text-cyan-400 font-semibold block mb-1">Pagamentos via Pix</span>
              Chave Pix verificada e entrega ágil por análise direta da nossa equipe.
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings?.companyName || 'Nexa Host'}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>São Paulo, SP - Brasil</span>
            <span>•</span>
            <span className="text-cyan-400">Protegido por Anti-DDoS Game L4/L7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
