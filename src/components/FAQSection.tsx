import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Como funciona a entrega da VPS após a confirmação do pagamento?',
      a: 'Após realizar o pagamento via Pix e anexar o comprovante na plataforma, nossa equipe técnica valida o recebimento e provisiona sua VPS em instantes. Você receberá uma notificação em sua Área do Cliente e os dados de IP, porta, usuário e senha ficarão disponíveis imediatamente na aba "Minhas VPS".'
    },
    {
      q: 'As VPS são otimizadas para servidores FiveM e txAdmin?',
      a: 'Sim! Nossos servidores contam com núcleos de alta frequência (AMD Ryzen 9 e Xeon Gold), portas 30120 liberadas por padrão e excelente performance de leitura NVMe Gen4 para que seu banco de dados MySQL e recursos de FiveM rodem sem quedas de tick rate.'
    },
    {
      q: 'Como funciona o pagamento via Pix manual?',
      a: 'Ao finalizar o pedido, geramos o valor exato com a nossa chave Pix oficial e QR Code. Você faz a transferência pelo aplicativo do seu banco e envia a foto ou PDF do comprovante no próprio sistema. Assim que aprovado pelo nosso time, sua VPS é liberada.'
    },
    {
      q: 'A proteção Anti-DDoS realmente aguenta ataques pesados em servidores de jogos?',
      a: 'Com certeza. Contamos com infraestrutura com capacidade superior a 2.5 Tbps e filtros específicos para o tráfego de jogos (camadas L4 e L7). Ataques diretos nas portas de FiveM, Rust, Minecraft ou bots são mitigados sem causar perda de pacotes ou desconexão dos jogadores.'
    },
    {
      q: 'Quais sistemas operacionais estão disponíveis?',
      a: 'Disponibilizamos Windows Server (2022 / 2019 Datacenter com acesso via RDP Área de Trabalho Remota), além das distribuições Linux mais estáveis do mercado como Ubuntu 22.04 LTS e Debian 12 com acesso root via SSH.'
    },
    {
      q: 'Posso fazer upgrade do meu plano VPS no futuro?',
      a: 'Sim! Conforme sua cidade ou projeto expandir, você pode solicitar a adição de memória RAM, núcleos de CPU e espaço em disco mantendo todos os seus arquivos, scripts e bancos de dados intactos.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-[#080c14] border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-500/30">
            Dúvidas Frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-['Rajdhani'] text-white uppercase tracking-tight mt-4">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Tudo o que você precisa saber sobre nossa infraestrutura, entrega e suporte.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-base font-bold text-slate-200 font-['Rajdhani']">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-300' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
