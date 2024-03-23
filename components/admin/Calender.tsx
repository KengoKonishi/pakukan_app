'use client'

import { DateSelectArg } from '@fullcalendar/core'
import { useCallback, useEffect, useState } from 'react'
import Calendar from '@/components/calendar'
import { CustomEventInput } from '@/types/Calendar'
import { createClient } from '@/utils/supabase/client'

type GuestHouseOption = {
  id: number
  name: string
  checked: boolean
}

const AdminCalendar = () => {
  const [guestHouseOptions, setGuestHouseOptions] = useState<GuestHouseOption[]>([])
  const [schedules, setSchedules] = useState<CustomEventInput[]>([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const getGuestHouses = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('guest_houses')
        .select('id, name')
        .eq('owner_group_id', 1)

      if (error) {
        console.log(error)
        return
      }

      const guestHouseOptions: GuestHouseOption[] = data.map((value) => ({
        ...value,
        checked: true,
      }))

      setGuestHouseOptions(guestHouseOptions)
    }
    void getGuestHouses()
  }, [])

  useEffect(() => {
    void getSchedules(
      guestHouseOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString()),
    )
  }, [guestHouseOptions])

  const getSchedules = async (targetGuestHouseIds: string[]) => {
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

  const onChangeGuestHouseCheckBox = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value: id, checked } = event.target

      setGuestHouseOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.id.toString() === id ? { ...option, checked } : option,
        ),
      )
    },
    [],
  )

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
            handleDateClick={handleDateClick}
            selectable={true}
          />
        </div>
      </div>
    </div>
  )
}

const GuestHouseCheckBoxList = ({
  guestHouseOptions,
  onChange,
}: {
  guestHouseOptions: GuestHouseOption[]
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <>
      <div>民泊施設一覧</div>
      {guestHouseOptions &&
        guestHouseOptions.map((option) => {
          return (
            <div key={option.id}>
              <label>{option.name}</label>
              <input
                id={option.id.toString()}
                type='checkbox'
                name='guestHouses'
                checked={option.checked}
                onChange={onChange}
                value={option.id.toString()}
              />
            </div>
          )
        })}
    </>
  )
}

const CreateScheduleModal = ({
  endDate,
  startDate,
  onClose,
}: {
  endDate: string
  startDate: string
  onClose: () => void
}) => {
  const [selected, setSelected] = useState('stay')
  const changeValue = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(event.target.value)

  const onClickCreateButton = () => {
    // TODO: 宿泊スケジュール作成画面、または清掃員スケジュール作成画面に遷移させる
    console.log(startDate, endDate, selected)
  }

  return (
    <div
      className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-10'
      onClick={onClose}
    >
      {/* モーダル全体 */}
      <div
        className='flex flex-col justify-center items-center w-4/5 p-5 my-24 bg-white border z-20'
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className='flex justify-end w-full'>
          <button
            onClick={onClose}
            type='button'
            aria-label='閉じる'
            className='flex justify-center items-center bg-transparent border-none text-4xl h-7.5 w-7.5 rounded-lg cursor-pointer'
          >
            ×
          </button>
        </div>
        {/* モーダルコンテンツ */}
        <div className='w-3/5'>
          <div className='flex justify-start'>
            <h3 className='text-2xl'>スケジュール登録</h3>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>開始日</p>
              {startDate}
            </div>
            <div>
              <p>終了日</p>
              {endDate}
            </div>
          </div>
          <div className='gap-20 p-5'>
            <div>
              <input
                type='radio'
                id='staySchedule'
                name='scheduleType'
                value='stay'
                checked={'stay' === selected}
                onChange={changeValue}
              />
              <label htmlFor='staySchedule'>宿泊スケジュール</label>
            </div>
            <div>
              <input
                type='radio'
                id='cleaningSchedule'
                name='scheduleType'
                value='cleaning'
                checked={'cleaning' === selected}
                onChange={changeValue}
              />
              <label htmlFor='cleaningSchedule'>清掃員スケジュール</label>
            </div>
          </div>
          <div className='flex justify-center'>
            <button
              className='py-2 px-4 rounded-md no-underline'
              onClick={onClickCreateButton}
            >
              作成する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCalendar
