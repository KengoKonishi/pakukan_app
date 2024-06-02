'use client'

import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import { useCallback, useEffect, useState } from 'react'
import Calendar from '@/components/calendar'
import { CheckBoxList } from '@/components/checkbox/CheckBoxList'
import { useGuestHouseOptions } from '@/hooks/useGuestHouseOptions'
import { CleaningScheduleModal } from './components/CleaningScheduleModal'
import { CreateScheduleModal } from './components/CreateScheduleModal'
import { ShiftShareButton } from './components/ShiftShareButton'
import { StayScheduleModal } from './components/StayScheduleModal'
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
  const [successMessage, setSuccessMessage] = useState('')
  const [validationError, setValidationError] = useState('')

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

    // スケジュールが削除された後に、再度stay_scheduleを取得する処理をここに実装
    const checkedGuestHouseIds = guestHouseOptions
      .filter((option) => option.checked)
      .map((option) => option.id.toString())

    void fetchSchedules(checkedGuestHouseIds)
  }, [guestHouseOptions, fetchSchedules])

  // 清掃スケジュール削除時の処理
  const handleDeleteCleaningSchedule = useCallback(() => {
    void fetchSchedules(
      guestHouseOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString()),
    )
    setSuccessMessage('削除が成功しました')
    // TODO: トーストを表示する
  }, [guestHouseOptions, fetchSchedules])

  // 宿泊スケジュール削除後の処理
  const handleScheduleDeleted = () => {
    setSuccessMessage('削除が成功しました')
  }

  return (
    <div className='w-full'>
      {successMessage && (
        <div className='text-blue-500 px-4 py-2 bg-yellow-200 rounded-md font-bold w-8/12 mb-4'>
          {successMessage}
        </div>
      )}
      {validationError && (
        <div className='text-red-500 px-4 py-2 bg-yellow-200 rounded-md font-bold'>
          {validationError}
        </div>
      )}
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
          onScheduleDeleted={handleScheduleDeleted}
        />
      )}
      {modalState.name === MODAL_NAMES.CLEANING_SCHEDULE &&
        modalState.scheduleId !== 0 && (
          <CleaningScheduleModal
            cleaningScheduleID={modalState.scheduleId}
            onClose={handleModalClose}
            handleDeleteCleaningSchedule={handleDeleteCleaningSchedule}
          />
        )}
      <div className='flex flex-row justify-center w-full'>
        <div className='w-1/6 mr-4'>
          <CheckBoxList
            label='民泊施設一覧'
            name='guestHouses'
            options={guestHouseOptions}
            isFlex={false}
            onChange={onChangeGuestHouseCheckBox}
          />
        </div>
        <div className='w-4/6 overflow-y-auto'>
          <Calendar
            events={schedules}
            selectable={true}
            handleDateClick={handleDateClick}
            handleEventClick={handleEventClick}
          />
          <div className='flex justify-end py-2'>
            <ShiftShareButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCalendar
