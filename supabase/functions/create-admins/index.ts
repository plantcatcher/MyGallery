import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-setup-secret',
};

interface AdminAccount {
  email: string;
  password: string;
  username: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 校验一次性设置密钥，防止函数被公开滥用
    const setupSecret = Deno.env.get('ADMIN_SETUP_SECRET');
    const providedSecret = req.headers.get('x-admin-setup-secret');

    if (!setupSecret || providedSecret !== setupSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const admins: AdminAccount[] = Array.isArray(body?.admins) ? body.admins : [];

    if (admins.length === 0) {
      return new Response(
        JSON.stringify({ error: '请提供管理员账号列表 admins: [{ email, password, username }]' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

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

    const results = [];

    const setAdminRole = async (userId: string | undefined) => {
      if (!userId) return;
      const { error } = await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', userId);
      if (error) {
        results.push({ user_id: userId, status: 'role_update_error', error: error.message });
      }
    };

    for (const admin of admins) {
      const { email, password, username } = admin;

      if (!email || !password || password.length < 8 || !username) {
        results.push({ email, status: 'skipped', reason: 'invalid account data or password too short' });
        continue;
      }

      // 检查用户是否已存在
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUser?.users?.find(u => u.email === email);

      if (existing) {
        // 更新密码，不创建新用户
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existing.id,
          { password, email_confirm: true }
        );

        if (updateError) {
          results.push({ email, status: 'error', error: updateError.message });
        } else {
          results.push({ email, status: 'updated', user_id: existing.id });
          await setAdminRole(existing.id);
        }
        continue;
      }

      // 创建用户
      const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username }
      });

      if (createError) {
        results.push({ email, status: 'error', error: createError.message });
        continue;
      }

      const userId = user.user?.id;
      results.push({ email, status: 'created', user_id: userId });
      await setAdminRole(userId);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
