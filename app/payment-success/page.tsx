type PaymentSuccessPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { type } = await searchParams;
  const isRaffle = type === "raffle";

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-4xl font-black text-white">
          Pagamento Concluído
        </h1>

        <p className="mt-6 text-zinc-400">
          O teu pagamento foi recebido com sucesso.
        </p>

        {isRaffle ? (
          <>
            <p className="mt-2 text-zinc-400">
              Os teus bilhetes foram registados automaticamente.
            </p>

            <a
              href="/raffles"
              className="inline-flex mt-10 h-12 px-8 items-center justify-center rounded-xl bg-[#ffb800] text-black font-black"
            >
              Voltar aos Sorteios
            </a>
          </>
        ) : (
          <>
            <p className="mt-2 text-zinc-400">
              A tua compra foi registada com sucesso.
            </p>

            <a
              href="/account"
              className="inline-flex mt-10 h-12 px-8 items-center justify-center rounded-xl bg-[#ffb800] text-black font-black"
            >
              Ver a Minha Conta
            </a>
          </>
        )}
      </div>
    </main>
  );
}