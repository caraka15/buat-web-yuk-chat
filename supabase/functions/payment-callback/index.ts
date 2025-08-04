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
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.json()
    console.log('Payment callback received:', body)

    // Verify the callback is from iPaymu
    const va = Deno.env.get('IPAYMU_VA')
    const apiKey = Deno.env.get('IPAYMU_API_KEY')

    if (!va || !apiKey) {
      throw new Error('iPaymu credentials not found')
    }

    // Extract payment info from callback
    const { sid, status, reference_id, trx_id } = body

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
      throw new Error('Payment not found')
    }

    // Update order status based on payment type and status
    if (status === 'berhasil') {
      let newOrderStatus = ''
      
      if (payment.payment_type === 'dp') {
        newOrderStatus = 'pending_approval'
      } else if (payment.payment_type === 'full') {
        newOrderStatus = 'completed'
      }

      if (newOrderStatus) {
        await supabaseClient
          .from('orders')
          .update({ 
            status: newOrderStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.order_id)
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