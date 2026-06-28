import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const {
  listingId,
  userId,
  quantity,
  ticketPrice,
} = await req.json();
   
    const session = await stripe.checkout.sessions.create({
  mode: "payment",

  payment_method_types: ["card"],

  line_items: [
    {
      price_data: {
        currency: "eur",

        product_data: {
          name: `${quantity} Ticket(s) Garagem164`,
        },

        unit_amount: Math.round(ticketPrice * 100),
      },

      quantity,
    },
  ],

  metadata: {
    listingId,
    userId,
    quantity: quantity.toString(),
  },

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,

cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-cancel`, 
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao criar checkout." },
      { status: 500 }
    );
  }
}