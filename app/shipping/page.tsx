export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="max-w-[1200px] mx-auto px-12 py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Envios
          </div>

          <h1 className="mt-5 text-[72px] leading-none font-black italic uppercase tracking-[-4px]">
            Informação de Envios
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Tudo o que precisas de saber sobre entregas,
            portes e responsabilidades entre comprador e vendedor.
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="max-w-[1200px] mx-auto px-12 py-20">

        <div className="space-y-6">

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Quem é responsável pelo envio?
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Nas vendas e leilões, o envio é da responsabilidade do vendedor.
              O comprador e o vendedor devem acordar previamente a forma de envio,
              custos e condições de entrega.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Quem paga os portes?
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Os portes de envio são definidos pelo vendedor e devem estar
              claramente identificados no anúncio ou acordados entre as partes.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              A Garagem164 intervém nos envios?
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Não. A Garagem164 é uma plataforma de ligação entre colecionadores
              e não participa diretamente no transporte das miniaturas.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              São permitidos envios internacionais?
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Sim. O vendedor pode optar por efetuar envios internacionais,
              desde que essa informação esteja claramente indicada no anúncio.
            </p>

          </div>

          <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-8">

            <h2 className="text-2xl font-black">
              Recomendações de embalagem
            </h2>

            <p className="mt-4 text-zinc-400 leading-relaxed">
              Recomendamos que todas as miniaturas sejam enviadas devidamente
              protegidas com material de amortecimento adequado, evitando danos
              durante o transporte.
            </p>

          </div>

          <div className="rounded-[28px] border border-[#ffb800]/20 bg-[#ffb800]/5 p-8">

            <h2 className="text-2xl font-black text-[#ffb800]">
              Recomendação Garagem164
            </h2>

            <p className="mt-4 text-zinc-300 leading-relaxed">
              Sempre que possível, utilize métodos de envio com código de
              rastreamento. Isso aumenta a segurança tanto para o comprador
              como para o vendedor.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}