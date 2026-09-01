"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, KeyRound, Save, Trash2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { optimizedImage } from "@/lib/images";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<Message>(null);
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
      setAvatarUrl(
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
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

  async function uploadAvatar(file: File) {
    if (avatarSaving) {
      return;
    }

    setAvatarMessage(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setAvatarMessage({
        type: "error",
        text: "Escolhe uma imagem JPEG, PNG ou WebP.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage({
        type: "error",
        text: "A imagem não pode ultrapassar 2 MB.",
      });
      return;
    }

    setAvatarSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    const avatarPath = `${user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("AVATAR UPLOAD ERROR:", uploadError);
      setAvatarMessage({
        type: "error",
        text: "Não foi possível carregar a foto de perfil.",
      });
      setAvatarSaving(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(avatarPath);

    const versionedUrl = `${publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: versionedUrl },
    });

    if (updateError) {
      console.error("AVATAR PROFILE UPDATE ERROR:", updateError);
      setAvatarMessage({
        type: "error",
        text: "A foto foi carregada, mas não foi possível associá-la à conta.",
      });
    } else {
      setAvatarUrl(versionedUrl);
      setAvatarMessage({
        type: "success",
        text: "Foto de perfil atualizada.",
      });
    }

    setAvatarSaving(false);
  }

  async function removeAvatar() {
    if (avatarSaving) {
      return;
    }

    setAvatarSaving(true);
    setAvatarMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([`${user.id}/avatar`]);

    if (removeError) {
      console.error("AVATAR DELETE ERROR:", removeError);
      setAvatarMessage({
        type: "error",
        text: "Não foi possível remover a foto de perfil.",
      });
      setAvatarSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    });

    if (updateError) {
      console.error("AVATAR PROFILE DELETE ERROR:", updateError);
      setAvatarMessage({
        type: "error",
        text: "Não foi possível atualizar os dados da conta.",
      });
    } else {
      setAvatarUrl("");
      setAvatarMessage({
        type: "success",
        text: "Foto de perfil removida.",
      });
    }

    setAvatarSaving(false);
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

          <div className="mt-7 flex flex-col gap-5 rounded-2xl border border-white/5 bg-black p-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ffb800]/30 bg-[#ffb800]/10">
              {avatarUrl ? (
                <img
                  src={optimizedImage(avatarUrl, { width: 192, height: 192, quality: 76, fit: "cover" })}
                  alt="Foto de perfil"
                  width={192}
                  height={192}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={46} className="text-[#ffb800]" />
              )}
            </div>

            <div className="flex-1">
              <div className="font-black">Foto de perfil</div>
              <p className="mt-1 text-sm text-zinc-500">
                JPEG, PNG ou WebP, até 2 MB.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-4 text-xs font-black uppercase text-black transition hover:bg-[#ffd34d]">
                  <Camera size={16} />
                  {avatarSaving ? "A atualizar..." : "Escolher foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={avatarSaving}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadAvatar(file);
                      }
                      event.target.value = "";
                    }}
                    className="sr-only"
                  />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={avatarSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/50 px-4 text-xs font-black uppercase text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          {avatarMessage && (
            <div
              className={`mt-5 rounded-xl border p-4 text-sm ${messageClass(avatarMessage.type)}`}
            >
              {avatarMessage.text}
            </div>
          )}

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
