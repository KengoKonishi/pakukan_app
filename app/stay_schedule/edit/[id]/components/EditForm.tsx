'use client'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../../components/SubmitButton'

export default function EditForm() {
  const { id } = useParams<{ id: string }>()
  const stayScheduleId = parseInt(id)
  const [staySchedule, setStaySchedule] = useState<
    {
      id: number
      guest_houses: {
        id: number
        name: string
      } | null
      start_datetime: string
      end_datetime: string
      guest_name: string
      numbers_of_guests: string
      amenities_info: string | null
      bag_recieve_info: string | null
      others: string | null
    }[]
  >([])
  const [guestHouses, setGuestHouses] = useState<{ ids: number[]; names: string[] }>({
    ids: [],
    names: [],
  })
  const [guestHouseId, setGuestHouseId] = useState<number>(0)
  const [guestHouseName, setGuestHouseName] = useState('')
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
            `id, guest_houses(id, name), start_datetime, end_datetime, guest_name, numbers_of_guests, amenities_info, bag_recieve_info, others`,
          )
          .eq('id', stayScheduleId)
          .limit(1)
          .single()

        if (stayError) {
          throw stayError
        }

        setStaySchedule(stayData)

        setGuestHouseId(stayData[0]?.guest_houses.id)
        setGuestHouseName(stayData[0]?.guest_houses.name)

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
    const selectedIndex = guestHouses.names.indexOf(e.target.value)
    if (selectedIndex !== -1) {
      const selectedId = guestHouses.ids[selectedIndex]
      setGuestHouseId(selectedId)
      setGuestHouseName(e.target.value)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    // 宿泊者名,アメニティ類の情報,荷物の事前/事後預かり情報,その他のバリデーション
    const prohibitedItems = [
      staySchedule[0].guest_name,
      staySchedule[0].amenities_info,
      staySchedule[0].bag_recieve_info,
      staySchedule[0].others,
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
    if (prohibitedNumbersOfGuestsPattern.test(staySchedule[0].numbers_of_guests)) {
      setValidationError('宿泊人数に数字以外の文字が使用されています。')
      return
    }

    try {
      // 更新する宿泊スケジュールデータを準備
      const stayScheduleData = {
        guest_house_id: guestHouseId,
        start_datetime: staySchedule[0].start_datetime,
        end_datetime: staySchedule[0].end_datetime,
        guest_name: staySchedule[0].guest_name,
        numbers_of_guests: staySchedule[0].numbers_of_guests,
        amenities_info: staySchedule[0].amenities_info,
        bag_recieve_info: staySchedule[0].bag_recieve_info,
        others: staySchedule[0].others,
      }

      const createStaySchedule = await supabase
        .from('stay_schedules')
        .update(stayScheduleData)
        .eq('id', stayScheduleId)

      if (createStaySchedule.error) {
        throw createStaySchedule.error
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
            チェックイン日時　　　　　　チェックアウト日時
          </label>
          <div className='flex'>
            <input
              type='datetime-local'
              id='checkInDatetime'
              value={staySchedule[0].start_datetime ?? ''}
              onChange={(e) => {
                const updatedStaySchedule = [...staySchedule]
                updatedStaySchedule[0].start_datetime = e.target.value
                setStaySchedule(updatedStaySchedule)
              }}
              required
              className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            />
            <span className='ml-4 mt-4 mr-4'>〜</span>
            <input
              type='datetime-local'
              id='checkOutDatetime'
              value={staySchedule[0].end_datetime ?? ''}
              onChange={(e) => {
                const updatedStaySchedule = [...staySchedule]
                updatedStaySchedule[0].end_datetime = e.target.value
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
          <label htmlFor='guestName' className='mb-4 pl-4 text-gray-700'>
            宿泊者名
          </label>
          <input
            type='text'
            id='guestName'
            value={staySchedule[0].guest_name ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = [...staySchedule]
              updatedStaySchedule[0].guest_name = e.target.value
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
              value={staySchedule[0].numbers_of_guests ?? ''}
              onChange={(e) => {
                const updatedStaySchedule = [...staySchedule]
                updatedStaySchedule[0].numbers_of_guests = e.target.value
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
            value={staySchedule[0].amenities_info ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = [...staySchedule]
              updatedStaySchedule[0].amenities_info = e.target.value
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
            value={staySchedule[0].bag_recieve_info ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = [...staySchedule]
              updatedStaySchedule[0].bag_recieve_info = e.target.value
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
            value={staySchedule[0].others ?? ''}
            onChange={(e) => {
              const updatedStaySchedule = [...staySchedule]
              updatedStaySchedule[0].others = e.target.value
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
