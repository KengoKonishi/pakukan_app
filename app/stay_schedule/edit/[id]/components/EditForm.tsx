'use client'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { CLEANING_SCHEDULE } from '@/constants/CleaningSchedule'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../../components/SubmitButton'
import { addHoursAndFormatDatetime } from '../../../components/addHoursAndFormatDatetime'

export default function EditForm() {
  const { id } = useParams<{ id: string }>()
  const stayScheduleId = parseInt(id)
  const [staySchedule, setStaySchedule] = useState<{
    id: number
    guest_house_id: number | null
    start_datetime: string
    end_datetime: string
    guest_name: string
    numbers_of_guests: string
    amenities_info: string | null
    bag_recieve_info: string | null
    others: string | null
  }>({
    id: 0,
    guest_house_id: null,
    start_datetime: '',
    end_datetime: '',
    guest_name: '',
    numbers_of_guests: '',
    amenities_info: null,
    bag_recieve_info: null,
    others: null,
  })
  const [cleaningSchedule, setCleaningSchedule] = useState<{
    id: number
    cleaner_id: number | null
    guest_house_id: number | null
    start_datetime: string
    end_datetime: string
    cleaning_status_id: number
  }>({
    id: 0,
    cleaner_id: null,
    guest_house_id: null,
    start_datetime: '',
    end_datetime: '',
    cleaning_status_id: 1,
  })
  const [guestHouses, setGuestHouses] = useState<{ [key: number]: string }>({})
  const [selectedGuestHouseId, setSelectedGuestHouseId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // stayScheduleの取得
        const { data: stayData, error: stayError } = await supabase
          .from('stay_schedules')
          .select(
            `id, guest_house_id, start_datetime, end_datetime, guest_name, numbers_of_guests, amenities_info, bag_recieve_info, others`,
          )
          .eq('id', stayScheduleId)
          .limit(1)
          .single()

        if (stayError) {
          throw stayError
        }

        // cleaningScheduleの取得
        const { data: cleaningData } = await supabase
          .from('cleaning_schedules')
          .select(
            `id, cleaner_id, guest_house_id, start_datetime, end_datetime, cleaning_status_id`,
          )
          .eq('stay_schedule_id', stayScheduleId)
          .limit(1)
          .single()

        setStaySchedule(stayData)
        setSelectedGuestHouseId(stayData.guest_house_id)
        if (cleaningData) {
          setCleaningSchedule(cleaningData)
        }

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
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [supabase, stayScheduleId])

  const handleGuestHouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value)
    setSelectedGuestHouseId(selectedId)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    // 宿泊者名,アメニティ類の情報,荷物の事前/事後預かり情報,その他のバリデーション
    if (!staySchedule) {
      return
    }
    const prohibitedItems = [
      staySchedule.guest_name,
      staySchedule.amenities_info,
      staySchedule.bag_recieve_info,
      staySchedule.others,
    ]
    const targetItems = [
      '宿泊者名',
      'アメニティ類の情報',
      '荷物の事前/事後預かり情報',
      'その他',
    ]
    const prohibitedNamePattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/
    for (let i = 0; i < prohibitedItems.length; i++) {
      const item = prohibitedItems[i]
      const targetItem = targetItems[i]
      const maxStringLength = 255

      if (staySchedule.end_datetime < staySchedule.start_datetime) {
        setValidationError(
          'チェックアウト日時はチェックイン日時よりも後の日時を設定してください。',
        )
        return
      }

      // 文字数のチェック
      if (item !== null && item.length > maxStringLength) {
        setValidationError(
          `${targetItem}は${maxStringLength}文字以内で入力してください。`,
        )
        return
      }

      // 禁止文字のチェック
      if (item !== null && prohibitedNamePattern.test(item)) {
        setValidationError(`${targetItem}に禁止文字が使用されています。`)
        return
      }
    }

    // 宿泊人数のバリデーション
    const prohibitedNumbersOfGuestsPattern = /[^0-9]/
    if (prohibitedNumbersOfGuestsPattern.test(staySchedule.numbers_of_guests)) {
      setValidationError('宿泊人数に数字以外の文字が使用されています。')
      return
    }

    try {
      // 更新する宿泊スケジュールデータを準備
      const stayScheduleData = {
        guest_house_id: selectedGuestHouseId!,
        start_datetime: staySchedule.start_datetime,
        end_datetime: staySchedule.end_datetime,
        guest_name: staySchedule.guest_name,
        numbers_of_guests: staySchedule.numbers_of_guests,
        amenities_info: staySchedule.amenities_info,
        bag_recieve_info: staySchedule.bag_recieve_info,
        others: staySchedule.others,
      }

      // 更新する清掃員シフトスケジュールデータを準備
      const cleaningStartDatetime = addHoursAndFormatDatetime(
        staySchedule.end_datetime,
        CLEANING_SCHEDULE.SETTING_TIME_FOR_CLEANING_START_DATETIME,
      )
      const cleaningEndDatetime = addHoursAndFormatDatetime(
        cleaningStartDatetime,
        CLEANING_SCHEDULE.CLEANING_TIME,
      )
      const cleaningScheduleData = {
        cleaner_id: cleaningSchedule.cleaner_id, //初期設定はnullで設定し、LINEでシフト登録した時にcleaner_idを登録する
        guest_house_id: selectedGuestHouseId!,
        start_datetime: cleaningStartDatetime,
        end_datetime: cleaningEndDatetime,
        cleaning_status_id: cleaningSchedule.cleaning_status_id,
      }

      const updateStaySchedule = await supabase
        .from('stay_schedules')
        .update(stayScheduleData)
        .eq('id', stayScheduleId)

      if (updateStaySchedule.error) {
        throw updateStaySchedule.error
      }

      const updateCleaningSchedule = await supabase
        .from('cleaning_schedules')
        .update(cleaningScheduleData)
        .eq('stay_schedule_id', stayScheduleId)

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
            チェックイン日時　　　　　　チェックアウト日時
          </label>
          <div className='flex'>
            <input
              type='datetime-local'
              id='checkInDatetime'
              value={staySchedule?.start_datetime ?? ''}
              onChange={(e) => {
                const updatedStaySchedule = { ...staySchedule }
                updatedStaySchedule.start_datetime = e.target.value
                setStaySchedule(updatedStaySchedule)
              }}
              required
              className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            />
            <span className='ml-4 mt-4 mr-4'>〜</span>
            <input
              type='datetime-local'
              id='checkOutDatetime'
              value={staySchedule?.end_datetime ?? ''}
              onChange={(e) => {
                const updatedStaySchedule = { ...staySchedule }
                updatedStaySchedule.end_datetime = e.target.value
                setStaySchedule(updatedStaySchedule)
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
          <label htmlFor='guestName' className='mb-4 pl-4 text-gray-700'>
            宿泊者名
          </label>
          <input
            type='text'
            id='guestName'
            value={staySchedule?.guest_name ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = { ...staySchedule }
              updatedStaySchedule.guest_name = e.target.value
              setStaySchedule(updatedStaySchedule)
            }}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='numbersOfGuests' className='mb-4 pl-4 text-gray-700'>
            宿泊人数
          </label>
          <div className='flex'>
            <input
              type='number'
              id='numbersOfGuests'
              value={staySchedule?.numbers_of_guests ?? ''}
              onChange={(e) => {
                const updatedStaySchedule = { ...staySchedule }
                updatedStaySchedule.numbers_of_guests = e.target.value
                setStaySchedule(updatedStaySchedule)
              }}
              required
              min='1'
              max='20'
              className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            />
            <span className='ml-4 mt-4'>人</span>
          </div>
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='amenitiesInfo' className='mb-4 pl-4 text-gray-700'>
            アメニティ類の情報
          </label>
          <textarea
            id='amenitiesInfo'
            value={staySchedule?.amenities_info ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = { ...staySchedule }
              updatedStaySchedule.amenities_info = e.target.value
              setStaySchedule(updatedStaySchedule)
            }}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='bagRecieveInfo' className='mb-4 pl-4 text-gray-700'>
            荷物の事前/事後預かり情報
          </label>
          <textarea
            id='bagRecieveInfo'
            value={staySchedule?.bag_recieve_info ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = { ...staySchedule }
              updatedStaySchedule.bag_recieve_info = e.target.value
              setStaySchedule(updatedStaySchedule)
            }}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='others' className='mb-4 pl-4 text-gray-700'>
            その他
          </label>
          <textarea
            id='others'
            value={staySchedule?.others ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = { ...staySchedule }
              updatedStaySchedule.others = e.target.value
              setStaySchedule(updatedStaySchedule)
            }}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
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
