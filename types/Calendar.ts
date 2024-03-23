import { EventInput } from '@fullcalendar/core'

export type CustomEventInput = EventInput & {
  eventType: 'stay' | 'cleaning'
  scheduleId: 'string'
}
