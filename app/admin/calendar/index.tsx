'use client'

import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import { useCallback, useEffect, useState } from 'react'
import Calendar from '@/components/calendar'
import { CleaningScheduleModal } from './components/CleaningScheduleModal'
import { CreateScheduleModal } from './components/CreateScheduleModal'
import { GuestHouseCheckBoxList } from './components/GuestHouseCheckBoxList'
import { StayScheduleModal } from './components/StayScheduleModal'
import { useGuestHouseOptions } from './hooks/useGuestHouseOptions'
import { useSchedules } from './hooks/useSchedules'

const MODAL_NAMES = {
  CREATE_SCHEDULE: 'CREATE_SCHEDULE',
  STAY_SCHEDULE: 'STAY_SCHEDULE',
  CLEANING_SCHEDULE: 'CLEANING_SCHEDULE',
}

const AdminCalendar = () => {
  const { guestHouseOptions, setGuestHouseOptions } = useGuestHouseOptions()
  const { schedules, fetchSchedules } = useSchedules()
  const [modalState, setModalState] = useState({
    name: '',
    startDate: '',
    endDate: '',
    scheduleId: 0,
  })

  useEffect(() => {
    // チェックがついた民泊施設に紐づくスケジュールを取得
    void fetchSchedules(
      guestHouseOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString()),
    )
  }, [guestHouseOptions])

  // 民泊施設のチェックボックス変更時の処理
  const onChangeGuestHouseCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: id, checked } = event.target

    setGuestHouseOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id.toString() === id ? { ...option, checked } : option,
      ),
    )
  }

  // カレンダーの日付クリック時の処理
  const handleDateClick = useCallback((selectInfo: DateSelectArg) => {
    const startDate = new Date(selectInfo.startStr)
    const endDate = new Date(selectInfo.endStr)
    if (selectInfo.allDay) {
      // NOTE: 月表示の場合 選択した日付を取得するために1日引く必要がある
      endDate.setDate(endDate.getDate() - 1)
    }

    setModalState((prevState) => ({
      ...prevState,
      name: MODAL_NAMES.CREATE_SCHEDULE,
      // NOTE: 月表示の場合は日付まで、週表示の場合は時間まで表示する
      startDate: selectInfo.allDay
        ? startDate.toLocaleDateString()
        : startDate.toLocaleString(),
      endDate: selectInfo.allDay
        ? endDate.toLocaleDateString()
        : endDate.toLocaleString(),
      scheduleId: 0,
    }))
  }, [])

  // 登録済みのスケジュールクリック時の処理
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (clickInfo.event.extendedProps.eventType === 'stay') {
      setModalState((prevState) => ({
        ...prevState,
        name: MODAL_NAMES.STAY_SCHEDULE,
        scheduleId: clickInfo.event.extendedProps.scheduleId as number,
      }))
    }
    if (clickInfo.event.extendedProps.eventType === 'cleaning') {
      setModalState((prevState) => ({
        ...prevState,
        name: MODAL_NAMES.CLEANING_SCHEDULE,
        scheduleId: clickInfo.event.extendedProps.scheduleId as number,
      }))
    }
  }, [])

  // モーダル閉じる処理 (共通で使用)
  const handleModalClose = useCallback(() => {
    setModalState((prevState) => ({
      ...prevState,
      name: '',
      startDate: '',
      endDate: '',
      scheduleId: 0,
    }))
  }, [])

  // 清掃スケジュール削除時の処理
  const handleDeleteCleaningSchedule = useCallback(() => {
    void fetchSchedules(
      guestHouseOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString()),
    )
    // TODO: トーストを表示する
  }, [guestHouseOptions])

  return (
    <div className='w-full'>
      {modalState.name === MODAL_NAMES.CREATE_SCHEDULE && (
        <CreateScheduleModal
          endDate={modalState.endDate}
          startDate={modalState.startDate}
          onClose={handleModalClose}
        />
      )}
      {modalState.name === MODAL_NAMES.STAY_SCHEDULE && modalState.scheduleId !== 0 && (
        <StayScheduleModal
          stayScheduleID={modalState.scheduleId}
          onClose={handleModalClose}
        />
      )}
      {modalState.name === MODAL_NAMES.CLEANING_SCHEDULE &&
        modalState.scheduleId !== 0 && (
          <CleaningScheduleModal
            cleaningScheduleID={modalState.scheduleId}
            onClose={handleModalClose}
            onDeleteSchedule={handleDeleteCleaningSchedule}
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
            handleEventClick={handleEventClick}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminCalendar
