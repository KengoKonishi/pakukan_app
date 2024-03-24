import { useState } from 'react'
import { CustomEventInput } from '@/types/Calendar'
import { createClient } from '@/utils/supabase/client'

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<CustomEventInput[]>([])

  // 民泊施設に紐づくスケジュールを取得
  const fetchSchedules = async (targetGuestHouseIds: string[]) => {
    const supabase = createClient()
    const schedules: CustomEventInput[] = []

    // 宿泊スケジュール
    const { data: stayScheduleData, error: stayScheduleError } = await supabase
      .from('stay_schedules')
      .select(
        'id, start_datetime, end_datetime, guest_name, numbers_of_guests, guest_houses (name)',
      )
      .in('guest_house_id', targetGuestHouseIds)

    if (stayScheduleError) {
      console.log(stayScheduleError)
      return
    }

    stayScheduleData.forEach((schedule) => {
      schedules.push({
        // NOTE: 宿泊と清掃でidが重複した場合に正しく動作しないため、接頭辞をつける
        id: 'stay_' + schedule.id.toString(),
        title: `${schedule.guest_houses?.name} ${schedule.guest_name} / ${schedule.numbers_of_guests}人`,
        start: schedule.start_datetime,
        end: schedule.end_datetime,
        eventType: 'stay',
        scheduleId: schedule.id.toString(),
      } as CustomEventInput)
    })

    // 清掃員スケジュール
    const { data: cleaningScheduleData, error: cleaningScheduleError } = await supabase
      .from('cleaning_schedules')
      .select('id, start_datetime, end_datetime, cleaners (name)')
      .in('guest_house_id', targetGuestHouseIds)

    if (cleaningScheduleError) {
      console.log(cleaningScheduleError)
      return
    }

    cleaningScheduleData.forEach((schedule) => {
      schedules.push({
        // NOTE: 宿泊と清掃でidが重複した場合に正しく動作しないため、接頭辞をつける
        id: 'cleaning' + schedule.id.toString(),
        title: schedule.cleaners ? `${schedule.cleaners.name}さん` : '',
        start: schedule.start_datetime,
        end: schedule.end_datetime,
        eventType: 'cleaning',
        scheduleId: schedule.id.toString(),
      } as CustomEventInput)
    })

    setSchedules(schedules)
  }

  return { schedules, setSchedules, fetchSchedules }
}
