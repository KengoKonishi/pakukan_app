import Link from 'next/link'
import React from 'react'

interface BackButtonProps {
  label: string
}

const BackButton: React.FC<BackButtonProps> = ({ label }) => {
  return (
    <Link href='/admin/guesthouse/list/'>
      <div className='flex justify-center items-center px-4 py-2 bg-gray-300 text-white rounded-full font-bold w-40 text-lg focus:outline-none focus:ring-4'>
        {label}
      </div>
    </Link>
  )
}

export default BackButton
