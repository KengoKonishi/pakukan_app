console.log('Hello from Functions!')
import * as crypto from 'https://deno.land/std@0.166.0/node/crypto.ts'

const LINE_REPLY_MESSAGE_URL = 'https://api.line.me/v2/bot/message/reply'
const CLEANER_REGISTRATION_FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfSBlpF_8oKHYkn5VNQsIb4EgYfA0ivi3f4I8LS9sjdJVa5rA/viewform?usp=pp_url&entry.455572547='

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
  const message = event.message

  // テキストメッセージ以外は処理しない
  // TODO: ポストバックイベントのみ処理するように修正してもいいかも
  if (message.type !== 'text') {
    console.log('message type !== text')
    return
  }

  const messageText = message.text
  console.log(messageText)
  const source = event.source.userId
  const lineUserId = event.source.userId
  console.log(source)

  const headers = {
    Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
    'Content-Type': 'application/json',
  }

  if (messageText === 'プロフィール登録') {
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

  // TODO: シフト確認 機能
  // TODO: 清掃報告 機能
}
