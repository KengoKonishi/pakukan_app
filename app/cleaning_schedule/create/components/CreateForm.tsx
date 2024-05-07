'use client'
import React, { useState, useEffect } from 'react'
import { cleaningSchedule, cleaningStatus } from '@/app/config'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'

export default function CreateForm() {
  const [checkInDatetime, setCheckInDatetime] = useState('')
  const [checkOutDatetime, setCheckOutDatetime] = useState('')
  const [guestHouses, setGuestHouses] = useState<{ ids: number[]; names: string[] }>({
    ids: [],
    names: [],
  })
  const [guestHouseId, setGuestHouseId] = useState<number>(0)
  const [guestHouseName, setGuestHouseName] = useState('')
  const [cleaners, setCleaners] = useState<{ ids: number[]; names: string[] }>({
    ids: [],
    names: [],
  })
  const [cleanerId, setCleanerId] = useState<number>(0)
  const [cleanerName, setCleanerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const initialStartDatetimeParam = urlParams.get('startDatetime') || ''
    const initialEndDatetimeParam = urlParams.get('endDatetime') || ''
    // デフォルトの時間設定と整形
    const addDefaultTimeToDatetimeAndFormatt = (
      datetimeString: string,
      time: number | null = null,
    ) => {
      const datetime = new Date(datetimeString + 'Z')
      if (time) {
        datetime.setUTCHours(time, 0, 0, 0) // time:00(11:00など) を設定
      }
      return datetime.toISOString().slice(0, 16) // 'yyyy-mm-ddTHH:MM'
    }
    // デフォルト清掃開始日時を設定
    let initialStartDatetime = ''
    if (initialStartDatetimeParam && initialStartDatetimeParam.includes(' ')) {
      initialStartDatetime = addDefaultTimeToDatetimeAndFormatt(initialStartDatetimeParam)
    } else if (initialStartDatetimeParam) {
      initialStartDatetime = addDefaultTimeToDatetimeAndFormatt(
        initialStartDatetimeParam,
        cleaningSchedule.CLEANING_START_DEFAULT_TIME,
      )
    }

    // デフォルト清掃終了日時を設定
    let initialEndDatetime = ''
    if (initialEndDatetimeParam && initialEndDatetimeParam.includes(' ')) {
      initialEndDatetime = addDefaultTimeToDatetimeAndFormatt(initialEndDatetimeParam)
    } else if (initialEndDatetimeParam) {
      initialEndDatetime = addDefaultTimeToDatetimeAndFormatt(
        initialEndDatetimeParam,
        cleaningSchedule.CLEANING_END_DEFAULT_TIME,
      )
    }

    void setCheckInDatetime(initialStartDatetime)
    void setCheckOutDatetime(initialEndDatetime)

    const fetchGuestHousesAndCleaners = async () => {
      try {
        // 宿泊施設一覧の取得
        const { data: guestHouseData, error: guestHouseError } = await supabase
          .from('guest_houses')
          .select(`id, name`)
          .eq('is_deleted', 0)

        if (guestHouseError) {
          throw guestHouseError
        }
        const guestHouseIds = guestHouseData.map((item) => item.id)
        const guestHouseNames = guestHouseData.map((item) => item.name)

        setGuestHouses({ ids: guestHouseIds, names: guestHouseNames })

        // 清掃員一覧の取得
        const { data: cleanersData, error: cleanersError } = await supabase
          .from('cleaners')
          .select(`id, name`)
          .eq('is_deleted', 0)

        if (cleanersError) {
          throw cleanersError
        }

        const cleanerIds = cleanersData.map((item) => item.id)
        const cleanerNames = cleanersData.map((item) => item.name)

        setCleaners({ ids: cleanerIds, names: cleanerNames })
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchGuestHousesAndCleaners()
  }, [supabase])

  //  宿泊施設の値更新
  const handleGuestHouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = guestHouses.names.indexOf(e.target.value)
    if (selectedIndex !== -1) {
      const selectedId = guestHouses.ids[selectedIndex]
      setGuestHouseId(selectedId)
      setGuestHouseName(e.target.value)
    }
  }

  //  清掃員の値更新
  const handleCleanerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = cleaners.names.indexOf(e.target.value)
    if (selectedIndex !== -1) {
      const selectedId = cleaners.ids[selectedIndex]
      setCleanerId(selectedId)
      setCleanerName(e.target.value)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    try {
      // 更新する清掃員シフトスケジュールデータを準備
      const cleaningScheduleData = {
        cleaner_id: cleanerId !== 0 ? cleanerId : null, //初期設定はnullで設定し、LINEでシフト登録した時にcleaner_idを登録する
        guest_house_id: guestHouseId,
        start_datetime: checkInDatetime,
        end_datetime: checkOutDatetime,
        cleaning_status_id: cleaningStatus.STATUS_ID_PENDING,
      }

      // 清掃員シフトデータを作成
      const createCleaningSchedule = await supabase
        .from('cleaning_schedules')
        .insert(cleaningScheduleData)

      if (createCleaningSchedule.error) {
        throw createCleaningSchedule.error
      }

      // すべての更新処理が成功した場合の処理
      console.log('フォームの更新処理が成功しました')
      setTimeout(() => {
        setSuccessMessage('作成が成功しました')
      }, 1000)
    } catch (e: unknown) {
      // 更新処理が失敗した場合の処理
      console.error('フォームの更新処理が失敗しました:', error)
      if (e instanceof Error) {
        setError(e.message)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className='w-5/6 mx-auto'>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => void handleSubmit(e)}
        className='flex flex-col gap-4 max-w-md'
      >
        {successMessage && (
          <div className='text-blue-500 px-4 py-2 bg-yellow-200 rounded-md font-bold'>
            {successMessage}
          </div>
        )}
        {validationError && (
          <div className='text-red-500 px-4 py-2 bg-yellow-200 rounded-md font-bold'>
            {validationError}
          </div>
        )}
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='checkInDatetime' className='mb-4 pl-4 text-gray-700'>
            {/* eslint-disable-next-line no-irregular-whitespace */}
            開始日時　　　　　　　　　　　　終了日時
          </label>
          <div className='flex'>
            <input
              type='datetime-local'
              id='checkInDatetime'
              value={checkInDatetime}
              onChange={(e) => setCheckInDatetime(e.target.value)}
              required
              className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            />
            <span className='ml-4 mt-4 mr-4'>〜</span>
            <input
              type='datetime-local'
              id='checkOutDatetime'
              value={checkOutDatetime}
              onChange={(e) => setCheckOutDatetime(e.target.value)}
              required
              className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            />
          </div>
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='guestHouseName' className='mb-4 pl-4 text-gray-700'>
            宿泊施設名
          </label>
          <select
            id='guestHouseName'
            value={guestHouseName}
            onChange={handleGuestHouseChange}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          >
            <option value=''>選択してください</option>
            {guestHouses.names.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='cleanerName' className='mb-4 pl-4 text-gray-700'>
            清掃員氏名（シフトが決まっている場合入力ください）
          </label>
          <select
            id='cleanerName'
            value={cleanerName}
            onChange={handleCleanerChange}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          >
            <option value=''>選択してください</option>
            {cleaners.names.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className='flex justify-center'>
          <div className='flex justify-center'>
            <SubmitButton label='登録する' />
          </div>
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
