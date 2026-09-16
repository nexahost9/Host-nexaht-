import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Zap, ArrowRight, CheckCircle2, Terminal, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface HeroProps {
  onViewPlans: () => void;
  onHireNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewPlans, onHireNow }) => {
  const { settings } = useAuth();

  const heroTitle = settings?.heroTitle || 'Sua infraestrutura. Seu servidor. Sua Nexa.';
  const heroSubtitle = settings?.heroSubtitle || 'VPS de alto desempenho para hospedar seu projeto com estabilidade, segurança e suporte.';

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/25 via-[#07090e] to-[#07090e]">
      {/* Decorative Grid Lines Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Cybernetic Glow Orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-8 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{settings?.heroBadge || 'Hospedagem Gamer & Aplicações de Alta Performance'}</span>
            <span className="bg-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-200">
              BR Datacenter
            </span>
          </div>

          {/* Main Hero Headline - Exact requested text */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-['Rajdhani'] tracking-tight text-white uppercase leading-[1.1] mb-6">
            {heroTitle.split('.').map((part, index) => {
              const trimmed = part.trim();
              if (!trimmed) return null;
              const isLast = index === 2 || trimmed.toLowerCase().includes('nexa');
              return (
                <span key={index} className="inline-block mr-3">
                  {isLast ? (
                    <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent underline decoration-cyan-500/40 decoration-4">
                      {trimmed}.
                    </span>
                  ) : (
                    <span>{trimmed}.</span>
                  )}
                </span>
              );
            })}
          </h1>

          {/* Subtitle - Exact requested text */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            {heroSubtitle}
          </p>

          {/* CTA Buttons - Exact requested buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onHireNow}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-slate-950 font-black tracking-wide text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Contratar agora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onViewPlans}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Ver planos</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 p-3 text-left">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Processadores</p>
                <p className="text-sm font-bold text-white">Ryzen 9 & Xeon Gold</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 text-left">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Armazenamento</p>
                <p className="text-sm font-bold text-white">NVMe Gen4 7000MB/s</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 text-left">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Proteção</p>
                <p className="text-sm font-bold text-white">Anti-DDoS 2.5 Tbps</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 text-left">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Latência Nacional</p>
                <p className="text-sm font-bold text-white">5ms - 15ms no Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
