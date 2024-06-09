console.log('Functions start')
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import * as crypto from 'https://deno.land/std@0.166.0/node/crypto.ts'
import {
  LINE_API,
  CarouselContainerContent,
  FlexMessage,
  TextMessage,
  CAROUSEL_CONTENT_MAX_SIZE,
} from '../_shared/line.ts'
import { CLEANING_STATUS_ID } from '../_shared/CleaningStatus.ts'

const CLEANER_REGISTRATION_FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf0a2362CrlBG_V_ckjXFNE472LzvPoU8pcM77EeQpzW-5LXA/viewform?usp=pp_url&entry.503257359='
const CLEANING_REPORT_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfcfRJBCaAJ6MleHyLjaJRD8y_Z8bUkG6D6U-StENGA263j8g/viewform?usp=pp_url&entry.1699498928=cleaningId&entry.1337618168=email&entry.847282419=cleanerName&entry.1904612076=cleaningScheduleStartDate&entry.2095971157=guestHouseName'

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
      const replyMessages: TextMessage[] = [
        {
          type: 'text',
          text: 'プロフィール登録済みです。\n登録情報に変更がある場合はお知らせください。',
        },
      ]
      await replyToLINE(event.replyToken, replyMessages)
      return
    }

    // LINEUSERIDが未登録の場合
    const replyMessages: TextMessage[] = [
      {
        type: 'text',
        text: '以下のフォームから登録を行なってください',
      },
      {
        type: 'text',
        text: `${CLEANER_REGISTRATION_FORM_BASE_URL}${lineUserId}`,
      },
    ]
    await replyToLINE(event.replyToken, replyMessages)
    return
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
      const replyMessages: TextMessage[] = [
        {
          type: 'text',
          text: '現在、募集中のシフトはありません。',
        },
      ]
      await replyToLINE(event.replyToken, replyMessages)
      return
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

    const replyMessages: FlexMessage[] = [
      {
        type: 'flex',
        altText: '現在募集中のシフトです。',
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
    ]

    // NOTE: LINEのAPIの仕様でカルーセルの最大サイズが決められているのでおさまるように整形する
    const groupingContents = toGroupingCarouselContainerContents(contents)
    groupingContents.forEach((contents) => {
      replyMessages.push({
        type: 'flex',
        altText: '募集中のシフトが連携されました。',
        contents: {
          type: 'carousel',
          contents: contents,
        },
      })
    })

    await replyToLINE(event.replyToken, replyMessages)
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
    const cleaner = await getCleaner(supabase, lineUserId)
    if (!cleaner) {
      await sendMessageNotExistsCleaner(event.replyToken)
      return
    }

    const postbackData = new URLSearchParams(event.postback.data)
    const cleaningScheduleId = postbackData.get('id')

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
        'id, start_datetime, end_datetime, guest_houses (name), cleaners (name, email), stay_schedule_id',
      )

    if (error) {
      console.error(error)
      // TODO: エラー処理
      return
    }

    // シフト登録できなかった場合
    if (updateCount === 0) {
      const replyMessages: TextMessage[] = [
        {
          type: 'text',
          text: '申し訳ありません。このシフトは埋まってしまいました。',
        },
      ]
      await replyToLINE(event.replyToken, replyMessages)
      return
    }

    // シフト登録できた場合
    const updateCleaningSchedule = updateCleaningScheduleData[0]
    console.log(updateCleaningSchedule)
    const guestHouse = updateCleaningSchedule.guest_houses.name

    const { data: stayScheduleData, error: stayScheduleError } = await supabase
      .from('stay_schedules')
      .select('guest_name, numbers_of_guests, amenities_info, bag_recieve_info, others')
      .eq('id', updateCleaningSchedule.stay_schedule_id)

    if (stayScheduleError) {
      // TODO: エラー処理
      return
    }

    // Googleカレンダーに同期
    try {
      const body = {
        action: 'createCleaningEvent',
        summary: `${updateCleaningSchedule.cleaners.name}さん / ${guestHouse}`,
        startDateISOString: new Date(
          updateCleaningSchedule.start_datetime + '+09:00',
        ).toISOString(), // Googleカレンダー登録用
        endDateISOString: new Date(
          updateCleaningSchedule.end_datetime + '+09:00',
        ).toISOString(), // Googleカレンダー登録用
        guestHouse,
        attendeesEmail: updateCleaningSchedule.cleaners.email,
        // 宿泊スケジュールの詳細情報を追加
        description: `
          宿泊者名: ${stayScheduleData[0].guest_name}
          宿泊人数: ${stayScheduleData[0].numbers_of_guests}
          アメニティ情報: ${stayScheduleData[0].amenities_info}
          荷物情報: ${stayScheduleData[0].bag_recieve_info}
          その他: ${stayScheduleData[0].others}
        `,
      }
      console.log(body)
      const res = await fetch(Deno.env.get('GOOGLE_CALENDAR_APP_URL') ?? '', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      console.log(data)
    } catch (e) {
      console.error('Googleカレンダーへの同期エラー')
      console.error(e)
      // NOTE: 同期に失敗したがシフト登録はできているため処理は継続する
    }

    const startDatetime = new Date(updateCleaningSchedule.start_datetime).toLocaleString() // LINE表示用
    const endDatetime = new Date(updateCleaningSchedule.end_datetime).toLocaleString() // LINE表示用
    const scheduleInfo = `宿泊施設: ${guestHouse}\n\n開始日: ${startDatetime}\n\n終了日: ${endDatetime}`

    const replyMessages: TextMessage[] = [
      {
        type: 'text',
        text: `以下のシフトを登録しました。\n\n${scheduleInfo}`,
      },
    ]
    await replyToLINE(event.replyToken, replyMessages)
    return
  }

  /*
    シフト確認機能
  */
  if (
    event.type === 'postback' &&
    event.postback.data === 'action=getOwnCreaningSchedules'
  ) {
    const cleaner = await getCleaner(supabase, lineUserId)
    if (!cleaner) {
      await sendMessageNotExistsCleaner(event.replyToken)
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
      const replyMessages: TextMessage[] = [
        {
          type: 'text',
          text: '現在、シフトはありません。',
        },
      ]
      await replyToLINE(event.replyToken, replyMessages)
      return
    }

    console.log(cleaningScheduleData)

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

    const replyMessages: FlexMessage[] = [
      {
        type: 'flex',
        altText: '現在入っているシフトが送信されました。',
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
    ]

    // NOTE: LINEのAPIの仕様でカルーセルの最大サイズが決められているのでおさまるように整形する
    const groupingContents = toGroupingCarouselContainerContents(contents)
    groupingContents.forEach((content) => {
      replyMessages.push(
        // シフト一覧部分
        {
          type: 'flex',
          altText: '現在入っているシフトが送信されました。',
          contents: {
            type: 'carousel',
            contents: content,
          },
        },
      )
    })

    await replyToLINE(event.replyToken, replyMessages)
    return
  }

  /*
    清掃報告対象のシフト 一覧取得機能
  */
  if (event.type === 'postback' && event.postback.data === 'action=GetCreaningReports') {
    const cleaner = await getCleaner(supabase, lineUserId)
    if (!cleaner) {
      await sendMessageNotExistsCleaner(event.replyToken)
      return
    }

    const now = new Date()
    const japanTimeOffset = 9 * 60 * 60 * 1000 // 日本のタイムゾーンオフセット（9時間をミリ秒に変換）
    const currentDateTime = new Date(now.getTime() + japanTimeOffset) // 日本時間で現在時刻
    const currentDateTimeStr = currentDateTime.toISOString()

    // NOTE: 清掃員IDに紐づく清掃スケジュールのうち、開始済みでステータスが完了以外のものを清掃報告対象としている
    const { data: cleaningScheduleData, error: getCleaningScheduleError } = await supabase
      .from('cleaning_schedules')
      .select('id, start_datetime, end_datetime, guest_houses (name)')
      .eq('cleaner_id', cleaner.id)
      .lte('start_datetime', currentDateTimeStr) // 開始日が現在以前
      .in('cleaning_status_id', [1, 2, 3]) // statusが未完了、確認待ち、差し戻し
      .order('start_datetime')

    if (getCleaningScheduleError) {
      console.error(getCleaningScheduleError)
      // TODO: エラー処理
      return
    }

    // 清掃報告対象がない場合
    if (cleaningScheduleData.length === 0) {
      const replyMessages: TextMessage[] = [
        {
          type: 'text',
          text: '現在、清掃報告の対象はありません。',
        },
      ]
      await replyToLINE(event.replyToken, replyMessages)
      return
    }

    console.log(cleaningScheduleData)

    // 清掃報告対象のシフトが存在する場合
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
                label: '清掃報告する',
                data: `action=getCreaningReportUrl&id=${schedule.id}`,
              },
            },
          ],
        },
      })
    })

    const replyMessages: FlexMessage[] = [
      {
        type: 'flex',
        altText: '清掃報告の対象が送信されました。',
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
                    text: '清掃報告するシフトを選んでください。',
                    wrap: true,
                  },
                ],
              },
            },
          ],
        },
      },
    ]
    // NOTE: LINEのAPIの仕様でカルーセルの最大サイズが決められているのでおさまるように整形する
    const groupingContents = toGroupingCarouselContainerContents(contents)
    groupingContents.forEach((contents) => {
      replyMessages.push({
        type: 'flex',
        altText: '清掃報告の対象が送信されました。',
        contents: {
          type: 'carousel',
          contents: contents,
        },
      })
    })

    await replyToLINE(event.replyToken, replyMessages)
    return
  }

  /*
    清掃報告URL取得機能
    NOTE: action=getCreaningReportUrl&id=${id}
  */
  if (
    event.type === 'postback' &&
    event.postback.data.startsWith('action=getCreaningReportUrl')
  ) {
    const cleaner = await getCleaner(supabase, lineUserId)
    if (!cleaner) {
      await sendMessageNotExistsCleaner(event.replyToken)
      return
    }

    const postbackData = new URLSearchParams(event.postback.data)
    const cleaningScheduleId = postbackData.get('id') as string

    const { data: cleaningSchedule, error: getCleaningScheduleError } = await supabase
      .from('cleaning_schedules')
      .select('id, start_datetime, end_datetime, guest_houses (name), cleaning_status_id')
      .limit(1)
      .single()
      .eq('id', cleaningScheduleId)
      .eq('cleaner_id', cleaner.id)

    if (getCleaningScheduleError) {
      console.error(getCleaningScheduleError)
      // TODO: エラー処理
      return
    }

    // すでに完了済みだったらURLは送信しない
    if (cleaningSchedule.cleaning_status_id === CLEANING_STATUS_ID.COMPLETED) {
      const replyMessages: TextMessage[] = [
        {
          type: 'text',
          text: `こちらの清掃報告は完了済みです。`,
        },
      ]
      await replyToLINE(event.replyToken, replyMessages)
      return
    }

    const { data: cleaningReportData, error: getCleaningReportError } = await supabase
      .from('cleaning_reports')
      .select(
        'id, edit_form_url, cleaning_schedules (id, start_datetime, end_datetime, guest_houses (name))',
      )
      .eq('cleaning_schedule_id', cleaningScheduleId)
      .order('id')

    if (getCleaningReportError) {
      console.error(getCleaningReportError)
      // TODO: エラー処理
      return
    }

    console.log('cleaningReportData: ', cleaningReportData)
    let cleaningFormUrl = ''
    if (cleaningReportData.length === 0 || !cleaningReportData[0].edit_form_url) {
      // 報告データがまだない場合、もしくはフォームのURLが登録されていない場合
      console.log('清掃員回答用のURLを作成して返却')
      cleaningFormUrl = CLEANING_REPORT_BASE_URL.replace('cleaningId', cleaningScheduleId)
        .replace('email', cleaner.email)
        .replace('cleanerName', cleaner.name)
        .replace('cleaningScheduleStartDate', cleaningSchedule.start_datetime)
        .replace('guestHouseName', cleaningSchedule.guest_houses.name)
    } else {
      console.log('登録済みのURLを返却')
      // 清掃員回答用のURLがデータがある場合
      const cleaningReport = cleaningReportData[0]
      cleaningFormUrl = cleaningReport.edit_form_url
    }

    const replyMessages: TextMessage[] = [
      {
        type: 'text',
        text: `以下のURLから報告してください。\n${cleaningFormUrl}`,
      },
    ]
    await replyToLINE(event.replyToken, replyMessages)
    return
  }
}

const getCleaner = async (supabase, lineUserId: string) => {
  const { data: cleaner, error: getCleanerError } = await supabase
    .from('cleaners')
    .select()
    .limit(1)
    .single()
    .eq('line_user_id', lineUserId)

  if (getCleanerError) {
    console.error(getCleanerError)
  }

  return cleaner
}

// NOTE: 応答トークンを使用してLINEに返信する。返信した後、そのイベントに対する処理は終了する。
const replyToLINE = async (
  lineReplyToken: string,
  replyMessages: TextMessage[] | FlexMessage[],
) => {
  const headers = {
    Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
    'Content-Type': 'application/json',
  }

  const dataString = JSON.stringify({
    replyToken: lineReplyToken,
    messages: replyMessages,
  })

  try {
    const res = await fetch(LINE_API.LINE_REPLY_MESSAGE_URL, {
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

const sendMessageNotExistsCleaner = async (lineReplyToken: string) => {
  const replyMessages: TextMessage[] = [
    {
      type: 'text',
      text: `ユーザー情報が見つかりませんでした。\n\n登録を行なっていない場合はGoogleフォームから登録を行なってください。`,
    },
  ]
  await replyToLINE(lineReplyToken, replyMessages)
}

// NOTE: LINEのAPIの仕様でカルーセルの最大サイズが決められているのでおさまるように整形する
const toGroupingCarouselContainerContents = (contents: CarouselContainerContent[]) => {
  const groupingContents: CarouselContainerContent[][] = []

  const slicedContents = contents.slice(0, CAROUSEL_CONTENT_MAX_SIZE * 4)
  for (let i = 0; i < slicedContents.length; i += CAROUSEL_CONTENT_MAX_SIZE) {
    const chunk = slicedContents.slice(i, i + CAROUSEL_CONTENT_MAX_SIZE)
    groupingContents.push(chunk)
  }

  return groupingContents
}
