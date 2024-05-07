'use client'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from './SubmitButton'

export default function EditForm() {
  const { id } = useParams<{ id: string }>()
  const cleaningScheduleId = parseInt(id)
  const [cleaningSchedule, setCleaningSchedule] = useState<{
    id: number
    stay_schedule_id: number
    start_datetime: string
    end_datetime: string
    cleaning_status_id: number
    guest_houses: {
      id: number
      name: string
    } | null
    cleaners: {
      id: number
      name: string
    } | null
  }>()
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
    const fetchData = async () => {
      try {
        // cleaningScheduleの取得
        const { data: cleaningData, error: cleaningError } = await supabase
          .from('cleaning_schedules')
          .select(
            `id, stay_schedule_id, start_datetime, end_datetime, cleaning_status_id, guest_houses(id, name), cleaners(id, name)`,
          )
          .eq('id', cleaningScheduleId)
          .limit(1)
          .single()

        if (cleaningError) {
          throw cleaningError
        }

        // cleaningScheduleのセット
        if (cleaningData.length > 0) {
          setCleaningSchedule(cleaningData[0])
        }

        setGuestHouseId(cleaningData[0].guest_houses.id)
        setGuestHouseName(cleaningData[0].guest_houses.name)

        setCleanerId(cleaningData[0].cleaners?.id)
        setCleanerName(cleaningData[0].cleaners?.name)

        // 宿泊施設一覧の取得
        const { data: guestHousesData, error: guestHousesError } = await supabase
          .from('guest_houses')
          .select(`id, name`)
          .eq('is_deleted', 0)

        if (guestHousesError) {
          throw guestHousesError
        }

        const guestHouseIds = guestHousesData.map((item) => item.id)
        const guestHouseNames = guestHousesData.map((item) => item.name)

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
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [supabase, cleaningScheduleId])

  const handleGuestHouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = guestHouses.names.indexOf(e.target.value)
    if (selectedIndex !== -1) {
      const selectedId = guestHouses.ids[selectedIndex]
      setGuestHouseId(selectedId)
      setGuestHouseName(e.target.value)
      setCleaningSchedule((prevSchedule) => ({
        ...prevSchedule,
        guest_house_id: selectedId,
      }))
    }
  }

  const handleCleanerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = cleaners.names.indexOf(e.target.value)
    if (selectedIndex !== -1) {
      const selectedId = cleaners.ids[selectedIndex]
      setCleanerId(selectedId)
      setCleanerName(e.target.value)
      setCleaningSchedule((prevSchedule) => ({
        ...prevSchedule,
        cleaner_id: selectedId,
      }))
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
        id: cleaningScheduleId,
        cleaner_id: cleanerId ?? null, //初期設定はnullで設定し、LINEでシフト登録した時にcleaner_idを登録する
        guest_house_id: guestHouseId,
        stay_schedule_id: cleaningSchedule.stay_schedule_id,
        start_datetime: cleaningSchedule.start_datetime,
        end_datetime: cleaningSchedule.end_datetime,
        cleaning_status_id: cleaningSchedule.cleaning_status_id,
      }
      console.log(cleaningScheduleData)

      const updateCleaningSchedule = await supabase
        .from('cleaning_schedules')
        .update(cleaningScheduleData)
        .eq('id', cleaningScheduleId)

      if (updateCleaningSchedule.error) {
        throw updateCleaningSchedule.error
      }

      // すべての更新処理が成功した場合の処理
      console.log('フォームの更新処理が成功しました')
      setTimeout(() => {
        setSuccessMessage('更新が成功しました')
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
              value={cleaningSchedule.start_datetime ?? ''}
              onChange={(e) => {
                const updatedCleaningSchedule = { ...cleaningSchedule }
                updatedCleaningSchedule.start_datetime = e.target.value
                setCleaningSchedule(updatedCleaningSchedule)
              }}
              required
              className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            />
            <span className='ml-4 mt-4 mr-4'>〜</span>
            <input
              type='datetime-local'
              id='checkOutDatetime'
              value={cleaningSchedule.end_datetime ?? ''}
              onChange={(e) => {
                const updatedCleaningSchedule = { ...cleaningSchedule }
                updatedCleaningSchedule.end_datetime = e.target.value
                setCleaningSchedule(updatedCleaningSchedule)
              }}
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
            清掃員氏名
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
            <SubmitButton label='更新する' />
          </div>
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
