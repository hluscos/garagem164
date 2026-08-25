import Link from "next/link";
import NewsletterUnsubscribe from "@/app/components/NewsletterUnsubscribe";

export default async function NewsletterUnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="min-h-[70vh] bg-black px-6 py-24 text-white">
      <section className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-zinc-950 p-8 sm:p-12">
        <div className="text-xs font-black uppercase tracking-[3px] text-[#ffb800]">
          Newsletter
        </div>
        <h1 className="mt-5 text-4xl font-black uppercase italic tracking-tight">
          Cancelar subscrição
        </h1>
        <p className="mt-5 leading-relaxed text-zinc-400">
          Depois de confirmares, deixarás de receber novidades e comunicações da
          Garagem164 neste endereço de email.
        </p>
        <NewsletterUnsubscribe token={token} />
        <Link href="/" className="mt-8 inline-block text-sm text-zinc-400 hover:text-white">
          Voltar à página inicial
        </Link>
      </section>
    </main>
  );
}
