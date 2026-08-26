export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Legal
          </div>

          <h1 className="mt-5 text-[46px] font-black italic uppercase leading-none tracking-[-3px] sm:text-[60px] lg:text-[72px] lg:tracking-[-4px]">
            Política de Privacidade
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Como a Garagem164 recolhe, utiliza e protege os dados dos utilizadores.
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">

        <div className="space-y-6">

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Dados Recolhidos
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              A Garagem164 poderá recolher informações fornecidas pelos
              utilizadores durante o registo, publicação de anúncios,
              participação em leilões, sorteios, subscrição da newsletter e
              contactos efetuados através da plataforma. Mediante consentimento,
              o Google Analytics 4 recolhe também dados estatísticos de navegação
              e utilização.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Utilização dos Dados
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Os dados recolhidos são utilizados para permitir o funcionamento
              da plataforma, melhorar os serviços prestados, gerir contas de
              utilizador, responder a pedidos de suporte e analisar, de forma
              agregada, o desempenho e a utilização do website. O email da
              newsletter é utilizado para enviar novidades e comunicações da
              Garagem164 apenas após consentimento do titular.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Partilha de Informação
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              A Garagem164 não vende dados pessoais a terceiros. A informação
              poderá apenas ser partilhada quando exigido por lei ou necessário
              para o funcionamento dos serviços disponibilizados.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Segurança
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              São adotadas medidas razoáveis para proteger os dados pessoais
              contra acessos não autorizados, perda ou utilização indevida.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Direitos dos Utilizadores
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Os utilizadores podem solicitar o acesso, correção ou eliminação
              dos seus dados pessoais, nos termos da legislação aplicável. A
              subscrição da newsletter pode ser cancelada a qualquer momento
              através da ligação incluída em cada comunicação.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Conservação dos Dados
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Os dados serão conservados apenas pelo período necessário para
              cumprir as finalidades para as quais foram recolhidos ou para
              cumprir obrigações legais.
            </p>

          </div>

          <div className="rounded-[28px] border border-[#ffb800]/20 bg-[#ffb800]/5 p-8">

            <h2 className="text-2xl font-black text-[#ffb800]">
              Contacto
            </h2>

            <p className="mt-4 text-zinc-300 leading-relaxed">
              Para qualquer questão relacionada com privacidade ou proteção de
              dados, os utilizadores poderão utilizar a página de contacto da plataforma.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
