'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type CleaningSchedule = {
  id: number
  start_datetime: string
  end_datetime: string
  cleaning_status: {
    name: string
  } | null
  guest_houses: {
    name: string
  } | null
  cleaners: {
    name: string
  } | null
}

export const CleaningScheduleModal = ({
  cleaningScheduleID,
  onClose,
}: {
  cleaningScheduleID: number
  onClose: () => void
}) => {
  const [cleaningSchedule, setCleaningSchedule] = useState<CleaningSchedule | null>(null)

  useEffect(() => {
    const getcleaningSchedule = async (id: number) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select(
          'id, start_datetime, end_datetime, cleaning_status (name), guest_houses (name), cleaners (name)',
        )
        .eq('id', id)

      if (error) {
        console.log(error)
        return
      }

      setCleaningSchedule(data[0])
    }

    void getcleaningSchedule(cleaningScheduleID)
  }, [cleaningScheduleID])

  const onClickDeleteButton = async () => {
    if (confirm('スケジュールを削除します。よろしいですか？')) {
      const supabase = createClient()
      const { error } = await supabase
        .from('cleaning_schedules')
        .delete()
        .eq('id', cleaningScheduleID)

      if (error) {
        console.log(error)
        return
      }

      onClose()
      // TODO: 最新のスケジュール取得してトースト表示
    }
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
            <h3 className='text-2xl'>
              清掃スケジュール<span> {cleaningSchedule?.cleaning_status?.name}</span>
            </h3>
          </div>
          <div className='flex justify-end'>
            <button
              className='py-2 px-4 rounded-md no-underline'
              onClick={() => void onClickDeleteButton()}
            >
              削除
            </button>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>開始日時</p>
              {cleaningSchedule?.start_datetime}
            </div>
            <div>
              <p>終了日時</p>
              {cleaningSchedule?.end_datetime}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>宿泊施設</p>
              {cleaningSchedule?.guest_houses?.name}
            </div>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>清掃員名</p>
              {cleaningSchedule?.cleaners?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
