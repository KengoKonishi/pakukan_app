console.log('Hello from Functions!')

// NOTE: LINEのWebhook URLとして登録している関数
Deno.serve(async (request) => {
  const { events } = await request.json()
  console.log(events)

  const event = events[0]
  const message = event.message

  if (message.type !== 'text') {
    console.log('message type !== text')
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // TODO: メニュー選択時のポストバックイベントに対応させる
  const messageText = message.text
  const source = event.source.userId
  const lineUserId = event.source.userId
  console.log(messageText)
  console.log(source)

  const headers = {
    Authorization: `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? ''}`,
    'Content-Type': 'application/json',
  }

  const replyMessages = [
    {
      type: 'text',
      text: '以下のフォームから登録を行なってください',
    },
    {
      type: 'text',
      text: `https://docs.google.com/forms/d/e/1FAIpQLSfSBlpF_8oKHYkn5VNQsIb4EgYfA0ivi3f4I8LS9sjdJVa5rA/viewform?usp=pp_url&entry.455572547=${lineUserId}`,
    },
  ]

  const dataString = JSON.stringify({
    replyToken: event.replyToken,
    messages: replyMessages,
  })

  // TODO: エラーハンドリング
  fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: headers,
    body: dataString,
  })
    .then((r) => {
      console.log(r)
    })
    .catch((e) => {
      console.log(e)
    })

  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  })
})
