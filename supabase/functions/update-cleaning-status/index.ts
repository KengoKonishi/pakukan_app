console.log('Functions start')
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { LINE_API } from '../_shared/line.ts'

// NOTE: 清掃状況のステータスの変更を行う
// NOTE: 管理者が清掃状況編集画面から更新を行った際に呼び出される

// 差し戻しを表すステータスID
const CLEANING_STATUS_ID_RETURNED = 3
// 完了を表すステータスID
const CLEANING_STATUS_ID_COMPLETED = 4

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const json = await req.json()
    console.log(json)
    const {
      cleaningScheduleId,
      updateStatus,
      cleaningReportId,
      cleaningReportResponseUrl,
    } = json

    if (!cleaningScheduleId || !updateStatus || !cleaningReportId) {
      return new Response(JSON.stringify({ message: 'Bad request', body: json }), {
        status: 400,
      })
    }

    const { data: cleaningSchedule, error: getCleaningScheduleError } = await supabase
      .from('cleaning_schedules')
      .select(
        'id, start_datetime, cleaning_status_id, cleaning_reports (id, edit_form_url), cleaners (line_user_id), guest_houses (name)',
      )
      .limit(1)
      .single()
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
        // ステータスを設定
        cleaning_status_id: updateStatus,
        // 更新日時を現在日時に設定
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleaningScheduleId)

    if (error) {
      console.error(error)
      return new Response(String(error.message ?? ''), { status: 500 })
    }

    // 清掃報告のデータ
    const { error: updateError } = await supabase
      .from('cleaning_reports')
      .update({
        response_url: cleaningReportResponseUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('cleaning_schedule_id', cleaningScheduleId)

    if (updateError) {
      console.error(updateError)
      return new Response(String(updateError.message ?? ''), { status: 500 })
    }

    // 差し戻しの場合はLINE通知する
    if (updateStatus === CLEANING_STATUS_ID_RETURNED) {
      // LINE MESSAGING API 用の共通ヘッダー
      const headers = {
        Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
        'Content-Type': 'application/json',
      }

      const replyMessages = [
        {
          type: 'text',
          text: `清掃報告に差し戻しがあります。以下のリンクから確認してください。\n${cleaningSchedule.cleaning_reports.edit_form_url}`,
        },
      ]

      const dataString = JSON.stringify({
        to: cleaningSchedule.cleaners.line_user_id,
        messages: replyMessages,
      })

      await fetch(LINE_API.PUSH_MESSAGE_URL, {
        method: 'POST',
        headers: headers,
        body: dataString,
      })
    }

    // 他のステータスから完了に更新された場合もLINE通知する
    if (
      cleaningSchedule.cleaning_status_id !== CLEANING_STATUS_ID_COMPLETED &&
      updateStatus === CLEANING_STATUS_ID_COMPLETED
    ) {
      // LINE MESSAGING API 用の共通ヘッダー
      const headers = {
        Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
        'Content-Type': 'application/json',
      }

      const replyMessages = [
        {
          type: 'text',
          text: `清掃報告のステータスが完了になりました。\n宿泊施設: ${cleaningSchedule.guest_houses.name}\n開始日: ${new Date(cleaningSchedule.start_datetime).toLocaleString()}`,
        },
      ]

      const dataString = JSON.stringify({
        to: cleaningSchedule.cleaners.line_user_id,
        messages: replyMessages,
      })

      await fetch(LINE_API.PUSH_MESSAGE_URL, {
        method: 'POST',
        headers: headers,
        body: dataString,
      })
    }

    return new Response(
      JSON.stringify({ message: '清掃状況のステータスの変更 正常終了' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: e?.message ?? e }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
