export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="max-w-[1200px] mx-auto px-12 py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Legal
          </div>

          <h1 className="mt-5 text-[72px] leading-none font-black italic uppercase tracking-[-4px]">
            Política de Cookies
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Informação sobre a utilização de cookies e tecnologias semelhantes na Garagem164.
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="max-w-[1200px] mx-auto px-12 py-20">

        <div className="space-y-6">

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              O que são Cookies?
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Cookies são pequenos ficheiros armazenados no dispositivo do utilizador
              que permitem melhorar a experiência de navegação e o funcionamento
              da plataforma.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Para que servem?
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Os cookies podem ser utilizados para memorizar preferências,
              manter sessões iniciadas, melhorar o desempenho da plataforma
              e obter informações estatísticas de utilização.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Tipos de Cookies
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              A Garagem164 utiliza cookies essenciais ao funcionamento e à
              autenticação. Com autorização do utilizador, utiliza também
              cookies de análise do Google Analytics 4 para compreender a
              utilização da plataforma e melhorar a experiência.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Gestão de Cookies
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              A escolha pode ser alterada a qualquer momento através de
              “Gerir cookies”, no rodapé. Também é possível bloquear ou eliminar
              cookies nas definições do navegador, embora algumas funcionalidades
              essenciais possam deixar de funcionar corretamente.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Google Analytics 4
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Quando autorizado, o Google Analytics recolhe dados estatísticos
              sobre visitas, páginas consultadas, origem do tráfego, dispositivo
              e interações. Utiliza os cookies <strong>_ga</strong> e{" "}
              <strong>_ga_&lt;ID&gt;</strong>, com duração predefinida de até dois
              anos. Estes cookies não são carregados quando os cookies opcionais
              são recusados.
            </p>

          </div>

          <div className="rounded-[28px] border border-[#ffb800]/20 bg-[#ffb800]/5 p-8">

            <h2 className="text-2xl font-black text-[#ffb800]">
              Atualizações
            </h2>

            <p className="mt-4 text-zinc-300 leading-relaxed">
              Esta Política de Cookies poderá ser atualizada periodicamente.
              Recomenda-se a consulta regular desta página para acompanhar
              eventuais alterações.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
