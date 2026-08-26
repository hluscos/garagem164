import type { Provider } from "@supabase/supabase-js";

const providerNames: Partial<Record<Provider, string>> = {
  facebook: "Facebook",
  google: "Google",
};

export function getSocialAuthErrorMessage(
  provider: Provider,
  errorMessage?: string,
) {
  const providerName = providerNames[provider] ?? "este serviço";
  const normalizedMessage = errorMessage?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("provider is not enabled") ||
    normalizedMessage.includes("unsupported provider")
  ) {
    return `O acesso com ${providerName} ainda não está disponível.`;
  }

  return `Não foi possível continuar com ${providerName}. Tenta novamente.`;
}
