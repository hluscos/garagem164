export default function LoginPage() {
  return (

    <main className="min-h-screen bg-black flex items-center justify-center px-6">

      {/* BACKGROUND GLOW */}

      <div className="absolute w-[700px] h-[700px] bg-[#ffb800]/10 blur-[180px] rounded-full" />

      {/* CARD */}

      <div className="relative z-10 w-full max-w-[460px] rounded-[32px] border border-white/10 bg-zinc-950/90 backdrop-blur-2xl p-10 shadow-[0_0_80px_rgba(255,184,0,0.08)]">

        {/* TITLE */}

        <div className="mb-10">

          <div className="text-[12px] uppercase tracking-[3px] text-[#ffb800] font-bold">

            Garagem164

          </div>

          <h1 className="mt-3 text-[52px] leading-none font-black italic uppercase tracking-[-3px] text-white">

            Entrar

          </h1>

          <p className="mt-4 text-zinc-400 leading-relaxed">

            Acede à tua garagem, leilões e coleção.

          </p>

        </div>

        {/* FORM */}

        <div className="space-y-5">

          {/* EMAIL */}

          <div>

            <label className="text-[12px] uppercase tracking-[2px] text-zinc-500 font-bold">

              Email

            </label>

            <input
              type="email"
              placeholder="o teu email"
              className="mt-2 w-full h-[58px] rounded-2xl bg-black border border-white/10 px-5 text-white outline-none focus:border-[#ffb800] transition-all"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="text-[12px] uppercase tracking-[2px] text-zinc-500 font-bold">

              Password

            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full h-[58px] rounded-2xl bg-black border border-white/10 px-5 text-white outline-none focus:border-[#ffb800] transition-all"
            />

          </div>

          {/* BUTTON */}

          <button className="w-full h-[60px] rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black text-[14px] font-black uppercase tracking-[1px] shadow-[0_0_50px_rgba(255,184,0,0.18)] mt-4">

            Entrar

          </button>

        </div>

      </div>

    </main>

  );
}