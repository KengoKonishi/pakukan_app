'use client'

import { DateSelectArg } from '@fullcalendar/core'
import { useCallback, useEffect, useState } from 'react'
import Calendar from '@/components/calendar'
import { CreateScheduleModal } from './components/CreateScheduleModal'
import { GuestHouseCheckBoxList } from './components/GuestHouseCheckBoxList'
import { useGuestHouseOptions } from './hooks/useGuestHouseOptions'
import { useSchedules } from './hooks/useSchedules'

const AdminCalendar = () => {
  const { guestHouseOptions, setGuestHouseOptions } = useGuestHouseOptions()
  const { schedules, fetchSchedules } = useSchedules()
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    // チェックがついた民泊施設に紐づくスケジュールを取得
    void fetchSchedules(
      guestHouseOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString()),
    )
  }, [guestHouseOptions])

  // 民泊施設のチェックボックス変更時のイベント
  const onChangeGuestHouseCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: id, checked } = event.target

    setGuestHouseOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id.toString() === id ? { ...option, checked } : option,
      ),
    )
  }

  // カレンダーの日付クリック時のイベント
  const handleDateClick = useCallback((selectInfo: DateSelectArg) => {
    console.log(selectInfo)
    setStartDate(selectInfo.startStr)
    // TODO: 終了日が1日ずれるので調査する。タイムゾーンが違う？
    setEndDate(selectInfo.endStr)
    setIsOpenModal(true)
  }, [])

  const handleModalClose = useCallback(() => setIsOpenModal(false), [])

  return (
    <div className='w-full'>
      {isOpenModal && (
        <CreateScheduleModal
          endDate={endDate}
          startDate={startDate}
          onClose={handleModalClose}
        />
      )}
      <div className='flex flex-row justify-center items-center w-full'>
        <div className='w-1/6'>
          <GuestHouseCheckBoxList
            guestHouseOptions={guestHouseOptions}
            onChange={onChangeGuestHouseCheckBox}
          />
        </div>
        <div className='w-3/6'>
          <Calendar
            events={schedules}
            selectable={true}
            handleDateClick={handleDateClick}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminCalendar
