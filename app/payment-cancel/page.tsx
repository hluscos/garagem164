export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
        <div className="text-6xl mb-6">❌</div>

        <h1 className="text-4xl font-black text-white">
          Pagamento Cancelado
        </h1>

        <p className="mt-6 text-zinc-400">
          O pagamento não foi concluído.
        </p>

        <p className="mt-2 text-zinc-400">
          Podes voltar a tentar quando quiseres.
        </p>

        <a
          href="/raffles"
          className="inline-flex mt-10 h-12 px-8 items-center justify-center rounded-xl border border-white/10 text-white hover:bg-zinc-900"
        >
          Voltar aos Sorteios
        </a>
      </div>
    </main>
  );
}