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

    // Create form data for iPaymu
    const formData = new FormData()
    formData.append('product[]', `Payment for order ${order_id}`)
    formData.append('qty[]', '1')
    formData.append('price[]', amount.toString())
    formData.append('description[]', `${payment_type === 'dp' ? 'DP Payment' : 'Final Payment'} for order ${order_id}`)
    formData.append('returnUrl', `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`)
    formData.append('notifyUrl', `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`)
    formData.append('cancelUrl', `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`)
    formData.append('referenceId', `${order_id}-${payment_type}-${Date.now()}`)
    formData.append('weight[]', '1')
    formData.append('dimension[]', '1:1:1')
    formData.append('buyerName', buyer_name)
    formData.append('buyerEmail', buyer_email)
    formData.append('buyerPhone', buyer_phone)
    formData.append('pickupArea', '80117')
    formData.append('pickupAddress', 'Jakarta')

    // Generate signature for iPaymu
    const timestamp = Date.now().toString()
    const stringToSign = 'POST:' + va + ':' + formData.toString() + ':' + apiKey
    const signature = btoa(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stringToSign)))

    // Make request to iPaymu
    const response = await fetch('https://sandbox.ipaymu.com/api/v2/payment', {
      method: 'POST',
      headers: {
        'va': va,
        'signature': signature,
        'timestamp': timestamp
      },
      body: formData
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
        ipaymu_transaction_id: result.Data.TransactionId || result.Data.SessionID,
        payment_url: result.Data.Url,
        va_number: result.Data.Via || '',
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
        va_number: result.Data.Via || '',
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