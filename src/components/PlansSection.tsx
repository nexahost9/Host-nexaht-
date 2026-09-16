import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Shield, MapPin, Check, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { Plan } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface PlansSectionProps {
  onSelectPlan: (plan: Plan) => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'fivem' | 'games' | 'bots'>('all');

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const filteredPlans = plans.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <section id="plans" className="py-24 bg-[#080c14] border-y border-slate-800/80 relative">
      {/* Background glow lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-500/30">
            Nossos Planos VPS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-['Rajdhani'] text-white uppercase tracking-tight mt-4">
            Escolha o poder ideal para seu projeto
          </h2>
          <p className="mt-3 text-slate-300 text-base">
            Todos os planos incluem Anti-DDoS Game, proteção em tempo real, porta 10 Gbps e entrega rápida.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos os Planos
            </button>
            <button
              onClick={() => setActiveCategory('fivem')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'fivem'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎮 FiveM Otimizado
            </button>
            <button
              onClick={() => setActiveCategory('bots')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'bots'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🤖 Bots & Apps
            </button>
            <button
              onClick={() => setActiveCategory('games')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'games'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Games Elite
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm font-mono">Carregando planos disponíveis no servidor...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <p className="text-slate-400">Nenhum plano cadastrado nesta categoria no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredPlans.map(plan => {
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                    isPopular
                      ? 'bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#07090e] border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                      : 'bg-[#0d131f]/90 border border-slate-800 hover:border-cyan-500/40 shadow-xl'
                  } p-7`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      Mais Escolhido para FiveM
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold font-['Rajdhani'] text-white tracking-wide">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Instância dedicada de alta prioridade
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400 font-semibold">R$</span>
                        <span className="text-4xl font-black font-['Rajdhani'] text-white">
                          {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/mês</span>
                      </div>
                      <p className="text-[11px] text-cyan-400 mt-1 font-mono">
                        Pagamento via Pix com entrega ágil
                      </p>
                    </div>

                    {/* Hardware Specifications */}
                    <div className="space-y-3.5 mb-8">
                      <div className="flex items-center gap-3 text-sm text-slate-200">
                        <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 leading-none">Processador (CPU)</p>
                          <p className="font-semibold text-white mt-0.5">{plan.cpu}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-200">
                        <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
                          <span className="font-mono text-xs font-bold leading-none">RAM</span>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 leading-none">Memória RAM</p>
                          <p className="font-semibold text-white mt-0.5">{plan.ram}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-200">
                        <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 leading-none">Armazenamento</p>
                          <p className="font-semibold text-white mt-0.5">{plan.storage}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-200">
                        <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 leading-none">Localização</p>
                          <p className="font-semibold text-white mt-0.5">{plan.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-200">
                        <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 leading-none">Proteção DDoS</p>
                          <p className="font-semibold text-white mt-0.5">{plan.protection}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="pt-6 border-t border-slate-800/80 mb-8 space-y-2">
                        {plan.features.map((feat, fidx) => (
                          <div key={fidx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hire Button */}
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white border border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    <span>Contratar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
