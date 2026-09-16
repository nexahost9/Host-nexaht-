import React, { useState } from 'react';
import { Handshake, Award, Tag, Megaphone, CheckCircle2, Send, Sparkles, DollarSign } from 'lucide-react';
import { api } from '../lib/api.ts';

export const PartnershipSection: React.FC = () => {
  const [formData, setFormData] = useState({
    cityName: '',
    responsibleName: '',
    discord: '',
    serverLink: '',
    memberCount: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const perks = [
    {
      emoji: '💰',
      title: '10% OFF nos serviços',
      desc: 'Desconto permanente na contratação e renovação das suas VPS e servidores dedicados.'
    },
    {
      emoji: '🎖️',
      title: 'Cargo especial de parceiro',
      desc: 'Destaque exclusivo no Discord oficial da Nexa Host com canal de suporte prioritário.'
    },
    {
      emoji: '🏷️',
      title: 'Selo de cidade parceira',
      desc: 'Badge e banner oficial de parceiro verificado para uso no Discord e loading screen da sua cidade.'
    },
    {
      emoji: '📢',
      title: 'Divulgação da cidade',
      desc: 'Divulgação da sua cidade FiveM nos canais de parceiros e eventos promovidos pela Nexa Host.'
    },
    {
      emoji: '🤝',
      title: 'Divulgação mútua',
      desc: 'Crescimento conjunto com apoio em sorteios, eventos e suporte especializado para sua comunidade.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.cityName || !formData.responsibleName || !formData.discord) {
      setErrorMessage('Por favor, preencha os campos obrigatórios (Nome da cidade, Responsável e Discord).');
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitPartnership({
        cityName: formData.cityName,
        responsibleName: formData.responsibleName,
        discord: formData.discord,
        serverLink: formData.serverLink,
        memberCount: formData.memberCount ? parseInt(formData.memberCount, 10) : 0,
        description: formData.description
      });
      setSuccessMessage(res.message);
      setFormData({
        cityName: '',
        responsibleName: '',
        discord: '',
        serverLink: '',
        memberCount: '',
        description: ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao enviar solicitação de parceria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="partnerships" className="py-24 bg-[#07090e] relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-500/30">
            Programa de Parcerias
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-['Rajdhani'] text-white uppercase tracking-tight mt-4">
            Cresça seu servidor FiveM com a Nexa Host
          </h2>
          <p className="mt-3 text-slate-300 text-base">
            Buscamos cidades de FiveM, comunidades de jogos e criadores comprometidos para construir uma aliança de alto nível.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {perks.map((perk, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                {perk.emoji}
              </span>
              <h3 className="text-base font-bold font-['Rajdhani'] text-white mb-2 leading-tight">
                {perk.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {perk.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Partnership Application Form */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b101b] border border-cyan-500/30 p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold font-['Rajdhani'] text-white uppercase flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Solicitar Parceria Oficial
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Preencha os dados da sua cidade para análise de nossa diretoria.
            </p>
          </div>

          {successMessage && (
            <div className="p-4 mb-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 mb-6 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                  Nome da Cidade / Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cidade Imperial RP"
                  value={formData.cityName}
                  onChange={e => setFormData({ ...formData, cityName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome ou apelido"
                  value={formData.responsibleName}
                  onChange={e => setFormData({ ...formData, responsibleName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                  Usuário do Discord *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: fundador_rp ou user#0001"
                  value={formData.discord}
                  onChange={e => setFormData({ ...formData, discord: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                  Link do Discord do Servidor
                </label>
                <input
                  type="url"
                  placeholder="https://discord.gg/suacidade"
                  value={formData.serverLink}
                  onChange={e => setFormData({ ...formData, serverLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Quantidade Média de Membros / Jogadores
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 1500"
                value={formData.memberCount}
                onChange={e => setFormData({ ...formData, memberCount: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Descrição do Projeto e Proposta de Parceria
              </label>
              <textarea
                rows={4}
                placeholder="Fale um pouco sobre a história do servidor, quantos players ativos costumam jogar e como pretendem realizar a divulgação mútua..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Enviando proposta...' : 'Enviar Solicitação de Parceria'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
