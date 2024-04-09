import { createClient } from 'https://esm.sh/@supabase/supabase-js'

console.log('Hello from Functions!')

// NOTE: 清掃員の登録を行う関数
// NOTE: GoogleForm送信時にGoogleAppsScriptからデータが送信される
Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const { name, email, tel, lineUserId } = await req.json()

    // 清掃員を登録
    const { error } = await supabase
      .from('cleaners')
      .insert({ name, email, tel, line_user_id: lineUserId })

    if (error) {
      // TODO: 失敗のメッセージをLINEに送信する
      throw error
    }

    const data = {}

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(String(e?.message ?? e), { status: 500 })
  }
})
