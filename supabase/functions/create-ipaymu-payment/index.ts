import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  order_id: string;
  amount: number;
  payment_type: 'dp' | 'full';
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paymentData: PaymentRequest = await req.json();
    console.log('Payment request received:', paymentData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get iPaymu credentials
    const iPaymuApiKey = Deno.env.get("IPAYMU_API_KEY")!;
    const iPaymuVa = Deno.env.get("IPAYMU_VA")!;

    if (!iPaymuApiKey || !iPaymuVa) {
      throw new Error("iPaymu credentials not configured");
    }

    // Create payment data for iPaymu
    const product = [`${paymentData.payment_type === 'dp' ? 'DP' : 'Pelunasan'} Pembayaran Proyek`];
    const qty = ["1"];
    const price = [paymentData.amount];
    const body = `product[]=${product[0]}&qty[]=${qty[0]}&price[]=${price[0]}&returnUrl=https://preview--buat-web-yuk-chat.lovable.app/dashboard&cancelUrl=https://preview--buat-web-yuk-chat.lovable.app/dashboard&notifyUrl=https://gcejndsmdkdxtlhziiqx.supabase.co/functions/v1/payment-callback&buyerName=${paymentData.buyer_name}&buyerEmail=${paymentData.buyer_email}&buyerPhone=${paymentData.buyer_phone}&referenceId=${paymentData.order_id}`;
    
    // Generate signature
    const stringToSign = `POST:https://sandbox.ipaymu.com/api/v2/payment:${iPaymuVa}:${iPaymuApiKey}:${body}`;
    const signature = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(stringToSign))
      .then(hashBuffer => Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join(''));

    console.log('Making request to iPaymu API');

    // Call iPaymu API
    const iPaymuResponse = await fetch("https://sandbox.ipaymu.com/api/v2/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "signature": signature,
        "va": iPaymuVa,
        "timestamp": Date.now().toString(),
      },
      body: body,
    });

    const responseText = await iPaymuResponse.text();
    console.log('iPaymu response:', responseText);
    
    let iPaymuData;
    try {
      iPaymuData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse iPaymu response:', responseText);
      throw new Error(`Invalid response from iPaymu: ${responseText}`);
    }

    if (iPaymuData.Status !== 200) {
      throw new Error(`iPaymu API error: ${iPaymuData.Message || 'Unknown error'}`);
    }

    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: paymentData.order_id,
        amount: paymentData.amount,
        payment_type: paymentData.payment_type,
        status: 'pending',
        ipaymu_session_id: iPaymuData.Data.SessionId,
        ipaymu_transaction_id: iPaymuData.Data.TransactionId,
        payment_url: iPaymuData.Data.Url,
        va_number: iPaymuData.Data.Via || null
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment save error:', paymentError);
      throw new Error(`Failed to save payment: ${paymentError.message}`);
    }

    // Update order status
    const newOrderStatus = paymentData.payment_type === 'dp' ? 'pending_dp_payment' : 'pending_full_payment';
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: newOrderStatus })
      .eq('id', paymentData.order_id);

    if (orderError) {
      console.error('Order update error:', orderError);
      throw new Error(`Failed to update order: ${orderError.message}`);
    }

    console.log('Payment created successfully:', payment);

    return new Response(JSON.stringify({ 
      paymentUrl: iPaymuData.Data.Url,
      vaNumber: iPaymuData.Data.Via || null,
      sessionId: iPaymuData.Data.SessionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Create iPaymu payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});