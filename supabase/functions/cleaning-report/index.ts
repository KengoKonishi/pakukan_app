console.log('Functions start')
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const LINE_PUSH_MESSAGE_URL = 'https://api.line.me/v2/bot/message/push'

// NOTE: 清掃報告の登録・更新を行う関数
// NOTE: GoogleForm送信時にGoogleAppsScriptからデータが送信される

// 確認依頼中を表すステータスID
const CLEANING_STATUS_ID_PENDING_REVIEW = 2

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const json = await req.json()
    console.log(json)
    const { cleaningScheduleId, email, editFormUrl } = json

    if (!cleaningScheduleId || !email || !editFormUrl) {
      return new Response(JSON.stringify({ message: 'Bad request', body: json }), {
        status: 400,
      })
    }

    const { data: cleaner, error: getCleanerError } = await supabase
      .from('cleaners')
      .select()
      .limit(1)
      .single()
      .eq('email', email)

    if (getCleanerError) {
      console.error(getCleanerError)
      return new Response(
        JSON.stringify({
          message: 'メールアドレスに紐づく清掃員が存在しません。',
          body: json,
        }),
        {
          status: 500,
        },
      )
    }

    const { data: cleaningSchedule, error: getCleaningScheduleError } = await supabase
      .from('cleaning_schedules')
      .select('id, cleaning_reports (id)')
      .limit(1)
      .single()
      .eq('cleaner_id', cleaner.id)
      .eq('id', cleaningScheduleId)

    if (getCleaningScheduleError) {
      console.error(getCleaningScheduleError)
      return new Response(
        JSON.stringify({
          message: '存在しない清掃スケジュールです。',
          body: json,
        }),
        {
          status: 500,
        },
      )
    }

    console.log(cleaningSchedule)

    // 清掃スケジュールのステータスを更新する
    const { error } = await supabase
      .from('cleaning_schedules')
      .update({
        // ステータスを確認依頼中に設定
        cleaning_status_id: CLEANING_STATUS_ID_PENDING_REVIEW,
        // 更新日時を現在日時に設定
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleaningScheduleId)

    if (error) {
      console.error(error)
      return new Response(String(error.message ?? ''), { status: 500 })
    }

    // 清掃報告のデータ
    if (cleaningSchedule.cleaning_reports === null) {
      // 新規作成時
      const { error: insertError } = await supabase.from('cleaning_reports').insert({
        cleaning_schedule_id: cleaningScheduleId,
        edit_form_url: editFormUrl,
        updated_at: new Date().toISOString(),
      })
      if (insertError) {
        console.error(insertError)
        return new Response(String(insertError.message ?? ''), { status: 500 })
      }
    } else {
      // 更新時
      const { error: updateError } = await supabase
        .from('cleaning_reports')
        .update({
          edit_form_url: editFormUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('cleaning_schedule_id', cleaningScheduleId)

      if (updateError) {
        console.error(updateError)
        return new Response(String(updateError.message ?? ''), { status: 500 })
      }
    }

    // LINE MESSAGING API 用の共通ヘッダー
    const headers = {
      Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
      'Content-Type': 'application/json',
    }

    const replyMessages = [
      {
        type: 'text',
        text: `清掃報告を受け付けました。`,
      },
    ]

    const dataString = JSON.stringify({
      to: cleaner.line_user_id,
      messages: replyMessages,
    })

    await fetch(LINE_PUSH_MESSAGE_URL, {
      method: 'POST',
      headers: headers,
      body: dataString,
    })

    return new Response(JSON.stringify({ message: '清掃報告 正常終了' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(String(e?.message ?? e), { status: 500 })
  }
})
