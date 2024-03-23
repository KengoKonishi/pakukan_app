'use client'

// NOTE: プラグインを後から読み込ませるため
// eslint-disable-next-line import/order
import { DateSelectArg } from '@fullcalendar/core'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { CustomEventInput } from '@/types/Calendar'

type Props = {
  events: CustomEventInput[]
  handleDateClick?: (selectInfo: DateSelectArg) => void
  selectable: boolean
}

const Calendar = ({ events, handleDateClick, selectable }: Props) => {
  return (
    <FullCalendar
      locale='ja'
      locales={allLocales}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView='dayGridMonth'
      selectable={selectable}
      select={handleDateClick}
      events={events}
    />
  )
}

export default Calendar
