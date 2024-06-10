console.log('Functions start')
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { LINE_API, TextMessage } from '../_shared/line.ts'
import { getISODateInJST } from '../_shared/date.ts'
import { CLEANING_STATUS_ID } from '../_shared/CleaningStatus.ts'

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
      .select('id, cleaning_reports (id), cleaning_status_id')
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

    // すでに完了済みの場合
    if (cleaningSchedule.cleaning_status_id === CLEANING_STATUS_ID.COMPLETED) {
      const messages: TextMessage[] = [
        {
          type: 'text',
          text: `こちらの清掃報告は完了済みです。\n連絡事項などある場合は、直接連絡してください。`,
        },
      ]
      await pushToLINE(cleaner.line_user_id, messages)

      return new Response(JSON.stringify({ message: '清掃報告 正常終了' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 清掃スケジュールのステータスを更新する
    const { error } = await supabase
      .from('cleaning_schedules')
      .update({
        // ステータスを確認依頼中に設定
        cleaning_status_id: CLEANING_STATUS_ID_PENDING_REVIEW,
        // 更新日時を現在日時に設定
        updated_at: getISODateInJST(),
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
        updated_at: getISODateInJST(),
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
          updated_at: getISODateInJST(),
        })
        .eq('cleaning_schedule_id', cleaningScheduleId)

      if (updateError) {
        console.error(updateError)
        return new Response(String(updateError.message ?? ''), { status: 500 })
      }
    }

    const messages: TextMessage[] = [
      {
        type: 'text',
        text: `清掃報告を受け付けました。`,
      },
    ]

    await pushToLINE(cleaner.line_user_id, messages)

    return new Response(JSON.stringify({ message: '清掃報告 正常終了' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(String(e?.message ?? e), { status: 500 })
  }
})

// NOTE: プッシュメッセージを使用してLINEに返信する。
const pushToLINE = async (to: string, messages: TextMessage[]) => {
  const headers = {
    Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
    'Content-Type': 'application/json',
  }

  const dataString = JSON.stringify({
    to,
    messages,
  })

  try {
    const res = await fetch(LINE_API.PUSH_MESSAGE_URL, {
      method: 'POST',
      headers: headers,
      body: dataString,
    })

    const data = await res.json()
    if (!res.ok) {
      console.error(data)
    }
  } catch (e) {
    console.error(e)
  }
  return
}
