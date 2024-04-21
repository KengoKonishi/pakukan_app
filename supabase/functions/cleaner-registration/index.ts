console.log('Functions start')
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const LINE_PUSH_MESSAGE_URL = 'https://api.line.me/v2/bot/message/push'

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

    const { data: cleanersData } = await supabase
      .from('cleaners')
      .select()
      .eq('line_user_id', lineUserId)

    // LINE MESSAGING API 用の共通ヘッダー
    const headers = {
      Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
      'Content-Type': 'application/json',
    }

    // すでにLINEUSERIDが登録されている場合
    if (cleanersData && cleanersData.length !== 0) {
      const replyMessages = [
        {
          type: 'text',
          text: 'プロフィール登録済みです。\n登録情報に変更がある場合はお知らせください。',
        },
      ]

      const dataString = JSON.stringify({
        to: lineUserId,
        messages: replyMessages,
      })

      try {
        await fetch(LINE_PUSH_MESSAGE_URL, {
          method: 'POST',
          headers: headers,
          body: dataString,
        })
        return new Response(
          JSON.stringify({ message: 'プロフィール登録済みの清掃員からのリクエスト' }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (e) {
        console.error(e)
        return new Response(String(e?.message ?? e), { status: 500 })
      }
    }

    // 清掃員を登録
    const { error } = await supabase
      .from('cleaners')
      .insert({ name, email, tel, line_user_id: lineUserId })

    if (error) {
      // TODO: 失敗のメッセージをLINEに送信する (https://api.line.me/v2/bot/message/push)
      // LINEのIDが妥当じゃない場合、送信できないので他にも通知手段があった方がいいかも
      throw error
    }

    // 成功のメッセージをLINEに送信する
    const replyMessages = [
      {
        type: 'text',
        text: 'プロフィール登録しました。\n登録情報に変更がある場合はお知らせください。',
      },
    ]

    const dataString = JSON.stringify({
      to: lineUserId,
      messages: replyMessages,
    })

    await fetch(LINE_PUSH_MESSAGE_URL, {
      method: 'POST',
      headers: headers,
      body: dataString,
    })

    return new Response(JSON.stringify({ message: 'プロフィール登録正常終了' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(String(e?.message ?? e), { status: 500 })
  }
})
