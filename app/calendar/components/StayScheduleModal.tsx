'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import DeleteButton from './DeleteButton'

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
  onScheduleDeleted,
}: {
  stayScheduleID: number
  onClose: () => void
  onScheduleDeleted: () => void
}) => {
  const [staySchedule, setStaySchedule] = useState<StaySchedule | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getStaySchedule = async (id: number) => {
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
  }, [stayScheduleID, supabase])

  // レコード削除
  const handleDelete = async (id: number): Promise<void> => {
    try {
      // TODO:トランザクション制御が必要なので、supabase database functionsで後追い設定必要
      // 宿泊スケジュールに紐づく清掃シフトスケジュールの有無確認
      const { data: cleaningScheduleData } = await supabase
        .from('cleaning_schedules')
        .select('id')
        .eq('stay_schedule_id', id)
        .single()

      if (cleaningScheduleData) {
        // 該当の清掃スケジュールがある場合のみ清掃報告および清掃シフトスケジュールの削除を実施
        // 清掃員シフトスケジュールに紐づく清掃報告の削除
        const { error: cleaningReportsError } = await supabase
          .from('cleaning_reports')
          .delete()
          .eq('cleaning_schedule_id', cleaningScheduleData.id)
        if (cleaningReportsError) {
          throw cleaningReportsError
        }

        // 宿泊スケジュールに紐づく清掃シフトスケジュールの削除
        const { error: cleaningScheduleError } = await supabase
          .from('cleaning_schedules')
          .delete()
          .eq('stay_schedule_id', id)

        if (cleaningScheduleError) {
          throw cleaningScheduleError
        }
      }

      // 宿泊スケジュールの削除
      const { error: stayScheduleError } = await supabase
        .from('stay_schedules')
        .delete()
        .match({ id })
      if (stayScheduleError) {
        throw stayScheduleError
      }

      // すべての更新処理が成功した場合の処理
      console.log('フォームの削除処理が成功しました')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 削除が成功したら親コンポーネントに通知
      onScheduleDeleted()

      // モーダルを閉じる
      onClose()
    } catch (error) {
      console.error('Error deleting stay schedule:', error)
    }
  }

  return (
    staySchedule && (
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
              <h3 className='text-2xl font-bold pt-5 pl-5 mb-2'>宿泊スケジュール</h3>
            </div>
            <div className='flex justify-end'>
              <Link href={`/stay_schedule/edit/${staySchedule.id}`}>
                <button className='mr-4 px-6 py-1 bg-blue-500 text-white rounded-full font-bold focus:outline-none hover:bg-blue-600'>
                  編集
                </button>
              </Link>
              <DeleteButton
                onConfirmDelete={() => handleDelete(staySchedule.id)}
                isStayScheduleFlg={true}
              />
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>チェックイン日時</p>
                {new Date(staySchedule.start_datetime).toLocaleString()}
              </div>
              <div>
                <p>チェックアウト日時</p>
                {new Date(staySchedule.end_datetime).toLocaleString()}
              </div>
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>宿泊施設</p>
                {staySchedule.guest_houses?.name}
              </div>
              <div>
                <p>宿泊者名</p>
                {staySchedule.guest_name}
              </div>
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>宿泊人数</p>
                {staySchedule.numbers_of_guests}
              </div>
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>アメニティ類の情報</p>
                {staySchedule.amenities_info ?? 'なし'}
              </div>
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>荷物の預かり情報</p>
                {staySchedule.bag_recieve_info ?? 'なし'}
              </div>
            </div>
            <div className='flex gap-20 p-5'>
              <div>
                <p>その他</p>
                {staySchedule.others ?? 'なし'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
