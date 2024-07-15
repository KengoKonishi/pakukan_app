'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cleaningStatusBgColor } from '@/constants/CleaningStatus'
import { createClient } from '@/utils/supabase/client'
import DeleteButton from './DeleteButton'

type CleaningSchedule = {
  id: number
  start_datetime: string
  end_datetime: string
  cleaning_status_id: number
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
  handleDeleteCleaningSchedule,
}: {
  cleaningScheduleID: number
  onClose: () => void
  handleDeleteCleaningSchedule: () => void
}) => {
  const [cleaningSchedule, setCleaningSchedule] = useState<CleaningSchedule | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getcleaningSchedule = async (id: number) => {
      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select(
          'id, start_datetime, end_datetime, cleaning_status_id, cleaning_status (name), guest_houses (name), cleaners (name)',
        )
        .eq('id', id)

      if (error) {
        console.error(error)
        return
      }

      if (data && data.length > 0) {
        setCleaningSchedule(data[0])
      } else {
        // データが見つからない場合の処理を追加するか、適切なエラーメッセージをログに出力します。
        console.error('データが見つかりませんでした')
      }
    }

    void getcleaningSchedule(cleaningScheduleID)
  }, [cleaningScheduleID, supabase])

  // レコード削除
  const handleDelete = async (id: number): Promise<void> => {
    try {
      // TODO:トランザクション制御が必要なので、supabase database functionsで後追い設定必要
      // cleaning_scheduleレコード削除前に外部キーとして紐づくcleaning_reportsも削除する
      const { error: cleaningReportsError } = await supabase
        .from('cleaning_reports')
        .delete()
        .eq('cleaning_schedule_id', id)
      if (cleaningReportsError) {
        throw cleaningReportsError
      }

      const { error } = await supabase.from('cleaning_schedules').delete().match({ id })
      if (error) {
        throw error
      }

      // すべての更新処理が成功した場合の処理
      console.debug('フォームの削除処理が成功しました')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 削除が成功したら親コンポーネントに通知
      handleDeleteCleaningSchedule()

      // モーダルを閉じる
      onClose()
    } catch (error) {
      console.error('Error deleting stay schedule:', error)
    }
  }

  return (
    cleaningSchedule && (
      <div
        className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-10'
        onClick={onClose}
      >
        {/* モーダル全体 */}
        <div
          className='flex flex-col justify-start items-center h-5/6 w-3/5 p-5 my-24 bg-gray-200 border z-20 overflow-auto'
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
          <div className='w-4/5'>
            <div className='flex justify-start border-b-4 border-b-amber-500 mb-4'>
              <h3 className='text-2xl font-bold pt-5 pl-5 mb-2'>
                清掃スケジュール
                <span
                  className={`ml-8 px-4 py-2 ${cleaningSchedule?.cleaning_status_id ? cleaningStatusBgColor(cleaningSchedule.cleaning_status_id) : ''} text-white text-center rounded-full w-40`}
                >
                  {' '}
                  {cleaningSchedule?.cleaning_status?.name}
                </span>
              </h3>
            </div>
            <div className='flex justify-end'>
              <Link href={`/cleaning_schedule/edit/${cleaningSchedule.id}`}>
                <button className='mr-4 px-6 py-1 bg-blue-500 text-white rounded-full font-bold focus:outline-none hover:bg-blue-600'>
                  編集
                </button>
              </Link>
              <DeleteButton onConfirmDelete={() => handleDelete(cleaningSchedule.id)} />
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>開始日時</p>
                {new Date(cleaningSchedule.start_datetime).toLocaleString()}
              </div>
              <div>
                <p>終了日時</p>
                {new Date(cleaningSchedule.end_datetime).toLocaleString()}
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
  )
}
