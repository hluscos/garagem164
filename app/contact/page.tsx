export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Contacto
          </div>

          <h1 className="mt-5 text-[46px] font-black italic uppercase leading-none tracking-[-3px] sm:text-[60px] lg:text-[72px] lg:tracking-[-4px]">
            Fala Connosco
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Tens alguma dúvida, sugestão ou problema?
            Estamos disponíveis para ajudar.
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">

        <div className="grid md:grid-cols-2 gap-10">

          {/* FORM */}

          <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Enviar Mensagem
            </h2>

            <div className="mt-8 space-y-5">

              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Nome
                </label>

                <input
                  type="text"
                  className="w-full h-[56px] rounded-2xl bg-black border border-white/10 px-5 outline-none focus:border-[#ffb800] transition"
                />

              </div>

              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  className="w-full h-[56px] rounded-2xl bg-black border border-white/10 px-5 outline-none focus:border-[#ffb800] transition"
                />

              </div>

              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Assunto
                </label>

                <select
                  className="w-full h-[56px] rounded-2xl bg-black border border-white/10 px-5 outline-none focus:border-[#ffb800] transition"
                >

                  <option>Suporte Técnico</option>
                  <option>Problema com Anúncio</option>
                  <option>Problema com Leilão</option>
                  <option>Sorteios</option>
                  <option>Sugestão</option>
                  <option>Outro</option>

                </select>

              </div>

              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Mensagem
                </label>

                <textarea
                  rows={6}
                  className="w-full rounded-2xl bg-black border border-white/10 p-5 outline-none focus:border-[#ffb800] transition resize-none"
                />

              </div>

              <button
                className="w-full h-[58px] rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px]"
              >
                Enviar Mensagem
              </button>

            </div>

          </div>

          {/* INFO */}

          <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Como Podemos Ajudar?
            </h2>

            <div className="mt-8 space-y-6 text-zinc-400">

              <div>
                ✓ Suporte a utilizadores
              </div>

              <div>
                ✓ Questões sobre leilões
              </div>

              <div>
                ✓ Questões sobre sorteios
              </div>

              <div>
                ✓ Sugestões para a plataforma
              </div>

              <div>
                ✓ Reportar conteúdo inadequado
              </div>

            </div>

            <div className="mt-12 p-6 rounded-2xl border border-[#ffb800]/20 bg-[#ffb800]/5">

              <div className="text-[#ffb800] font-black uppercase text-sm tracking-[1px]">
                Tempo Médio de Resposta
              </div>

              <div className="mt-3 text-3xl font-black">
                &lt; 48h
              </div>

              <p className="mt-3 text-zinc-400">
                Tentamos responder a todos os contactos o mais rapidamente possível.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
