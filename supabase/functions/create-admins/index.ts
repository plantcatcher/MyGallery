import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 创建两个管理员账户
    const admins = [
      { email: 'zayn@miaoda.com', password: 'huang', username: 'zayn' },
      { email: 'zayn2@miaoda.com', password: 'huang2', username: 'zayn2' }
    ];

    const results = [];

    for (const admin of admins) {
      // 检查用户是否已存在
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(u => u.email === admin.email);

      if (userExists) {
        results.push({ email: admin.email, status: 'already_exists' });
        continue;
      }

      // 创建用户
      const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: { username: admin.username }
      });

      if (createError) {
        results.push({ email: admin.email, status: 'error', error: createError.message });
        continue;
      }

      results.push({ email: admin.email, status: 'created', user_id: user.user?.id });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
