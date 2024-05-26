'use client'

import { useState } from 'react'

export const ShiftShareButton = () => {
  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onButtonClick = () => {
    setSuccessMessage('')
    setErrorMessage('')
    setIsShowConfirmModal(true)
  }

  const handleCancel = () => {
    setIsShowConfirmModal(false)
  }

  const handleOk = async () => {
    setSuccessMessage('')
    setErrorMessage('')
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/shift-sharing`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (res.ok) {
      const data = (await res.json()) as { count: number }
      const message =
        data.count > 0
          ? `シフト連携しました。 (${data.count}件)`
          : '現在募集中のシフトはありませんでした。'
      setSuccessMessage(message)
    } else {
      setErrorMessage('シフト連携に失敗しました。')
    }
  }

  return (
    <>
      <button
        className='py-2 px-4 rounded-full bg-amber-500 text-white no-underline'
        type='button'
        onClick={onButtonClick}
      >
        LINEでシフト連携
      </button>
      {isShowConfirmModal && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-10'>
          <div className='bg-white p-8 rounded-md shadow-md'>
            {successMessage && (
              <div className='text-blue-500 px-4 py-2 bg-yellow-200 rounded-md font-bold mb-4'>
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className='text-red-500 px-4 py-2 bg-yellow-200 rounded-md font-bold mb-4'>
                {errorMessage}
              </div>
            )}
            <p className='mb-4 whitespace-pre-wrap'>
              {`担当者の決まっていないシフトが一斉通知されます。\nよろしいですか？`}
            </p>
            <div className='flex justify-center'>
              <button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleOk}
                className='bg-amber-500 text-white px-4 py-2 mr-4 rounded-md'
              >
                連携
              </button>
              <button onClick={handleCancel} className='bg-gray-300 px-4 py-2 rounded-md'>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
