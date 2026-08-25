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

export async function POST(req: NextRequest) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. AUTENTICAÇÃO
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
      return NextResponse.json(
        {
          error: "Sessão inválida.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. OBTER TRANSACTION
     * ---------------------------------------------------------
     */

    const body = await req.json();

    const transactionId =
      body?.transactionId;

    if (!transactionId) {
      return NextResponse.json(
        {
          error:
            "transactionId é obrigatório.",
        },
        { status: 400 },
      );
    }

    const {
      data: transaction,
      error: transactionError,
    } = await supabaseAdmin
      .from("transactions")
      .select(
        `
          id,
          listing_id,
          auction_id,
          buyer_id,
          seller_id,
          amount,
          platform_fee,
          seller_amount,
          currency,
          commercial_status,
          financial_status,
          protection_ends_at,
          stripe_payment_intent,
          stripe_checkout_session,
          stripe_transfer_id
        `,
      )
      .eq("id", transactionId)
      .maybeSingle();

    if (transactionError) {
      console.error(
        "❌ ERRO NA CONSULTA DA TRANSAÇÃO:",
        transactionError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível obter a transação.",
        },
        { status: 500 },
      );
    }

    if (!transaction) {
      return NextResponse.json(
        {
          error:
            "Transação não encontrada.",
        },
        { status: 404 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. GARANTIR QUE O PEDIDO É FEITO PELO VENDEDOR
     * ---------------------------------------------------------
     */

    if (
      transaction.seller_id !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem autorização para efetuar este resgate.",
        },
        { status: 403 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. VALIDAR ESTADO COMERCIAL
     * ---------------------------------------------------------
     */

    if (
      transaction.commercial_status !==
      "delivered"
    ) {
      return NextResponse.json(
        {
          error:
            "A transação ainda não foi entregue.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. VALIDAR ESTADO FINANCEIRO
     * ---------------------------------------------------------
     */

    if (
      transaction.financial_status !==
      "ready_for_payout"
    ) {
      return NextResponse.json(
        {
          error:
            "A transação ainda não está pronta para resgate.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 6. VALIDAR PROTEÇÃO
     * ---------------------------------------------------------
     */

    if (
      !transaction.protection_ends_at
    ) {
      return NextResponse.json(
        {
          error:
            "A transação não possui período de proteção.",
        },
        { status: 409 },
      );
    }

    if (
      new Date(
        transaction.protection_ends_at,
      ).getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "O período de proteção ainda não terminou.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 7. IMPEDIR RESGATE DUPLICADO
     * ---------------------------------------------------------
     */

    if (
      transaction.stripe_transfer_id
    ) {
      return NextResponse.json({
        success: true,
        alreadyTransferred: true,
        stripeTransferId:
          transaction.stripe_transfer_id,
      });
    }

    /*
     * ---------------------------------------------------------
     * 8. OBTER CONTA STRIPE CONNECT
     * ---------------------------------------------------------
     */

    const {
      data: connectAccount,
      error: connectError,
    } = await supabaseAdmin
      .from("stripe_connect_accounts")
      .select(
        `
          stripe_account_id,
          details_submitted,
          charges_enabled,
          payouts_enabled
        `,
      )
      .eq(
        "user_id",
        transaction.seller_id,
      )
      .eq(
        "livemode",
        stripeLivemode,
      )
      .maybeSingle();

    if (connectError) {
      console.error(
        "❌ ERRO NA CONSULTA DA CONTA STRIPE CONNECT:",
        connectError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar a conta Stripe Connect.",
        },
        { status: 500 },
      );
    }

    if (!connectAccount) {
      return NextResponse.json(
        {
          error:
            "O vendedor não tem uma conta Stripe Connect.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 9. VALIDAR CONTA STRIPE
     * ---------------------------------------------------------
     */

    if (
      !connectAccount.details_submitted ||
      !connectAccount.payouts_enabled
    ) {
      return NextResponse.json(
        {
          error:
            "A conta Stripe do vendedor ainda não está habilitada para receber fundos.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 10. CONFIRMAR CONTA DIRETAMENTE NO STRIPE
     * ---------------------------------------------------------
     */

    const connectedAccount =
      await stripe.accounts.retrieve(
        connectAccount.stripe_account_id,
      );

    if (
      !connectedAccount.payouts_enabled
    ) {
      return NextResponse.json(
        {
          error:
            "O Stripe ainda não permite transferências para esta conta.",
        },
        { status: 409 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 11. VALIDAR VALOR
     * ---------------------------------------------------------
     */

    const sellerAmount =
      Number(
        transaction.seller_amount,
      );

    if (
      !Number.isFinite(
        sellerAmount,
      ) ||
      sellerAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O valor a receber pelo vendedor é inválido.",
        },
        { status: 409 },
      );
    }

    const transferAmount =
      Math.round(
        sellerAmount * 100,
      );

    /*
     * ---------------------------------------------------------
     * 12. CRIAR TRANSFERÊNCIA STRIPE
     * ---------------------------------------------------------
     *
     * Usamos uma chave de idempotência única por
     * transaction para impedir transferências duplicadas.
     */

    const idempotencyKey =
      `payout-${transaction.id}`;

    const transfer =
      await stripe.transfers.create(
        {
          amount:
            transferAmount,

          currency:
            transaction.currency.toLowerCase(),

          destination:
            connectAccount.stripe_account_id,

          metadata: {
            transaction_id:
              transaction.id,

            auction_id:
              transaction.auction_id ??
              "",

            seller_id:
              transaction.seller_id,

            buyer_id:
              transaction.buyer_id,

            seller_amount:
              sellerAmount.toFixed(2),
          },
        },
        {
          idempotencyKey,
        },
      );

    /*
     * ---------------------------------------------------------
     * 13. FINALIZAR TRANSACTION
     * ---------------------------------------------------------
     */

    const {
      data: completedTransaction,
      error:
        completionError,
    } = await supabaseAdmin.rpc(
      "complete_transaction_payout",
      {
        p_transaction_id:
          transaction.id,

        p_stripe_transfer_id:
          transfer.id,
      },
    );

    if (completionError) {
      console.error(
        "❌ ERRO AO FINALIZAR O RESGATE:",
        completionError,
      );

      /*
       * A transferência Stripe já foi criada.
       *
       * NÃO tentamos criar outra transferência.
       * A idempotency key garante que uma nova tentativa
       * da mesma transaction reutilize a operação.
       */

      return NextResponse.json(
        {
          error:
            "A transferência Stripe foi criada, mas não foi possível finalizar a transação.",
          stripeTransferId:
            transfer.id,
        },
        { status: 500 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 14. SUCESSO
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      transaction:
        completedTransaction?.[0] ??
        null,

      stripeTransferId:
        transfer.id,

      amount:
        sellerAmount,

      currency:
        transaction.currency,
    });

  } catch (error) {
    console.error(
      "❌ ERRO NO RESGATE STRIPE:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao efetuar o resgate dos fundos.",
      },
      { status: 500 },
    );
  }
}
