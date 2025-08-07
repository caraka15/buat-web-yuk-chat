import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Payment callback received, method:', req.method);
    
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Handle both POST and GET requests from iPaymu
    let callbackData;
    
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type');
      if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        callbackData = {};
        for (const [key, value] of formData.entries()) {
          callbackData[key] = value;
        }
      } else {
        callbackData = await req.json();
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      callbackData = {};
      for (const [key, value] of url.searchParams.entries()) {
        callbackData[key] = value;
      }
    }

    console.log('Callback data received:', callbackData);

    // Extract payment info from callback
    const { sid, status, reference_id, trx_id } = callbackData;

    if (!sid) {
      console.error('No session ID found in callback');
      throw new Error('Session ID not found');
    }

    // Update payment status
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .update({ 
        status: status === 'berhasil' ? 'completed' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('ipaymu_session_id', sid)
      .select('order_id, payment_type')
      .single()

    if (paymentError) {
      console.error('Payment update error:', paymentError)
      throw new Error('Failed to update payment')
    }

    if (!payment) {
      console.error('Payment not found for session:', sid)
      throw new Error('Payment not found')
    }

    console.log('Payment updated:', payment);

    // Update order status based on payment type and status
    if (status === 'berhasil') {
      let newOrderStatus = ''
      
      if (payment.payment_type === 'dp') {
        newOrderStatus = 'pending_approval'
      } else if (payment.payment_type === 'full') {
        newOrderStatus = 'completed'
      }

      if (newOrderStatus) {
        const { error: orderError } = await supabaseClient
          .from('orders')
          .update({ 
            status: newOrderStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.order_id)

        if (orderError) {
          console.error('Order update error:', orderError);
        } else {
          console.log('Order status updated to:', newOrderStatus);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing payment callback:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})