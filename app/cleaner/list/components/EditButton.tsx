import Link from 'next/link'
import React from 'react'

interface EditButtonProps {
  label: string
  id: number
}

const EditButton: React.FC<EditButtonProps> = ({ label, id }) => {
  return (
    <Link href={`/cleaner/edit/${id}`}>
      <button className='px-6 py-1 bg-blue-500 text-white rounded-full font-bold focus:outline-none hover:bg-blue-600'>
        {label}
      </button>
    </Link>
  )
}

export default EditButton
