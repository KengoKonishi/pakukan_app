'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'

// 基準となる時刻に引数で指定した時刻を足す
const addHoursToDatetime = (datetimeString: string, hours: number) => {
  const datetime = new Date(datetimeString)
  const timezoneOffset = datetime.getTimezoneOffset() // 現地時間からのオフセットを取得する
  const millisecondsToAdd = hours * 60 * 60 * 1000 // 指定された時間をミリ秒に変換する
  const adjustedTime = datetime.getTime() + millisecondsToAdd - timezoneOffset * 60 * 1000 // ローカル時間に変換する
  const result = new Date(adjustedTime)
  return result.toISOString().slice(0, 16) // 'yyyy-mm-ddTHH:MM'
}
// 清掃状況ステータス：未完了
const CLEANING_STATUS_ID_PENDING = 1
// チェックアウト時刻の一定時間経過後を清掃開始時刻とする（単位：h）
const SETTING_TIME_FOR_CLEANING_START_DATETIME = 2
// 清掃員の清掃時間(単位：h)
const CLEANING_TIME = 3
// 宿泊者のデフォルトチェックイン時刻(単位：h)
const GUEST_DEFAULT_CHECK_IN_TIME = 15
// 宿泊者のデフォルトチェックアウト時刻(単位：h)
const GUEST_DEFAULT_CHECK_OUT_TIME = 11

interface GuestHouse {
  id: number
  name: string
}

export default function CreateForm() {
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
      const datetime = new Date(datetimeString + 'Z')
      datetime.setUTCHours(time, 0, 0, 0) // time:00(11:00など) を設定
      return datetime.toISOString().slice(0, 16) // 'yyyy-mm-ddTHH:MM'
    }
    // チェックイン日時を設定
    const initialCheckInDatetime = initialCheckInDatetimeParam
      ? addDefaultTimeToDatetime(initialCheckInDatetimeParam, GUEST_DEFAULT_CHECK_IN_TIME)
      : ''
    // チェックイン日時を設定
    const initialCheckOutDatetime = initialCheckOutDatetimeParam
      ? addDefaultTimeToDatetime(
          initialCheckOutDatetimeParam,
          GUEST_DEFAULT_CHECK_OUT_TIME,
        )
      : ''

    void setCheckInDatetime(initialCheckInDatetime)
    void setCheckOutDatetime(initialCheckOutDatetime)

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
      // 更新する宿泊スケジュールデータを準備
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

      // 更新する清掃員シフトスケジュールデータを準備
      const cleaningStartDatetime = addHoursToDatetime(
        checkOutDatetime,
        SETTING_TIME_FOR_CLEANING_START_DATETIME,
      )
      const cleaningEndDatetime = addHoursToDatetime(cleaningStartDatetime, CLEANING_TIME)
      const cleaningScheduleData = {
        cleaner_id: null, //初期設定はnullで設定し、LINEでシフト登録した時にcleaner_idを登録する
        guest_house_id: guesthouseId,
        start_datetime: cleaningStartDatetime,
        end_datetime: cleaningEndDatetime,
        cleaning_status_id: CLEANING_STATUS_ID_PENDING,
      }

      // 宿泊スケジュールと清掃員シフトデータの両方を作成。
      // いずれか失敗すればロールバックするようsupabaseにてメソッド設定
      const { error } = await supabase.rpc('createStayAndCleaningSchedules', {
        stay_schedule_data: stayScheduleData,
        cleaning_schedule_data: cleaningScheduleData,
      })

      if (error) {
        console.error('Failed to call create_stay_and_cleaning_schedules:', error)
        throw error
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
