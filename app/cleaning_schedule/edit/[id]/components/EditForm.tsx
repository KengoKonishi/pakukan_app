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
    stay_schedule_id: number | null
    start_datetime: string
    end_datetime: string
    cleaning_status_id: number
    guest_house_id: number | null
    cleaner_id: number | null
  }>({
    id: 0,
    stay_schedule_id: 0,
    start_datetime: '',
    end_datetime: '',
    cleaning_status_id: 1,
    guest_house_id: null,
    cleaner_id: null,
  })
  const [guestHouses, setGuestHouses] = useState<{ [key: number]: string }>({})
  const [selectedGuestHouseId, setSelectedGuestHouseId] = useState<number | null>(null)
  const [cleaners, setCleaners] = useState<{ [key: number]: string }>({})
  const [selectedCleanerId, setSelectedCleanerId] = useState<number | null>(null)
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
            `id, stay_schedule_id, start_datetime, end_datetime, cleaning_status_id, guest_house_id, cleaner_id`,
          )
          .eq('id', cleaningScheduleId)
          .limit(1)
          .single()

        if (cleaningError) {
          throw cleaningError
        }

        setCleaningSchedule(cleaningData)
        setSelectedCleanerId(cleaningData.cleaner_id)
        setSelectedGuestHouseId(cleaningData.guest_house_id)

        // 宿泊施設一覧の取得
        const { data: guestHousesData, error: guestHousesError } = await supabase
          .from('guest_houses')
          .select(`id, name`)
          .eq('is_deleted', 0)

        if (guestHousesError) {
          throw guestHousesError
        }

        const guestHousesMap: { [key: number]: string } = {}
        guestHousesData.forEach((item) => {
          guestHousesMap[item.id] = item.name
        })
        setGuestHouses(guestHousesMap)

        // 清掃員一覧の取得
        const { data: cleanersData, error: cleanersError } = await supabase
          .from('cleaners')
          .select(`id, name`)
          .eq('is_deleted', 0)

        if (cleanersError) {
          throw cleanersError
        }

        const CleanersMap: { [key: number]: string } = {}
        cleanersData.forEach((item) => {
          CleanersMap[item.id] = item.name
        })
        setCleaners(CleanersMap)
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
    const selectedId = parseInt(e.target.value)
    setSelectedGuestHouseId(selectedId)
  }

  const handleCleanerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value)
    setSelectedCleanerId(selectedId)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    if (!cleaningSchedule) {
      return
    }

    if (cleaningSchedule.end_datetime < cleaningSchedule.start_datetime) {
      setValidationError('清掃終了日時は清掃開始日時よりも後の日時を設定してください。')
      return
    }

    try {
      // 更新する清掃員シフトスケジュールデータを準備
      const cleaningScheduleData = {
        id: cleaningScheduleId,
        cleaner_id: selectedCleanerId! ?? null, //初期設定はnullで設定し、LINEでシフト登録した時にcleaner_idを登録する
        guest_house_id: selectedGuestHouseId!,
        stay_schedule_id: cleaningSchedule.stay_schedule_id,
        start_datetime: cleaningSchedule.start_datetime,
        end_datetime: cleaningSchedule.end_datetime,
        cleaning_status_id: cleaningSchedule.cleaning_status_id,
      }
      console.debug(cleaningScheduleData)

      const updateCleaningSchedule = await supabase
        .from('cleaning_schedules')
        .update(cleaningScheduleData)
        .eq('id', cleaningScheduleId)

      if (updateCleaningSchedule.error) {
        throw updateCleaningSchedule.error
      }

      // すべての更新処理が成功した場合の処理
      console.debug('フォームの更新処理が成功しました')
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
              value={cleaningSchedule?.start_datetime ?? ''}
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
              value={cleaningSchedule?.end_datetime ?? ''}
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
            id='guestHouseId'
            value={selectedGuestHouseId || ''}
            onChange={handleGuestHouseChange}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          >
            <option value=''>選択してください</option>
            {Object.entries(guestHouses).map(([id, name]) => (
              <option key={id} value={id}>
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
            id='cleanerId'
            value={selectedCleanerId || ''}
            onChange={handleCleanerChange}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          >
            <option value=''>選択してください</option>
            {Object.entries(cleaners).map(([id, name]) => (
              <option key={id} value={id}>
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
