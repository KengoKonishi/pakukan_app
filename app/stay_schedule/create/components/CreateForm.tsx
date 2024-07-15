'use client'
import React, { useState, useEffect } from 'react'
import { CLEANING_SCHEDULE } from '@/constants/CleaningSchedule'
import { CLEANING_STATUS_ID } from '@/constants/CleaningStatus'
import { STAY_SCHEDULE } from '@/constants/StaySchedule'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'
import { addHoursAndFormatDatetime } from '../../components/addHoursAndFormatDatetime'

export default function CreateForm() {
  const [checkInDatetime, setCheckInDatetime] = useState('')
  const [checkOutDatetime, setCheckOutDatetime] = useState('')
  const [guestHouses, setGuestHouses] = useState<{ [key: number]: string }>({})
  const [selectedGuestHouseId, setSelectedGuestHouseId] = useState<number | null>(null)
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
  const [userEmail, setUserEmail] = useState('')

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
    let initialCheckInDatetime = ''
    if (initialCheckInDatetimeParam && initialCheckInDatetimeParam.includes(' ')) {
      // 「2024/5/7 6:00:00」のような「日付＋時刻」で渡される場合
      initialCheckInDatetime = addHoursAndFormatDatetime(initialCheckInDatetimeParam)
    } else if (initialCheckInDatetimeParam) {
      // 「2024/5/7」のような「日付」で渡される場合、デフォルトの時刻を設定
      initialCheckInDatetime = addDefaultTimeToDatetime(
        initialCheckInDatetimeParam,
        STAY_SCHEDULE.GUEST_DEFAULT_CHECK_IN_TIME,
      )
    }

    // チェックアウト日時を設定
    let initialCheckOutDatetime = ''
    if (initialCheckOutDatetimeParam && initialCheckOutDatetimeParam.includes(' ')) {
      // 「2024/5/7 6:00:00」のような「日付＋時刻」で渡される場合
      initialCheckOutDatetime = addHoursAndFormatDatetime(initialCheckOutDatetimeParam)
    } else if (initialCheckOutDatetimeParam) {
      // 「2024/5/7」のような「日付」で渡される場合、デフォルトの時刻を設定
      initialCheckOutDatetime = addDefaultTimeToDatetime(
        initialCheckOutDatetimeParam,
        STAY_SCHEDULE.GUEST_DEFAULT_CHECK_OUT_TIME,
      )
    }

    void setCheckInDatetime(initialCheckInDatetime)
    void setCheckOutDatetime(initialCheckOutDatetime)

    const fetchUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error fetching user:', error)
        setError('Error fetching user email')
      } else if (data && data.user && data.user.email) {
        setUserEmail(data.user.email)
      } else {
        console.error('No user data found')
        setError('No user data found')
      }
    }

    const fetchGuestHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_houses')
          .select(`id, name`)
          .eq('is_deleted', 0)

        if (error) {
          throw error
        }
        const guestHousesMap: { [key: number]: string } = {}
        data.forEach((item) => {
          guestHousesMap[item.id] = item.name
        })

        await fetchUserEmail()
        setGuestHouses(guestHousesMap)
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

      if (checkOutDatetime < checkInDatetime) {
        setValidationError(
          'チェックアウト日時はチェックイン日時よりも後の日時を設定してください。',
        )
        return
      }

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
        guest_house_id: selectedGuestHouseId!,
        start_datetime: checkInDatetime,
        end_datetime: checkOutDatetime,
        guest_name: guestName,
        numbers_of_guests: numbersOfGuests,
        amenities_info: amenitiesInfo,
        bag_recieve_info: bagRecieveInfo,
        others: others,
      }

      // 更新する清掃員シフトスケジュールデータを準備
      const cleaningStartDatetime = addHoursAndFormatDatetime(
        checkOutDatetime,
        CLEANING_SCHEDULE.SETTING_TIME_FOR_CLEANING_START_DATETIME,
      )
      const cleaningEndDatetime = addHoursAndFormatDatetime(
        cleaningStartDatetime,
        CLEANING_SCHEDULE.CLEANING_TIME,
      )
      const cleaningScheduleData = {
        cleaner_id: null, //初期設定はnullで設定し、LINEでシフト登録した時にcleaner_idを登録する
        guest_house_id: selectedGuestHouseId!,
        start_datetime: cleaningStartDatetime,
        end_datetime: cleaningEndDatetime,
        cleaning_status_id: CLEANING_STATUS_ID.UNFINISHED,
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

      // Googleカレンダーに同期
      const guestHouseName = selectedGuestHouseId ? guestHouses[selectedGuestHouseId] : ''
      const body = {
        action: 'createStayEvent',
        summary: `${stayScheduleData.guest_name}様 / ${guestHouseName}`,
        startDateISOString: new Date(
          stayScheduleData.start_datetime + '+09:00',
        ).toISOString(), // Googleカレンダー登録用
        endDateISOString: new Date(
          stayScheduleData.end_datetime + '+09:00',
        ).toISOString(), // Googleカレンダー登録用
        guestHouse: guestHouseName,
        attendeesEmail: userEmail,
        description: `
          宿泊者名: ${stayScheduleData.guest_name}
          宿泊人数: ${stayScheduleData.numbers_of_guests}
          アメニティ情報: ${stayScheduleData.amenities_info}
          荷物情報: ${stayScheduleData.bag_recieve_info}
          その他: ${stayScheduleData.others}
        `,
      }
      console.debug(body)
      const res = await fetch(process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_APP_URL ?? '', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json()

      if (!data) {
        console.error('Googleカレンダーへの同期エラー')
        throw error
      }

      // すべての更新処理が成功した場合の処理
      console.debug('フォームの更新処理が成功しました')
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
        <div className='flex justify-center pb-4'>
          <div className='flex justify-center'>
            <SubmitButton label='登録する' />
          </div>
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
