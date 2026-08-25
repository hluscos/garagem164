"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Save, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");
      setDisplayName(
        typeof user.user_metadata?.display_name === "string"
          ? user.user_metadata.display_name
          : "",
      );
      setLoading(false);
    }

    void loadUser();
  }, [router]);

  async function saveProfile() {
    if (profileSaving) {
      return;
    }

    setProfileSaving(true);
    setProfileMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
      },
    });

    if (error) {
      console.error("PROFILE UPDATE ERROR:", error);
      setProfileMessage({
        type: "error",
        text: "Não foi possível guardar os dados da conta.",
      });
    } else {
      setProfileMessage({
        type: "success",
        text: "Dados da conta atualizados.",
      });
    }

    setProfileSaving(false);
  }

  async function changePassword() {
    if (passwordSaving) {
      return;
    }

    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "A nova palavra-passe deve ter pelo menos 8 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "As palavras-passe não coincidem.",
      });
      return;
    }

    setPasswordSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("PASSWORD UPDATE ERROR:", error);
      setPasswordMessage({
        type: "error",
        text: "Não foi possível alterar a palavra-passe. Inicia sessão novamente e tenta de novo.",
      });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({
        type: "success",
        text: "Palavra-passe alterada com sucesso.",
      });
    }

    setPasswordSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
        <div className="w-full max-w-[900px] text-zinc-500">A carregar...</div>
      </main>
    );
  }

  const messageClass = (type: "success" | "error") =>
    type === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-red-500/20 bg-red-500/10 text-red-300";

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="w-full max-w-[900px]">
        <div className="text-[11px] font-bold uppercase tracking-[4px] text-[#ffb800]">
          A Minha Conta
        </div>

        <h1 className="mt-3 text-5xl font-black tracking-tight">
          Definições
        </h1>

        <p className="mt-2 max-w-2xl text-zinc-400">
          Atualiza os dados da tua conta e gere a segurança do acesso.
        </p>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffb800]/10 text-[#ffb800]">
              <UserRound size={21} />
            </div>

            <div>
              <h2 className="text-xl font-black">Dados da conta</h2>
              <p className="text-sm text-zinc-500">
                Informação associada ao teu perfil.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
                Nome de apresentação
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                placeholder="O teu nome"
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black px-4 outline-none transition focus:border-[#ffb800]"
              />
            </label>

            <label>
              <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
                Email
              </span>
              <input
                type="email"
                value={email}
                readOnly
                className="mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-white/5 bg-black px-4 text-zinc-500"
              />
            </label>
          </div>

          {profileMessage && (
            <div
              className={`mt-5 rounded-xl border p-4 text-sm ${messageClass(profileMessage.type)}`}
            >
              {profileMessage.text}
            </div>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={profileSaving}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-5 text-sm font-black text-black transition hover:bg-[#ffd34d] disabled:cursor-wait disabled:opacity-60"
          >
            <Save size={17} />
            {profileSaving ? "A guardar..." : "Guardar dados"}
          </button>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffb800]/10 text-[#ffb800]">
              <KeyRound size={21} />
            </div>

            <div>
              <h2 className="text-xl font-black">Palavra-passe</h2>
              <p className="text-sm text-zinc-500">
                Escolhe uma nova palavra-passe para a tua conta.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
                Nova palavra-passe
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black px-4 outline-none transition focus:border-[#ffb800]"
              />
            </label>

            <label>
              <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-500">
                Confirmar palavra-passe
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repete a nova palavra-passe"
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black px-4 outline-none transition focus:border-[#ffb800]"
              />
            </label>
          </div>

          {passwordMessage && (
            <div
              className={`mt-5 rounded-xl border p-4 text-sm ${messageClass(passwordMessage.type)}`}
            >
              {passwordMessage.text}
            </div>
          )}

          <button
            type="button"
            onClick={changePassword}
            disabled={passwordSaving}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ffb800]/50 px-5 text-sm font-black text-[#ffb800] transition hover:border-[#ffb800] hover:bg-[#ffb800]/5 disabled:cursor-wait disabled:opacity-60"
          >
            <KeyRound size={17} />
            {passwordSaving ? "A alterar..." : "Alterar palavra-passe"}
          </button>
        </section>
      </div>
    </main>
  );
}
