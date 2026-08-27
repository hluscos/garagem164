import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TransactionalEmail = {
  eventKey: string;
  eventType: string;
  recipientUserId: string;
  subject: string;
  entityType: string;
  entityId: string;
  heading: string;
  paragraphs: string[];
  action?: { label: string; path: string };
};

type StoredEmailPayload = {
  heading?: unknown;
  paragraphs?: unknown;
  action?: unknown;
};

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function buildHtml(email: TransactionalEmail) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://garagem164.pt";
  const action = email.action
    ? `<p style="margin:28px 0"><a href="${escapeHtml(`${siteUrl}${email.action.path}`)}" style="display:inline-block;background:#ffb800;color:#000;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:800">${escapeHtml(email.action.label)}</a></p>`
    : "";

  return `<!doctype html><html lang="pt-PT"><body style="margin:0;background:#09090b;color:#f4f4f5;font-family:Arial,sans-serif"><main style="max-width:580px;margin:0 auto;padding:36px 24px"><p style="color:#ffb800;font-weight:800;letter-spacing:2px;text-transform:uppercase">Garagem164</p><h1 style="font-size:28px;margin:0 0 24px">${escapeHtml(email.heading)}</h1>${email.paragraphs.map((paragraph) => `<p style="line-height:1.6;color:#d4d4d8">${escapeHtml(paragraph)}</p>`).join("")}${action}<p style="margin-top:32px;color:#71717a;font-size:12px">Este é um email automático da Garagem164.</p></main></body></html>`;
}

/**
 * Creates a durable email event, then sends it through Resend. The local
 * event key is permanent; the same key is also supplied to Resend so webhook
 * retries cannot produce duplicate emails.
 */
export async function queueTransactionalEmailOnce(email: TransactionalEmail) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("transactional_email_events")
    .select("status, attempts")
    .eq("event_key", email.eventKey)
    .maybeSingle();

  if (existingError) {
    console.error("TRANSACTIONAL EMAIL EVENT READ ERROR", { eventKey: email.eventKey, existingError });
    return { queued: false, reason: "ledger_error" as const };
  }

  if (existing?.status === "sent") {
    return { queued: false, reason: "already_sent" as const };
  }

  if ((existing?.attempts ?? 0) >= 5) {
    return { queued: false, reason: "retry_limit_reached" as const };
  }

  const { error: insertError } = existing
    ? { error: null }
    : await supabaseAdmin
    .from("transactional_email_events")
    .insert({
      event_key: email.eventKey,
      event_type: email.eventType,
      recipient_user_id: email.recipientUserId,
      subject: email.subject,
      entity_type: email.entityType,
      entity_id: email.entityId,
      payload: {
        heading: email.heading,
        paragraphs: email.paragraphs,
        action: email.action ?? null,
      },
    });

  if (insertError) {
    if (insertError.code === "23505") return { queued: false, reason: "already_recorded" as const };
    console.error("TRANSACTIONAL EMAIL EVENT ERROR", { eventKey: email.eventKey, insertError });
    return { queued: false, reason: "ledger_error" as const };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const now = new Date().toISOString();

  if (!apiKey || !from) {
    await supabaseAdmin
      .from("transactional_email_events")
      .update({ last_error: "RESEND_API_KEY ou RESEND_FROM_EMAIL não configurada", updated_at: now })
      .eq("event_key", email.eventKey);
    return { queued: true, delivered: false, reason: "email_not_configured" as const };
  }

  const { data: recipient, error: recipientError } = await supabaseAdmin.auth.admin
    .getUserById(email.recipientUserId);
  const recipientEmail = recipient?.user?.email?.trim().toLowerCase();

  if (recipientError || !recipientEmail) {
    await supabaseAdmin
      .from("transactional_email_events")
      .update({
        status: "failed",
        attempts: (existing?.attempts ?? 0) + 1,
        last_error: "Não foi possível obter o email do destinatário.",
        updated_at: now,
      })
      .eq("event_key", email.eventKey);
    return { queued: true, delivered: false, reason: "recipient_unavailable" as const };
  }

  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.eventKey,
      },
      body: JSON.stringify({
        from,
        to: [recipientEmail],
        subject: email.subject,
        html: buildHtml(email),
      }),
    });
  } catch (error) {
    await supabaseAdmin
      .from("transactional_email_events")
      .update({
        status: "failed",
        attempts: (existing?.attempts ?? 0) + 1,
        last_error: error instanceof Error ? error.message : "Falha de rede ao contactar a Resend.",
        updated_at: now,
      })
      .eq("event_key", email.eventKey);
    return { queued: true, delivered: false, reason: "provider_error" as const };
  }

  const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;

  if (!response.ok) {
    await supabaseAdmin
      .from("transactional_email_events")
      .update({
        status: "failed",
        attempts: (existing?.attempts ?? 0) + 1,
        last_error: payload?.message || `A Resend respondeu ${response.status}.`,
        updated_at: now,
      })
      .eq("event_key", email.eventKey);
    return { queued: true, delivered: false, reason: "provider_error" as const };
  }

  await supabaseAdmin
    .from("transactional_email_events")
    .update({
      status: "sent",
      attempts: (existing?.attempts ?? 0) + 1,
      recipient_email: recipientEmail,
      provider_message_id: payload?.id ?? null,
      last_error: null,
      sent_at: now,
      updated_at: now,
    })
    .eq("event_key", email.eventKey);

  return { queued: true, delivered: true as const };
}

/** Retries unsent jobs from the durable outbox. Called by the protected cron. */
export async function flushTransactionalEmailOutbox(limit = 50) {
  const { data: events, error } = await supabaseAdmin
    .from("transactional_email_events")
    .select("event_key, event_type, recipient_user_id, subject, entity_type, entity_id, payload")
    .in("status", ["pending", "failed"])
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("TRANSACTIONAL EMAIL OUTBOX READ ERROR", error);
    return { processed: 0, delivered: 0, failed: 0 };
  }

  let delivered = 0;
  let failed = 0;

  for (const event of events ?? []) {
    const payload = event.payload as StoredEmailPayload | null;
    const paragraphs = Array.isArray(payload?.paragraphs)
      && payload.paragraphs.every((paragraph) => typeof paragraph === "string")
      ? payload.paragraphs
      : null;
    const action = payload?.action && typeof payload.action === "object"
      && "label" in payload.action && "path" in payload.action
      && typeof payload.action.label === "string" && typeof payload.action.path === "string"
      ? { label: payload.action.label, path: payload.action.path }
      : undefined;

    if (typeof payload?.heading !== "string" || !paragraphs) {
      await supabaseAdmin
        .from("transactional_email_events")
        .update({ status: "failed", attempts: 5, last_error: "Payload de email inválido.", updated_at: new Date().toISOString() })
        .eq("event_key", event.event_key);
      failed += 1;
      continue;
    }

    const result = await queueTransactionalEmailOnce({
      eventKey: event.event_key,
      eventType: event.event_type,
      recipientUserId: event.recipient_user_id,
      subject: event.subject,
      entityType: event.entity_type,
      entityId: event.entity_id,
      heading: payload.heading,
      paragraphs,
      action,
    });

    if ("delivered" in result && result.delivered) delivered += 1;
    else failed += 1;
  }

  return { processed: events?.length ?? 0, delivered, failed };
}
