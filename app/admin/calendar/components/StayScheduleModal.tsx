'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type StaySchedule = {
  id: number
  start_datetime: string
  end_datetime: string
  guest_name: string
  numbers_of_guests: string
  amenities_info: string | null
  bag_recieve_info: string | null
  others: string | null
  guest_houses: {
    name: string
  } | null
}

export const StayScheduleModal = ({
  stayScheduleID,
  onClose,
}: {
  stayScheduleID: number
  onClose: () => void
}) => {
  const [staySchedule, setStaySchedule] = useState<StaySchedule | null>(null)

  useEffect(() => {
    const getStaySchedule = async (id: number) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stay_schedules')
        .select(
          'id, start_datetime, end_datetime, guest_name, numbers_of_guests, amenities_info, bag_recieve_info, others, guest_houses (name)',
        )
        .eq('id', id)

      if (error) {
        console.log(error)
        return
      }

      setStaySchedule(data[0])
    }

    void getStaySchedule(stayScheduleID)
  }, [stayScheduleID])

  const onClickEditButton = () => {
    // TODO: 宿泊スケジュール編集画面に遷移させる
    console.log('clicked')
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
            <h3 className='text-2xl'>宿泊スケジュール</h3>
          </div>
          <div className='flex justify-end'>
            <button
              className='py-2 px-4 rounded-md no-underline'
              onClick={onClickEditButton}
            >
              編集
            </button>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>チェックイン日時</p>
              {staySchedule?.start_datetime}
            </div>
            <div>
              <p>チェックアウト日時</p>
              {staySchedule?.end_datetime}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>宿泊施設</p>
              {staySchedule?.guest_houses?.name}
            </div>
            <div>
              <p>宿泊者名</p>
              {staySchedule?.guest_name}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>宿泊人数</p>
              {staySchedule?.numbers_of_guests}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>アメニティ類の情報</p>
              {staySchedule?.amenities_info ?? 'なし'}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>荷物の預かり情報</p>
              {staySchedule?.bag_recieve_info ?? 'なし'}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>その他</p>
              {staySchedule?.others ?? 'なし'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
