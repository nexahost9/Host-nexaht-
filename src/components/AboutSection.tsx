import React from 'react';
import { Server, Cpu, Shield, Globe, Award, CheckCircle, Clock } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#07090e] relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-500/30">
              Sobre a Nexa Host
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-['Rajdhani'] text-white uppercase tracking-tight mt-4 leading-tight">
              Infraestrutura de alta fidelidade para projetos ambiciosos
            </h2>
            <p className="mt-5 text-slate-300 text-base leading-relaxed">
              A <strong>Nexa Host</strong> nasceu da necessidade real de jogadores, donos de servidores FiveM e desenvolvedores por uma hospedagem no Brasil que realmente cumpra o que promete: <strong>estabilidade, baixa latência e proteção ativa contra ataques cibernéticos</strong>.
            </p>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Sabemos o quanto uma queda de servidor ou congelamento de FPS prejudica a experiência da sua comunidade. Por isso, investimos em servidores dedicados com os processadores mais rápidos do mercado (AMD Ryzen 9 de 5.7 GHz e Intel Xeon Gold) instalados em datacenters Tier III no coração de São Paulo, com conexão direta aos principais pontos de troca de tráfego (PTT / IX.br).
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">SLA de 99.9%</h4>
                  <p className="text-xs text-slate-400 mt-1">Garantia contratual de uptime com redundância elétrica e de rede.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Atendimento Gamer</h4>
                  <p className="text-xs text-slate-400 mt-1">Equipe que conhece frameworks FiveM (vRP, QBCore, txAdmin) e servidores.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Visual Board */}
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-[#0e1626] to-[#07090e] border border-cyan-500/30 p-8 shadow-2xl relative overflow-hidden">
              {/* Circuit lines */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Server className="w-48 h-48 text-cyan-400" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs font-mono text-cyan-400 uppercase">Status do Cluster BR-SP1</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operação Normal
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                      <span>Capacidade de Mitigação Anti-DDoS</span>
                      <span className="text-cyan-400 font-bold">2.5 Tbps</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full w-[94%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                      <span>Velocidade de Leitura/Gravação NVMe</span>
                      <span className="text-indigo-400 font-bold">7.000 MB/s</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[98%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                      <span>Uptime Médio Anual</span>
                      <span className="text-emerald-400 font-bold">99.98%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[99.9%]" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Backbone: IX.br + Tier-1 Transit</span>
                  <span className="text-white font-semibold">10 Gbps SFP+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
