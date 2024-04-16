import React from 'react'

interface DeleteButtonProps {
  onClick: () => Promise<void>
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick }) => {
  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onClick}
      className='mr-2 px-6 py-1 bg-orange-700 text-white rounded-full font-bold focus:outline-none hover:bg-orange-800'
    >
      削除
    </button>
  )
}

export default DeleteButton
