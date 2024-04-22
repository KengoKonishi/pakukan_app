'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'

export default function SettingForm() {
  const [checkInDatetime, setCheckInDatetime] = useState('')
  const [checkOutDatetime, setCheckOutDatetime] = useState('')
  const [guesthouses, setGuesthouses] = useState<{ ids: number[]; names: string[] }>({
    ids: [],
    names: [],
  })
  const [guesthouseId, setGuesthouseId] = useState<number>(0)
  const [guesthouseName, setGuesthouseName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [numbersOfGuests, setNumbersOfGuests] = useState('')
  const [amenitiesInfo, setAmenitiesInfo] = useState('')
  const [bagRecieveInfo, setBagRecieveInfo] = useState('')
  const [others, setOthers] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const initialCheckInDatetimeParam = urlParams.get('checkInDatetime') || ''
    const initialCheckOutDatetimeParam = urlParams.get('checkOutDatetime') || ''
    const addDefaultTimeToDatetime = (datetimeString: string, time: number) => {
      const datetime = new Date(Date.parse(datetimeString))
      datetime.setUTCHours(time, 0, 0, 0) // time:00(11:00など) を設定
      return datetime.toISOString().slice(0, 16) // 'yyyy-mm-ddTHH:MM'
    }
    // デフォルトのチェックイン日時を設定
    const initialCheckInDatetime = initialCheckInDatetimeParam
      ? addDefaultTimeToDatetime(initialCheckInDatetimeParam, 11)
      : ''
    // デフォルトのチェックイン日時を設定
    const initialCheckOutDatetime = initialCheckOutDatetimeParam
      ? addDefaultTimeToDatetime(initialCheckOutDatetimeParam, 15)
      : ''

    setCheckInDatetime(initialCheckInDatetime)
    setCheckOutDatetime(initialCheckOutDatetime)

    const fetchGuestHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_houses')
          .select(`id, name`)
          .eq('is_deleted', 0)
        if (error) {
          throw error
        }
        const guesthouseIds = data.map((item) => item.id)
        const guesthouseNames = data.map((item) => item.name)

        setGuesthouses({ ids: guesthouseIds, names: guesthouseNames })
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchGuestHouses()
  }, [supabase])

  const handleGuesthouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = guesthouses.names.indexOf(e.target.value)
    if (selectedIndex !== -1) {
      const selectedId = guesthouses.ids[selectedIndex]
      // console.log('選択されたゲストハウスのID:', selectedId)
      setGuesthouseId(selectedId)
      setGuesthouseName(e.target.value)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    // 宿泊者名,アメニティ類の情報,荷物の事前/事後預かり情報,その他のバリデーション
    const prohibitedItems = [guestName, amenitiesInfo, bagRecieveInfo, others]
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
      if (item.length > maxStringLength) {
        setValidationError(
          `${targetItem}は${maxStringLength}文字以内で入力してください。`,
        )
        return
      }

      // 禁止文字のチェック
      if (prohibitedNamePattern.test(item)) {
        setValidationError(`${targetItem}に禁止文字が使用されています。`)
        return
      }
    }

    // 宿泊人数のバリデーション
    const prohibitedNumbersOfGuestsPattern = /[^0-9]/
    if (prohibitedNumbersOfGuestsPattern.test(numbersOfGuests)) {
      setValidationError('宿泊人数に数字以外の文字が使用されています。')
      return
    }

    try {
      // 更新するデータを準備
      const stayScheduleData = {
        guest_house_id: guesthouseId,
        start_datetime: checkInDatetime,
        end_datetime: checkOutDatetime,
        guest_name: guestName,
        numbers_of_guests: numbersOfGuests,
        amenities_info: amenitiesInfo,
        bag_recieve_info: bagRecieveInfo,
        others: others,
      }

      const createStaySchedule = await supabase
        .from('stay_schedules')
        .insert(stayScheduleData)

      if (createStaySchedule.error) {
        throw createStaySchedule.error
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
            チェックイン日時　　　　　　チェックアウト日時
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
          <label htmlFor='guesthouseName' className='mb-4 pl-4 text-gray-700'>
            宿泊施設名
          </label>
          <select
            id='guesthouseName'
            value={guesthouseName}
            onChange={handleGuesthouseChange}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          >
            <option value=''>選択してください</option>
            {guesthouses.names.map((name, index) => (
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
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
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
              value={numbersOfGuests}
              onChange={(e) => setNumbersOfGuests(e.target.value)}
              required
              min='1'
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
            value={amenitiesInfo}
            onChange={(e) => setAmenitiesInfo(e.target.value)}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='bagRecieveInfo' className='mb-4 pl-4 text-gray-700'>
            荷物の事前/事後預かり情報
          </label>
          <textarea
            id='bagRecieveInfo'
            value={bagRecieveInfo}
            onChange={(e) => setBagRecieveInfo(e.target.value)}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='others' className='mb-4 pl-4 text-gray-700'>
            その他
          </label>
          <textarea
            id='others'
            value={others}
            onChange={(e) => setOthers(e.target.value)}
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
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
