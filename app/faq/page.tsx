"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Como comprar uma miniatura?",
      answer:
        "Escolhe a miniatura pretendida e segue as instruções apresentadas pelo vendedor.",
    },
    {
      question: "Quem paga os portes de envio?",
      answer:
        "Os portes são definidos pelo vendedor e apresentados no anúncio.",
    },
    {
      question: "Quanto custa anunciar na Garagem164?",
      answer:
        "Publicar um anúncio é gratuito. Os custos só se aplicam quando uma venda ou leilão é efetivamente pago.",
    },
    {
      question: "O comprador paga alguma taxa extra?",
      answer:
        "Não. O comprador vê e paga apenas o preço do artigo ou dos bilhetes e, quando aplicável, os portes de envio apresentados antes de pagar. Não é adicionada uma taxa de serviço ou de processamento no checkout.",
    },
    {
      question: "Quais são os custos para vender?",
      answer:
        "Publicar um anúncio é gratuito. Numa venda ou leilão pago, a Garagem164 retém uma comissão de 3% e o custo de processamento do pagamento. O detalhe é apresentado ao vendedor na área de vendas assim que o pagamento é confirmado.",
    },
    {
      question: "Porque pode variar o custo de processamento?",
      answer:
        "O custo depende do método de pagamento escolhido e do tipo de cartão ou carteira utilizada. A Garagem164 calcula-o a partir do pagamento efetivamente concluído e não o acrescenta como taxa ao comprador.",
    },
    {
      question: "Posso editar um anúncio depois de publicado?",
      answer:
        "Sim. Os anúncios podem ser editados através da área da conta.",
    },
    {
      question: "Como funcionam os leilões?",
      answer:
        "Os utilizadores podem licitar até ao final do leilão. Vence a licitação mais alta quando o tempo termina.",
    },
    {
      question: "Posso cancelar uma licitação?",
      answer:
        "Não. Todas as licitações devem ser feitas de forma responsável.",
    },
    {
      question: "Quem organiza os sorteios?",
      answer:
        "Os sorteios são organizados exclusivamente pela Garagem164.",
    },
    {
      question: "Como é escolhido o vencedor de um sorteio?",
      answer:
        "O vencedor é selecionado através de um processo transparente divulgado em cada sorteio, anunciado pela plataforma Random.org com dados certificados.",
    },
    {
      question: "A Garagem164 é responsável pelos envios?",
      answer:
        "Não. Nas vendas e leilões, a responsabilidade pelo envio pertence ao vendedor.",
    },
    {
      question: "Como posso contactar a Garagem164?",
      answer:
        "Através do formulário de contacto ou das redes sociais oficiais.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Ajuda
          </div>

          <h1 className="mt-5 text-[46px] font-black italic uppercase leading-none tracking-[-3px] sm:text-[60px] lg:text-[72px] lg:tracking-[-4px]">
            Perguntas Frequentes
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Tudo o que precisas de saber sobre compras,
            vendas, leilões e sorteios na Garagem164.
          </p>

        </div>

      </section>

      {/* FAQ */}

      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-12 lg:py-16">

        <div className="space-y-4">

          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-[28px] border border-white/5 bg-zinc-950 overflow-hidden"
              >

                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="w-full px-8 py-7 flex items-center justify-between text-left hover:bg-white/[0.02] transition-all duration-300"
                >

                  <span className="text-[20px] font-black">
                    {faq.question}
                  </span>

                  <div className="text-[#ffb800]">

                    {isOpen ? (
                      <Minus size={22} />
                    ) : (
                      <Plus size={22} />
                    )}

                  </div>

                </button>

                {isOpen && (
                  <div className="px-8 pb-8">

                    <div className="h-px bg-white/5 mb-6" />

                    <p className="text-zinc-400 leading-relaxed text-[16px]">
                      {faq.answer}
                    </p>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </section>
    </main>
  );
}
