import React from 'react';
import { Headphones, MessageSquare, Mail, Phone, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SupportContactSectionProps {
  onOpenTicket: () => void;
}

export const SupportContactSection: React.FC<SupportContactSectionProps> = ({ onOpenTicket }) => {
  const { settings } = useAuth();

  return (
    <section id="support" className="py-24 bg-[#07090e] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-500/30">
            Canais de Atendimento
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-['Rajdhani'] text-white uppercase tracking-tight mt-4">
            Suporte & Contato Especializado
          </h2>
          <p className="mt-3 text-slate-300 text-base">
            Estamos prontos para atender seu projeto com respostas rápidas e técnicos experientes em infraestrutura e FiveM.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Discord Card */}
          <div className="p-8 rounded-2xl bg-[#0e1422] border border-cyan-500/30 hover:border-cyan-400 transition-all text-center flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-['Rajdhani'] text-white mb-2">Comunidade no Discord</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Tire dúvidas rápidas, acompanhe status de manutenção em tempo real e interaja com outros administradores de servidores.
              </p>
            </div>

            <a
              href={settings?.discordUrl || 'https://discord.gg/nexahost'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Entrar no Discord</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Tickets Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#07090e] border-2 border-cyan-500/50 hover:border-cyan-400 transition-all text-center flex flex-col justify-between group shadow-2xl shadow-cyan-500/10">
            <div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Headphones className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-['Rajdhani'] text-white mb-2">Sistema de Tickets</h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                Atendimento formal e registrado com histórico, anexos de arquivos e resposta direta dos administradores e técnicos da Nexa Host.
              </p>
            </div>

            <button
              onClick={onOpenTicket}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <span>Abrir Ticket de Suporte</span>
            </button>
          </div>

          {/* Email / WhatsApp Card */}
          <div className="p-8 rounded-2xl bg-[#0e1422] border border-cyan-500/30 hover:border-cyan-400 transition-all text-center flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-['Rajdhani'] text-white mb-2">Contato Corporativo</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Para propostas comerciais, compras em lote de servidores dedicados ou parcerias institucionais.
              </p>
            </div>

            <a
              href={`mailto:${settings?.email || 'contato@nexahost.com.br'}`}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{settings?.email || 'contato@nexahost.com.br'}</span>
            </a>
          </div>
        </div>

        {/* 24/7 Notice bar */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Plantão técnico 24 horas por dia, 7 dias por semana para incidentes críticos de rede.</span>
          </div>
          <span className="font-mono text-cyan-400">Tempo de resposta médio: &lt; 20 minutos</span>
        </div>
      </div>
    </section>
  );
};
