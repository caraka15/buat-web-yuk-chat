import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  order_id: string
  amount: number
  payment_type: 'dp' | 'full'
  buyer_name: string
  buyer_email: string
  buyer_phone: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth token
    supabaseClient.auth.setSession({ access_token: token, refresh_token: '' })

    const { order_id, amount, payment_type, buyer_name, buyer_email, buyer_phone }: PaymentRequest = await req.json()

    // Get iPaymu credentials
    const va = Deno.env.get('IPAYMU_VA')
    const apiKey = Deno.env.get('IPAYMU_API_KEY')

    if (!va || !apiKey) {
      throw new Error('iPaymu credentials not found')
    }

    // Create payment data for iPaymu
    const paymentData = {
      name: buyer_name,
      phone: buyer_phone,
      email: buyer_email,
      amount: amount,
      notifyUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
      expired: 24, // 24 hours
      expiredType: "hours",
      comments: `Payment for order ${order_id} - ${payment_type}`,
      referenceId: `${order_id}-${payment_type}-${Date.now()}`,
      paymentMethod: "va",
      paymentChannel: "bca"
    }

    // Generate signature for iPaymu
    const body = JSON.stringify(paymentData)
    const requestBody = btoa(body)
    const stringToSign = 'POST:' + va + ':' + requestBody + ':' + apiKey
    const signature = btoa(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stringToSign)))

    // Make request to iPaymu
    const response = await fetch('https://sandbox.ipaymu.com/api/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'va': va,
        'signature': signature,
        'timestamp': Date.now().toString()
      },
      body: requestBody
    })

    const result = await response.json()

    if (result.Status !== 200) {
      throw new Error(result.Message || 'Payment creation failed')
    }

    // Save payment to database
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        order_id,
        payment_type,
        amount,
        ipaymu_session_id: result.Data.SessionID,
        ipaymu_transaction_id: result.Data.TransactionId,
        payment_url: result.Data.Url,
        va_number: result.Data.Via,
        status: 'pending'
      })

    if (paymentError) {
      console.error('Database error:', paymentError)
      throw new Error('Failed to save payment')
    }

    // Update order status
    await supabaseClient
      .from('orders')
      .update({ 
        status: payment_type === 'dp' ? 'pending_approval' : 'pending_final_payment'
      })
      .eq('id', order_id)

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: result.Data.Url,
        va_number: result.Data.Via,
        amount: amount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating payment:', error)
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