export default function GiveawayRulesPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <section className="border-b border-white/5">

        <div className="max-w-[1200px] mx-auto px-12 py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Sorteios
          </div>

          <h1 className="mt-5 text-[72px] leading-none font-black italic uppercase tracking-[-4px]">
            Regras dos Sorteios
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Informação sobre o funcionamento dos sorteios oficiais da Garagem164.
          </p>

        </div>

      </section>

      <section className="max-w-[1200px] mx-auto px-12 py-20">

        <div className="space-y-6">

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">
            <h2 className="text-2xl font-black">
              Sorteios Oficiais
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Todos os sorteios disponíveis na plataforma são organizados
              exclusivamente pela Garagem164.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">
            <h2 className="text-2xl font-black">
              Participação
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Cada sorteio apresenta o número de participações disponíveis,
              o preço por participação e a data prevista para o sorteio.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">
            <h2 className="text-2xl font-black">
              Seleção do Vencedor
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Os vencedores são selecionados através do Random.org,
              uma plataforma independente de geração de números aleatórios
              reconhecida internacionalmente.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">
            <h2 className="text-2xl font-black">
              Transparência
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Sempre que aplicável, será disponibilizada prova do resultado
              obtido através do Random.org para garantir total transparência.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">
            <h2 className="text-2xl font-black">
              Contacto do Vencedor
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              O vencedor será contactado através dos dados associados à sua conta.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#ffb800]/20 bg-[#ffb800]/5 p-8">

            <h2 className="text-2xl font-black text-[#ffb800]">
              Importante
            </h2>

            <p className="mt-4 text-zinc-300 leading-relaxed">
              A participação em qualquer sorteio implica a aceitação integral
              destas regras e das condições apresentadas na respetiva página do sorteio.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}