import React, { useState } from 'react'

interface DeleteButtonProps {
  onConfirmDelete: () => Promise<void>
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onConfirmDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    await onConfirmDelete()
    setShowConfirmation(false)
  }

  const handleCancelDelete = () => {
    setShowConfirmation(false)
  }

  return (
    <div>
      <button
        onClick={handleDeleteClick}
        className='mr-2 px-6 py-1 bg-orange-700 text-white rounded-full font-bold focus:outline-none hover:bg-orange-800'
      >
        削除
      </button>
      {showConfirmation && (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
          <div className='bg-white p-8 rounded-md shadow-md'>
            <p className='mb-4'>本当に削除しますか？</p>
            <div className='flex justify-center'>
              <button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleConfirmDelete}
                className='bg-orange-700 text-white px-4 py-2 mr-4 rounded-md'
              >
                削除
              </button>
              <button
                onClick={handleCancelDelete}
                className='bg-gray-300 px-4 py-2 rounded-md'
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteButton
