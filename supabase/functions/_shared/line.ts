export const LINE_API = {
  LINE_REPLY_MESSAGE_URL: 'https://api.line.me/v2/bot/message/reply',
  PUSH_MESSAGE_URL: 'https://api.line.me/v2/bot/message/push',
  BROADCAST_URL: 'https://api.line.me/v2/bot/message/broadcast',
} as const

export const CAROUSEL_CONTENT_MAX_SIZE = 12

export type CarouselContainerContent = {
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

export type FlexMessage = {
  type: 'flex'
  altText: string
  contents: {
    type: 'carousel'
    contents: CarouselContainerContent[]
  }
}

export type TextMessage = {
  type: 'text'
  text: string
}
