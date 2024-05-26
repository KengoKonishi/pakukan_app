import React, { useState } from 'react'
import { CLEANING_STATUS_ID } from '@/constants/CleaningStatus'

interface UpdateButtonProps {
  confirmMessage: string
  label: string
  upadteStatus: (typeof CLEANING_STATUS_ID)[keyof typeof CLEANING_STATUS_ID]

  onClickUpdateButton: (
    e: React.MouseEvent<HTMLButtonElement>,
    upadteStatus: number,
  ) => Promise<void>
}

const UpdateButton: React.FC<UpdateButtonProps> = ({
  confirmMessage,
  label,
  upadteStatus,
  onClickUpdateButton,
}) => {
  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false)

  const onButtonClick = () => {
    setIsShowConfirmModal(true)
  }

  const handleOk = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    await onClickUpdateButton(e, upadteStatus)
    setIsShowConfirmModal(false)
  }

  const handleCancel = () => {
    setIsShowConfirmModal(false)
  }

  return (
    <div>
      <button
        onClick={onButtonClick}
        className='mr-2 px-4 py-2 bg-amber-500 text-white rounded-full w-40 text-lg font-bold focus:outline-none hover:bg-orange-800'
        type='button'
      >
        {label}
      </button>
      {isShowConfirmModal && (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
          <div className='bg-white p-8 rounded-md shadow-md'>
            <p className='mb-4 whitespace-pre-wrap'>{confirmMessage}</p>
            <div className='flex justify-center'>
              <button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleOk}
                className='bg-amber-500 text-white px-4 py-2 mr-4 rounded-md'
              >
                更新
              </button>
              <button onClick={handleCancel} className='bg-gray-300 px-4 py-2 rounded-md'>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateButton
