import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { seller_id, product_name, quantity_available, threshold } = await req.json();

    if (!seller_id || !product_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get seller email from auth
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(seller_id);
    if (userError || !userData?.user?.email) {
      console.error('Could not fetch seller email:', userError);
      return new Response(JSON.stringify({ error: 'Seller email not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sellerEmail = userData.user.email;

    // Get seller name from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, farm_name')
      .eq('user_id', seller_id)
      .maybeSingle();

    const sellerName = profile?.full_name || 'Seller';
    const farmName = profile?.farm_name || '';

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px; color: #DC2626; font-size: 18px;">⚠️ Low Stock Alert</h2>
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>${product_name}</strong> has only <strong>${quantity_available}</strong> units remaining, which is below your threshold of <strong>${threshold}</strong>.
          </p>
        </div>
        <p style="color: #374151; font-size: 14px;">
          Hi ${sellerName}${farmName ? ` (${farmName})` : ''},
        </p>
        <p style="color: #374151; font-size: 14px;">
          Please restock this product soon to avoid missed sales. You can update your inventory from your seller dashboard.
        </p>
        <p style="color: #6B7280; font-size: 12px; margin-top: 32px;">
          You're receiving this because you have email notifications enabled. You can change this in your dashboard notification preferences.
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Stock Alerts <onboarding@resend.dev>',
        to: [sellerEmail],
        subject: `⚠️ Low Stock: ${product_name} (${quantity_available} left)`,
        html: emailHtml,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      console.error('Resend API error:', resData);
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(resData)}`);
    }

    console.log('Low stock email sent to', sellerEmail, 'for product', product_name);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending low stock email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
