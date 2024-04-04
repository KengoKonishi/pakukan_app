'use client'

import { useState } from 'react'

export const CreateScheduleModal = ({
  endDate,
  startDate,
  onClose,
}: {
  endDate: string
  startDate: string
  onClose: () => void
}) => {
  const [selected, setSelected] = useState('stay')
  const changeValue = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(event.target.value)

  const onClickCreateButton = () => {
    // TODO: 宿泊スケジュール作成画面、または清掃員スケジュール作成画面に遷移させる
    console.log(startDate, endDate, selected)
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
            <h3 className='text-2xl'>スケジュール登録</h3>
          </div>
          <div className='flex gap-20 p-5'>
            <div>
              <p>開始日</p>
              {startDate}
            </div>
            <div>
              <p>終了日</p>
              {endDate}
            </div>
          </div>
          <div className='gap-20 p-5'>
            <div>
              <input
                type='radio'
                id='staySchedule'
                name='scheduleType'
                value='stay'
                checked={'stay' === selected}
                onChange={changeValue}
              />
              <label htmlFor='staySchedule'>宿泊スケジュール</label>
            </div>
            <div>
              <input
                type='radio'
                id='cleaningSchedule'
                name='scheduleType'
                value='cleaning'
                checked={'cleaning' === selected}
                onChange={changeValue}
              />
              <label htmlFor='cleaningSchedule'>清掃員スケジュール</label>
            </div>
          </div>
          <div className='flex justify-center'>
            <button
              className='py-2 px-4 rounded-md no-underline'
              onClick={onClickCreateButton}
            >
              作成する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
