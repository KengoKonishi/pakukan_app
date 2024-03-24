'use client'

// NOTE: プラグインを後から読み込ませるため
// eslint-disable-next-line import/order
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { CustomEventInput } from '@/types/Calendar'

type Props = {
  events: CustomEventInput[]
  selectable: boolean
  handleEventClick?: (eventInfo: EventClickArg) => void
  handleDateClick?: (selectInfo: DateSelectArg) => void
}

const Calendar = ({ events, selectable, handleEventClick, handleDateClick }: Props) => {
  return (
    <FullCalendar
      locale='ja'
      locales={allLocales}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView='dayGridMonth'
      selectable={selectable}
      select={handleDateClick}
      events={events}
      eventClick={handleEventClick}
    />
  )
}

export default Calendar
