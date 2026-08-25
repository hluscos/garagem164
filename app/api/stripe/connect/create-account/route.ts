import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
);

const stripeLivemode =
  process.env.STRIPE_SECRET_KEY?.startsWith(
    "sk_live_",
  ) ?? false;

export async function GET(req: NextRequest) {
  try {
    const authorization =
      req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        { status: 401 },
      );
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Sessão inválida.",
        },
        { status: 401 },
      );
    }

    const {
      data: account,
      error: accountQueryError,
    } = await supabaseAdmin
      .from("stripe_connect_accounts")
      .select(
        `
          stripe_account_id,
          details_submitted,
          charges_enabled,
          payouts_enabled,
          livemode
        `,
      )
      .eq("user_id", user.id)
      .eq("livemode", stripeLivemode)
      .maybeSingle();

    if (accountQueryError) {
      console.error(
        "❌ Erro ao consultar estado Connect:",
        accountQueryError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar a conta Stripe.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      account: account ?? null,
      livemode: stripeLivemode,
    });
  } catch (error) {
    console.error(
      "❌ Stripe Connect status error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao verificar pagamentos Stripe.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. OBTER UTILIZADOR AUTENTICADO
     * ---------------------------------------------------------
     */

    const authorization =
      req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        { status: 401 },
      );
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (userError || !user) {
      console.error(
        "❌ Erro ao validar utilizador:",
        userError,
      );

      return NextResponse.json(
        {
          error: "Sessão inválida.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. VERIFICAR SE JÁ EXISTE CONTA CONNECT
     * ---------------------------------------------------------
     */

    const {
      data: existingAccount,
      error: accountQueryError,
    } = await supabaseAdmin
      .from("stripe_connect_accounts")
      .select(
        `
          id,
          user_id,
          stripe_account_id,
          details_submitted,
          charges_enabled,
          payouts_enabled,
          livemode
        `,
      )
      .eq("user_id", user.id)
      .eq("livemode", stripeLivemode)
      .maybeSingle();

    if (accountQueryError) {
      console.error(
        "❌ Erro ao procurar conta Connect:",
        accountQueryError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar a conta Stripe.",
        },
        { status: 500 },
      );
    }

    let stripeAccountId =
      existingAccount?.stripe_account_id;

    /*
     * ---------------------------------------------------------
     * 3. CRIAR CONTA CONNECT SE NÃO EXISTIR
     * ---------------------------------------------------------
     */

    if (!stripeAccountId) {
      const account =
        await stripe.accounts.create({
          type: "express",
          country: "PT",
          email: user.email ?? undefined,

          capabilities: {
            transfers: {
              requested: true,
            },
          },
        });

      stripeAccountId =
        account.id;

      const {
        error: insertError,
      } = await supabaseAdmin
        .from("stripe_connect_accounts")
        .insert({
          user_id: user.id,

          livemode:
            stripeLivemode,

          stripe_account_id:
            stripeAccountId,

          details_submitted:
            account.details_submitted ??
            false,

          charges_enabled:
            account.charges_enabled ??
            false,

          payouts_enabled:
            account.payouts_enabled ??
            false,
        });

      if (insertError) {
        console.error(
          "❌ Erro ao guardar conta Connect:",
          insertError,
        );

        /*
         * Se conseguimos criar a conta Stripe mas
         * falhámos a guardar na BD, tentamos apagar
         * a conta para evitar ficar uma conta órfã.
         */

        try {
          await stripe.accounts.del(
            stripeAccountId,
          );
        } catch (cleanupError) {
          console.error(
            "❌ Erro ao limpar conta Stripe órfã:",
            cleanupError,
          );
        }

        return NextResponse.json(
          {
            error:
              "Não foi possível guardar a conta Stripe.",
          },
          { status: 500 },
        );
      }

      console.log(
        "✅ Stripe Connect Account criada:",
        stripeAccountId,
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. OBTER ESTADO ATUAL DA CONTA
     * ---------------------------------------------------------
     */

    const account =
      await stripe.accounts.retrieve(
        stripeAccountId,
      );

    /*
     * ---------------------------------------------------------
     * 5. ATUALIZAR ESTADO NA BD
     * ---------------------------------------------------------
     */

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("stripe_connect_accounts")
      .update({
        details_submitted:
          account.details_submitted ??
          false,

        charges_enabled:
          account.charges_enabled ??
          false,

        payouts_enabled:
          account.payouts_enabled ??
          false,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "user_id",
        user.id,
      )
      .eq(
        "livemode",
        stripeLivemode,
      );

    if (updateError) {
      console.error(
        "⚠️ Erro ao atualizar estado Connect:",
        updateError,
      );
    }

    /*
     * ---------------------------------------------------------
     * 6. CRIAR LINK DE ONBOARDING
     * ---------------------------------------------------------
     */

    const origin =
      req.nextUrl.origin;

    const refreshUrl =
      `${origin}/account?stripe_connect=refresh`;

    const returnUrl =
      `${origin}/account?stripe_connect=success`;

    const accountLink =
      await stripe.accountLinks.create({
        account:
          stripeAccountId,

        refresh_url:
          refreshUrl,

        return_url:
          returnUrl,

        type:
          "account_onboarding",
      });

    console.log(
      "🔗 Stripe Connect onboarding criado:",
      {
        userId: user.id,
        stripeAccountId,
      },
    );

    /*
     * ---------------------------------------------------------
     * 7. DEVOLVER URL
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      url:
        accountLink.url,

      stripeAccountId,

      detailsSubmitted:
        account.details_submitted ??
        false,

      chargesEnabled:
        account.charges_enabled ??
        false,

      payoutsEnabled:
        account.payouts_enabled ??
        false,
    });

  } catch (error) {
    console.error(
      "❌ Stripe Connect error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao configurar pagamentos Stripe.",
      },
      { status: 500 },
    );
  }
}
