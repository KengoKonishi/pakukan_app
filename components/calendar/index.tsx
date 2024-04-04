'use client'

// NOTE: プラグインを後から読み込ませるため
// eslint-disable-next-line import/order
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
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
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView='dayGridMonth'
      selectable={selectable}
      select={handleDateClick}
      events={events}
      eventClick={handleEventClick}
      headerToolbar={{
        left: 'prev,next',
        center: 'title',
        right: 'timeGridWeek,dayGridMonth',
      }}
    />
  )
}

export default Calendar
