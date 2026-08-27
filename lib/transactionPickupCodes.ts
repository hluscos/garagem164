import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createPickupConfirmationCode } from "@/lib/pickupConfirmation";

export async function ensureTransactionPickupCode(
  transactionId: string,
  buyerId: string,
) {
  const { error } = await supabaseAdmin
    .from("transaction_pickup_codes")
    .upsert(
      {
        transaction_id: transactionId,
        buyer_id: buyerId,
        confirmation_code: createPickupConfirmationCode(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "transaction_id",
        ignoreDuplicates: true,
      },
    );

  if (error) {
    throw new Error("Unable to prepare pickup confirmation code.");
  }
}
