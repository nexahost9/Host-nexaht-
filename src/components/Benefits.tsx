import React from 'react';
import { Zap, Shield, Gamepad2, MessageSquare, Globe, Rocket, Check } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefitsList = [
    {
      icon: Zap,
      emoji: '⚡',
      title: 'Alto desempenho',
      tag: 'Hardware High-End',
      color: 'from-amber-500/20 to-yellow-500/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      description:
        'Processadores AMD Ryzen 9 de 5.7 GHz e Intel Xeon Gold com memória DDR5 de alta frequência e discos NVMe Gen4 ultrarrápidos para o menor tempo de resposta.',
      highlights: ['Ryzen 9 7950X3D / 5950X', 'Discos NVMe Gen4 7000 MB/s', 'Zero gargalo de processamento']
    },
    {
      icon: Shield,
      emoji: '🛡️',
      title: 'Segurança',
      tag: 'Anti-DDoS Game',
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      description:
        'Mitigação Anti-DDoS Game com capacidade superior a 2.5 Tbps. Filtros avançados para mitigar ataques UDP/TCP, SYN flood e exploits específicos sem derrubar seu servidor.',
      highlights: ['Proteção de camada 4 e camada 7', 'Mitigação em tempo real sem lag', 'Firewall configurável']
    },
    {
      icon: Gamepad2,
      emoji: '🎮',
      title: 'Ideal para FiveM',
      tag: 'Otimização Gamer',
      color: 'from-cyan-500/20 to-blue-500/5',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      description:
        'Infraestrutura especialmente dimensionada para rodar bases pesadas de FiveM (vRP, QBCore, ESX), txAdmin, bots de Discord e servidores de jogos com estabilidade total de ticks.',
      highlights: ['Portas FiveM liberadas', 'Suporte a txAdmin e MySQL nativo', 'Perfeito para 32 a 256+ players']
    },
    {
      icon: MessageSquare,
      emoji: '💬',
      title: 'Suporte',
      tag: 'Atendimento Especializado',
      color: 'from-indigo-500/20 to-purple-500/5',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
      description:
        'Equipe técnica que entende a rotina de desenvolvedores e donos de servidores. Suporte ágil via sistema de tickets integrado e Discord.',
      highlights: ['Tempo de resposta rápido', 'Equipe gamer e técnica', 'Painel de tickets integrado']
    },
    {
      icon: Globe,
      emoji: '🌐',
      title: 'Conectividade',
      tag: 'Baixa Latência SP',
      color: 'from-sky-500/20 to-cyan-500/5',
      borderColor: 'border-sky-500/30',
      iconColor: 'text-sky-400',
      description:
        'Links redundantes conectados diretamente ao IX.br (PTT-Metro) em São Paulo. O menor ping do Brasil e excelente rota para toda a América do Sul.',
      highlights: ['Uplink de 10 Gbps redundante', 'Ping de 5ms a 18ms no Sudeste', 'Rotas diretas de fibra óptica']
    },
    {
      icon: Rocket,
      emoji: '🚀',
      title: 'Fácil expansão',
      tag: 'Upgrade Ágil',
      color: 'from-purple-500/20 to-pink-500/5',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      description:
        'Conforme sua cidade FiveM ou projeto cresce, faça upgrade de memória RAM, núcleos de CPU e espaço em disco sem perder suas configurações ou banco de dados.',
      highlights: ['Sem perda de arquivos', 'Migração facilitada', 'Planos flexíveis sob demanda']
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-[#07090e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
            Diferenciais da Nexa Host
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-['Rajdhani'] text-white uppercase tracking-tight mt-4">
            Construída para quem busca estabilidade máxima
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            Seja para criar sua cidade FiveM dos sonhos, hospedar bots ou gerenciar aplicações críticas, temos a estrutura certa para você.
          </p>
        </div>

        {/* Benefits Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative group rounded-2xl bg-gradient-to-b ${item.color} p-6 border ${item.borderColor} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 ${item.iconColor} shadow-inner`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-['Rajdhani'] text-white flex items-center gap-2 mb-2">
                    <span>{item.emoji}</span>
                    <span>{item.title}</span>
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
