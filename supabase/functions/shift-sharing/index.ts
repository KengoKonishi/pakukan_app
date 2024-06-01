console.log('Functions start')

import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import {
  LINE_API,
  CarouselContainerContent,
  FlexMessage,
  CAROUSEL_CONTENT_MAX_SIZE,
} from '../_shared/line.ts'

// NOTE: 募集中のシフトをLINEで通知する
// NOTE: 管理者がカレンダー画面でボタンを押した際に呼び出される

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

    const now = new Date()
    const japanTimeOffset = 9 * 60 * 60 * 1000 // 日本のタイムゾーンオフセット（9時間をミリ秒に変換）
    const currentDateTime = new Date(now.getTime() + japanTimeOffset) // 日本時間で現在時刻
    const currentDateTimeStr = currentDateTime.toISOString()

    // NOTE: 清掃員IDが紐づけられていない清掃スケジュールを募集中のシフトとしている。
    const { data: cleaningScheduleData } = await supabase
      .from('cleaning_schedules')
      .select('id, start_datetime, end_datetime, guest_houses (name)')
      .is('cleaner_id', null)
      .gte('start_datetime', currentDateTimeStr) // 開始日が現在以降
      .eq('cleaning_status_id', 1) // 一応statusが未完了という条件も指定
      .order('start_datetime')

    // 募集中のシフトが存在しない場合は何もしない
    if (cleaningScheduleData.length === 0) {
      return new Response(JSON.stringify({ count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(cleaningScheduleData)

    // 募集中のシフトが存在する場合

    const contents: CarouselContainerContent[] = []
    cleaningScheduleData.forEach((schedule) => {
      const startDatetime = new Date(schedule.start_datetime).toLocaleString()
      const endDatetime = new Date(schedule.end_datetime).toLocaleString()
      const scheduleInfo = `宿泊施設: ${schedule.guest_houses.name}\n\n開始日: ${startDatetime}\n\n終了日: ${endDatetime}`

      contents.push({
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: scheduleInfo,
              wrap: true,
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'button',
              style: 'primary',
              action: {
                type: 'postback',
                label: 'シフト申請',
                data: `action=createCreanSchedule&id=${schedule.id}`,
                // displayText: `以下のシフトを申請しました。\n\n${scheduleInfo}`,
              },
            },
          ],
        },
      })
    })

    const messages: FlexMessage[] = [
      {
        type: 'flex',
        altText: '募集中のシフトが連携されました。',
        contents: {
          type: 'carousel',
          contents: [
            {
              type: 'bubble',
              body: {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'お疲れ様です。現在募集中のシフトです。\n申請よろしくお願いします。',
                    wrap: true,
                  },
                ],
              },
            },
          ],
        },
      },
    ]

    // NOTE: LINEのAPIの仕様でカルーセルの最大サイズが決められている
    const slicedContents = contents.slice(0, CAROUSEL_CONTENT_MAX_SIZE * 4)
    const tmpContent: CarouselContainerContent[][] = []
    for (let i = 0; i < slicedContents.length; i += CAROUSEL_CONTENT_MAX_SIZE) {
      const chunk = slicedContents.slice(i, i + CAROUSEL_CONTENT_MAX_SIZE)
      tmpContent.push(chunk)
    }
    tmpContent.forEach((chunkContent) => {
      messages.push({
        type: 'flex',
        altText: '募集中のシフトが連携されました。',
        contents: {
          type: 'carousel',
          contents: chunkContent,
        },
      })
    })

    const headers = {
      Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
      'Content-Type': 'application/json',
    }
    const dataString = JSON.stringify({
      messages: messages,
    })

    try {
      // NOTE: 友達になっているユーザーに対して一斉送信する
      const res = await fetch(LINE_API.BROADCAST_URL, {
        method: 'POST',
        headers: headers,
        body: dataString,
      })

      const data = await res.json()
      if (!res.ok) {
        console.error(data)
        return new Response(JSON.stringify({ error: 'please confirm server log' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    } catch (e) {
      console.error(e)
    }

    return new Response(JSON.stringify({ count: cleaningScheduleData.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: e?.message ?? e }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
