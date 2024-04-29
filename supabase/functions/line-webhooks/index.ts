console.log('Functions start')
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import * as crypto from 'https://deno.land/std@0.166.0/node/crypto.ts'

const LINE_REPLY_MESSAGE_URL = 'https://api.line.me/v2/bot/message/reply'
const CLEANER_REGISTRATION_FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf0a2362CrlBG_V_ckjXFNE472LzvPoU8pcM77EeQpzW-5LXA/viewform?usp=pp_url&entry.503257359='

const GOOGLE_CALENDAR_APP_URL =
  'https://script.google.com/macros/s/AKfycbwU95NcRyWH2WiWgAsphp169YsF8ceqvaPKgOgByhJfITa7aZUPLAMTCOCrOBYufQh7/exec'

// NOTE: LINEのWebhook URLとして登録している関数
Deno.serve(async (request) => {
  // NOTE: 署名の検証にbodyのテキストが必要
  const body = await request.text()

  // 署名を検証する
  const channelSecret = Deno.env.get('LINE_CHANNEL_SECRET') ?? ''
  const signature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')
  if (signature !== request.headers.get('X-LINE-SIGNATURE')) {
    console.log('署名の検証エラー')
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // NOTE: リクエストボディ
  // {
  //   "destination": "xxxxxxxxxx",
  //   "events": []
  // }
  const events = JSON.parse(body).events
  console.log(events)

  await Promise.all(events.map(processEvent))

  console.log('処理終了')
  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// NOTE: 各eventに対する処理
const processEvent = async (event) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  const lineUserId = event.source.userId

  const headers = {
    Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
    'Content-Type': 'application/json',
  }

  /*
    清掃員プロフィール登録機能
    公式アカウントが追加されたとき もしくは プロフィール登録と入力されたとき
    (NOTE: 正確にはブロック解除されたときもfollowイベントが発火する)
  */
  if (
    event.type === 'follow' ||
    (event.type === 'message' &&
      event.message.type === 'text' &&
      event.message.text === 'プロフィール登録')
  ) {
    const { data: cleanersData } = await supabase
      .from('cleaners')
      .select()
      .eq('line_user_id', lineUserId)

    // すでにLINEUSERIDが登録されている場合
    if (cleanersData && cleanersData.length !== 0) {
      const replyMessages = [
        {
          type: 'text',
          text: 'プロフィール登録済みです。\n登録情報に変更がある場合はお知らせください。',
        },
      ]

      const dataString = JSON.stringify({
        replyToken: event.replyToken,
        messages: replyMessages,
      })

      try {
        await fetch(LINE_REPLY_MESSAGE_URL, {
          method: 'POST',
          headers: headers,
          body: dataString,
        })
      } catch (e) {
        console.error(e)
      }

      return
    }

    // LINEUSERIDが未登録の場合
    const replyMessages = [
      {
        type: 'text',
        text: '以下のフォームから登録を行なってください',
      },
      {
        type: 'text',
        text: `${CLEANER_REGISTRATION_FORM_BASE_URL}${lineUserId}`,
      },
    ]

    const dataString = JSON.stringify({
      replyToken: event.replyToken,
      messages: replyMessages,
    })

    try {
      await fetch(LINE_REPLY_MESSAGE_URL, {
        method: 'POST',
        headers: headers,
        body: dataString,
      })
    } catch (e) {
      console.error(e)
    }
  }

  /*
    募集中シフト取得機能
  */
  if (
    event.type === 'postback' &&
    event.postback.data === 'action=getAvairableCreaningSchedules'
  ) {
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

    // 募集中のシフトが存在しない場合
    if (cleaningScheduleData.length === 0) {
      const replyMessages = [
        {
          type: 'text',
          text: '現在、募集中のシフトはありません。',
        },
      ]

      const dataString = JSON.stringify({
        replyToken: event.replyToken,
        messages: replyMessages,
      })

      try {
        await fetch(LINE_REPLY_MESSAGE_URL, {
          method: 'POST',
          headers: headers,
          body: dataString,
        })
      } catch (e) {
        console.error(e)
      }

      return
    }

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
        altText: 'This is a Flex Message',
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
                    text: '現在募集中のシフトです。',
                  },
                ],
              },
            },
          ],
        },
      },
      // シフト一覧部分
      {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: {
          type: 'carousel',
          contents: contents,
        },
      },
    ]

    try {
      await fetch(LINE_REPLY_MESSAGE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ replyToken: event.replyToken, messages }),
      })
    } catch (e) {
      console.error(e)
    }

    return
  }

  /*
    シフト登録機能
    NOTE: action=createCreanSchedule&id=${id}
  */
  if (
    event.type === 'postback' &&
    event.postback.data.startsWith('action=createCreanSchedule')
  ) {
    const postbackData = new URLSearchParams(event.postback.data)
    const cleaningScheduleId = postbackData.get('id')

    const { data: cleaner, error: getCleanerError } = await supabase
      .from('cleaners')
      .select()
      .limit(1)
      .single()
      .eq('line_user_id', lineUserId)

    if (getCleanerError) {
      console.log(getCleanerError)
      // TODO: エラー処理
      return
    }

    const {
      count: updateCount,
      data: updateCleaningScheduleData,
      error,
    } = await supabase
      .from('cleaning_schedules')
      .update({ cleaner_id: cleaner.id }, { count: 'exact' })
      .eq('id', cleaningScheduleId)
      // NOTE: シフトの重複登録を避けるために、更新条件として清掃員IDがNULLであることも指定しておく
      .is('cleaner_id', null)
      .select(
        'id, start_datetime, end_datetime, guest_houses (name), cleaners (name, email)',
      )

    if (error) {
      console.error(error)
      // TODO: エラー処理
      return
    }

    // シフト登録できなかった場合
    if (updateCount === 0) {
      const replyMessages = [
        {
          type: 'text',
          text: '申し訳ありません。このシフトは埋まってしまいました。',
        },
      ]

      const dataString = JSON.stringify({
        replyToken: event.replyToken,
        messages: replyMessages,
      })

      try {
        await fetch(LINE_REPLY_MESSAGE_URL, {
          method: 'POST',
          headers: headers,
          body: dataString,
        })
      } catch (e) {
        console.error(e)
      }
      return
    }

    // シフト登録できた場合
    const updateCleaningSchedule = updateCleaningScheduleData[0]
    console.log(updateCleaningSchedule)
    const guestHouse = updateCleaningSchedule.guest_houses.name

    // Googleカレンダーに同期
    try {
      const body = {
        action: 'createCleaningEvent',
        summary: `${updateCleaningSchedule.cleaners.name}`,
        startDateISOString: new Date(
          updateCleaningSchedule.start_datetime + '+09:00',
        ).toISOString(), // Googleカレンダー登録用
        endDateISOString: new Date(
          updateCleaningSchedule.end_datetime + '+09:00',
        ).toISOString(), // Googleカレンダー登録用
        guestHouse,
        attendeesEmail: updateCleaningSchedule.cleaners.email,
      }
      console.log(body)
      await fetch(GOOGLE_CALENDAR_APP_URL, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (e) {
      console.error('Googleカレンダーへの同期エラー')
      console.error(e)
      // NOTE: 同期に失敗したがシフト登録はできているため処理は継続する
    }

    const startDatetime = new Date(updateCleaningSchedule.start_datetime).toLocaleString() // LINE表示用
    const endDatetime = new Date(updateCleaningSchedule.end_datetime).toLocaleString() // LINE表示用
    const scheduleInfo = `宿泊施設: ${guestHouse}\n\n開始日: ${startDatetime}\n\n終了日: ${endDatetime}`

    const replyMessages = [
      {
        type: 'text',
        text: `以下のシフトを登録しました。\n\n${scheduleInfo}`,
      },
    ]

    const dataString = JSON.stringify({
      replyToken: event.replyToken,
      messages: replyMessages,
    })

    try {
      await fetch(LINE_REPLY_MESSAGE_URL, {
        method: 'POST',
        headers: headers,
        body: dataString,
      })
    } catch (e) {
      console.error(e)
    }
    return
  }

  /*
    シフト確認機能
  */
  if (
    event.type === 'postback' &&
    event.postback.data === 'action=getOwnCreaningSchedules'
  ) {
    const { data: cleaner, error: getCleanerError } = await supabase
      .from('cleaners')
      .select()
      .limit(1)
      .single()
      .eq('line_user_id', lineUserId)

    if (getCleanerError) {
      console.error(getCleanerError)
      // TODO: エラー処理
      return
    }

    const now = new Date()
    const japanTimeOffset = 9 * 60 * 60 * 1000 // 日本のタイムゾーンオフセット（9時間をミリ秒に変換）
    const oneDayAgoTime = new Date(now.getTime() + japanTimeOffset - 24 * 60 * 60 * 1000) // 日本時間で1日前の時刻を計算
    const oneDayAgoTimeStr = oneDayAgoTime.toISOString()
    const { data: cleaningScheduleData, error: getCleaningScheduleError } = await supabase
      .from('cleaning_schedules')
      .select('id, start_datetime, end_datetime, guest_houses (name)')
      .eq('cleaner_id', cleaner.id)
      .gte('start_datetime', oneDayAgoTimeStr)
      .order('start_datetime')

    if (getCleaningScheduleError) {
      console.error(getCleaningScheduleError)
      // TODO: エラー処理
      return
    }

    // シフトがない場合
    if (cleaningScheduleData.length === 0) {
      const replyMessages = [
        {
          type: 'text',
          text: '現在、シフトはありません。',
        },
      ]

      const dataString = JSON.stringify({
        replyToken: event.replyToken,
        messages: replyMessages,
      })

      try {
        await fetch(LINE_REPLY_MESSAGE_URL, {
          method: 'POST',
          headers: headers,
          body: dataString,
        })
      } catch (e) {
        console.error(e)
      }
      return
    }

    // シフトがある場合
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
      })
    })

    const messages: FlexMessage[] = [
      {
        type: 'flex',
        altText: 'This is a Flex Message',
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
                    text: '現在入っているシフトです。',
                  },
                ],
              },
            },
          ],
        },
      },
      // シフト一覧部分
      {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: {
          type: 'carousel',
          contents: contents,
        },
      },
    ]

    try {
      await fetch(LINE_REPLY_MESSAGE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ replyToken: event.replyToken, messages }),
      })
    } catch (e) {
      console.error(e)
    }

    return
  }

  /*
    清掃報告機能
    TODO:
  */
}

type CarouselContainerContent = {
  type: 'bubble'
  body: {
    type: string
    layout: string
    contents: [
      {
        type: 'text'
        text: string
        wrap?: boolean
      },
    ]
  }
  footer?: {
    type: string
    layout: string
    contents: [
      {
        type: 'button'
        style: string
        action: {
          type: 'postback'
          label: string
          data: string
          displayText?: string
        }
      },
    ]
  }
}

type FlexMessage = {
  type: string
  altText: string
  contents: {
    type: 'carousel'
    contents: CarouselContainerContent[]
  }
}
